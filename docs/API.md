# Web Designer API Reference

**Version**: 0.18.0
**Base URL**: `http://gateway:8088/data/webdesigner/api/v1`
**Authentication**: Ignition Gateway session required
**Content-Type**: `application/json`

---

## Table of Contents

- [Authentication](#authentication)
- [Projects API](#projects-api)
- [Views API](#views-api)
- [Tags API](#tags-api)
- [Components API](#components-api)
- [Error Responses](#error-responses)
- [Optimistic Concurrency](#optimistic-concurrency)

---

## Authentication

All API endpoints require a valid Ignition Gateway session with Designer role privileges.

### Session Requirements
- User must be logged into the Gateway web interface
- Session cookie (`JSESSIONID`) must be sent with requests
- Frontend uses `withCredentials: true` in axios configuration

### Authorization
- All endpoints check for `SessionScope.Designer` access
- Unauthorized requests return `401 Unauthorized`
- Forbidden requests return `403 Forbidden`

### Example (Axios)
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://gateway:8088',
  withCredentials: true,  // Required for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Now all requests include session cookies
const response = await apiClient.get('/data/webdesigner/api/v1/projects');
```

---

## Projects API

### GET /api/v1/projects
List all Perspective projects available on the Gateway.

**Request**:
```http
GET /data/webdesigner/api/v1/projects HTTP/1.1
Host: gateway:8088
Cookie: JSESSIONID=...
```

**Response**: `200 OK`
```json
{
  "projects": [
    "MyProject",
    "AnotherProject",
    "TestProject"
  ]
}
```

**Response Codes**:
- `200 OK` - Success
- `401 Unauthorized` - No valid session
- `500 Internal Server Error` - Gateway error

**Notes**:
- Only returns Perspective-enabled projects
- Project names are sorted alphabetically
- Filters out Vision-only and non-Perspective projects

---

## Views API

### GET /api/v1/projects/{name}/views
List all Perspective views in a specific project.

**Request**:
```http
GET /data/webdesigner/api/v1/projects/MyProject/views HTTP/1.1
Host: gateway:8088
Cookie: JSESSIONID=...
```

**Response**: `200 OK`
```json
{
  "project": "MyProject",
  "views": [
    {
      "name": "MainView",
      "path": "MainView"
    },
    {
      "name": "Settings",
      "path": "Settings"
    },
    {
      "name": "Dashboard",
      "path": "Dashboards/Dashboard"
    }
  ]
}
```

**Response Codes**:
- `200 OK` - Success
- `401 Unauthorized` - No valid session
- `404 Not Found` - Project not found
- `500 Internal Server Error` - Gateway error

**Notes**:
- Returns all `.json` view files in the project's `com.inductiveautomation.perspective/views/` resource path
- View `path` is relative to the views folder
- Nested folders are represented in the path (e.g., `"Dashboards/Dashboard"`)

---

### GET /api/v1/projects/{name}/view
Get the content of a specific view file.

**Request**:
```http
GET /data/webdesigner/api/v1/projects/MyProject/view?path=MainView HTTP/1.1
Host: gateway:8088
Cookie: JSESSIONID=...
```

**Response**: `200 OK`
```json
{
  "project": "MyProject",
  "viewPath": "MainView",
  "content": {
    "meta": {
      "version": 1
    },
    "params": {},
    "props": {},
    "root": {
      "type": "ia.container.flex",
      "props": {
        "style": {
          "classes": ""
        }
      },
      "children": [
        {
          "type": "ia.display.label",
          "props": {
            "text": "Hello World"
          },
          "position": {
            "basis": "200px"
          }
        }
      ]
    }
  },
  "etag": "sha256-a1b2c3d4e5f6..."
}
```

**Response Headers**:
- `ETag`: `"sha256-a1b2c3d4e5f6..."` - Used for optimistic concurrency

**Response Codes**:
- `200 OK` - Success
- `401 Unauthorized` - No valid session
- `404 Not Found` - Project or view not found
- `500 Internal Server Error` - Gateway error

**Query Parameters**:
- `path` (required): View path relative to views folder (e.g., `"MainView"` or `"Dashboards/Dashboard"`)

**Notes**:
- Returns the raw `view.json` content
- `etag` is a SHA-256 hash of the file content for optimistic concurrency
- View structure follows Perspective view.json format

---

### PUT /api/v1/projects/{name}/view
Save changes to a view file (with optimistic concurrency).

**Request**:
```http
PUT /data/webdesigner/api/v1/projects/MyProject/view?path=MainView HTTP/1.1
Host: gateway:8088
Cookie: JSESSIONID=...
If-Match: "sha256-a1b2c3d4e5f6..."
Content-Type: application/json

{
  "meta": {
    "version": 1
  },
  "params": {},
  "props": {},
  "root": {
    "type": "ia.container.flex",
    "props": {
      "style": {
        "classes": ""
      }
    },
    "children": [
      {
        "type": "ia.display.label",
        "props": {
          "text": "Hello World - Updated!"
        },
        "position": {
          "basis": "200px"
        }
      }
    ]
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "View saved successfully",
  "etag": "sha256-b2c3d4e5f6a1..."
}
```

**Response Headers**:
- `ETag`: `"sha256-b2c3d4e5f6a1..."` - New ETag for the saved content

**Response Codes**:
- `200 OK` - Success
- `401 Unauthorized` - No valid session
- `404 Not Found` - Project or view not found
- `409 Conflict` - If-Match header doesn't match (file was modified by another user)
- `412 Precondition Failed` - Missing If-Match header
- `500 Internal Server Error` - Gateway error

**Required Headers**:
- `If-Match`: `"sha256-..."` - ETag from previous GET request (for optimistic concurrency)

**Query Parameters**:
- `path` (required): View path relative to views folder

**Notes**:
- Implements optimistic concurrency to prevent overwriting changes
- The `If-Match` header must match the current file's ETag
- If another user modified the file, returns `409 Conflict` with current ETag
- Audit logs the save operation with username, timestamp, and client IP

---

## Tags API

### GET /api/v1/tags
List all tag providers on the Gateway.

**Request**:
```http
GET /data/webdesigner/api/v1/tags HTTP/1.1
Host: gateway:8088
Cookie: JSESSIONID=...
```

**Response**: `200 OK`
```json
{
  "providers": [
    {
      "name": "default"
    },
    {
      "name": "PLC1"
    },
    {
      "name": "Simulation"
    }
  ]
}
```

**Response Codes**:
- `200 OK` - Success
- `401 Unauthorized` - No valid session
- `500 Internal Server Error` - Gateway error

**Notes**:
- Returns all configured tag providers
- Provider names are sorted alphabetically
- Empty array if no providers configured

---

### GET /api/v1/tags/{provider}
Browse tag tree hierarchy for a specific provider.

**Request**:
```http
GET /data/webdesigner/api/v1/tags/default?path=Folder1/SubFolder HTTP/1.1
Host: gateway:8088
Cookie: JSESSIONID=...
```

**Response**: `200 OK`
```json
{
  "provider": "default",
  "path": "Folder1/SubFolder",
  "tags": [
    {
      "name": "Temperature",
      "path": "Folder1/SubFolder/Temperature",
      "type": "Float",
      "hasChildren": false
    },
    {
      "name": "Alarms",
      "path": "Folder1/SubFolder/Alarms",
      "type": "Folder",
      "hasChildren": true
    }
  ]
}
```

**Response Codes**:
- `200 OK` - Success
- `401 Unauthorized` - No valid session
- `404 Not Found` - Provider or path not found
- `500 Internal Server Error` - Gateway error

**Query Parameters**:
- `path` (optional): Folder path within the provider (e.g., `"Folder1/SubFolder"`)
  - If omitted, returns root-level tags

**Notes**:
- Returns tags and folders at the specified path
- `hasChildren: true` indicates a folder that can be expanded
- Tag `type` indicates data type (Int, Float, String, Boolean, etc.) or "Folder"
- Use recursive calls to browse the full tag tree

---

## Components API

### GET /api/v1/perspective/components
Get the catalog of available Perspective components.

**Request**:
```http
GET /data/webdesigner/api/v1/perspective/components HTTP/1.1
Host: gateway:8088
Cookie: JSESSIONID=...
```

**Response**: `200 OK`
```json
{
  "components": [
    {
      "type": "ia.container.flex",
      "category": "Layout",
      "name": "Flex Container",
      "icon": "📦",
      "defaultProps": {
        "style": {
          "classes": ""
        }
      }
    },
    {
      "type": "ia.display.label",
      "category": "Display",
      "name": "Label",
      "icon": "🏷️",
      "defaultProps": {
        "text": "Label"
      }
    }
  ]
}
```

**Response Codes**:
- `200 OK` - Success
- `401 Unauthorized` - No valid session
- `500 Internal Server Error` - Gateway error

**Notes**:
- Returns component metadata for the component palette
- `defaultProps` used when dragging component from palette
- Currently returns a static list of 11 common components
- Future: Introspect from Gateway's Perspective module

---

## Error Responses

All error responses follow this format:

```json
{
  "error": true,
  "status": 404,
  "message": "Project 'InvalidProject' not found"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | No valid Gateway session |
| 403 | Forbidden | User lacks Designer role |
| 404 | Not Found | Resource not found (project, view, tag provider) |
| 409 | Conflict | Optimistic concurrency failure (file was modified) |
| 412 | Precondition Failed | Missing required header (e.g., If-Match) |
| 500 | Internal Server Error | Gateway internal error |

### Error Response Examples

**401 Unauthorized**:
```json
{
  "error": true,
  "status": 401,
  "message": "Authentication required. Please log in to the Gateway."
}
```

**409 Conflict** (Optimistic Concurrency):
```json
{
  "error": true,
  "status": 409,
  "message": "View was modified by another user. Please reload and try again.",
  "currentEtag": "sha256-newHash..."
}
```

**500 Internal Server Error**:
```json
{
  "error": true,
  "status": 500,
  "message": "Failed to read view: IOException",
  "details": "java.io.IOException: Resource not found"
}
```

---

## Optimistic Concurrency

The PUT `/api/v1/projects/{name}/view` endpoint implements optimistic concurrency control to prevent users from overwriting each other's changes.

### How It Works

1. **GET view** - Receive current view content and ETag header
2. **Edit locally** - User makes changes in the Web Designer
3. **PUT view** - Send changes with `If-Match: <etag>` header
4. **Gateway validates** - Compares If-Match with current file's ETag
5. **Success or Conflict**:
   - **Match**: Save succeeds, return new ETag
   - **Mismatch**: Return `409 Conflict` with current ETag

### Example Flow

```javascript
// Step 1: Load view
const getResponse = await apiClient.get(
  '/data/webdesigner/api/v1/projects/MyProject/view?path=MainView'
);
const { content, etag } = getResponse.data;
const currentEtag = getResponse.headers['etag'];

// Step 2: User edits content locally
const updatedContent = { ...content };
updatedContent.root.children[0].props.text = "Updated!";

// Step 3: Save with If-Match
try {
  const putResponse = await apiClient.put(
    '/data/webdesigner/api/v1/projects/MyProject/view?path=MainView',
    updatedContent,
    {
      headers: {
        'If-Match': currentEtag
      }
    }
  );

  // Success! Update stored ETag
  const newEtag = putResponse.headers['etag'];

} catch (error) {
  if (error.response.status === 409) {
    // Conflict! Another user modified the file
    alert("View was modified by another user. Please reload.");
    // Reload to get latest version
    window.location.reload();
  }
}
```

### Best Practices

1. **Always include If-Match** on PUT requests
2. **Handle 409 Conflict** by prompting user to reload
3. **Update stored ETag** after successful save
4. **Warn before reload** if user has unsaved changes

---

## Rate Limiting

Currently, there is no rate limiting on API endpoints. Future versions may implement:
- Per-user request limits (e.g., 100 requests/minute)
- Burst limits for write operations
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)

---

## Versioning

The API uses URL path versioning (`/api/v1/...`).

**Current Version**: v1 (stable)

Future breaking changes will increment the version (e.g., `/api/v2/...`), with:
- Support for previous version for 6+ months
- Deprecation warnings in response headers
- Migration guide provided

---

## Security Considerations

### Authentication & Authorization
- All endpoints require Designer role
- Session timeouts respect Gateway configuration
- Failed authentication attempts are audit logged

### Input Validation
- All user inputs are validated and sanitized
- JSON payloads limited to 2MB
- Path traversal attempts are blocked
- SQL injection protection (parameterized queries if applicable)

### Audit Logging
All state-changing operations are logged:
- Username
- Timestamp
- Client IP address
- Resource path
- Success/failure status

### CORS & CSRF
- CORS is not enabled (same-origin only)
- CSRF protection relies on session cookies
- Custom headers (`If-Match`) provide additional CSRF protection

---

## Testing the API

### Using curl (with session cookie)

```bash
# 1. Login to Gateway to get session cookie
curl -c cookies.txt -X POST http://gateway:8088/system/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 2. Use session cookie for API requests
curl -b cookies.txt http://gateway:8088/data/webdesigner/api/v1/projects

# 3. Get a specific view
curl -b cookies.txt \
  "http://gateway:8088/data/webdesigner/api/v1/projects/MyProject/view?path=MainView"
```

### Using Postman

1. **Login**: POST to `http://gateway:8088/system/login`
2. **Enable Cookies**: Postman will automatically store session cookies
3. **Test Endpoints**: Use the session cookie for subsequent requests

---

## Changelog

### v0.18.0 (2025-11-07)
- Fixed session authentication with `withCredentials: true`
- All endpoints now properly validate Gateway session
- Improved error messages

### v0.6.0 (2025-11-03)
- Added GET `/api/v1/perspective/components`
- Optimistic concurrency implemented for PUT view
- Audit logging framework added

### v0.5.0 (2025-11-02)
- Added PUT `/api/v1/projects/{name}/view`
- Implemented ETag-based concurrency control

### v0.2.0 (2025-10-28)
- Initial API implementation
- GET endpoints for projects, views, and tags

---

**Last Updated**: 2025-11-07
**API Version**: v1
**Module Version**: v0.18.0
