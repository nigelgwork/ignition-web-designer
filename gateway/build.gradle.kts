// Web-Based Ignition Perspective Designer - Gateway Module Build
// Version: 0.1.0

plugins {
    `java-library`
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

dependencies {
    // Ignition SDK dependencies
    compileOnly("com.inductiveautomation.ignitionsdk:gateway-api:8.3.0")
    compileOnly("com.inductiveautomation.ignitionsdk:perspective-gateway:8.3.0")

    // JSON processing (Gson - should be available in Ignition)
    compileOnly("com.google.code.gson:gson:2.10.1")

    // Servlet API (Jakarta for 8.3+)
    compileOnly("jakarta.servlet:jakarta.servlet-api:5.0.0")

    // Logging (SLF4J available in Ignition)
    compileOnly("org.slf4j:slf4j-api:2.0.9")

    // Testing dependencies
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testImplementation("org.mockito:mockito-core:5.6.0")
    testImplementation("org.mockito:mockito-junit-jupiter:5.6.0")
}

tasks.test {
    useJUnitPlatform()
}

// Copy frontend build output to resources before building module
tasks.named<Copy>("processResources") {
    dependsOn(":frontend:npmBuild")

    // Copy frontend dist to resources/web
    from("${project(":frontend").projectDir}/dist")
    into("${projectDir}/src/main/resources/web")
}

// Ensure clean removes frontend build output from resources
tasks.clean {
    delete("${projectDir}/src/main/resources/web")
}
