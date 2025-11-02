// Web-Based Ignition Perspective Designer - Root Build Script
// Version: 0.6.0

plugins {
    id("io.ia.sdk.modl") version "0.3.0"
}

// Define version and group
version = "0.6.0"
group = "com.me.webdesigner"

// Ignition module configuration
ignitionModule {
    name.set("Web Designer")
    fileName.set("Web-Designer.modl")
    id.set("com.me.webdesigner")
    moduleVersion.set(version.toString())
    moduleDescription.set("Web-based Perspective Designer for Ignition Gateway")
    requiredIgnitionVersion.set("8.3.0")

    // License information
    license.set("LICENSE.txt")

    // Project scopes (Gateway only for now)
    projectScopes.putAll(mapOf(
        ":gateway" to "G"
    ))

    // Module hooks
    hooks.putAll(mapOf(
        "com.me.webdesigner.GatewayHook" to "G"
    ))

    // Skip module signing for development
    skipModlSigning.set(true)
}

// Subprojects will configure themselves individually
