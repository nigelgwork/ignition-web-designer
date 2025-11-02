# Ignition 8.3 SDK Knowledge Base for Claude Code

## Overview

This comprehensive knowledge base enables Claude Code to effectively develop Ignition SDK modules. It contains detailed guides, best practices, code examples, and workflows for all aspects of Ignition module development.

## Knowledge Base Files

### 📘 Core Documentation

1. **00-CLAUDE-CODE-INSTRUCTIONS.md** ⭐ **START HERE**
   - Specific instructions for Claude Code environments
   - Standard workflows and procedures
   - Code generation templates

2. **01-SDK-Overview-Getting-Started.md**
   - What is the Ignition SDK, prerequisites, quick start

3. **02-Module-Architecture-Structure.md**
   - Module anatomy, scopes, hooks, lifecycle

4. **03-Build-Systems-Gradle-Maven.md**
   - Complete Gradle and Maven configuration guide

### 🔧 Component Development

5. **04-Perspective-Component-Development.md**
   - React/TypeScript components for web

6. **05-Vision-Component-Development.md**
   - Java Swing components for desktop

### 🔌 Drivers and Functions

7. **06-OPC-UA-Device-Driver-Development.md**
   - Custom device drivers for OPC-UA

8. **07-Scripting-Functions-RPC-Communication.md**
   - Python functions and Designer-Gateway RPC

### 📋 Reference

9. **08-Quick-Reference-Cheat-Sheet.md**
   - Quick lookup, code snippets, troubleshooting

## Quick Start

```bash
# 1. Clone SDK examples
git clone https://github.com/inductiveautomation/ignition-sdk-examples.git

# 2. Build a module
cd ignition-sdk-examples/scripting-function
./gradlew build

# 3. Install in Ignition
# Open http://localhost:8088
# Config → Modules → Install (select .modl file)
```

## Prerequisites

- Java JDK 17
- Ignition 8.3+ running locally
- Gradle or Maven
- IDE (IntelliJ recommended)
- Git

## Key Resources

- SDK Docs: https://www.sdk-docs.inductiveautomation.com/
- Examples: https://github.com/inductiveautomation/ignition-sdk-examples
- Forum: https://forum.inductiveautomation.com/c/module-development/7

**Start with 00-CLAUDE-CODE-INSTRUCTIONS.md for Claude Code specific workflows!**
