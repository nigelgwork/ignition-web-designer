# Web Designer v0.18.0 - Access Instructions

## How to Access the Web Designer

The Web Designer requires Gateway authentication. Follow these steps:

### Step 1: Login to Gateway

1. Open browser: **http://localhost:9088/web/home**
2. **Login** with your Gateway credentials
   - Default username: `admin`
   - Default password: `password` (or your custom password)

### Step 2: Access Web Designer

Once logged in, you have two options:

#### Option A: Via Gateway Home Page (Recommended)
1. After login, you'll see the Gateway home page
2. Look for the **"Web Designer"** section
3. Click on **"Perspective Designer"** launcher
4. The Web Designer will open in a new tab

#### Option B: Direct URL (Full-Screen Mode)
1. After logging in at http://localhost:9088/web/home
2. Navigate to: **http://localhost:9088/data/webdesigner/standalone**
3. This opens the Web Designer in full-screen mode (no Gateway sidebar)

## Understanding the 401 Error

If you see this error:
```
HTTP ERROR 401 Unauthorized
URI:    /data/webdesigner/standalone
STATUS:    401
MESSAGE:    Unauthorized
```

**This means you need to login first!**

The Web Designer requires a Designer session scope, which you get by:
1. Logging into the Gateway at http://localhost:9088/web/home
2. Then accessing /data/webdesigner/standalone

**You cannot access /data/webdesigner/standalone directly without logging in first.**

## Why "Designer" Session Scope?

The Web Designer uses `SessionScope.Designer` for security because:
- It requires access to Perspective projects and views
- It needs permission to modify view.json files
- It integrates with the Perspective Designer ecosystem
- This ensures only authorized users can edit views

## If Projects Aren't Loading

If you can access the Web Designer but no projects are showing:

1. **Verify Projects Exist**:
   - Check if you have any Perspective projects in your Gateway
   - Navigate to: Config → Projects
   - Create a new project if none exist

2. **Check Project Type**:
   - Web Designer only works with **Perspective** projects
   - Vision projects will not appear

3. **Check API Endpoint**:
   - Open browser dev tools (F12)
   - Go to Network tab
   - Try clicking "Refresh" in the Project Tree
   - Check if the request to `/data/webdesigner/api/v1/projects` succeeds
   - If it returns 403 Forbidden, you need Designer role permissions

4. **Check Permissions**:
   - Ensure your user has Designer role or appropriate permissions
   - Navigate to: Config → Security → Users/Roles
   - Verify your user has Designer access

## New UI - Vertical Tab Bar

v0.18.0 introduces a redesigned left sidebar with vertical icon tabs:

- **📁 Projects** (Ctrl+Shift+E) - Browse projects and views
- **🧩 Components** (Ctrl+Shift+C) - Drag components to canvas
- **🏷️ Tags** (Ctrl+Shift+T) - Browse and bind tags
- **📜 Scripts** (Ctrl+Shift+S) - View project scripts
- **🗄️ Queries** (Ctrl+Shift+Q) - Browse named queries

Click any tab to switch panels. The active panel gets full vertical space.
Click the active tab again (or click ◀ at bottom) to collapse the sidebar.

## Troubleshooting

### Problem: Can't access /web/home

**Solution**: Your Gateway may be running on a different port.
- Check: `docker ps` to see port mappings
- Look for: `0.0.0.0:XXXX->8088/tcp`
- Access: `http://localhost:XXXX/web/home`

### Problem: Gateway not responding

**Solution**: Check Gateway status
```bash
# For Docker
docker logs <container-name>

# For systemd service
systemctl status ignition

# Check process
ps aux | grep ignition
```

### Problem: Module not loading

**Solution**: Check Gateway logs
```bash
# Docker logs
docker logs <container-name> --tail 100

# File logs (if available)
tail -f /usr/local/bin/ignition/logs/wrapper.log
```

Look for lines containing:
```
Starting up module 'com.me.webdesigner' v0.18.0
Web Designer module starting up
```

## Access Summary

| URL | Purpose | Requires Login |
|-----|---------|----------------|
| http://localhost:9088/web/home | Gateway home page | Yes |
| http://localhost:9088/data/webdesigner/standalone | Full-screen Web Designer | Yes (Designer session) |
| http://localhost:9088/data/webdesigner/api/v1/projects | Projects API (JSON) | Yes (Designer session) |
| http://localhost:9088/data/webdesigner/test | API test endpoint | Yes (Designer session) |

## Port Configuration

Your Gateway is running on port **9088** (not 8088).

This is because you're using `ignition-toolkit` with Docker port mapping:
```
0.0.0.0:9088->8088/tcp
```

**Always use port 9088 in your browser URLs.**

---

**Still having issues?** Check the Gateway logs and browser console (F12 → Console) for specific error messages.
