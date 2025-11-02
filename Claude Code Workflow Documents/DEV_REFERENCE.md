# Development Reference & Working Preferences

A living document for optimizing collaboration between developer and Claude Code across various project types.

---

## 1. Core Working Principles

### Verification-First Development
- **Always provide proof of changes** - Use appropriate commands (grep, diff, test results) to demonstrate fixes work
- **Show before/after states** - Explicitly validate changes rather than assuming success
- **Test immediately after implementation** - Don't assume solutions will work
- **Request user verification** - Acknowledge when manual testing is needed

### Problem-Solving Philosophy
- **Complete solutions over patches** - When an approach fails fundamentally, rebuild rather than patch
- **Systematic over ad-hoc** - Work methodically through lists of changes
- **Dynamic over static** - Prefer configurable, adaptable solutions
- **One source of truth** - Avoid maintaining multiple versions or duplicate configurations

### Communication Style
- **Be explicit about uncertainty** - "I believe this will work, let me verify..." 
- **Acknowledge limitations** - "This requires manual testing because..."
- **Provide context for decisions** - Explain why an approach was chosen
- **Progress updates for long tasks** - Regular status updates during complex operations

---

## 2. Regional & Environment Settings

### Location
- **Primary Location**: Adelaide, South Australia, Australia
- **Timezone**: ACST/ACDT (UTC+9:30/+10:30)
- **Date Format**: DD/MM/YYYY
- **Temperature**: Celsius
- **Distance**: Kilometers
- **Currency**: AUD ($)

### Language Preferences
- **Spelling**: Australian English (favour, colour, realise)
- **Terminology**: Australian conventions where applicable
- **Time references**: 24-hour format preferred for technical work

---

## 3. Code Style & Formatting

### Universal Principles
- **Consistency over perfection** - Match existing project style
- **Clarity over cleverness** - Readable code > clever one-liners
- **Self-documenting code** - Clear variable/function names
- **Comments for "why" not "what"** - Explain decisions, not obvious operations

### Language-Specific Defaults

#### Python
```python
# PEP 8 compliance
# Type hints for function signatures
# Docstrings for public functions
# Black formatter compatible

def calculate_total(
    items: List[Item],
    tax_rate: float = 0.1
) -> Decimal:
    """Calculate order total with tax.
    
    Args:
        items: List of items in order
        tax_rate: Tax rate as decimal (default 0.1)
        
    Returns:
        Total amount including tax
    """
    subtotal = sum(item.price for item in items)
    return subtotal * (1 + tax_rate)
```

#### JavaScript/TypeScript
```javascript
// 2 space indentation
// Semicolons optional (match project)
// Prefer const > let > var
// Async/await over promise chains

const processUser = async (userId: string): Promise<User> => {
  try {
    const user = await fetchUser(userId)
    return await validateUser(user)
  } catch (error) {
    logger.error('User processing failed:', error)
    throw new UserProcessingError(error.message)
  }
}
```

#### Java
```java
// 4 space indentation
// Opening braces on same line
// Explicit access modifiers
// JavaDoc for public APIs

/**
 * Processes user authentication.
 * @param credentials User credentials
 * @return Authenticated user object
 * @throws AuthenticationException if authentication fails
 */
public User authenticate(Credentials credentials) 
    throws AuthenticationException {
    validateCredentials(credentials);
    return userService.authenticate(credentials);
}
```

---

## 4. Version Management

### Semantic Versioning Strategy
```
MAJOR.MINOR.PATCH

PATCH: Bug fixes, documentation, minor tweaks
MINOR: New features, significant improvements  
MAJOR: Breaking changes, architectural shifts
```

### Auto-Versioning Workflow
1. Assess change impact (patch/minor/major)
2. Update version in appropriate files
3. Include version in commit message
4. Tag releases for milestones

---

## 5. Git Workflow

