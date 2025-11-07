# Testing Existing Project Loading

## Verify Web Designer Can See Your Existing Projects

### Step 1: Check You Have Perspective Projects

1. Login to Gateway: http://localhost:9088/web/config
2. Navigate to: **Config → Projects → Projects**
3. Verify you have at least one project listed
4. Check the project type - must be **Perspective** (not Vision)

**If you don't have any Perspective projects:**
- Click "Create New Project"
- Name: `TestProject`
- Project Type: **Perspective**
- Click Save

### Step 2: Create a Test View (if needed)

1. Open the project in Perspective Designer
2. Create a new view: Right-click Views → New View
3. Name it: `TestView`
4. Add a simple component (e.g., Label)
5. Save the view

### Step 3: Test the API Directly

Open your browser Developer Tools (F12) and run these commands in the Console:

**Test 1: List Projects**
```javascript
fetch('http://localhost:9088/data/webdesigner/api/v1/projects', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('Projects:', data))
  .catch(err => console.error('Error:', err))
```

**Expected Response:**
```json
{
  "projects": ["TestProject", "YourProject1", "YourProject2"]
}
```

**If you get 401 Unauthorized:**
- You're not logged in
- Go to http://localhost:9088/web/home and login first
- Then try the fetch again

**If you get empty array `{projects: []}`:**
- No Perspective projects exist
- Create one following Step 2

---

**Test 2: List Views in a Project**
```javascript
fetch('http://localhost:9088/data/webdesigner/api/v1/projects/TestProject/views', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('Views:', data))
  .catch(err => console.error('Error:', err))
```

**Expected Response:**
```json
{
  "project": "TestProject",
  "views": [
    {
      "name": "TestView",
      "path": "TestView",
      "folder": ""
    }
  ]
}
```

---

**Test 3: Load a View**
```javascript
fetch('http://localhost:9088/data/webdesigner/api/v1/projects/TestProject/view?path=TestView', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('View Content:', data))
  .catch(err => console.error('Error:', err))
```

**Expected Response:**
```json
{
  "project": "TestProject",
  "path": "TestView",
  "content": {
    "root": {
      "type": "ia.container.flex",
      "props": { ... },
      "children": [ ... ]
    }
  },
  "etag": "sha256-hash-here"
}
```

---

### Step 4: Check Web Designer UI

1. Login to Gateway: http://localhost:9088/web/home
2. Navigate to Web Designer (standalone): http://localhost:9088/data/webdesigner/standalone
3. Look at the **ProjectTree** (📁 Projects tab in left sidebar)

**What you should see:**
- List of your Perspective projects
- Click a project → expands to show views
- Click a view → loads in Canvas

**If you see "No projects":**
- Check browser Console (F12 → Console) for errors
- Check Network tab (F12 → Network) for failed requests
- Look for red errors or 401/403 responses

---

### Step 5: Check Gateway Logs

If the API tests above fail, check Gateway logs:

**Docker:**
```bash
docker logs ignition-python3-test --tail 100 | grep -i "webdesigner\|error"
```

**Look for:**
```
I [c.m.w.GatewayHook] Web Designer module starting up - Version 0.18.0
I [c.m.w.WebDesignerApiRoutes] Mounted Web Designer API routes
```

**If you see errors like:**
- `NoSuchMethodException: getProject` → ProjectManager API issue
- `ClassNotFoundException` → Missing dependencies
- `401` or `403` → Authentication/authorization issue

---

## Common Issues & Solutions

### Issue 1: "No projects found"

**Cause**: No Perspective projects exist
**Solution**: Create a Perspective project in Gateway Config → Projects

