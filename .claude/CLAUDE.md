# Claude Code Instructions - Web-Based Ignition Perspective Designer

## 🎯 Project Overview
This project builds a web-based Ignition Perspective Designer that runs entirely in a browser. It consists of a Java Gateway Module (.modl) backend and a React + TypeScript SPA frontend, enabling users to browse projects, edit view.json files, drag components, bind tags, and save changes - all from a web browser.

**Module ID**: com.me.webdesigner
**Target Ignition Version**: 8.3.0+
**Tech Stack**: Java 17, React + TypeScript, Gradle, Zustand, react-dnd

## 📚 Required Reading
Claude must read these files at session start and reference during development:

1. **`.claude/WORKFLOW.md`** - Development workflow and checkpoints
2. **`.claude/SECURITY_CHECKLIST.md`** - Security assessment requirements (CRITICAL for this project)
3. **`.claude/REFACTOR_TRIGGERS.md`** - When and how to refactor
4. **`VERSION.md`** - Current version and strategy
5. **`docs/ARCHITECTURE.md`** - System design decisions
6. **`CLAUDE.md`** - Project-specific context (main context file)
7. **`webPerspectiveDetails.md`** - Complete project specification

## 🔄 Workflow Integration

### Session Start
```
1. Read all files in .claude/ directory
2. Read CLAUDE.md for project context
3. Check current VERSION.md
4. Review recent CHANGELOG.md entries
5. Note any pending security/refactor items
```

### During Development
- **Before implementing features:** Check security implications (CRITICAL - Ignition Gateway access)
- **After writing code:** Assess against refactor triggers
- **Before commits:** Run workflow checklist
- **End of session:** Complete daily checkpoint

### Checkpoint Triggers
When you hear these phrases, run the associated workflow:

| Trigger Phrase | Action |
|---------------|---------|
| "Let's start" | Read .claude/ files, check version, review project brief |
| "Implement/Add/Create feature" | Security pre-check, version plan |
| "Fix bug/issue" | Security scan, patch version |
| "Ready to commit" | Full workflow checklist |
| "That's all for today" | Daily checkpoint, note pending items |
| "Is this secure?" | Run SECURITY_CHECKLIST.md |
| "This seems complex" | Check REFACTOR_TRIGGERS.md |

## 🚦 Decision Framework

### When to Stop Development
**RED FLAGS - Must fix before continuing:**
- Security vulnerability detected (hardcoded credentials, SQL injection, XSS)
- Missing authentication/authorization checks on API endpoints
- Optimistic concurrency control not implemented
- Cyclomatic complexity >15
- Critical documentation missing

### When to Suggest Refactoring
**Proactively suggest when detecting:**
- Duplicate code (3+ instances)
- Functions >50 lines
- Deep nesting (>4 levels)
- Complex conditionals
- Backend handler methods >100 lines

### When to Update Documentation
**Always update when:**
- Adding new API endpoints
- Changing view.json schema
- Modifying Gradle build structure
- Adding React components or Zustand store actions
- Fixing bugs (add to CHANGELOG)
- Making architectural decisions

## 📋 Regular Assessments

### Every Feature/Fix
- [ ] Security quick-scan (especially authentication/authorization)
- [ ] Input validation check (all API endpoints)
- [ ] Complexity check
- [ ] Documentation update
- [ ] Version increment

### Daily Checkpoint
- [ ] Security review of changes (focus on Gateway API access)
- [ ] Technical debt assessment
- [ ] CHANGELOG update
- [ ] WIP commit

### Weekly Review
- [ ] Full security audit
- [ ] Refactoring assessment
- [ ] Documentation audit
- [ ] Version release decision

## 🔧 Custom Commands

### /workflow-precommit
1. Run security quick-scan (focus on auth, input validation, secrets)
2. Check refactor triggers
3. Verify documentation current
4. Show git status
5. Generate commit message

### /workflow-daily
1. Summarize today's changes
2. Run security assessment
3. Identify technical debt
4. Update CHANGELOG
5. Create WIP commit

### /security-scan
1. Run SECURITY_CHECKLIST quick scan
2. Check for hardcoded credentials
3. Verify all API endpoints have auth checks
4. Check optimistic concurrency implementation
5. Report findings with severity

### /refactor-assess
1. Measure complexity metrics
2. Identify code smells
3. Find duplicate code
4. Suggest refactoring order
5. Estimate effort

