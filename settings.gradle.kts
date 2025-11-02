// Web-Based Ignition Perspective Designer - Multi-Project Build Settings
// Version: 0.1.0

rootProject.name = "webdesigner"

// Define subprojects
include("gateway")
include("frontend")

// Configure plugin repositories
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
        maven {
            name = "Ignition Releases"
            url = uri("https://nexus.inductiveautomation.com/repository/public")
        }
    }
}

// Configure dependency repositories
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        mavenCentral()
        maven {
            name = "Ignition Releases"
            url = uri("https://nexus.inductiveautomation.com/repository/public")
        }
    }
}
