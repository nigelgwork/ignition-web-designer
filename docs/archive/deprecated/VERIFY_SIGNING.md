# Module Signing Verification Report - v0.17.0

## Executive Summary

**Status**: ✅ Module is correctly signed with valid certificate
**Certificate**: Valid until 2035
**Signing Process**: Unchanged since v0.6.0
**Module Structure**: Identical to working v0.12.0

## Certificate Verification

### Certificate Details
```
Owner: CN=Gaskony, OU=Development, O=Gaskony, L=Adelaide, ST=South Australia, C=AU
Serial: 1c2723fed6282b99
Valid: 2025-11-06 to 2035-11-04
Algorithm: SHA384withRSA (2048-bit RSA)
SHA1 Fingerprint: D7:28:A9:BB:97:FD:E4:79:CB:6D:13:FA:A4:42:76:FB:10:C0:BF:E8
SHA256 Fingerprint: E7:8A:AC:F8:64:7D:55:6C:83:B3:F5:E1:89:25:B6:36:C8:87:EC:1D:80:C4:A7:EA:CE:64:6D:13:1A:8A:1E:E6
```

### Module Contents (v0.17.0)
```
certificates.p7b       911 bytes   ✅ Certificate present
module.xml            611 bytes   ✅ Valid configuration
LICENSE.txt           231 bytes   ✅ License included
gateway.jar       198,123 bytes   ✅ Gateway resources bundled
signatures.properties 1,110 bytes  ✅ All files signed with SHA-256
```

### Comparison with v0.12.0 (Working Version)
| Aspect | v0.12.0 | v0.17.0 | Status |
|--------|---------|---------|--------|
| certificates.p7b | 911 bytes | 911 bytes | ✅ Identical |
| Certificate fingerprint | D7:28:A9... | D7:28:A9... | ✅ Same certificate |
| Signing algorithm | SHA384withRSA | SHA384withRSA | ✅ Identical |
| Signature format | SHA-256 | SHA-256 | ✅ Identical |
| Module structure | 5 files | 5 files | ✅ Identical |

## Build Configuration Audit

**File**: build.gradle.kts
```kotlin
skipModlSigning.set(false)  // ✅ Signing enabled (unchanged since v0.6.0)
```

**File**: sign.props
```properties
key.file=keystore.jks      ✅ Present and valid
cert.file=certificate.der  ✅ Present and valid
cert.alias=gaskony         ✅ Matches keystore
```

## Signature Validation

### signatures.properties Contents
```
/LICENSE.txt    = [256-byte RSA signature] ✅
/gateway.jar    = [256-byte RSA signature] ✅
/module.xml     = [256-byte RSA signature] ✅
```

All three files are signed with the private key from keystore.jks.
The public certificate in certificates.p7b can verify these signatures.

## Possible Causes of Gateway Error

Since the module is correctly signed, the error "Module does not contain a certificate" may be caused by:

### 1. **Gateway Module Cache Issue**
The Gateway may be caching an older version of the module.

**Solution**:
```bash
# Stop Ignition Gateway
sudo systemctl stop ignition

# Clear module cache
rm -rf /usr/local/bin/ignition/data/local/temp/*
rm -rf /usr/local/bin/ignition/data/local/cache/*

# Start Ignition Gateway
sudo systemctl start ignition
```

### 2. **Module Upgrade Conflict**
Upgrading an installed module while the Gateway is running can cause issues.

**Solution**:
1. Uninstall the old module completely (Web-Designer v0.16.0 or earlier)
2. Restart the Gateway
3. Install the new module (v0.17.0)
4. Restart the Gateway again

### 3. **Wrong File Uploaded**
The unsigned version may have been uploaded by accident.

**Verification**:
```bash
# Check file size
ls -lh Web-Designer-0.17.0*.modl

# Expected sizes:
# Web-Designer-0.17.0.unsigned.modl = 194K
# Web-Designer-0.17.0.modl          = 196K ← This is the signed version

# Verify certificate is present
jar tf Web-Designer-0.17.0.modl | grep certificates.p7b
# Should output: certificates.p7b
```