## 📊 Metrics to Track

### Security (CRITICAL for Gateway Module)
- Days since last full audit: ___
- Open security issues: ___
- API endpoints without auth: 0 (MUST BE ZERO)
- Hardcoded secrets found: 0 (MUST BE ZERO)

### Code Quality
- Average Java complexity: ___
- Average TS/JS complexity: ___
- Test coverage (Backend): ___
- Test coverage (Frontend): ___

### Technical Debt
- Refactoring backlog: ___
- TODO/FIXME count: ___
- Missing documentation items: ___

## 🎯 Development Principles

1. **Security First** - Every API endpoint MUST have authentication and authorization checks
2. **Maintain Simplicity** - Refactor proactively, don't accumulate complexity
3. **Document Continuously** - Update docs with code, not after
4. **Version Deliberately** - Semantic versioning with purpose
5. **Test Thoroughly** - Write tests before fixing bugs
6. **Verify Changes** - Always provide proof that changes work

## 📝 Communication Style

- Proactively flag security/complexity concerns
- Suggest workflow checkpoints at appropriate times
- Provide metrics/evidence for suggestions
- Track accumulating debt across sessions
- Remind about pending assessments
- **Acknowledge uncertainty** - "I believe" vs "This will"
- **Regular updates** - Progress on long tasks

## 🚀 Project-Specific Configuration

### Paths
- Backend code: `gateway/src/main/java/com/me/webdesigner/`
- Frontend code: `frontend/src/`
- Backend resources: `gateway/src/main/resources/`
- Frontend dist: `frontend/dist/` (copied to backend resources during build)
- Tests: `gateway/src/test/` and `frontend/src/__tests__/`
- Documentation: `docs/`

### Commands
- Build backend: `./gradlew build`
- Build frontend: `cd frontend && npm run build`
- Build module: `./gradlew assembleModl`
- Test backend: `./gradlew test`
- Test frontend: `cd frontend && npm test`
- Security scan (Java): `./gradlew dependencyCheckAnalyze`
- Security scan (Frontend): `cd frontend && npm audit`

### Environment
- Backend Language: Java 17
- Frontend Language: TypeScript
- Backend Framework: Ignition SDK 8.3+
- Frontend Framework: React + Vite
- State Management: Zustand
- Package manager (Backend): Gradle
- Package manager (Frontend): npm
- Version control: Git

### Critical Technical Notes
- **MUST use jakarta.* imports** instead of javax.* (Ignition 8.3+ requirement)
- **MUST implement optimistic concurrency** on POST /view endpoint
- **MUST validate all user inputs** on backend
- **MUST audit log all write operations**
- **Build dependency**: Frontend build MUST complete before backend resource packaging

## 🔐 Security Requirements (NON-NEGOTIABLE)

### Every API Endpoint MUST:
1. Validate session via `gatewayContext.getAuthManager().getUserFromRequest(req)`
2. Return 401 if no authenticated user
3. Check for "Designer" role or custom "webdesigner.edit" permission
4. Return 403 if unauthorized
5. Validate and sanitize all URL parameters
6. Limit request body size (1-2 MB for POST /view)

### Audit Logging:
Every write operation MUST be logged with:
- Username
- Resource path
- Client IP address
- Timestamp
- Success/failure status

### Optimistic Concurrency:
POST /view MUST:
- Require If-Match header with file signature/hash
- Validate If-Match against current file state
- Return 409 Conflict if mismatch
- Only save if If-Match matches current state

## 📋 Pre-Implementation Checklist

Before implementing ANY new API endpoint:
- [ ] Define authentication requirements
- [ ] Define authorization requirements
- [ ] Plan input validation strategy
- [ ] Design error responses
- [ ] Plan audit logging
- [ ] Document in API design section
- [ ] Add to security checklist

## 🎓 Learning Resources

- Ignition SDK Docs: https://docs.inductiveautomation.com/
- React Docs: https://react.dev/
- Zustand Docs: https://zustand-demo.pmnd.rs/
- react-dnd Docs: https://react-dnd.github.io/react-dnd/
- TypeScript Docs: https://www.typescriptlang.org/docs/

---

Last Updated: 2025-11-02 (Australia/Adelaide)
Version System: Semantic (MAJOR.MINOR.PATCH)
Workflow Version: 1.0.0
