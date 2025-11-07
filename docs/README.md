# Documentation Index

**Project:** Web-Based Ignition Perspective Designer
**Version:** 0.20.0
**Last Updated:** 2025-11-07

Welcome to the documentation for the Web-Based Ignition Perspective Designer. This index provides a clear guide to all available documentation organized by audience and purpose.

---

## 📚 Documentation by Audience

### For New Users
Start here to understand what the project does and how to use it:

1. **[README.md](../README.md)** - Project overview, features, quick start
2. **[USER_GUIDE.md](USER_GUIDE.md)** - Step-by-step usage instructions
3. **[ACCESS_INSTRUCTIONS.md](../ACCESS_INSTRUCTIONS.md)** - How to access the web designer

### For New Developers
Start here to understand the codebase and begin contributing:

1. **[REQUIREMENTS.md](REQUIREMENTS.md)** - What the project aims to achieve
2. **[architecture/OVERVIEW.md](architecture/OVERVIEW.md)** - High-level architecture
3. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Setup development environment
4. **[architecture/DATA_FLOW.md](architecture/DATA_FLOW.md)** - How data moves through the system
5. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture documentation index

### For Backend Developers (Java)
Focus on Gateway module implementation:

1. **[architecture/BACKEND.md](architecture/BACKEND.md)** - Backend architecture
2. **[API.md](API.md)** - REST API specification
3. **[SECURITY.md](SECURITY.md)** - Security requirements
4. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Build and test instructions

### For Frontend Developers (React/TypeScript)
Focus on React SPA implementation:

1. **[architecture/FRONTEND.md](architecture/FRONTEND.md)** - Frontend architecture
2. **[architecture/DATA_FLOW.md](architecture/DATA_FLOW.md)** - State management flows
3. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Build and development workflow

### For Security Reviewers
Security-focused documentation:

1. **[SECURITY.md](SECURITY.md)** - Complete security architecture
2. **[architecture/BACKEND.md](architecture/BACKEND.md)** - Authentication/authorization implementation
3. **[API.md](API.md)** - API security requirements

### For Operators/DevOps
Deployment and operations:

1. **[../DEPLOYMENT.md](../DEPLOYMENT.md)** - How to deploy the module
2. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Build instructions
3. **[../VERSION.md](../VERSION.md)** - Current version and release notes

---

## 📖 Documentation by Purpose

### Understanding the Project

| Document | Purpose | Length |
|----------|---------|--------|
| [README.md](../README.md) | Project overview, features, quick start | 3 pages |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Functional and technical requirements | 2 pages |
| [USER_GUIDE.md](USER_GUIDE.md) | End-user instructions | 12KB |

### Architecture & Design

| Document | Purpose | Audience |
|----------|---------|----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture docs index | All developers |
| [architecture/OVERVIEW.md](architecture/OVERVIEW.md) | High-level system design | All developers, architects |
| [architecture/BACKEND.md](architecture/BACKEND.md) | Gateway module architecture | Backend developers |
| [architecture/FRONTEND.md](architecture/FRONTEND.md) | React SPA architecture | Frontend developers |
| [architecture/DATA_FLOW.md](architecture/DATA_FLOW.md) | Data models and flows | All developers |
| [SECURITY.md](SECURITY.md) | Security architecture | Security, all developers |

### Development

| Document | Purpose | Audience |
|----------|---------|----------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Setup, build, test | All developers |
| [API.md](API.md) | REST API specification | Backend, frontend devs |
| [../VERSION.md](../VERSION.md) | Version history & roadmap | All developers |
| [../CHANGELOG.md](../CHANGELOG.md) | Detailed change history | All developers |

### Deployment & Operations

| Document | Purpose | Audience |
|----------|---------|----------|
| [../DEPLOYMENT.md](../DEPLOYMENT.md) | Deployment instructions | DevOps, operators |
| [../ACCESS_INSTRUCTIONS.md](../ACCESS_INSTRUCTIONS.md) | How to access the UI | End users, operators |

### Project Management

| Document | Purpose | Audience |
|----------|---------|----------|
| [../ROADMAP.md](../ROADMAP.md) | Future plans and milestones | PM, stakeholders |
| [../VERSION.md](../VERSION.md) | Version strategy | PM, developers |
| [../CHANGELOG.md](../CHANGELOG.md) | Release notes | All stakeholders |

---

