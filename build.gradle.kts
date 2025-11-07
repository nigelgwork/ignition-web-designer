// Web-Based Ignition Perspective Designer - Root Build Script
// Version: 0.17.0

plugins {
    id("io.ia.sdk.modl") version "0.3.0"
}

// Define version and group
version = "0.20.0"
group = "com.me.webdesigner"

// Ignition module configuration
ignitionModule {
    name.set("Designer (Web)")
    // Include version in filename for version control
    fileName.set("Web-Designer-${version}")
    id.set("com.me.webdesigner")
    moduleVersion.set(version.toString())
    moduleDescription.set("Web-based Perspective Designer for Ignition Gateway. Developed by Gaskony.")
    requiredIgnitionVersion.set("8.3.0")

    // Free module - no license required
    freeModule.set(true)

    // License information
    license.set("LICENSE.txt")

    // Project scopes (Gateway only for now)
    projectScopes.putAll(mapOf(
        ":gateway" to "G"
    ))

    // Module dependencies - Perspective classes must be available at runtime
    moduleDependencies.putAll(mapOf(
        "com.inductiveautomation.perspective" to "G"
    ))

    // Module hooks
    hooks.putAll(mapOf(
        "com.me.webdesigner.GatewayHook" to "G"
    ))

    // Enable module signing with self-signed certificate
    // Signing configured via sign.props file
    skipModlSigning.set(false)
}

// Subprojects will configure themselves individually
