# Backend Architecture - Gateway Module

**Technology:** Java 17, Ignition SDK 8.3+
**Module ID:** `com.me.webdesigner`
**Build System:** Gradle 8.x with `io.ia.sdk.modl` plugin

---

## Overview

The backend is an Ignition Gateway module that provides:
1. REST API for view/tag/script management
2. Static file server for React SPA
3. Authentication and authorization
4. Audit logging
5. Integration with Gateway managers

## Module Structure

```
gateway/
├── src/main/java/com/me/webdesigner/
│   ├── GatewayHook.java          # Module entry point
│   ├── WebDesignerServlet.java   # HTTP request handler
│   ├── api/
│   │   ├── ProjectHandler.java   # Project/view endpoints
│   │   ├── TagHandler.java       # Tag browsing endpoints
│   │   ├── ScriptHandler.java    # Script management endpoints
│   │   └── ComponentHandler.java # Component metadata endpoints
│   ├── security/
│   │   ├── AuthFilter.java       # Session validation
│   │   └── AuditLogger.java      # Audit logging
│   └── util/
│       ├── JsonUtil.java         # JSON serialization
│       └── PathUtil.java         # Path sanitization
└── src/main/resources/
    ├── module.xml                # Module descriptor
    └── static/                   # React SPA files (frontend/dist)
```

## Core Components

### 1. GatewayHook
**Purpose:** Module lifecycle management

**Responsibilities:**
- Initialize module on Gateway startup
- Register servlets and mount points
- Access GatewayContext
- Clean up on shutdown

**Key Methods:**
```java
public void setup(GatewayContext context) {
    this.gatewayContext = context;
}

public void startup(LicenseState licenseState) {
    // Register WebDesignerServlet at /data/webdesigner/*
}

public void shutdown() {
    // Cleanup resources
}
```

### 2. WebDesignerServlet
**Purpose:** HTTP request routing

**Routes:**
- `/data/webdesigner/` → Static SPA (index.html)
- `/data/webdesigner/api/v1/*` → API handlers
- `/data/webdesigner/test` → Diagnostic endpoint

**Key Methods:**
```java
protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    // Route to appropriate handler or serve static file
}

protected void doPost/doPut/doDelete(...) {
    // Handle write operations
}
```

### 3. API Handlers

#### ProjectHandler
**Endpoints:**
- `GET /api/v1/projects` - List all projects
- `GET /api/v1/projects/{name}/views` - List views in project
- `GET /api/v1/projects/{name}/view?path={viewPath}` - Load view JSON
- `PUT /api/v1/projects/{name}/view?path={viewPath}` - Save view JSON

**Implementation:**
```java
private void handleGetView(HttpServletRequest req, HttpServletResponse resp) {
    // 1. Validate session (AuthFilter)
    // 2. Extract and sanitize parameters
    // 3. Call ProjectManager.getResource()
    // 4. Calculate ETag (SHA-256 or timestamp)
    // 5. Return JSON with ETag header
}

private void handlePutView(HttpServletRequest req, HttpServletResponse resp) {
    // 1. Validate session and authorization
    // 2. Check If-Match header against current ETag
    // 3. Return 409 if mismatch (conflict)
    // 4. Create timestamped backup
    // 5. Write view.json via ProjectManager
    // 6. Audit log the operation
    // 7. Return 200 with new ETag
}
```

#### TagHandler
**Endpoints:**
- `GET /api/v1/tags` - List tag providers
- `GET /api/v1/tags/{provider}` - Browse tags in provider
- `GET /api/v1/tags/{provider}?path={tagPath}` - Get specific tag

**Implementation:**
```java
private void handleGetTags(HttpServletRequest req, HttpServletResponse resp) {
    // 1. Validate session
    // 2. Get TagManager from GatewayContext
    // 3. Call tagManager.getTagProviders()
    // 4. Return JSON array of providers
}
```

#### ScriptHandler (v0.20.0+)
**Endpoints:**
- `GET /api/v1/scripts` - List project scripts
- `GET /api/v1/scripts/{path}` - Load script content
- `PUT /api/v1/scripts/{path}` - Save script content

#### ComponentHandler
**Endpoints:**
- `GET /api/v1/perspective/components` - List available component types

---

## Security Implementation

### Authentication Flow
```java
// In every API endpoint:
User user = gatewayContext.getAuthManager().getUserFromRequest(req);
if (user == null) {
    resp.sendError(401, "Unauthorized - No valid session");
    return;
}
```

### Authorization Flow
```java
// Check for Designer role or custom permission:
if (!user.getRoles().contains("Designer") &&
    !user.hasPermission("webdesigner.edit")) {
    resp.sendError(403, "Forbidden - Requires Designer role");
    return;
}
```

### Input Validation
```java
private String sanitizeProjectName(String projectName) {
    // Remove ../ path traversal attempts
    // Remove special characters
    // Validate against known projects
    return ProjectNameValidator.sanitize(projectName);
}
```