**Test:**
```javascript
// Should return array of project names
fetch('http://localhost:9088/data/webdesigner/api/v1/projects', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

### Issue 2: "401 Unauthorized"

**Cause**: Not logged in or session expired
**Solution**:
1. Go to http://localhost:9088/web/home
2. Login with your Gateway credentials
3. Then access http://localhost:9088/data/webdesigner/standalone

---

### Issue 3: Projects exist but not showing in Web Designer

**Cause A**: Projects are Vision-only (not Perspective)
**Solution**: Web Designer only shows Perspective projects. Create a Perspective project.

**Cause B**: API returning empty array
**Test**:
```javascript
fetch('http://localhost:9088/data/webdesigner/api/v1/projects', {
  credentials: 'include'
}).then(r => r.json()).then(data => {
  if (data.projects.length === 0) {
    console.log('API returns 0 projects - check Gateway has Perspective projects')
  }
})
```

**Cause C**: Frontend not calling API
**Test**: Check browser Network tab for request to `/api/v1/projects`

---

### Issue 4: Views not loading

**Cause**: View path incorrect or view doesn't exist
**Solution**:
1. Check view exists in Perspective Designer
2. Test API directly with the exact path:
```javascript
fetch('http://localhost:9088/data/webdesigner/api/v1/projects/YourProject/view?path=YourView', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

### Issue 5: Can't save changes

**Cause**: Missing ETag or optimistic concurrency conflict
**Solution**:
- Check Console for errors
- Verify view hasn't been modified by another user
- Try reloading the view and making changes again

---

## Diagnostic Checklist

Run through this checklist to diagnose project loading issues:

- [ ] I have logged into the Gateway at http://localhost:9088/web/home
- [ ] I can see projects in Config → Projects
- [ ] My projects are **Perspective** projects (not Vision)
- [ ] I have at least one view in a Perspective project
- [ ] API test #1 (fetch projects) returns my projects
- [ ] API test #2 (fetch views) returns views for a project
- [ ] API test #3 (fetch view content) returns view.json
- [ ] Web Designer loads at http://localhost:9088/data/webdesigner/standalone
- [ ] ProjectTree shows my projects in the left sidebar
- [ ] Clicking a project expands to show views
- [ ] Clicking a view loads it in the Canvas

**If any step fails, that's where the problem is!**

---

## Quick Test: Create Minimal Project

If you're not sure if your existing projects are compatible, create a minimal test:

1. **Create Project**:
   - Config → Projects → Create New Project
   - Name: `WebDesignerTest`
   - Type: **Perspective**
   - Click Save

2. **Create View**:
   - Open project in Perspective Designer
   - Right-click Views → New View
   - Name: `SimpleView`
   - Add one Label component
   - Set text to "Hello Web Designer"
   - Save

3. **Test in Web Designer**:
   - http://localhost:9088/data/webdesigner/standalone
   - ProjectTree should show "WebDesignerTest"
   - Click project → should show "SimpleView"
   - Click view → should load in Canvas
   - Should see Label with "Hello Web Designer"

**If this works:**
- ✅ Web Designer can load existing projects
- ✅ API is working correctly
- ❌ Your other projects might be incompatible (check they're Perspective, not Vision)

**If this doesn't work:**
- ❌ Something is wrong with the module/API
- Check Gateway logs for errors
- Verify module is properly installed (v0.18.0)

---

## Expected Behavior

When working correctly:

1. **Login** → http://localhost:9088/web/home
2. **Open Web Designer** → http://localhost:9088/data/webdesigner/standalone
3. **See Projects** → Left sidebar (📁 Projects tab) shows all Perspective projects
4. **Expand Project** → Click project name to see views
5. **Load View** → Click view name to load in Canvas
6. **Edit View** → Click components, edit properties
7. **Save View** → File → Save (Ctrl+S)
8. **Changes Persisted** → Reload view, changes are saved

---

## Need Help?

If projects still aren't showing after following this guide:

1. **Capture API Response**:
```javascript
fetch('http://localhost:9088/data/webdesigner/api/v1/projects', {
  credentials: 'include'
}).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2)))
```

2. **Capture Gateway Logs**:
```bash
docker logs ignition-python3-test --tail 200 | grep -i webdesigner
```

3. **Capture Browser Console Errors**:
   - F12 → Console tab
   - Screenshot any red errors

4. **Share the outputs** and I can help diagnose the specific issue.

---

## Bottom Line

**Web Designer DOES support existing projects.**

The API uses `ProjectManager.listProjects()` and `ProjectManager.getResource()` to read your actual Ignition projects and views. When you edit and save, it writes back to the same project files that Perspective Designer uses.

**If you're not seeing your projects**, it's a configuration or compatibility issue, not a fundamental limitation. Follow the tests above to identify exactly where the problem is.
