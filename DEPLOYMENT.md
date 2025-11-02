# Deployment Guide - Web Designer Module

## Version: 0.5.0

This guide provides instructions for deploying and testing the Web Designer module on an Ignition Gateway.

---

## Prerequisites

- Ignition Gateway 8.3.0 or higher
- Java 17 runtime
- At least one Perspective project created in the Gateway
- Perspective views created for testing

---

## Building the Module

### 1. Build Command

```bash
./gradlew clean zipModule
```

### 2. Build Output

The module file will be created at:
```
build/Web-Designer.unsigned.modl
```

Current size: **~379K**

---

## Installing the Module

### Option 1: Gateway Web Interface (Recommended)

1. Navigate to Gateway web interface: `http://your-gateway:8088`
2. Login with admin credentials
3. Go to **Config → System → Modules**
4. Click **Install or Upgrade a Module...**
5. Upload `build/Web-Designer.unsigned.modl`
6. Click **Install**

### Option 2: File System Installation

1. Copy the `.modl` file to Gateway's `user-lib/modules` directory:
   ```bash
   cp build/Web-Designer.unsigned.modl /path/to/ignition/user-lib/modules/
   ```
2. Restart the Gateway

---

## Allowing Unsigned Modules

Since this module is unsigned, you must configure Ignition to allow unsigned modules.

### Add to `ignition.conf`:

```ini
wrapper.java.additional.X=-Dignition.allowunsignedmodules=true
```

Replace `X` with the next available number in your `ignition.conf` file.

### Restart Gateway:

```bash
sudo systemctl restart ignition
```

Or on Windows:
```
net stop ignition
net start ignition
```

---

## Verifying Installation

### 1. Check Module Status

1. Go to **Config → System → Modules**
2. Verify "Web Designer" appears in the list
3. Status should be **Running**
4. Version should show **0.5.0**

### 2. Check Logs

Monitor Gateway logs for successful module startup:

```bash
tail -f /path/to/ignition/logs/wrapper.log
```

Look for:
```
INFO  [WebDesignerGatewayHook] Web Designer Module starting...
INFO  [WebDesignerApiRoutes] Mounting Web Designer API routes...
INFO  [WebDesignerApiRoutes] Mounted Web Designer API routes:
INFO  [WebDesignerApiRoutes]   - GET /data/webdesigner/api/v1/projects
INFO  [WebDesignerApiRoutes]   - GET /data/webdesigner/api/v1/projects/{name}/views
INFO  [WebDesignerApiRoutes]   - GET /data/webdesigner/api/v1/projects/{name}/view
INFO  [WebDesignerApiRoutes]   - PUT /data/webdesigner/api/v1/projects/{name}/view
```

---

## Accessing the Web Designer

### URL Format

```
http://your-gateway:8088/res/webdesigner/
```

Example:
```
http://localhost:8088/res/webdesigner/
```

### What You Should See

- **Header**: "🎨 Web Designer v0.5.0 - Phase 5"
- **Left Sidebar**:
  - ProjectTree with refresh button
  - ComponentPalette with draggable components
- **Center Canvas**: Empty state prompting to select a view
- **Right Sidebar**: PropertyEditor

---

## Testing the Module

### Phase 5 Features to Test

#### 1. Project and View Loading

**Note**: Currently returns placeholder data. API integration pending.

1. Click refresh button in ProjectTree
2. Expected: Empty projects list or placeholder message
3. Check browser console for API call: `GET /data/webdesigner/api/v1/projects`

#### 2. View Content Loading

**Note**: Currently returns placeholder data.

1. If views appear, click on a view name
2. Expected: Canvas loads with placeholder content or error
3. Check console for: `GET /data/webdesigner/api/v1/projects/{name}/view?path=...`

#### 3. Component Selection

1. If view content loads with components, click on a component in Canvas
2. PropertyEditor (right sidebar) should display component properties
3. Component path should appear (e.g., `root.children[0]`)

#### 4. Property Editing

1. Select a component
2. In PropertyEditor, click any property value
3. Textarea should appear for editing
4. Edit the value and click **Save** or press **Enter**
5. Verify property updates in component preview
6. "● Modified" indicator should appear in Canvas header

#### 5. Drag-and-Drop Components

1. In ComponentPalette, drag a component (e.g., "Button")
2. Drop it onto a component in the Canvas
3. New component should be added to the parent's children
4. "● Modified" indicator should appear

#### 6. Component Deletion

1. Select a component (not root)
2. Click the **✕** delete button
3. Confirmation dialog should appear
4. Confirm deletion
5. Component should be removed from tree
6. "● Modified" indicator should appear

#### 7. View Saving

**Note**: Currently sends to placeholder endpoint.

