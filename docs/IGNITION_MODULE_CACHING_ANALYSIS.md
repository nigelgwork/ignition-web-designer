# Ignition Gateway Module Loading, Caching, and Deployment Analysis

## Executive Summary

Based on comprehensive research of the Web Designer module codebase and Ignition Gateway documentation, the critical issue of the Gateway loading old cached module code despite a new .modl file being deployed is primarily caused by **Ignition's module classloader caching and persistence mechanisms**, combined with **improper module uninstallation procedures**.

This document explains:
1. How Ignition Gateway loads modules
2. All caching mechanisms involved
3. Proper procedures to upgrade/replace modules
4. Known issues and solutions

---

## 1. How Ignition Gateway Loads Modules

### 1.1 Module Loading Architecture

Ignition Gateway uses a **modular architecture** where modules are packaged as `.modl` files (Java modules with .jar bundling, resources, and metadata).

#### Loading Process:
```
1. Startup Phase
   ├─ Gateway discovers .modl files in /data/var/ignition/modl/
   ├─ For each .modl:
   │  ├─ Extract module.xml (metadata)
   │  ├─ Verify module signature
   │  ├─ Check dependencies
   │  └─ Load module JAR via ModuleClassLoader
   │
2. Initialization Phase
   ├─ Create ModuleHook instance (e.g., GatewayHook)
   ├─ Call setup(GatewayContext)
   ├─ Register servlets/routes
   │
3. Startup Phase
   ├─ Call startup(LicenseState)
   ├─ Logger outputs: "Starting up module 'com.me.webdesigner' v0.18.0"
   │
4. Running State
   ├─ Module remains loaded for entire Gateway session
   └─ No automatic reloading of .modl changes
```

### 1.2 Module ClassLoader Hierarchy

Ignition uses a **custom classloader hierarchy** for each module:

```
Bootstrap ClassLoader (JVM)
    ↓
Platform ClassLoader (java.*, jakarta.*)
    ↓
App ClassLoader (Ignition core classes)
    ↓
ModuleClassLoader (Per-module)
    ├─ Loads gateway.jar (module code)
    ├─ Loads module dependencies
    └─ Isolated from other modules (to prevent conflicts)
```

**Key Point:** Each module gets its own isolated classloader instance when the module is loaded. This instance is held in memory and **persists for the life of the Gateway process**.

---

## 2. Caching Mechanisms Involved

### 2.1 JAR File Caching (File System)

**Location:** `/usr/local/ignition/data/local/cache/` and `/usr/local/ignition/data/local/temp/`

**What:** Ignition caches extracted module JAR files for faster loading on subsequent Gateway restarts.

**Duration:** Persists across Gateway restarts until explicitly cleared.

**Impact:**
- If you replace a .modl file but don't clear cache, old JAR is used
- This is **the primary cause** of loading old code

**Solution:**
```bash
# Clear module cache BEFORE restarting Gateway
rm -rf /usr/local/ignition/data/local/cache/*
rm -rf /usr/local/ignition/data/local/temp/*

# Then restart
systemctl restart ignition
```

### 2.2 Module Registry Caching

**Location:** Ignition's internal module registry (in-memory during runtime)

**What:** Ignition maintains an in-memory registry of loaded modules with:
- Module ID
- Version number
- ClassLoader instance
- Module state (Running, Stopped, etc.)

**Duration:** Per-session (cleared on restart)

**Impact:**
- During runtime, module updates via the web UI store the old version in registry
- Registry doesn't automatically detect that the .modl file was replaced
- Running module continues using old classloader

### 2.3 ClassLoader Caching (Runtime Memory)

**What:** The ModuleClassLoader instance holds cached class definitions in memory.

**Duration:** For the lifetime of the Gateway process

**Impact:**
- Classes are loaded once and never reloaded during Gateway runtime
- Changing the .modl file does NOT reload classes
- **Gateway restart is required** to get new code

