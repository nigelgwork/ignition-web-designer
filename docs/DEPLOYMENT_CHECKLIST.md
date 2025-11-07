# Production Deployment Checklist

Complete checklist for deploying the Web Designer module to production.

**Version:** 0.29.0
**Status:** Production Ready
**Date:** _______________

---

## Pre-Deployment

### 1. Code Quality
- [ ] All tests passing (frontend & backend)
- [ ] Test coverage > 80%
- [ ] No critical or high severity bugs
- [ ] Code review completed
- [ ] Documentation updated

### 2. Security Audit
- [ ] Complete [SECURITY_AUDIT_CHECKLIST.md](SECURITY_AUDIT_CHECKLIST.md)
- [ ] npm audit passed (no high/critical vulnerabilities)
- [ ] OWASP dependency check passed
- [ ] All endpoints have authentication checks
- [ ] All endpoints have authorization checks
- [ ] Input validation comprehensive
- [ ] No hardcoded credentials
- [ ] Audit logging operational

### 3. Performance Verification
- [ ] Bundle size < 400KB
- [ ] Load time < 2s
- [ ] API response times meet targets
- [ ] No memory leaks detected
- [ ] Performance monitoring active

### 4. Build Verification
- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] Module assembles successfully
- [ ] Module signature valid
- [ ] All assets included

---

## Deployment Steps

### 1. Build Module

```bash
# Install frontend dependencies
cd frontend
npm install

# Build frontend
npm run build

# Verify bundle size
ls -lh dist/

# Return to root
cd ..

# Build and assemble module
./gradlew clean build assembleModl

# Verify module created
ls -lh build/*.modl
```

### 2. Test in Staging

- [ ] Install module in staging Gateway
- [ ] Verify module loads without errors
- [ ] Test authentication flow
- [ ] Test authorization (Designer role)
- [ ] Load a project
- [ ] Load a view
- [ ] Edit and save a view
- [ ] Verify audit logs created
- [ ] Test all keyboard shortcuts
- [ ] Test tag browsing
- [ ] Test script editing
- [ ] Test named query browsing

### 3. Gateway Preparation

**Production Gateway Requirements:**
- [ ] Ignition 8.3.0+ installed
- [ ] Java 17+ runtime
- [ ] HTTPS configured
- [ ] Session timeout configured (recommended: 30 minutes)
- [ ] Designer role configured
- [ ] User accounts with Designer role created
- [ ] Backup current Gateway data
- [ ] Backup current project files

### 4. Module Installation

```bash
# Option 1: Web interface
1. Navigate to: Config > System > Modules
2. Click "Install or Upgrade a Module"
3. Upload Web-Designer-0.29.0.modl
4. Wait for installation to complete
5. Verify module appears in list

# Option 2: File system
cp build/Web-Designer-0.29.0.modl \
   /path/to/ignition/user-lib/modules/

# Restart Gateway
```

### 5. Post-Installation Verification

**Check Gateway Logs:**
```bash
tail -f /path/to/ignition/logs/wrapper.log
```

Look for:
- [ ] Module loaded successfully
- [ ] Routes mounted: `/data/webdesigner`
- [ ] No error messages

**Test Access:**
- [ ] Can access: `https://gateway:8088/data/webdesigner/`
- [ ] Redirects to login if not authenticated
- [ ] Shows "Permission denied" for non-Designer users
- [ ] Loads successfully for Designer users

**Smoke Tests:**
- [ ] Projects list loads
- [ ] Can expand a project
- [ ] Can load a view
- [ ] Can add a component
- [ ] Can edit a property
- [ ] Can save changes
- [ ] Toast notifications work
- [ ] Keyboard shortcuts work ('?')

---

## Monitoring

### 1. Gateway Logs

Monitor for:
- Authentication failures (401)
- Authorization failures (403)
- Server errors (500)
- Slow operations (>1s)

**Log Location:**
```
/path/to/ignition/logs/wrapper.log
```

### 2. Audit Logs

Verify audit logging:
- [ ] View save operations logged
- [ ] Script save operations logged
- [ ] Username recorded
- [ ] Timestamp recorded
- [ ] IP address recorded

**Check Audit Logs:**
```
Gateway > Config > Audit > View Logs
Filter by: WEB_DESIGNER_*
```

### 3. Performance Metrics

Monitor via PerformanceMonitor logs:
- API response times
- Slow operation alerts
- Operation statistics

**Acceptable Ranges:**
- List projects: < 500ms
- Load view: < 200ms
- Save view: < 500ms

### 4. Security Events

Monitor for suspicious activity:
- Multiple failed authentication attempts
- Path traversal attempts
- Large payload attempts
- Unusual access patterns

---

## Rollback Plan

