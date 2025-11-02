# Deployment Guide - Web-Based Ignition Perspective Designer

## Version: 0.6.0

This guide provides step-by-step instructions for deploying the Web Designer module to an Ignition Gateway.

---

## Prerequisites

### Ignition Gateway Requirements

- **Ignition Version**: 8.3.0 or higher
- **Java Version**: JDK 17 (required for Ignition 8.3+)
- **Modules Required**:
  - Perspective Module (for viewing/editing Perspective views)
- **Permissions**: Gateway admin access for module installation

### Development Environment (for building)

- **Java JDK**: 17 or higher
- **Node.js**: 18+ (with npm)
- **Gradle**: Included via Gradle Wrapper (./gradlew)
- **Git**: For version control

---

## Building the Module

### Step 1: Clone the Repository

```bash
cd /path/to/modules/
git clone <your-repo-url> ignition-web-designer
cd ignition-web-designer
```

### Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

**Expected Output:**
```
dist/assets/index-[hash].css     25.22 kB
dist/assets/index-[hash].js     278.24 kB
 built in 1.43s
```

### Step 3: Build Gateway Module

```bash
./gradlew clean build
```

### Step 4: Create .modl File

```bash
./gradlew zipModule
```

The module file will be created at:
```
build/Web-Designer.unsigned.modl (approximately 384 KB)
```

---

## Installation on Ignition Gateway

### Step 1: Access Gateway Configuration

1. Open your web browser
2. Navigate to: `http://<gateway-ip>:8088`
3. Log in with admin credentials
4. Go to **Config** ’ **System** ’ **Modules**

### Step 2: Allow Unsigned Modules (Development Only)

**  WARNING: Only do this on development/test Gateways, NEVER in production!**

Edit the ignition.conf file:
```bash
sudo nano /usr/local/ignition/data/ignition.conf
```

Add this line:
```
wrapper.java.additional.X=-Dignition.allowunsignedmodules=true
```

Restart Ignition:
```bash
sudo systemctl restart ignition
```

### Step 3: Install the Module

1. In Gateway webpage, go to **Config** ’ **System** ’ **Modules**
2. Scroll to bottom, click **Install or Upgrade a Module**
3. Click **Choose File** and select `build/Web-Designer.unsigned.modl`
4. Click **Install**
5. Wait for module to install (10-30 seconds)
6. Module should appear with status **Running**

---

## Accessing the Web Designer

Navigate to:
```
http://<gateway-ip>:8088/res/webdesigner/
```

You should see:
- **Header**: "Ignition Web Designer v0.6.0 - Phase 6"
- **Left Sidebar**: ProjectTree and ComponentPalette
- **Center**: Canvas area
- **Right Sidebar**: PropertyEditor

---

## Testing the API Endpoints

```bash
# List all projects
curl http://localhost:8088/data/webdesigner/api/v1/projects

# Get component catalog
curl http://localhost:8088/data/webdesigner/api/v1/perspective/components

# List tag providers
curl http://localhost:8088/data/webdesigner/api/v1/tags
```

---

## Troubleshooting

### Module Won't Install

**Solutions**:
1. Check Ignition version is 8.3.0+
2. Verify unsigned modules are allowed
3. Check Gateway logs:
   ```
   tail -f /usr/local/ignition/logs/wrapper.log
   ```

### Frontend Not Loading

**Solutions**:
1. Verify module is **Running** in Modules page
2. Check browser DevTools Console for errors
3. Try hard refresh: Ctrl+Shift+R

### API Endpoints Return 404

**Solutions**:
1. Check Gateway logs for route mounting errors
2. Test API directly with curl
3. Look for "Mounting Web Designer API routes" in logs

---

## Security Considerations

### Development Mode (Current v0.6.0)

  **Current Status**: The module is in **development mode** with:
-  Authentication framework present but **not enforced**
-  Input validation active
- L Unsigned module

**DO NOT deploy v0.6.0 to production!**

### Production Readiness (Future v0.7.0+)

Before production deployment:
- [ ] Real authentication via Gateway session manager
- [ ] Role-based authorization
- [ ] Full audit logging
- [ ] Module signing with valid certificate
- [ ] Security audit completed

---

## Uninstalling the Module

1. Go to **Config** ’ **System** ’ **Modules**
2. Find "Web Designer" in the list
3. Click **Uninstall** button
4. Confirm uninstallation

---

## Logging and Debugging

### Gateway Logs

**Location**: `/usr/local/ignition/logs/`

```bash
# Real-time monitoring
tail -f /usr/local/ignition/logs/wrapper.log

# Search for module messages
grep "Web Designer" /usr/local/ignition/logs/wrapper.log
```

### Frontend Debugging

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Check **Network** tab for API call details

---

## Next Steps After Deployment

### For Developers

1. **Test on live Gateway** - Verify all API endpoints work
2. **Implement real Gateway APIs** - Replace placeholder code
3. **Add unit tests** - Backend and frontend coverage
4. **Security hardening** - Real auth, audit logging

### For Users

1. **Browse projects** - Verify projects appear in tree
2. **Open a view** - Test view loading
3. **Edit properties** - Modify component properties
4. **Save changes** - Verify view saves successfully
5. **Test undo/redo** - Verify history management works

---

**Last Updated**: 2025-11-03
**Module Version**: 0.6.0
**Document Version**: 1.0