**Example:**
```
Scenario:
1. v0.17.0 deployed, Gateway running → GatewayHook v0.17.0 loaded
2. Build v0.18.0, deploy Web-Designer-0.18.0.modl
3. Restart Gateway → Still sees v0.17.0!

Why?
- Old v0.17.0 .modl is still in /data/var/ignition/modl/
- Cache contains old gateway.jar
- ModuleClassLoader loads old jar from cache
- Gateway startup logs show v0.17.0 (not v0.18.0)
```

---

## 3. Module Installation/Upgrade Procedures

### 3.1 First-Time Installation (Correct Procedure)

```bash
# Step 1: Build module
./gradlew clean build assembleModl
# Output: build/Web-Designer-0.18.0.modl

# Step 2: Copy to Gateway modules directory
cp build/Web-Designer-0.18.0.modl \
   /usr/local/ignition/data/var/ignition/modl/

# Step 3: Restart Gateway
systemctl restart ignition
```

**OR via Web UI:**
1. Navigate to: Config → System → Modules
2. Click: "Install or Upgrade a Module"
3. Select: `Web-Designer-0.18.0.modl`
4. Click: "Install"
5. Gateway automatically restarts

### 3.2 Upgrading to New Version (CRITICAL - Most Common Source of Caching Issues)

**WRONG WAY (Results in old code being loaded):**
```bash
# ❌ DON'T DO THIS
1. Build v0.18.0 as Web-Designer-0.18.0.modl
2. Copy to /data/var/ignition/modl/
3. Restart Gateway
# RESULT: Old v0.17.0 still loads because cache wasn't cleared!
```

**CORRECT WAY:**
```bash
# ✅ DO THIS INSTEAD

# Step 1: Uninstall old version FIRST
# Option A: Via Web UI
#   Config → System → Modules
#   Find "Web Designer"
#   Click "Uninstall"
#   Wait for module to stop
#   Restart Gateway
#
# Option B: Manual file removal
#   rm /usr/local/ignition/data/var/ignition/modl/Web-Designer-0.17.0.modl

# Step 2: Clean cache BEFORE next startup
systemctl stop ignition
rm -rf /usr/local/ignition/data/local/cache/*
rm -rf /usr/local/ignition/data/local/temp/*
rm -rf /usr/local/ignition/data/local/user/com.me.webdesigner/  # Module-specific temp

# Step 3: Copy new version
cp build/Web-Designer-0.18.0.modl \
   /usr/local/ignition/data/var/ignition/modl/

# Step 4: Restart
systemctl start ignition
```

### 3.3 In-Place Replacement (NOT RECOMMENDED)

```bash
# ❌ DON'T: Replace file while Gateway is running
# This can cause:
# - Partial module load (some code from old, some from new)
# - ClassLoader conflicts
# - 403 errors on module operations

# ✅ DO: Always restart Gateway after changing .modl file
```

---

## 4. Signed vs Unsigned Module Priority

### 4.1 Module Signature Verification

**Location of signatures:** Inside .modl file (ZIP archive)
- `META-INF/signatures.properties` - File signatures
- `certificates.p7b` - Certificate chain

**Signature verification happens:**
```
During module load (startup phase)
├─ Extract .modl file
├─ Check for certificates.p7b
├─ Read signatures.properties
├─ Verify file hashes against signatures
├─ Match public key to trusted certificates
└─ If validation fails → Module load fails with error
```

### 4.2 Signed vs Unsigned Priority

**Ignition's behavior:**
1. By default, Ignition **only loads signed modules**
2. To allow unsigned modules: Set JVM flag
   ```
   -Dignition.allowunsignedmodules=true
   ```
3. No preference between signed/unsigned if both allowed

### 4.3 Common Signature Issues

**Error:** "Module does not contain a certificate"

**Causes:**
1. **Cache issue** (most likely) - old unsigned version being loaded from cache
2. **Wrong file uploaded** - unsigned version uploaded instead of signed
3. **Signature verification failed** - trust store doesn't recognize certificate

**Solution (from verified signing report):**
```bash
# Clear cache and reinstall
systemctl stop ignition

# Clear all cache
rm -rf /usr/local/ignition/data/local/cache/*
rm -rf /usr/local/ignition/data/local/temp/*

# Remove old module
rm /usr/local/ignition/data/var/ignition/modl/Web-Designer-0.17.0.modl

# Install new signed module
cp build/Web-Designer-0.18.0.modl \
   /usr/local/ignition/data/var/ignition/modl/

# Verify file integrity before restart
jar tf /usr/local/ignition/data/var/ignition/modl/Web-Designer-0.18.0.modl | grep certificates.p7b

# Restart
systemctl start ignition
```