### Audit Logging
```java
private void auditLogWrite(String operation, String resource, User user,
                           HttpServletRequest req, boolean success) {
    String logEntry = String.format(
        "%s | User: %s | Resource: %s | IP: %s | Success: %b | Timestamp: %s",
        operation, user.getUsername(), resource,
        req.getRemoteAddr(), success, Instant.now()
    );
    gatewayContext.getAuditManager().log("webdesigner", logEntry);
}
```

---

## Optimistic Concurrency

### ETag Generation
```java
private String generateETag(Resource resource) {
    // Option 1: SHA-256 hash of content
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] hash = digest.digest(resource.getBytes());
    return Base64.getEncoder().encodeToString(hash);

    // Option 2: Timestamp-based (simpler)
    return String.valueOf(resource.getLastModified());
}
```

### If-Match Validation
```java
private void handlePutView(...) {
    String ifMatch = req.getHeader("If-Match");
    if (ifMatch == null) {
        resp.sendError(428, "Precondition Required - If-Match header missing");
        return;
    }

    Resource currentResource = projectManager.getResource(projectName, viewPath);
    String currentETag = generateETag(currentResource);

    if (!ifMatch.equals(currentETag)) {
        resp.sendError(409, "Conflict - File has been modified");
        return;
    }

    // Proceed with save...
}
```

---

## Static File Serving

```java
private void serveStaticFile(HttpServletRequest req, HttpServletResponse resp) {
    String path = req.getPathInfo();
    if (path == null || path.equals("/")) {
        path = "/index.html";
    }

    // Load from classpath resources
    InputStream is = getClass().getResourceAsStream("/static" + path);
    if (is == null) {
        resp.sendError(404, "File not found");
        return;
    }

    // Set content type based on extension
    String contentType = getContentType(path);
    resp.setContentType(contentType);

    // Set cache headers for production
    if (isProduction) {
        resp.setHeader("Cache-Control", "public, max-age=31536000");
    }

    // Stream file to response
    IOUtils.copy(is, resp.getOutputStream());
}
```

---

## Dependencies

### Production Dependencies
```gradle
dependencies {
    // Ignition SDK
    compileOnly("com.inductiveautomation.ignitionsdk:ignition-common:8.3.0")
    compileOnly("com.inductiveautomation.ignitionsdk:gateway-api:8.3.0")

    // Jakarta Servlet API (not javax!)
    compileOnly("jakarta.servlet:jakarta.servlet-api:5.0.0")

    // JSON processing (if not available in Ignition)
    implementation("com.google.code.gson:gson:2.10.1")
}
```

### Key Import Requirements
```java
// MUST use jakarta.* instead of javax.*
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
// NOT: import javax.servlet.http.*
```

---

## Build Configuration

### Gradle Build (build.gradle.kts)
```kotlin
plugins {
    id("java")
    id("io.ia.sdk.modl") version "0.1.1"
}

ignitionModule {
    name.set("Web Designer")
    moduleId.set("com.me.webdesigner")
    moduleVersion.set("0.20.0")

    requiredIgnitionVersion.set("8.3.0")
    requiredFrameworkVersion.set("8")

    hooks.put("com.me.webdesigner.GatewayHook", "gateway")

    // Include frontend build output
    from("frontend/dist") {
        into("static")
    }
}
```

---

## Error Handling

### Standard Error Responses
```java
// 400 Bad Request - Invalid input
resp.sendError(400, "Invalid project name");

// 401 Unauthorized - No session
resp.sendError(401, "No valid session");

// 403 Forbidden - No permission
resp.sendError(403, "Requires Designer role");

// 404 Not Found - Resource doesn't exist
resp.sendError(404, "View not found");

// 409 Conflict - ETag mismatch
resp.sendError(409, "File has been modified by another user");

// 428 Precondition Required - Missing If-Match
resp.sendError(428, "If-Match header required");

// 500 Internal Server Error - Unexpected exception
resp.sendError(500, "Internal server error");
```

---

## Performance Considerations

- **Connection Pooling**: Reuse GatewayContext managers (singleton pattern)
- **Request Size Limits**: Enforce 2MB max for PUT requests
- **Resource Caching**: No backend caching (always fresh from ProjectManager)
- **Thread Safety**: All handlers must be thread-safe (stateless)

---

## Testing Strategy

### Unit Tests
```java
@Test
public void testSanitizeProjectName() {
    assertEquals("MyProject", PathUtil.sanitize("MyProject"));
    assertEquals("MyProject", PathUtil.sanitize("../MyProject"));
    assertEquals("MyProject", PathUtil.sanitize("My<script>Project"));
}
```

### Integration Tests
- Test with mock GatewayContext
- Test authentication flows
- Test optimistic concurrency scenarios

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - High-level architecture
- **[FRONTEND.md](./FRONTEND.md)** - React SPA architecture
- **[DATA_FLOW.md](./DATA_FLOW.md)** - API data flows
- **[../API.md](../API.md)** - REST API specification
- **[../SECURITY.md](../SECURITY.md)** - Security requirements

---

**Last Updated:** 2025-11-07
**Document Version:** 1.0