### Commit Message Template
```
[Type] Brief description (max 50 chars)

Version: X.Y.Z-1 → X.Y.Z

Changes:
- Detailed change description
- Another change description

Verification:
- Build status: ✅ Successful
- Tests: X passed, Y total
- Coverage: XX%

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: feat, fix, docs, style, refactor, test, chore

### Branch Strategy
- `main/master` - Production ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `release/*` - Release preparation

---

## 6. Testing Philosophy

### Testing Principles
- **Test behavior, not implementation**
- **Clear test names describe expectations**
- **One assertion per test preferred**
- **Mock external dependencies**
- **Test edge cases explicitly**

### Test Structure
```python
def test_user_authentication_with_valid_credentials():
    # Arrange
    user = create_test_user()
    credentials = valid_credentials()
    
    # Act
    result = authenticate(credentials)
    
    # Assert
    assert result.user_id == user.id
    assert result.is_authenticated is True
```

---

## 7. Documentation Standards

### Always Keep Synchronized
- Version numbers across all files
- README with current features
- API documentation
- Configuration examples
- Installation instructions

### Comment Standards
```python
# TODO: Specific task to complete
# FIXME: Known issue to address
# HACK: Temporary solution (explain why)
# NOTE: Important information
# OPTIMIZE: Performance improvement opportunity
# SECURITY: Security consideration
```

---

## 8. Error Handling

### Error Handling Principles
- **Fail fast** - Detect problems early
- **Meaningful messages** - Include context in errors
- **Appropriate level** - Don't catch what you can't handle
- **User-friendly** - Translate technical errors
- **Log appropriately** - Errors to stderr, info to stdout

### Error Message Format
```python
# Bad
raise Exception("Error")

# Good
raise ValidationError(
    f"Invalid email format for user {user_id}: "
    f"'{email}' does not match pattern"
)
```

---

## 9. Performance Guidelines

### Optimization Approach
1. **Measure first** - Profile before optimizing
2. **Optimize algorithms** - Before micro-optimizations
3. **Cache strategically** - Expensive operations only
4. **Lazy loading** - Load when needed
5. **Document trade-offs** - Explain optimization decisions

### Performance Checklist
- [ ] Database queries optimized (N+1 queries eliminated)
- [ ] Appropriate indexes in place
- [ ] Caching implemented where beneficial
- [ ] Large datasets paginated
- [ ] Async operations for I/O bound tasks

---

## 10. Security Best Practices

### Default Security Practices
- **Never commit secrets** - Use environment variables
- **Sanitize user input** - Always validate and escape
- **Principle of least privilege** - Minimal permissions
- **Update dependencies** - Keep libraries current
- **Security in depth** - Multiple layers of protection

### Security Checklist
- [ ] No hardcoded credentials
- [ ] Input validation implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Secure headers configured

---

## 11. Code Review Checklist

### Before Submitting PR
- [ ] Code follows style guidelines
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No commented-out code
- [ ] No debug statements
- [ ] Security implications considered
- [ ] Performance impact assessed

### Review Focus Areas
1. **Logic correctness** - Does it do what it should?
2. **Edge cases** - Are they handled?
3. **Error handling** - Are errors properly managed?
4. **Performance** - Any obvious bottlenecks?
5. **Security** - Any vulnerabilities?
6. **Maintainability** - Is it easy to understand?

---

## 12. Debugging Approach

### Systematic Debugging Process
1. **Reproduce reliably** - Consistent reproduction steps
2. **Isolate the problem** - Narrow down scope
3. **Form hypothesis** - What might cause this?
4. **Test hypothesis** - Verify with targeted test
5. **Fix and verify** - Ensure fix works
6. **Add regression test** - Prevent reoccurrence

### Debug Output Format
```python
# Include context in debug output
logger.debug(f"Processing user {user_id}: state={state}, "
            f"action={action}, timestamp={timestamp}")

# Not just
logger.debug("Processing")
```

---

## 13. Refactoring Guidelines

### When to Refactor
- **Code exceeds 300 lines** - Consider splitting
- **Duplicate code appears 3+ times** - Extract common functionality
- **Complex conditions** - Extract to named functions
- **Deep nesting (>3 levels)** - Flatten or extract
- **Comments explain "what"** - Code should be self-explanatory

### Safe Refactoring Process
1. **Ensure tests exist** - Don't refactor without safety net
2. **Small incremental changes** - One refactor at a time
3. **Verify after each step** - Maintain working state
4. **Update documentation** - Reflect structural changes
5. **Clean up** - Remove old code completely

---

## 14. Quick Reference Checklists

### 📝 New Project Setup
- [ ] Initialize version control
- [ ] Set up project structure
- [ ] Create README
- [ ] Configure linting/formatting
- [ ] Set up testing framework
- [ ] Add CI/CD pipeline
- [ ] Document setup instructions

### 🚀 Before Every Push
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version incremented
- [ ] Commit message complete
- [ ] No debug code
- [ ] No sensitive data

### 🐛 Bug Fix Process
- [ ] Reproduce the issue
- [ ] Write failing test
- [ ] Implement fix
- [ ] Verify test passes
- [ ] Check for similar issues
- [ ] Update documentation

### ✨ Feature Addition
- [ ] Requirements clear
- [ ] Design documented
- [ ] Tests written
- [ ] Implementation complete
- [ ] Documentation updated
- [ ] Version bumped (minor)

---

## 15. Collaboration Preferences

### Communication Style
- **Direct and clear** - No unnecessary preambles
- **Acknowledge uncertainty** - "I believe" vs "This will"
- **Explain reasoning** - Share thought process
- **Ask for clarification** - When requirements unclear
- **Regular updates** - Progress on long tasks

### Working Patterns
- **Morning standup** - What's planned for today
- **Midday check-in** - Progress and blockers
- **End of day summary** - What was completed
- **Weekly review** - Assess technical debt and priorities

---

**Document Version:** 1.0.0
**Last Updated:** October 2025
**Status:** Living Document - Update regularly based on project learnings