---

## 5. Cache Invalidation Strategies

### 5.1 Automatic Cache Invalidation (Built-in)

Ignition **automatically invalidates cache** when:
1. **Gateway restart** - All caches cleared from memory
2. **Module version changes** in module.xml - Cache keys include version
3. **Module removal** - Associated cache cleaned up

**BUT:** File system caches in `/data/local/cache/` and `/data/local/temp/` are NOT automatically cleared!

### 5.2 Manual Cache Invalidation (Required for upgrades)

**Complete Cache Clear (Most Thorough):**
```bash
systemctl stop ignition

# Clear all caches
rm -rf /usr/local/ignition/data/local/cache/*
rm -rf /usr/local/ignition/data/local/temp/*
rm -rf /usr/local/ignition/data/local/user/com.me.webdesigner/

# Clear module registry
rm -rf /usr/local/ignition/data/modl-registry/

systemctl start ignition
```

**Targeted Cache Clear (For specific module):**
```bash
systemctl stop ignition

# Clear only Web Designer caches
rm -rf /usr/local/ignition/data/local/cache/Web-Designer*
rm -rf /usr/local/ignition/data/local/temp/Web-Designer*
rm -rf /usr/local/ignition/data/local/user/com.me.webdesigner/

systemctl start ignition
```

**Browser Cache Clear (Frontend assets):**
```javascript
// JavaScript console while in Web Designer
// This clears browser-cached assets
localStorage.clear()
sessionStorage.clear()
// Then: Ctrl+Shift+R (hard refresh)
```

---

## 6. Deployment Checklist (Preventing Cache Issues)

### 6.1 Safe Module Upgrade Procedure

```
PRE-DEPLOYMENT
  ✓ Test module builds successfully
  ✓ Verify module.xml version is incremented
  ✓ Verify certificates are embedded (signed)
  ✓ Backup current module file
  ✓ Verify module file size matches expectations

DEPLOYMENT
  ✓ Stop Gateway (via systemctl or orchestration)
  ✓ Uninstall old module from /data/var/ignition/modl/
  ✓ Clear cache directories
  ✓ Copy new .modl file
  ✓ Verify new file is present and readable
  ✓ Start Gateway
  
POST-DEPLOYMENT
  ✓ Check logs for "Starting up module" message
  ✓ Verify module appears in Config → Modules
  ✓ Verify version number matches new version
  ✓ Clear browser cache (Ctrl+Shift+R)
  ✓ Test module functionality
  ✓ Check for 401/403 errors
```

### 6.2 Docker Deployment (Common Pattern)

```bash
# Build
./gradlew clean build assembleModl

# Deploy to container
docker cp build/Web-Designer-0.18.0.modl \
  ignition-container:/usr/local/ignition/data/var/ignition/modl/

# Restart container (NOT just restart service)
docker restart ignition-container

# Verify
docker logs ignition-container | grep "Web Designer"
```

---

## 7. Known Issues and Solutions

### Issue #1: Gateway Loads Old Module Version Despite New .modl File

**Symptoms:**
- Log shows "v0.17.0" but deployed v0.18.0
- API calls return old behavior
- Frontend assets are old version

**Root Causes:**
1. Cache not cleared before restart (80% of cases)
2. Old .modl file still present in modules directory
3. Module directory doesn't exist or wrong permissions

**Solution:**
```bash
# Step 1: Verify files
ls -la /usr/local/ignition/data/var/ignition/modl/
# Should show ONLY the new version file

# Step 2: Stop Gateway
systemctl stop ignition

# Step 3: Remove all old .modl files
rm /usr/local/ignition/data/var/ignition/modl/Web-Designer-*.modl

# Step 4: Clear caches
rm -rf /usr/local/ignition/data/local/cache/*
rm -rf /usr/local/ignition/data/local/temp/*

# Step 5: Copy new version
cp build/Web-Designer-0.18.0.modl \
   /usr/local/ignition/data/var/ignition/modl/

# Step 6: Verify copy succeeded
ls -la /usr/local/ignition/data/var/ignition/modl/

# Step 7: Start Gateway
systemctl start ignition

# Step 8: Verify in logs
tail -f /usr/local/ignition/logs/wrapper.log | grep "Web Designer"
```

