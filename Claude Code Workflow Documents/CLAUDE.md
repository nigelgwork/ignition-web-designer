# Claude Code Instructions - [PROJECT NAME]

## 🎯 Project Overview
[Brief project description]

## 📚 Required Reading
Claude must read these files at session start and reference during development:

1. **`.claude/WORKFLOW.md`** - Development workflow and checkpoints
2. **`.claude/SECURITY_CHECKLIST.md`** - Security assessment requirements  
3. **`.claude/REFACTOR_TRIGGERS.md`** - When and how to refactor
4. **`VERSION.md`** - Current version and strategy
5. **`docs/ARCHITECTURE.md`** - System design decisions

## 🔄 Workflow Integration

### Session Start
```
1. Read all files in .claude/ directory
2. Check current VERSION.md
3. Review recent CHANGELOG.md entries
4. Note any pending security/refactor items
```

### During Development
- **Before implementing features:** Check security implications
- **After writing code:** Assess against refactor triggers
- **Before commits:** Run workflow checklist
- **End of session:** Complete daily checkpoint

### Checkpoint Triggers
When you hear these phrases, run the associated workflow:

| Trigger Phrase | Action |
|---------------|---------|
| "Let's start" | Read .claude/ files, check version |
| "Implement/Add/Create feature" | Security pre-check, version plan |
| "Fix bug/issue" | Security scan, patch version |
| "Ready to commit" | Full workflow checklist |
| "That's all for today" | Daily checkpoint, note pending items |
| "Is this secure?" | Run SECURITY_CHECKLIST.md |
| "This seems complex" | Check REFACTOR_TRIGGERS.md |

## 🚦 Decision Framework

### When to Stop Development
**RED FLAGS - Must fix before continuing:**
- Security vulnerability detected
- Cyclomatic complexity >15
- Hardcoded credentials found
- Critical documentation missing

### When to Suggest Refactoring
**Proactively suggest when detecting:**
- Duplicate code (3+ instances)
- Functions >50 lines
- Deep nesting (>4 levels)
- Complex conditionals

### When to Update Documentation
**Always update when:**
- Adding new features
- Changing API interfaces
- Modifying architecture
- Fixing bugs (add to CHANGELOG)

## 📋 Regular Assessments

### Every Feature/Fix
- [ ] Security quick-scan
- [ ] Complexity check
- [ ] Documentation update
- [ ] Version increment

### Daily Checkpoint
- [ ] Security review of changes
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
1. Run security quick-scan
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

### /workflow-weekly  
1. Full security audit
2. Complexity analysis
3. Documentation coverage
4. Suggest refactoring priorities
5. Plan next version

### /security-scan
1. Run SECURITY_CHECKLIST quick scan
2. Check for credentials in code
3. Scan dependencies
4. Report findings with severity

### /refactor-assess
1. Measure complexity metrics
2. Identify code smells
3. Find duplicate code
4. Suggest refactoring order
5. Estimate effort

## 📊 Metrics to Track

### Security
- Days since last full audit: ___
- Open security issues: ___
- Dependency vulnerabilities: ___

### Code Quality
- Average complexity: ___
- Test coverage: ___
- Documentation coverage: ___

### Technical Debt
- Refactoring backlog: ___
- TODO/FIXME count: ___
- Code smell count: ___

## 🎯 Development Principles

1. **Security First** - Every feature considered through security lens
2. **Maintain Simplicity** - Refactor proactively, don't accumulate complexity
3. **Document Continuously** - Update docs with code, not after
4. **Version Deliberately** - Semantic versioning with purpose
5. **Test Thoroughly** - Write tests before fixing bugs

## 📝 Communication Style

- Proactively flag security/complexity concerns
- Suggest workflow checkpoints at appropriate times  
- Provide metrics/evidence for suggestions
- Track accumulating debt across sessions
- Remind about pending assessments

## 🚀 Project-Specific Configuration

### Paths
- Source code: `src/`
- Tests: `tests/`
- Documentation: `docs/`
- Build output: `dist/`

### Commands
- Build: `[BUILD COMMAND]`
- Test: `[TEST COMMAND]`
- Lint: `[LINT COMMAND]`
- Security scan: `[SECURITY COMMAND]`

### Environment
- Language: [LANGUAGE]
- Framework: [FRAMEWORK]
- Package manager: [PACKAGE MANAGER]
- Version control: Git

---

Last Updated: [DATE]
Version System: Semantic (MAJOR.MINOR.PATCH)
Workflow Version: 1.0.0
