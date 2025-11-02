#!/bin/bash

# Setup script for development workflow structure
# Usage: ./setup-workflow.sh

echo "🚀 Setting up development workflow structure..."

# Create directories
echo "📁 Creating directories..."
mkdir -p .claude
mkdir -p docs
mkdir -p src
mkdir -p tests

# Create workflow files if they don't exist
echo "📄 Creating workflow files..."

if [ ! -f ".claude/WORKFLOW.md" ]; then
    echo "   Creating .claude/WORKFLOW.md"
    touch .claude/WORKFLOW.md
fi

if [ ! -f ".claude/SECURITY_CHECKLIST.md" ]; then
    echo "   Creating .claude/SECURITY_CHECKLIST.md"
    touch .claude/SECURITY_CHECKLIST.md
fi

if [ ! -f ".claude/REFACTOR_TRIGGERS.md" ]; then
    echo "   Creating .claude/REFACTOR_TRIGGERS.md"
    touch .claude/REFACTOR_TRIGGERS.md
fi

if [ ! -f ".claude/CLAUDE.md" ]; then
    echo "   Creating .claude/CLAUDE.md"
    touch .claude/CLAUDE.md
fi

if [ ! -f "VERSION.md" ]; then
    echo "   Creating VERSION.md"
    echo "# Version Management\n\n## Current Version: 1.0.0\n" > VERSION.md
fi

if [ ! -f "docs/CHANGELOG.md" ]; then
    echo "   Creating docs/CHANGELOG.md"
    cat > docs/CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure
- Workflow documentation
- Security checklist
- Refactoring triggers

## [1.0.0] - $(date +%Y-%m-%d)

### Added
- Initial release

EOF
fi

if [ ! -f "docs/ARCHITECTURE.md" ]; then
    echo "   Creating docs/ARCHITECTURE.md"
    cat > docs/ARCHITECTURE.md << 'EOF'
# Architecture Documentation

## Overview
[High-level description of the system]

## System Components
[Description of major components]

## Data Flow
[How data moves through the system]

## Technology Stack
- Language: 
- Framework: 
- Database: 
- Cache: 
- Queue: 

## Design Decisions

### Decision 1: [Title]
**Context:** [Why this decision was needed]
**Decision:** [What was decided]
**Consequences:** [Impact of the decision]

## Security Considerations
[Security architecture and measures]

## Performance Considerations
[Performance optimizations and strategies]

## Scalability
[How the system scales]

EOF
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
venv/
env/
*.egg-info/
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
*.Zone.Identifier

# Logs
*.log
logs/

# Testing
coverage/
.coverage
htmlcov/
.pytest_cache/

# Temporary
tmp/
temp/
*.tmp

EOF
fi

echo ""
echo "✅ Workflow structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the workflow templates into the created files"
echo "2. Customize for your specific project and language"
echo "3. Run initial security and complexity assessments"
echo "4. Set up your version management strategy"
echo ""
echo "📁 Structure created:"
tree -L 2 -a .claude docs 2>/dev/null || {
    echo ".claude/"
    echo "  ├── CLAUDE.md"
    echo "  ├── WORKFLOW.md"
    echo "  ├── SECURITY_CHECKLIST.md"
    echo "  └── REFACTOR_TRIGGERS.md"
    echo "docs/"
    echo "  ├── ARCHITECTURE.md"
    echo "  └── CHANGELOG.md"
    echo "VERSION.md"
}
