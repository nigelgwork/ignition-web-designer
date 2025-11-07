# Security Documentation

Comprehensive security considerations, threat model, and best practices for the Web Designer module.

---

## Table of Contents

- [Security Overview](#security-overview)
- [Threat Model](#threat-model)
- [Authentication & Authorization](#authentication--authorization)
- [Input Validation](#input-validation)
- [Optimistic Concurrency](#optimistic-concurrency)
- [Audit Logging](#audit-logging)
- [Known Vulnerabilities](#known-vulnerabilities)
- [Security Checklist](#security-checklist)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)

---

## Security Overview

### Security Posture

**Risk Level**: **MEDIUM**

The Web Designer module:
- ✅ Requires Gateway authentication (Designer role)
- ✅ Implements optimistic concurrency control
- ✅ Validates all user inputs
- ✅ Audit logs all write operations
- ⚠️ Allows modification of project resources
- ⚠️ Executes in privileged Gateway context

### Key Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Only Designer role can access
3. **Audit Everything**: All state changes are logged
4. **Fail Secure**: Errors deny access, not grant it
5. **Validate Everything**: Trust nothing from the client

---

## Threat Model

### Assets

| Asset | Value | Threat |
|-------|-------|--------|
| **Perspective Views** | HIGH | Unauthorized modification, deletion, data exfiltration |
| **Project Resources** | HIGH | Unauthorized access, tampering |
| **User Sessions** | MEDIUM | Session hijacking, CSRF |
| **Gateway API Access** | CRITICAL | Privilege escalation, unauthorized operations |

### Threat Actors

| Actor | Capability | Motivation |
|-------|------------|------------|
| **Authenticated Designer** | Full access | Legitimate use |
| **Authenticated Non-Designer** | No access (401/403) | Curiosity, testing boundaries |
| **Unauthenticated User** | No access (401) | Information disclosure, unauthorized access |
| **Network Attacker** | HTTPS required | MITM, eavesdropping |
| **Malicious Designer** | Full API access | Data destruction, sabotage |

### Attack Vectors

1. **Unauthorized Access**
   - Threat: Non-Designer user accesses API
   - Mitigation: SessionScope.Designer check on every endpoint

2. **CSRF (Cross-Site Request Forgery)**
   - Threat: Attacker tricks Designer into making malicious request
   - Mitigation: Session cookie + custom headers (`If-Match`)

3. **Session Hijacking**
   - Threat: Attacker steals session cookie
   - Mitigation: HttpOnly cookies, HTTPS required, session timeout

4. **Optimistic Concurrency Bypass**
   - Threat: Attacker omits `If-Match` header to overwrite changes
   - Mitigation: Server enforces `If-Match` requirement (412 if missing)

5. **Path Traversal**
   - Threat: Malicious view path like `../../system/config`
   - Mitigation: Input validation, path sanitization

6. **JSON Injection**
   - Threat: Malicious JSON in view content
   - Mitigation: JSON parsing limits, size limits

7. **DoS (Denial of Service)**
   - Threat: Attacker sends large payloads or rapid requests
   - Mitigation: Request size limits (2MB), rate limiting (future)

---

## Authentication & Authorization

### Authentication (Who are you?)

**Mechanism**: Ignition Gateway session cookies

```java
@Override
public void setup(ModuleRoutes routes) {
    routes.newRoute("/api/v1/projects")
        .accessControl(Routes.requireSession(EnumSet.of(SessionScope.Designer)))
        .mount();
}
```

**Process**:
1. User logs into Gateway web interface
2. Gateway creates session, sets `JSESSIONID` cookie
3. Frontend includes cookie in API requests (`withCredentials: true`)
4. Backend validates session exists and is active

**Failure Mode**:
- No session → `401 Unauthorized`
- Expired session → `401 Unauthorized`
- Invalid session → `401 Unauthorized`

---

### Authorization (What can you do?)

**Mechanism**: Role-based access control (RBAC)

**Required Role**: `Designer` (or equivalent permission)

**Implementation**:
```java
private static String checkAuth(RequestContext req, HttpServletResponse res, GatewayContext context, boolean requireDesigner) {
    try {
        HttpServletRequest servletReq = req.getRequest();

        // Get authenticated user
        User user = context.getAuthManager().getUserFromRequest(servletReq);
        if (user == null || !user.isAuthenticated()) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return null;
        }

        // Check Designer role
        if (requireDesigner) {
            boolean hasRole = user.hasRole("Designer") || user.hasRole("Administrator");
            if (!hasRole) {
                res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return null;
            }
        }

        return user.getUsername();
    } catch (Exception e) {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return null;
    }
}
```

**Failure Mode**:
- User lacks Designer role → `403 Forbidden`
- Role check fails → `403 Forbidden`

---

## Input Validation

### Validation Rules

| Input | Validation | Max Length | Sanitization |
|-------|------------|------------|--------------|
| **Project Name** | Alphanumeric + hyphens | 100 chars | Remove path separators |
| **View Path** | Valid path format | 200 chars | Remove `../` and absolute paths |
| **View Content** | Valid JSON | 2MB | JSON parse check |
| **Tag Path** | Valid path format | 500 chars | Remove `../` |
| **ETag** | Hex string | 100 chars | Regex validation |

### Implementation

**Project Name**:
```java
private static boolean isValidProjectName(String name) {
    if (name == null || name.isEmpty()) return false;
    if (name.length() > 100) return false;

    // Allow alphanumeric, hyphens, underscores
    return name.matches("^[a-zA-Z0-9_-]+$");
}
```

**View Path**:
```java
private static String sanitizeViewPath(String path) {
    if (path == null) return null;

    // Remove path traversal attempts
    path = path.replace("../", "").replace("..\\", "");

    // Remove leading/trailing slashes
    path = path.trim().replaceAll("^/+", "").replaceAll("/+$", "");

    // Ensure not absolute path
    if (path.startsWith("/") || path.contains(":")) {
        throw new SecurityException("Absolute paths not allowed");
    }

    return path;
}
```

**View Content Size**:
```java
private static final int MAX_VIEW_SIZE = 2 * 1024 * 1024; // 2MB

if (contentBytes.length > MAX_VIEW_SIZE) {
    res.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
    return createErrorResponse(413, "View content exceeds maximum size");
}
```

---

## Optimistic Concurrency

### Purpose

Prevent users from overwriting each other's changes without awareness.

### Mechanism

**ETag (Entity Tag)**: SHA-256 hash of view file content

1. **GET view** → Response includes `ETag` header
2. **User edits locally**
3. **PUT view** → Request includes `If-Match: <etag>` header
4. **Server validates**:
   - Current file ETag == `If-Match` → **Save succeeds**
   - Current file ETag != `If-Match` → **409 Conflict**

### Implementation

**Generate ETag**:
```java
private static String generateETag(byte[] content) {
    try {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(content);
        return "sha256-" + bytesToHex(hash);
    } catch (NoSuchAlgorithmException e) {
        throw new RuntimeException("SHA-256 not available", e);
    }
}
```

**Validate If-Match**:
```java
private static JsonObject handlePutView(RequestContext req, HttpServletResponse res) {
    String ifMatch = req.getRequest().getHeader("If-Match");

    // Require If-Match header
    if (ifMatch == null || ifMatch.isEmpty()) {
        res.setStatus(HttpServletResponse.SC_PRECONDITION_FAILED);
        return createErrorResponse(412, "If-Match header required");
    }

    // Get current file ETag
    String currentETag = generateETag(currentFileBytes);

    // Compare
    if (!ifMatch.equals(currentETag)) {
        res.setStatus(HttpServletResponse.SC_CONFLICT);
        JsonObject error = createErrorResponse(409, "View was modified by another user");
        error.addProperty("currentEtag", currentETag);
        return error;
    }

    // Save succeeds
    // ...
}
```

### Security Benefits

1. **Prevents accidental overwrites**: User A and User B can't silently overwrite each other
2. **CSRF mitigation**: Attacker can't forge valid `If-Match` header without knowing current ETag
3. **Audit trail**: Conflicts are logged for investigation

---

## Audit Logging

### Purpose

Track all state-changing operations for:
- Security incident investigation
- Compliance requirements
- User accountability
- Debugging production issues

### Logged Events

| Event | Data Logged |
|-------|-------------|
| **View Saved** | Username, project, view path, timestamp, client IP, success/failure |
| **View Deleted** | Username, project, view path, timestamp, client IP |
| **Optimistic Concurrency Conflict** | Username, project, view path, conflicting ETags |
| **Authentication Failure** | Username (if available), timestamp, client IP, endpoint |
| **Authorization Failure** | Username, required role, timestamp, client IP, endpoint |

### Implementation

```java
import com.inductiveautomation.ignition.gateway.audit.AuditManager;
import com.inductiveautomation.ignition.gateway.audit.AuditRecord;

private static void auditViewSave(GatewayContext context, String username, String project, String viewPath, boolean success, String clientIp) {
    AuditManager auditManager = context.getAuditManager();

    AuditRecord record = new AuditRecord.Builder()
        .timestamp(new Date())
        .actor(username)
        .action("WEB_DESIGNER_SAVE_VIEW")
        .actionTarget(project + "/" + viewPath)
        .actionValue(success ? "SUCCESS" : "FAILURE")
        .originationContext(clientIp)
        .build();

    auditManager.addAuditRecord(record);
}
```

### Log Retention

- **Audit records**: Retained per Gateway configuration (default: 90 days)
- **Gateway logs**: Retained per Gateway configuration (default: 30 days)
- **Compliance**: May require longer retention for regulated industries

---

## Known Vulnerabilities

### Current (v0.18.0)

**None known** at time of writing.

### Historical

#### v0.17.0 and earlier: Session Cookie Not Sent
- **CVE**: N/A (internal finding)
- **Severity**: HIGH
- **Description**: Frontend axios client did not send session cookies with API requests, causing all requests to fail with 401
- **Impact**: Broken authentication, unusable application
- **Fix**: Added `withCredentials: true` to axios configuration in v0.18.0
- **Status**: ✅ FIXED

---

## Security Checklist

### For Every New Endpoint

- [ ] **Authentication**: Requires Gateway session?
- [ ] **Authorization**: Requires Designer role?
- [ ] **Input Validation**: All parameters validated?
- [ ] **Output Encoding**: JSON properly escaped?
- [ ] **Rate Limiting**: Can it be DOS'd?
- [ ] **Audit Logging**: State changes logged?
- [ ] **Error Handling**: No sensitive data in errors?
- [ ] **Testing**: Security test cases added?

### For Every Release

- [ ] **Dependency Scan**: Run `npm audit` and `./gradlew dependencyCheckAnalyze`
- [ ] **Code Review**: Security-focused review completed?
- [ ] **Penetration Testing**: Attempted common attacks?
- [ ] **Audit Log Review**: Logs working correctly?
- [ ] **Documentation**: Security docs updated?
- [ ] **Changelog**: Security fixes documented?

### For Production Deployment

- [ ] **HTTPS**: Gateway configured for HTTPS?
- [ ] **Session Timeout**: Appropriate timeout configured?
- [ ] **Firewall**: Gateway not exposed to public internet?
- [ ] **Backup**: Project backups in place?
- [ ] **Monitoring**: Security alerts configured?
- [ ] **Incident Response**: Plan documented?

---

## Security Best Practices

### For Developers

1. **Never trust user input**: Validate everything from the client
2. **Use parameterized queries**: Prevent SQL injection (if applicable)
3. **Fail securely**: On error, deny access (don't default to allow)
4. **Log security events**: Audit all authentication/authorization failures
5. **Keep dependencies updated**: Run security scans regularly

### For Administrators

1. **Use HTTPS**: Encrypt traffic between browser and Gateway
2. **Restrict Gateway access**: Use firewall, VPN, or IP whitelist
3. **Review audit logs**: Regularly check for suspicious activity
4. **Backup projects**: Before major changes or updates
5. **Test in dev first**: Never deploy directly to production
6. **Limit Designer role**: Only give to trusted users

---

## Reporting Vulnerabilities

### How to Report

If you discover a security vulnerability, please **DO NOT** open a public issue.

**Contact**:
- Email: [security contact email]
- Include:
  - Description of vulnerability
  - Steps to reproduce
  - Impact assessment
  - Suggested fix (if known)

### Response Process

1. **Acknowledgment**: Within 24 hours
2. **Assessment**: Within 5 business days
3. **Fix Development**: Timeline depends on severity
4. **Disclosure**: Coordinated with reporter

### Severity Levels

| Severity | Response Time | Example |
|----------|---------------|---------|
| **CRITICAL** | 24 hours | Remote code execution, privilege escalation |
| **HIGH** | 3 days | Authentication bypass, data exfiltration |
| **MEDIUM** | 2 weeks | XSS, CSRF, information disclosure |
| **LOW** | 4 weeks | Minor information leaks, DoS with auth |

---

## Security Roadmap

### Planned Enhancements

#### v0.19.0
- [ ] Rate limiting on write operations
- [ ] Enhanced input validation with regex whitelist
- [ ] Security headers (CSP, X-Frame-Options)

#### v0.20.0
- [ ] Role-based permissions (read-only Designer role)
- [ ] Project-level access control
- [ ] API key authentication (alternative to session cookies)

#### v1.0.0
- [ ] Full security audit by third party
- [ ] Penetration testing
- [ ] Security compliance report (OWASP Top 10)
- [ ] Vulnerability disclosure program

#### v2.0.0
- [ ] End-to-end encryption for sensitive data
- [ ] Multi-factor authentication support
- [ ] Advanced audit logging with anomaly detection

---

## Compliance

### OWASP Top 10 (2021)

| Risk | Status | Notes |
|------|--------|-------|
| **A01:2021-Broken Access Control** | ✅ MITIGATED | Session + role checks on all endpoints |
| **A02:2021-Cryptographic Failures** | ✅ MITIGATED | HTTPS required, ETag uses SHA-256 |
| **A03:2021-Injection** | ✅ MITIGATED | Input validation, JSON parsing limits |
| **A04:2021-Insecure Design** | ✅ MITIGATED | Threat model documented, security by design |
| **A05:2021-Security Misconfiguration** | ⚠️ PARTIAL | Depends on Gateway configuration |
| **A06:2021-Vulnerable Components** | ⚠️ ONGOING | Regular dependency scans required |
| **A07:2021-Identification & Authentication** | ✅ MITIGATED | Relies on Gateway authentication |
| **A08:2021-Software & Data Integrity** | ✅ MITIGATED | Optimistic concurrency, module signing |
| **A09:2021-Security Logging & Monitoring** | ✅ MITIGATED | Audit logging implemented |
| **A10:2021-Server-Side Request Forgery** | ✅ N/A | No SSRF attack surface |

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html)
- [Ignition Security Best Practices](https://docs.inductiveautomation.com/docs/8.3/platform/ignition-security-best-practices)

---

**Last Updated**: 2025-11-07
**Version**: 0.18.0
**Next Security Audit**: v1.0.0 release
