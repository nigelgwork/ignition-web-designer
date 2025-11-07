# Security Audit Checklist

Complete checklist for security audits before production deployment.

## Pre-Deployment Security Audit

**Date:** ________________
**Auditor:** ________________
**Version:** ________________

---

## 1. Authentication & Authorization

### Backend
- [ ] Every endpoint checks for authenticated user
- [ ] Every endpoint returns 401 if no session
- [ ] Every endpoint checks Designer role/permission
- [ ] Every endpoint returns 403 if unauthorized
- [ ] No hardcoded credentials in code
- [ ] No test/debug authentication bypasses
- [ ] Session timeout configured appropriately
- [ ] Session cookies have secure flags (Gateway managed)

### Frontend
- [ ] withCredentials: true for all API calls
- [ ] 401 responses handled (redirect to login)
- [ ] 403 responses handled (show permission error)
- [ ] No credentials stored in localStorage
- [ ] No credentials in URL parameters

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 2. Input Validation

### Backend
- [ ] All URL parameters validated
- [ ] All query parameters validated
- [ ] All request body content validated
- [ ] Path traversal prevention (../ sequences)
- [ ] Absolute path prevention
- [ ] Null byte injection prevention
- [ ] JSON size limits enforced (2MB)
- [ ] Component nesting depth limited (20 levels)
- [ ] Component count limited (500 components)
- [ ] Name length limited (100 chars)
- [ ] Special characters validated
- [ ] Required fields checked

### Frontend
- [ ] View structure validated before send
- [ ] Component hierarchy validated
- [ ] Property values type-checked
- [ ] Path inputs sanitized
- [ ] Form inputs validated
- [ ] File uploads validated (if any)

**Vulnerabilities Found:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 3. XSS Prevention

- [ ] No dangerouslySetInnerHTML used
- [ ] React escaping relied upon
- [ ] No eval() of user input
- [ ] No Function() constructor with user input
- [ ] No innerHTML with user data
- [ ] Monaco editor sandboxed
- [ ] No automatic script execution
- [ ] JSON responses only (no HTML rendering)
- [ ] Content-Type headers correct

**Test Results:**
```
Payload: <script>alert('XSS')</script>
Result: ___________________________________________

Payload: <img src=x onerror=alert('XSS')>
Result: ___________________________________________
```

---

## 4. Injection Prevention

### SQL Injection
- [ ] No SQL construction from user input
- [ ] Named queries read-only
- [ ] Gateway handles query execution
- [ ] No stored procedures executed
- [ ] N/A - Module doesn't execute SQL

### Command Injection
- [ ] No system commands executed with user input
- [ ] No shell spawning
- [ ] File operations use Java APIs only
- [ ] N/A - Module doesn't execute commands

### Path Traversal
- [ ] Path validation on all file operations
- [ ] Paths normalized before use
- [ ] Paths verified within base directory
- [ ] No symlink following outside base

**Test Results:**
```
Payload: ../../../etc/passwd
Result: ___________________________________________

Payload: ../../gateway.xml
Result: ___________________________________________
```

---

## 5. File Security

### File Reading
- [ ] Paths validated before reading
- [ ] Base directory enforced
- [ ] File existence checked
- [ ] Permissions verified
- [ ] File size limits enforced
- [ ] Try-with-resources used
- [ ] Exceptions handled properly

### File Writing
- [ ] Paths validated before writing
- [ ] Content size validated
- [ ] Content validated (JSON structure)
- [ ] Atomic writes used
- [ ] Temp files cleaned up
- [ ] Permissions set correctly
- [ ] Audit logged

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 6. Audit Logging

- [ ] All write operations logged
- [ ] All security events logged
- [ ] User actions logged
- [ ] Failed auth attempts logged
- [ ] Authorization failures logged
- [ ] Logs include: username, action, resource, IP, timestamp
- [ ] Logs not modifiable by users
- [ ] Log rotation configured
- [ ] Logs monitored

**Sample Log Entries:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 7. Error Handling

- [ ] No stack traces exposed to users
- [ ] No filesystem paths in error messages
- [ ] No internal details in responses
- [ ] Generic error messages to frontend
- [ ] Detailed errors in backend logs only
- [ ] Error codes appropriate (401, 403, 404, 500)
- [ ] Errors don't leak sensitive data

