// Web-Based Ignition Perspective Designer - Frontend Build
// Version: 0.9.0
// Builds React SPA as SystemJS UMD module for Gateway integration

plugins {
    java
}

val projectOutput: String = "${layout.buildDirectory.get()}/generated-resources/"

// Install npm dependencies
val npmInstall by tasks.registering(Exec::class) {
    description = "Install npm dependencies"
    group = "build"

    workingDir = projectDir
    commandLine = listOf("npm", "install")

    inputs.file("package.json")
    outputs.dir("node_modules")
}

// Build frontend with webpack (UMD module for Gateway integration)
val webpack by tasks.registering(Exec::class) {
    description = "Build frontend with webpack (SystemJS UMD module)"
    group = "build"

    workingDir = projectDir
    commandLine = listOf("npm", "run", "build")

    dependsOn(npmInstall)

    inputs.files(fileTree(projectDir).matching {
        include("src/**/*")
        include("*.json")
        include("webpack.config.js")
        exclude("node_modules/**")
        exclude("dist/**")
        exclude("build/**")
    })

    outputs.dir(projectOutput)
}

// Make processResources depend on webpack
tasks.named("processResources") {
    dependsOn(webpack)
}

sourceSets {
    main {
        output.dir(projectOutput, "builtBy" to listOf(webpack))
    }
}

// Legacy Vite build task for local development
val viteBuild by tasks.registering(Exec::class) {
    description = "Build frontend with Vite (legacy, for standalone development)"
    group = "build"

    workingDir = projectDir
    commandLine = listOf("npm", "run", "vite:build")

    dependsOn(npmInstall)

    inputs.dir("src")
    inputs.file("vite.config.ts")
    outputs.dir("dist")
}

// Clean task
tasks.clean {
    delete("build")
    delete("node_modules")
    delete("dist")
}
