// Web-Based Ignition Perspective Designer - Frontend Build
// Version: 0.1.0

import java.io.ByteArrayOutputStream

// This subproject wraps npm commands to integrate with Gradle build

// Task to install npm dependencies
tasks.register<Exec>("npmInstall") {
    group = "frontend"
    description = "Install npm dependencies"

    workingDir = projectDir
    commandLine = if (System.getProperty("os.name").lowercase().contains("windows")) {
        listOf("cmd", "/c", "npm", "install")
    } else {
        listOf("npm", "install")
    }

    // Only run if node_modules doesn't exist or package.json changed
    inputs.file("package.json")
    outputs.dir("node_modules")
}

// Task to build frontend for production
tasks.register<Exec>("npmBuild") {
    group = "frontend"
    description = "Build frontend for production"

    dependsOn("npmInstall")

    workingDir = projectDir
    commandLine = if (System.getProperty("os.name").lowercase().contains("windows")) {
        listOf("cmd", "/c", "npm", "run", "build")
    } else {
        listOf("npm", "run", "build")
    }

    inputs.dir("src")
    inputs.file("package.json")
    inputs.file("vite.config.ts")
    outputs.dir("dist")
}

// Task to run frontend dev server
tasks.register<Exec>("npmDev") {
    group = "frontend"
    description = "Run frontend dev server"

    dependsOn("npmInstall")

    workingDir = projectDir
    commandLine = if (System.getProperty("os.name").lowercase().contains("windows")) {
        listOf("cmd", "/c", "npm", "run", "dev")
    } else {
        listOf("npm", "run", "dev")
    }
}

// Task to run frontend tests
tasks.register<Exec>("npmTest") {
    group = "frontend"
    description = "Run frontend tests"

    dependsOn("npmInstall")

    workingDir = projectDir
    commandLine = if (System.getProperty("os.name").lowercase().contains("windows")) {
        listOf("cmd", "/c", "npm", "test")
    } else {
        listOf("npm", "test")
    }
}

// Task to run npm audit
tasks.register<Exec>("npmAudit") {
    group = "frontend"
    description = "Run npm security audit"

    workingDir = projectDir
    commandLine = if (System.getProperty("os.name").lowercase().contains("windows")) {
        listOf("cmd", "/c", "npm", "audit")
    } else {
        listOf("npm", "audit")
    }

    isIgnoreExitValue = true
}

// Clean task - override the default clean task to also remove frontend artifacts
tasks.named<Delete>("clean") {
    delete("dist")
    delete("node_modules")
}

// Make build task depend on npmBuild
tasks.named("build") {
    dependsOn("npmBuild")
}