**Error Response Examples:**
```
200: ____________________________________________
401: ____________________________________________
403: ____________________________________________
404: ____________________________________________
500: ____________________________________________
```

---

## 8. DoS Prevention

- [ ] Request size limits enforced
- [ ] JSON size limits enforced (2MB)
- [ ] Component count limits enforced (500)
- [ ] Nesting depth limits enforced (20)
- [ ] File size limits enforced
- [ ] Iteration limits enforced
- [ ] Timeout on long operations
- [ ] Resource cleanup on errors
- [ ] No infinite loops possible

**Load Test Results:**
```
1000 requests in 1 second: _______________________
100MB JSON payload: ______________________________
1000 nested components: __________________________
```

---

## 9. Dependency Security

### Backend
- [ ] Dependency check scan passed
- [ ] No known vulnerabilities in dependencies
- [ ] Dependencies up to date
- [ ] Only necessary dependencies included
- [ ] Ignition SDK version compatible

```bash
./gradlew dependencyCheckAnalyze
Last scan date: ____________
Results: ___________________
```

### Frontend
- [ ] npm audit passed
- [ ] No high/critical vulnerabilities
- [ ] Dependencies up to date
- [ ] Only necessary dependencies included
- [ ] Package lock file committed

```bash
npm audit
Last scan date: ____________
Results: ___________________
```

---

## 10. HTTPS/TLS

- [ ] HTTPS enforced (Gateway level)
- [ ] TLS 1.2+ required
- [ ] Strong cipher suites configured
- [ ] Certificate valid
- [ ] No mixed content warnings
- [ ] HSTS header set (Gateway level)
- [ ] Secure cookie flags set (Gateway level)

**Configuration:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 11. Session Security

- [ ] Session timeout configured
- [ ] Session invalidation on logout
- [ ] Session fixation prevention
- [ ] Session cookies HttpOnly
- [ ] Session cookies Secure
- [ ] Session cookies SameSite
- [ ] No session data in URL
- [ ] No session data in localStorage

**Session Configuration:**
```
Timeout: __________ minutes
HttpOnly: __________
Secure: __________
SameSite: __________
```

---

## 12. Rate Limiting

- [ ] Rate limiting implemented (or documented for future)
- [ ] Reasonable limits per user
- [ ] Reasonable limits per IP
- [ ] Rate limit headers sent
- [ ] 429 Too Many Requests returned
- [ ] Backend throttling
- [ ] Frontend debouncing

**Current Status:**
```
Backend rate limiting: _____________________________
Frontend debouncing: _______________________________
Recommended limits: ________________________________
```

---

## 13. Code Quality

- [ ] No commented-out authentication checks
- [ ] No debug/test code in production
- [ ] No console.log with sensitive data
- [ ] No TODO with security implications
- [ ] Code follows security best practices
- [ ] Security utilities used consistently
- [ ] Error handling comprehensive

**Issues Found:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 14. Documentation

- [ ] Security documentation complete
- [ ] API documentation includes security notes
- [ ] Deployment guide includes security setup
- [ ] User guide explains permissions
- [ ] Security contacts documented
- [ ] Incident response plan documented
- [ ] This checklist completed

---

## 15. Testing

### Security Testing Performed
- [ ] Manual penetration testing
- [ ] Automated security scanning
- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts
- [ ] XSS payload testing
- [ ] Path traversal testing
- [ ] DoS attack testing
- [ ] Session hijacking testing
- [ ] CSRF testing

**Test Results Summary:**
```
Tests passed: ________ / ________
Critical issues: ________
High issues: ________
Medium issues: ________
Low issues: ________
```

---

## Sign-Off

### Security Auditor
**Name:** ________________
**Date:** ________________
**Signature:** ________________

**Recommendation:**
- [ ] Approved for production deployment
- [ ] Approved with minor fixes
- [ ] Requires additional security work
- [ ] Not approved

**Comments:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

### Development Lead
**Name:** ________________
**Date:** ________________
**Signature:** ________________

**Comments:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Remediation Plan

| Issue | Severity | Assigned To | Target Date | Status |
|-------|----------|-------------|-------------|--------|
|       |          |             |             |        |
|       |          |             |             |        |
|       |          |             |             |        |
|       |          |             |             |        |

---

**Checklist Version:** 1.0
**Last Updated:** 2025-11-07
**Next Audit Date:** ________________