## 🗂️ Archived Documentation

Historical and reference documentation (not current):

### Research & Planning
- **[archive/research/PERSPECTIVE_DESIGNER_UI_RESEARCH.md](archive/research/PERSPECTIVE_DESIGNER_UI_RESEARCH.md)** - Original UI research (45KB, archived)
- **[archive/research/SUMMARY.md](archive/research/SUMMARY.md)** - Research summary
- **[archive/original-spec/webPerspectiveDetails.md](archive/original-spec/webPerspectiveDetails.md)** - Original spec (236KB Word doc)
- **[archive/planning/ARCHITECTURE_v0.6.0.md](archive/planning/ARCHITECTURE_v0.6.0.md)** - Original monolithic architecture doc
- **[archive/planning/PHASED_IMPLEMENTATION_PLAN.md](archive/planning/PHASED_IMPLEMENTATION_PLAN.md)** - Original implementation plan

### Session Notes
- **[archive/sessions/INDEX.md](archive/sessions/INDEX.md)** - Session archive index
- **[archive/sessions/](archive/sessions/)** - Historical session notes (7 documents)

---

## 🔍 Finding What You Need

### "How do I...?"

**...understand what this project does?**
→ [README.md](../README.md)

**...use the web designer?**
→ [USER_GUIDE.md](USER_GUIDE.md)

**...set up my development environment?**
→ [DEVELOPMENT.md](DEVELOPMENT.md)

**...understand the architecture?**
→ Start with [architecture/OVERVIEW.md](architecture/OVERVIEW.md)

**...implement a new feature?**
1. Check [REQUIREMENTS.md](REQUIREMENTS.md) for requirements
2. Review [architecture/DATA_FLOW.md](architecture/DATA_FLOW.md) for patterns
3. Implement following [DEVELOPMENT.md](DEVELOPMENT.md) guidelines
4. Ensure [SECURITY.md](SECURITY.md) compliance

**...deploy the module?**
→ [../DEPLOYMENT.md](../DEPLOYMENT.md)

**...understand the API?**
→ [API.md](API.md)

**...review security?**
→ [SECURITY.md](SECURITY.md)

**...check current version?**
→ [../VERSION.md](../VERSION.md)

**...see what's changed?**
→ [../CHANGELOG.md](../CHANGELOG.md)

**...see future plans?**
→ [../ROADMAP.md](../ROADMAP.md)

---

## 📋 Documentation Standards

### Active Documentation
All active documentation follows these standards:
- **Max Length**: 500 lines per file (except comprehensive guides)
- **Format**: Markdown with clear headers
- **Diagrams**: ASCII art or Mermaid (when available)
- **Code Examples**: Include language tags for syntax highlighting
- **Cross-References**: Link to related documents
- **Maintenance**: Update with code changes, not after

### Archiving Policy
Documentation is archived when:
- It becomes historical/reference only
- It's superseded by newer documents
- It exceeds reasonable maintenance size
- It's no longer aligned with current architecture

**Archive Location**: `docs/archive/{category}/`

### Documentation Review
- **Frequency**: After major releases or architectural changes
- **Checklist**:
  - [ ] Accuracy (matches current code)
  - [ ] Completeness (covers key topics)
  - [ ] Clarity (understandable by target audience)
  - [ ] Cross-references (links work)
  - [ ] Examples (code samples work)

---

## 🔗 External Resources

- **Ignition SDK Documentation**: https://docs.inductiveautomation.com/
- **Perspective Documentation**: https://docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective
- **React Documentation**: https://react.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/docs/
- **Zustand Documentation**: https://zustand-demo.pmnd.rs/

---

## 📝 Contributing to Documentation

When contributing to documentation:

1. **Before Writing**: Check if related docs exist
2. **While Writing**:
   - Follow the documentation standards above
   - Use clear, concise language
   - Include examples where helpful
   - Add cross-references to related docs
3. **After Writing**:
   - Update this index if adding new docs
   - Update cross-references in related docs
   - Request documentation review

---

## 📧 Documentation Feedback

If you find documentation issues:
- **Missing Information**: Note what's needed
- **Inaccurate Information**: Note what's wrong and what's correct
- **Unclear Information**: Suggest improvements
- **Broken Links**: Report the link and intended target

---

**Index Maintainer:** Development Team
**Last Review:** 2025-11-07
**Next Review:** After v0.21.0 release or architectural changes