1. Make any modification (edit property, add/delete component)
2. "● Modified" indicator should appear
3. Click **Save** button
4. Check console for: `PUT /data/webdesigner/api/v1/projects/{name}/view`
5. Alert should show "View saved successfully!" (placeholder response)
6. "● Modified" indicator should clear

---

## API Integration (Phase 6+ Required)

The following API endpoints currently return placeholder data and require ProjectManager integration:

### 1. GET /api/v1/projects

**Current Status**: Returns empty array with note

**Required Implementation**:
```java
var projectManager = context.getProjectManager();
// Determine correct method for listing projects
Collection<String> projectNames = projectManager.getProjects(); // or similar
for (String name : projectNames) {
    projectsArray.add(name);
}
```

### 2. GET /api/v1/projects/{name}/views

**Current Status**: Returns empty array with note

**Required Implementation**:
```java
var project = context.getProjectManager().getProject(projectName);
var viewResources = project.getResourcesOfType(PerspectiveViewResourceType);
for (Resource resource : viewResources) {
    String viewPath = resource.getResourcePath().toString();
    String viewName = resource.getName();
    // Add to response
}
```

### 3. GET /api/v1/projects/{name}/view?path=...

**Current Status**: Returns placeholder content

**Required Implementation**:
```java
var project = context.getProjectManager().getProject(projectName);
var resourcePath = ResourcePath.fromString("view/" + viewPath);
var resource = project.getResource(resourcePath);
var viewData = resource.getData("view.json");
String viewJson = viewData.map(ImmutableBytes::getBytesAsString).orElse("{}");
JsonObject viewContent = JsonParser.parseString(viewJson).getAsJsonObject();
```

### 4. PUT /api/v1/projects/{name}/view?path=...

**Current Status**: Accepts and validates request, returns success message

**Required Implementation**:
```java
var project = context.getProjectManager().getProject(projectName);
var resourcePath = ResourcePath.fromString("view/" + viewPath);
var resource = project.getResource(resourcePath);
String viewJson = gson.toJson(viewContent);
resource.setData("view.json", viewJson.getBytes(StandardCharsets.UTF_8));
project.commitResource(resource);
```

---

## Troubleshooting

### Module Won't Install

**Issue**: "Module rejected: unsigned module"

**Solution**: Add `-Dignition.allowunsignedmodules=true` to `ignition.conf`

---

### Module Shows Error State

**Check**:
1. Gateway logs: `/path/to/ignition/logs/wrapper.log`
2. Look for Java exceptions or stack traces
3. Verify Java 17 is being used
4. Check module dependencies are available

---

### API Endpoints Return 404

**Check**:
1. Module is in "Running" state
2. URL is correct: `/data/webdesigner/api/v1/...`
3. Gateway logs for route mounting messages

---

### Frontend Not Loading

**Check**:
1. Browser console for JavaScript errors
2. URL is correct: `/res/webdesigner/`
3. Check Network tab for 404s on static resources
4. Verify frontend files in module: `unzip -l build/Web-Designer.unsigned.modl`

---

### ProjectTree Shows "No projects found"

**Expected Behavior**: This is normal. API integration is pending.

**Temporary Workaround**: Modify `WebDesignerApiRoutes.java:handleGetProjects()` to return hard-coded test data:

```java
JsonArray projectsArray = new JsonArray();
projectsArray.add("TestProject");
projectsArray.add("MyProject");
response.add("projects", projectsArray);
```

Rebuild and redeploy the module.

---

## Development Workflow

### Making Changes

1. Edit source files
2. Rebuild module: `./gradlew clean zipModule`
3. In Gateway, go to **Modules**
4. Click **Install or Upgrade a Module...**
5. Upload new `.modl` file
6. Click **Upgrade**
7. Refresh browser to see changes

### Hot Reload (Frontend Only)

For rapid frontend development:

1. Start Vite dev server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Access at: `http://localhost:5173`
3. API calls will proxy to Gateway at `localhost:8088`

---

## Production Considerations

### Before Production Deployment

1. **Sign the Module**:
   ```bash
   ./gradlew signModule
   ```
   Requires code signing certificate.

2. **Complete API Integration**:
   - Replace all TODO placeholders
   - Test with real projects and views
   - Verify ProjectManager API methods

3. **Add Authentication**:
   - Implement role checking in API endpoints
   - Verify user has Designer role
   - Check project permissions

4. **Add Error Handling**:
   - Proper HTTP status codes
   - User-friendly error messages
   - Detailed logging

5. **Performance Testing**:
   - Test with large views (100+ components)
   - Test with many projects (50+)
   - Monitor memory usage

6. **Security Review**:
   - Input validation on all API endpoints
   - XSS protection
   - CSRF protection for write operations
   - SQL injection prevention (if using database)

---

## Next Steps

See [README.md](README.md) for:
- Feature roadmap
- Development phases
- Architecture overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for:
- System design
- Component architecture
- API specifications