If issues arise, follow rollback procedure:

### 1. Immediate Rollback

```bash
# Option 1: Disable module (Gateway web interface)
1. Config > System > Modules
2. Find "Web Designer"
3. Click "Uninstall" or "Disable"
4. Restart Gateway

# Option 2: Remove module file
rm /path/to/ignition/user-lib/modules/Web-Designer-0.29.0.modl
# Restart Gateway
```

### 2. Restore Previous Version

```bash
# If you have previous version backed up
cp backup/Web-Designer-0.28.0.modl \
   /path/to/ignition/user-lib/modules/
# Restart Gateway
```

### 3. Restore Project Backups

```bash
# If project files were corrupted
cp -r backup/projects/* \
   /path/to/ignition/data/projects/
# Restart Gateway
```

---

## Post-Deployment

### 1. Communication

- [ ] Notify users of deployment
- [ ] Provide access instructions
- [ ] Share user guide link
- [ ] Set up support channel

### 2. User Training

Provide training on:
- How to access Web Designer
- Basic operations (load, edit, save)
- Keyboard shortcuts
- Tag binding
- Script editing
- Troubleshooting

### 3. Feedback Collection

Set up feedback mechanism:
- [ ] Bug report process
- [ ] Feature request process
- [ ] User satisfaction survey

### 4. Documentation

Ensure accessible:
- [ ] [USER_GUIDE.md](USER_GUIDE.md)
- [ ] [ACCESS_INSTRUCTIONS.md](../ACCESS_INSTRUCTIONS.md)
- [ ] [API.md](API.md)
- [ ] [TROUBLESHOOTING.md](../ACCESS_INSTRUCTIONS.md#troubleshooting)

---

## Troubleshooting

### Module Won't Load

**Symptoms:** Module not appearing in list or errors in logs

**Check:**
1. Java version: `java -version` (must be 17+)
2. Gateway version: Must be 8.3.0+
3. Module signature: Re-sign if needed
4. Logs for specific error messages

**Solution:**
```bash
# Re-sign module
./gradlew signModule

# Verify signature
unzip -l build/Web-Designer-0.29.0.modl | grep META-INF
```

### 401 Unauthorized Errors

**Symptoms:** Users can't access, always get 401

**Check:**
1. User logged into Gateway
2. Session cookies enabled in browser
3. Session timeout not too short

**Solution:**
1. Have user login: `https://gateway:8088/web/home`
2. Then access Web Designer
3. Check browser console for cookie errors

### 403 Forbidden Errors

**Symptoms:** Logged in users get "Permission denied"

**Check:**
1. User has Designer role
2. Role configuration correct

**Solution:**
```
Gateway > Config > Security > Users/Roles
1. Find user
2. Verify "Designer" role assigned
3. Save changes
```

### Views Won't Save

**Symptoms:** Save operation fails

**Check:**
1. File system permissions
2. Disk space available
3. View validation errors
4. ETag conflicts

**Solution:**
1. Check Gateway logs for specific error
2. Verify project directory writable
3. Check view JSON structure valid
4. Try reloading view (to get fresh ETag)

### Performance Issues

**Symptoms:** Slow loading or operation

**Check:**
1. View size (component count)
2. Network latency
3. Gateway resource usage
4. Database connection issues

**Solution:**
1. Check PerformanceMonitor logs
2. Review slow operation warnings
3. Optimize large views
4. Check network between browser and Gateway

---

## Success Criteria

Deployment is successful when:

- [x] Module installed without errors
- [x] All smoke tests passed
- [x] No errors in Gateway logs (30 minutes)
- [x] Audit logs showing activity
- [x] Performance metrics acceptable
- [x] Users can access and use system
- [x] No security incidents
- [x] Support team briefed

---

## Sign-Off

### Deployment Team

**Name:** _______________
**Role:** Deployment Engineer
**Date:** _______________
**Signature:** _______________

**Comments:**
```
_________________________________________________________________
_________________________________________________________________
```

### QA Team

**Name:** _______________
**Role:** QA Engineer
**Date:** _______________
**Signature:** _______________

**Test Results:**
```
_________________________________________________________________
_________________________________________________________________
```

### Security Team

**Name:** _______________
**Role:** Security Engineer
**Date:** _______________
**Signature:** _______________

**Security Status:**
```
_________________________________________________________________
_________________________________________________________________
```

### Operations Team

**Name:** _______________
**Role:** Operations Engineer
**Date:** _______________
**Signature:** _______________

**Monitoring Status:**
```
_________________________________________________________________
_________________________________________________________________
```

---

**Checklist Version:** 1.0
**Last Updated:** 2025-11-07
**Module Version:** 0.29.0 - Production Ready