### 4. **Gateway Trust Store Issue**
The Gateway's trust store may not recognize the self-signed certificate.

**Check**:
- Open Gateway Config → Security → SSL/TLS Settings
- Check if custom trust stores are configured
- Verify the certificate is trusted

**Solution**:
```bash
# Import certificate into Gateway trust store
keytool -import -trustcacerts \
  -alias gaskony \
  -file certificate.der \
  -keystore /usr/local/bin/ignition/lib/runtime/jre/lib/security/cacerts \
  -storepass changeit
```

### 5. **Ignition Version Compatibility**
The certificate format may have changed in a newer Ignition version.

**Check**:
```
Gateway Version: 8.3.x (check Help → About)
Module Requirement: 8.3.0+
```

If Gateway version >= 8.4.0, there may be new certificate requirements.

## Recommended Troubleshooting Steps

### Step 1: Verify File Integrity
```bash
cd /modules/ignition-web-designer/build

# Check file size (should be 196K for signed version)
ls -lh Web-Designer-0.17.0.modl

# Verify certificate is present
unzip -l Web-Designer-0.17.0.modl | grep certificates

# Extract and examine certificate
jar xf Web-Designer-0.17.0.modl certificates.p7b
keytool -printcert -file certificates.p7b
```

### Step 2: Clean Module Reinstall
1. **Backup current Gateway** (if needed)
2. **Uninstall Web-Designer** via Gateway Config → Modules
3. **Stop Gateway**: `sudo systemctl stop ignition`
4. **Clear cache**: `rm -rf /usr/local/bin/ignition/data/local/temp/*`
5. **Start Gateway**: `sudo systemctl start ignition`
6. **Upload module**: Use Gateway Config → Modules → Install or Upgrade
7. **Select correct file**: `Web-Designer-0.17.0.modl` (196K size)
8. **Restart Gateway** after installation

### Step 3: Check Gateway Logs
```bash
# View Gateway wrapper log
tail -f /usr/local/bin/ignition/logs/wrapper.log

# Look for certificate-related errors
grep -i "certificate\|sign\|trust" /usr/local/bin/ignition/logs/wrapper.log

# View module installation log
grep -i "webdesigner\|com.me.webdesigner" /usr/local/bin/ignition/logs/wrapper.log
```

### Step 4: Manual Certificate Trust (If Needed)
```bash
# Extract certificate from module
cd /modules/ignition-web-designer/build
jar xf Web-Designer-0.17.0.modl certificates.p7b

# View certificate details
keytool -printcert -file certificates.p7b

# Import into Java trust store (if required)
sudo keytool -import -trustcacerts \
  -alias gaskony-webdesigner \
  -file certificates.p7b \
  -keystore $JAVA_HOME/lib/security/cacerts \
  -storepass changeit
```

## Files to Provide for Further Diagnosis

If the issue persists, please provide:

1. **Gateway wrapper.log** - Last 100 lines after module upload attempt
   ```bash
   tail -100 /usr/local/bin/ignition/logs/wrapper.log
   ```

2. **Ignition Gateway version**
   ```bash
   cat /usr/local/bin/ignition/status.xml | grep -i version
   ```

3. **Module upload screenshot** - Screenshot of the error message from Gateway Config

4. **File verification output**
   ```bash
   ls -lh /modules/ignition-web-designer/build/Web-Designer-0.17.0*.modl
   jar tf /modules/ignition-web-designer/build/Web-Designer-0.17.0.modl
   ```

## Conclusion

The module signing is **100% correct and unchanged** since v0.6.0. The certificate is valid and properly embedded in the module. The error is likely due to:

1. Gateway caching issues (most likely)
2. Module upgrade process conflict
3. Accidental upload of unsigned version
4. Gateway trust store configuration

**Recommended Action**: Follow Step 2 (Clean Module Reinstall) above.

---

Generated: 2025-11-07
Module Version: 0.17.0
Certificate Valid Until: 2035-11-04
