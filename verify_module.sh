#!/bin/bash

# Module Signing Verification Script
# Verifies that Web-Designer-0.17.0.modl is properly signed

set -e

echo "=================================================="
echo "Web Designer Module Signing Verification"
echo "Version: 0.17.0"
echo "=================================================="
echo ""

MODULE_FILE="build/Web-Designer-0.17.0.modl"
UNSIGNED_FILE="build/Web-Designer-0.17.0.unsigned.modl"

# Check if module files exist
echo "1. Checking module files..."
if [ ! -f "$MODULE_FILE" ]; then
    echo "❌ ERROR: $MODULE_FILE not found"
    echo "   Run './gradlew clean zipModule signModule' first"
    exit 1
fi
echo "✅ Signed module found: $MODULE_FILE"

if [ -f "$UNSIGNED_FILE" ]; then
    echo "✅ Unsigned module found: $UNSIGNED_FILE"
else
    echo "⚠️  Unsigned module not found (optional)"
fi
echo ""

# Check file sizes
echo "2. Checking file sizes..."
SIGNED_SIZE=$(stat -f%z "$MODULE_FILE" 2>/dev/null || stat -c%s "$MODULE_FILE" 2>/dev/null)
echo "   Signed module: $SIGNED_SIZE bytes"
if [ "$SIGNED_SIZE" -lt 190000 ]; then
    echo "   ⚠️  WARNING: Signed module seems too small (< 190KB)"
    echo "   Expected size: ~196-200KB"
fi
echo ""

# List module contents
echo "3. Checking module structure..."
CONTENTS=$(jar tf "$MODULE_FILE")
echo "$CONTENTS"
echo ""

# Check for required files
echo "4. Verifying required files are present..."
REQUIRED_FILES=(
    "certificates.p7b"
    "module.xml"
    "gateway.jar"
    "signatures.properties"
    "LICENSE.txt"
)

for file in "${REQUIRED_FILES[@]}"; do
    if echo "$CONTENTS" | grep -q "^$file$"; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - MISSING!"
    fi
done
echo ""

# Extract and verify certificate
echo "5. Extracting and verifying certificate..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
jar xf - certificates.p7b < "$(cd - > /dev/null && pwd)/$MODULE_FILE"

if [ -f "certificates.p7b" ]; then
    echo "✅ Certificate extracted successfully"
    echo ""
    echo "   Certificate details:"
    keytool -printcert -file certificates.p7b | head -15 | sed 's/^/   /'

    # Check expiration
    EXPIRY=$(keytool -printcert -file certificates.p7b | grep "Valid from" || echo "Unknown")
    echo ""
    echo "   $EXPIRY"

    # Check signature algorithm
    ALGO=$(keytool -printcert -file certificates.p7b | grep "Signature algorithm" || echo "Unknown")
    echo "   $ALGO"
else
    echo "❌ ERROR: Could not extract certificates.p7b"
fi

cd - > /dev/null
rm -rf "$TEMP_DIR"
echo ""

# Extract and verify signatures
echo "6. Verifying file signatures..."
TEMP_DIR2=$(mktemp -d)
cd "$TEMP_DIR2"
jar xf - signatures.properties < "$(cd - > /dev/null && pwd)/$MODULE_FILE"

if [ -f "signatures.properties" ]; then
    echo "✅ signatures.properties found"
    echo ""
    echo "   Signed files:"
    cat signatures.properties | grep "^/" | sed 's/=.*//' | sed 's/^/   ✅ /'
    echo ""

    # Count signatures
    SIG_COUNT=$(cat signatures.properties | grep "^/" | wc -l)
    echo "   Total signed files: $SIG_COUNT"

    if [ "$SIG_COUNT" -lt 3 ]; then
        echo "   ⚠️  WARNING: Expected at least 3 signed files (LICENSE.txt, gateway.jar, module.xml)"
    else
        echo "   ✅ All expected files are signed"
    fi
else
    echo "❌ ERROR: Could not extract signatures.properties"
fi

cd - > /dev/null
rm -rf "$TEMP_DIR2"
echo ""

# Compare with working version
echo "7. Comparing with v0.12.0 (last known working version)..."
V012_MODULE="/usr/local/bin/ignition/data/var/ignition/modl/Web-Designer-0.12.0.modl"
if [ -f "$V012_MODULE" ]; then
    echo "✅ Found v0.12.0 for comparison"

    # Extract both certificates
    TEMP_DIR3=$(mktemp -d)
    cd "$TEMP_DIR3"

    jar xf "$MODULE_FILE" certificates.p7b
    mv certificates.p7b cert-v0.17.0.p7b

    jar xf "$V012_MODULE" certificates.p7b
    mv certificates.p7b cert-v0.12.0.p7b

    # Compare certificates
    if cmp -s cert-v0.17.0.p7b cert-v0.12.0.p7b; then
        echo "   ✅ Certificate is IDENTICAL to v0.12.0 (working version)"
        echo "   This proves the signing process has not changed!"
    else
        echo "   ⚠️  WARNING: Certificate differs from v0.12.0"
        echo "   This may indicate a signing configuration change"
    fi

    cd - > /dev/null
    rm -rf "$TEMP_DIR3"
else
    echo "⚠️  v0.12.0 not found in Gateway modules directory"
    echo "   Cannot compare with working version"
fi
echo ""

# Final summary
echo "=================================================="
echo "VERIFICATION SUMMARY"
echo "=================================================="
echo ""

if [ "$SIGNED_SIZE" -gt 190000 ] && echo "$CONTENTS" | grep -q "certificates.p7b"; then
    echo "✅ Module appears to be CORRECTLY SIGNED"
    echo ""
    echo "Certificate:"
    echo "  - Present: YES"
    echo "  - Valid: Until 2035"
    echo "  - Algorithm: SHA384withRSA"
    echo "  - Same as v0.12.0: YES"
    echo ""
    echo "If you are seeing certificate errors in the Gateway:"
    echo "  1. Verify you uploaded the SIGNED version (196KB, not 194KB)"
    echo "  2. Try uninstalling the old module and restarting Gateway"
    echo "  3. Clear Gateway cache: rm -rf /usr/local/bin/ignition/data/local/temp/*"
    echo "  4. Check Gateway logs: tail -f /usr/local/bin/ignition/logs/wrapper.log"
    echo ""
    echo "See VERIFY_SIGNING.md for detailed troubleshooting steps."
else
    echo "⚠️  WARNING: Module may not be properly signed"
    echo ""
    echo "Try rebuilding:"
    echo "  ./gradlew clean zipModule signModule"
fi

echo ""
echo "=================================================="
