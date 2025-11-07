# Testing Guide

Comprehensive testing guidelines for the Web Designer module.

## Testing Strategy

### Test Pyramid

```
        /\
       /  \  E2E Tests (5%)
      /____\
     /      \  Integration Tests (25%)
    /________\
   /          \  Unit Tests (70%)
  /__________

__\
```

### Test Types

1. **Unit Tests** - Test individual functions/components
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test complete user workflows
4. **Security Tests** - Test security measures
5. **Performance Tests** - Test performance characteristics
6. **Manual Tests** - Exploratory testing

---

## Frontend Testing

### Unit Tests (React Components)

**Testing Library Stack:**
- Jest - Test runner
- React Testing Library - Component testing
- MSW (Mock Service Worker) - API mocking

**Example Component Test:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast} from '../components/Toast/ToastNotification'

describe('ToastNotification', () => {
  it('renders success toast with message', () => {
    const toast = {
      id: '1',
      type: ToastType.SUCCESS,
      title: 'Success',
      message: 'Operation completed',
    }

    render(<ToastNotification toast={toast} />)

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('calls dismiss when close button clicked', () => {
    const mockDismiss = jest.fn()
    const toast = { id: '1', type: ToastType.INFO, message: 'Test' }

    render(<ToastNotification toast={toast} />)

    fireEvent.click(screen.getByTitle('Dismiss'))

    expect(mockDismiss).toHaveBeenCalledWith('1')
  })
})
```

**Test Coverage Goals:**
- Components: > 80%
- Utilities: > 90%
- Stores: > 85%

### Integration Tests (API Integration)

**Mock API Responses:**
```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/data/webdesigner/api/v1/projects', (req, res, ctx) => {
    return res(ctx.json({
      projects: [
        { name: 'TestProject', title: 'Test Project' }
      ]
    }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('loads projects from API', async () => {
  render(<ProjectTree />)

  await waitFor(() => {
    expect(screen.getByText('TestProject')).toBeInTheDocument()
  })
})
```

### E2E Tests (Cypress)

**Example E2E Test:**
```javascript
describe('View Editing Workflow', () => {
  beforeEach(() => {
    cy.visit('/data/webdesigner')
    cy.login('admin', 'password')
  })

  it('should load, edit, and save a view', () => {
    // Load project
    cy.get('[data-testid=project-tree]').click()
    cy.contains('TestProject').click()

    // Load view
    cy.contains('MainView').click()

    // Add component
    cy.get('[data-testid=component-palette]')
      .contains('Button')
      .drag('[data-testid=canvas]')

    // Edit property
    cy.get('[data-testid=property-editor]')
      .find('input[name="text"]')
      .clear()
      .type('Click Me')

    // Save
    cy.get('[data-testid=save-button]').click()

    // Verify success toast
    cy.contains('View saved successfully').should('be.visible')
  })
})
```

---

## Backend Testing

### Unit Tests (JUnit)

**Testing Framework:**
- JUnit 5
- Mockito - Mocking framework
- AssertJ - Fluent assertions

**Example Handler Test:**
```java
@ExtendWith(MockitoExtension.class)
class ProjectHandlerTest {

    @Mock
    private GatewayContext context;

    @Mock
    private HttpServletRequest req;

    @Mock
    private HttpServletResponse res;

    @Test
    void testGetProjects_WithAuthenticatedUser_ReturnsProjects() {
        // Arrange
        User mockUser = mock(User.class);
        when(SecurityUtil.getAuthenticatedUser(context, req))
            .thenReturn(mockUser);
        when(SecurityUtil.hasDesignerPermission(context, mockUser))
            .thenReturn(true);

        // Act
        JsonObject result = ProjectHandler.handleGetProjects(context, req, res);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.has("projects")).isTrue();
        verify(res, never()).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    void testGetProjects_WithoutAuthentication_Returns401() {
        // Arrange
        when(SecurityUtil.getAuthenticatedUser(context, req))
            .thenReturn(null);

        // Act
        JsonObject result = ProjectHandler.handleGetProjects(context, req, res);

        // Assert
        verify(res).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertThat(result.get("error").getAsString())
            .contains("Authentication required");
    }
}
```

### Integration Tests (Module Loading)

**Test Module Loading:**
```java
@Test
void testModuleLoadsSuccessfully() {
    GatewayHook hook = new WebDesignerGatewayHook();
    GatewayContext mockContext = mock(GatewayContext.class);

    // Test startup
    hook.setup(mockContext);

    // Verify routes mounted
    verify(mockContext).mountRoutes(any());

    // Test shutdown
    hook.shutdown();
}
```

---

## Security Testing

### Authentication Tests

```bash
# Test without session
curl -X GET http://localhost:8088/data/webdesigner/api/v1/projects
# Expected: 401 Unauthorized

# Test with invalid session
curl -X GET http://localhost:8088/data/webdesigner/api/v1/projects \
  --cookie "JSESSIONID=invalid"
# Expected: 401 Unauthorized

# Test with valid session but no permissions
curl -X GET http://localhost:8088/data/webdesigner/api/v1/projects \
  --cookie "JSESSIONID=valid-user-session"
# Expected: 403 Forbidden (if not Designer role)
```

### Input Validation Tests

```bash
# Test path traversal
curl -X GET "http://localhost:8088/data/webdesigner/api/v1/projects/test/view?path=../../../etc/passwd"
# Expected: 400 Bad Request (Invalid path)

# Test large JSON
dd if=/dev/zero bs=1M count=10 | curl -X PUT \
  "http://localhost:8088/data/webdesigner/api/v1/projects/test/view?path=test" \
  --data-binary @-
# Expected: 400 Bad Request (JSON too large)

# Test deep nesting
# Create JSON with 100 levels of nesting
# Expected: 400 Bad Request (Nesting too deep)
```

### XSS Tests

```javascript
// Test XSS in component names
const xssPayload = '<script>alert("XSS")</script>'
addComponent({ type: 'ia.display.label', meta: { name: xssPayload } })

// Verify: Should be escaped in display
// Expected: Text displays literally, no script execution
```

---

## Performance Testing

### Load Testing (Artillery)

**artillery.yml:**
```yaml
config:
  target: "http://localhost:8088"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests/second
      name: "Sustained load"
    - duration: 30
      arrivalRate: 50  # 50 requests/second
      name: "Peak load"

scenarios:
  - name: "Load projects"
    flow:
      - get:
          url: "/data/webdesigner/api/v1/projects"
          headers:
            Cookie: "JSESSIONID={{ session }}"
      - think: 2
      - get:
          url: "/data/webdesigner/api/v1/projects/TestProject/views"
```

**Run:**
```bash
artillery run artillery.yml
```

**Success Criteria:**
- Response time p95 < 500ms
- Response time p99 < 1000ms
- Error rate < 1%
- No memory leaks

### Frontend Performance

**Lighthouse:**
```bash
lighthouse http://localhost:8088/data/webdesigner \
  --output=html \
  --output-path=./lighthouse-report.html
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

---

## Manual Testing Checklist

### Smoke Tests (Quick Verification)

- [ ] Module loads without errors
- [ ] Can access Web Designer page
- [ ] Can see project list
- [ ] Can expand a project
- [ ] Can load a view
- [ ] Can add a component
- [ ] Can edit a property
- [ ] Can save changes
- [ ] Can undo/redo
- [ ] Can see toast notifications

### Full Functional Tests

#### Project Management
- [ ] List all projects
- [ ] Expand/collapse projects
- [ ] Filter projects (if implemented)
- [ ] Refresh project list

#### View Management
- [ ] List views in project
- [ ] Load view content
- [ ] Parse view JSON correctly
- [ ] Display component tree
- [ ] Handle missing views
- [ ] Handle invalid JSON

#### Component Editing
- [ ] Add component from palette
- [ ] Select component
- [ ] Multi-select components
- [ ] Move component
- [ ] Resize component
- [ ] Delete component
- [ ] Copy/paste component
- [ ] Duplicate component
- [ ] Undo/redo operations

#### Property Editing
- [ ] Edit text properties
- [ ] Edit number properties
- [ ] Edit boolean properties
- [ ] Edit object properties (JSON)
- [ ] Edit array properties
- [ ] Create bindings (tag, property, etc.)
- [ ] Edit bindings
- [ ] Remove bindings

#### Save Operations
- [ ] Save view successfully
- [ ] Handle save conflicts (ETag)
- [ ] Show save success toast
- [ ] Show save error toast
- [ ] Validate before save
- [ ] Audit log created

#### UI Features
- [ ] Left sidebar toggle
- [ ] Right sidebar toggle
- [ ] Zoom in/out
- [ ] Grid overlay toggle
- [ ] Align components
- [ ] Keyboard shortcuts work
- [ ] Help dialog opens (?)
- [ ] Full screen mode

### Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if Mac available)

### Gateway Integration

- [ ] Session authentication works
- [ ] Permission checks work
- [ ] Audit logs appear in Gateway
- [ ] Module starts/stops cleanly
- [ ] No errors in Gateway logs
- [ ] Module info page accessible

---

## Test Data Setup

### Create Test Project

```bash
# In Ignition Designer, create:
- Project: "WebDesignerTest"
- View: "TestView" with components
- Script: "TestScript.py"
- Named Query: "TestQuery"
```

### Mock Data Files

**frontend/src/__mocks__/testData.ts:**
```typescript
export const mockProjects = [
  { name: 'TestProject', title: 'Test Project' }
]

export const mockViews = [
  { name: 'MainView', path: 'MainView', title: 'Main View' }
]

export const mockViewContent = {
  root: {
    type: 'ia.container.coord',
    meta: { name: 'root' },
    children: []
  }
}
```

---

## Continuous Integration

### GitHub Actions Workflow

**.github/workflows/test.yml:**
```yaml
name: Test

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npm run build

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - run: ./gradlew test
      - run: ./gradlew build
```

---

## Test Execution

### Run All Tests

**Frontend:**
```bash
cd frontend
npm test                    # Unit tests
npm run test:coverage       # With coverage
npm run test:e2e           # E2E tests (if configured)
```

**Backend:**
```bash
./gradlew test              # Unit tests
./gradlew integrationTest   # Integration tests (if configured)
./gradlew test jacocoTestReport  # With coverage
```

### Test Coverage Reports

**Frontend:**
```bash
cd frontend
npm run test:coverage
# View: frontend/coverage/lcov-report/index.html
```

**Backend:**
```bash
./gradlew test jacocoTestReport
# View: build/reports/jacoco/test/html/index.html
```

---

## Test Maintenance

### When to Update Tests

1. **New Feature Added**
   - Add unit tests for new code
   - Add integration test for feature flow
   - Update E2E test if user-facing
   - Update manual test checklist

2. **Bug Fixed**
   - Add regression test
   - Verify fix doesn't break existing tests
   - Update test data if needed

3. **Refactoring**
   - Verify tests still pass
   - Update test structure if needed
   - Maintain test coverage

### Test Review Checklist

- [ ] Tests are independent (no shared state)
- [ ] Tests are fast (< 1s per unit test)
- [ ] Tests have clear names
- [ ] Tests test one thing
- [ ] Mocks are reasonable
- [ ] Edge cases covered
- [ ] Error cases covered
- [ ] Happy path covered

---

**Last Updated:** 2025-11-07
**Version:** 0.29.0
**Test Coverage Target:** > 80%