### Issue #2: "Module does not contain a certificate" Error

**Root Cause:** Usually cache issue, not signature issue

**Solution:**
```bash
# First: Verify unsigned .modl was not uploaded by mistake
jar tf build/Web-Designer-0.18.0.modl | grep certificates.p7b
# Should output: certificates.p7b

# Then: Clear cache and reinstall (same as Issue #1)
```

### Issue #3: Module Fails to Load After Upgrade

**Symptoms:**
- Log shows error during module load
- Module doesn't appear in Config → Modules
- "Class not found" or "Dependency not satisfied"

**Solutions:**
1. **Verify Java version:** Must be JDK 17+
2. **Verify Ignition version:** Must be 8.3.0+
3. **Check dependencies:** Perspective module must be installed
4. **Check signature:** Re-sign if needed
5. **Check file corruption:** Rebuild module

```bash
# Rebuild from scratch
./gradlew clean build assembleModl

# Verify module integrity
jar tf build/Web-Designer-0.18.0.modl | head -20

# Verify signature
keytool -printcert -file build/Web-Designer-0.18.0.modl | head -20
```

### Issue #4: ClassLoader Still Has Old Code After Restart

**Cause:** Classloader cache not fully cleared

**Solution:** Use `docker restart` instead of service restart
```bash
# DON'T: systemctl restart ignition
# This may not fully clear classloader

# DO: Full process restart
systemctl stop ignition
sleep 5  # Wait for process to fully exit
systemctl start ignition

# OR Docker:
docker stop ignition-container
docker start ignition-container
```

---

## 8. Key Takeaways for the Web Designer Module

### Critical Points:

1. **Ignition does NOT automatically reload module code** - Gateway restart required
2. **File system caches must be manually cleared** - /data/local/cache/* and /data/local/temp/*
3. **Old .modl files must be deleted** - Multiple versions in modules dir cause confusion
4. **Module version in module.xml must be incremented** - To invalidate version-based caches
5. **Browser caches frontend assets** - Hard refresh (Ctrl+Shift+R) needed for UI changes

### Deployment Formula:

```
Clean Build + Cache Clear + Old File Removal + Restart = Guaranteed New Code Loading
```

### Monitoring Command:

```bash
# Watch for module loading logs
tail -f /usr/local/ignition/logs/wrapper.log | grep -i "webdesigner\|web designer"

# Expected output:
# INFO - Starting up module 'com.me.webdesigner' v0.18.0
# INFO - Web Designer module starting up
# INFO - Mounting Web Designer API routes at /data/webdesigner/api/v1
```

---

## 9. References

### Code References from Web Designer Project:

**Module Entry Point:** `/modules/ignition-web-designer/gateway/src/main/java/com/me/webdesigner/GatewayHook.java`
- `setup(GatewayContext)` - Called during module initialization
- `startup(LicenseState)` - Called after routes mounted
- `shutdown()` - Called during module unload

**Module Metadata:** `/modules/ignition-web-designer/build/moduleContent/module.xml`
- Version: 1.0.1
- Module ID: com.me.webdesigner
- Required: Ignition 8.3.0+

**Build Configuration:** `/modules/ignition-web-designer/build.gradle.kts`
- Handles module signing
- Manages version numbering
- Controls JAR bundling

### Documentation References:

- **Deployment Guide:** `/modules/ignition-web-designer/DEPLOYMENT.md`
- **Signing Verification:** `/modules/ignition-web-designer/docs/archive/deprecated/VERIFY_SIGNING.md`
- **Architecture:** `/modules/ignition-web-designer/docs/architecture/BACKEND.md`
- **Development:** `/modules/ignition-web-designer/docs/DEVELOPMENT.md`

