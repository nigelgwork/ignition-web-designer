# Development Guide

Complete guide for setting up a development environment and contributing to the Web Designer project.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Building](#building)
- [Testing](#testing)
- [Debugging](#debugging)
- [Code Style](#code-style)
- [Common Issues](#common-issues)

---

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **JDK** | 17+ | Backend compilation |
| **Node.js** | 18+ | Frontend development |
| **npm** | 9+ | Frontend package management |
| **Ignition Gateway** | 8.3+ | Runtime environment |
| **Git** | Latest | Version control |

### Recommended IDE

- **Backend (Java)**: IntelliJ IDEA, Eclipse, or VS Code with Java extensions
- **Frontend (TypeScript/React)**: VS Code with recommended extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - React Developer Tools (browser extension)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd ignition-web-designer
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Configure Ignition Gateway

**Option A: Docker (Recommended for Development)**

```bash
# Using ignition-docker
docker run -d \
  -p 8088:8088 \
  -v $(pwd)/build:/modules \
  --name ignition-dev \
  inductiveautomation/ignition:8.3.0

# Access Gateway: http://localhost:8088
# Default credentials: admin / password
```

**Option B: Local Installation**

1. Download Ignition from https://inductiveautomation.com/downloads/
2. Install following instructions for your platform
3. Start Gateway: `<install-dir>/ignition.sh` (Linux/Mac) or `ignition.exe` (Windows)
4. Access Gateway: http://localhost:8088

### 4. Verify Setup

```bash
# Backend: Gradle build
./gradlew --version

# Frontend: npm build
cd frontend && npm run build

# Full module build
./gradlew clean build
```

---

## Project Structure

```
ignition-web-designer/
├── build.gradle.kts                # Root Gradle build
├── settings.gradle.kts             # Multi-project configuration
├── gradle/wrapper/                 # Gradle wrapper
│
├── gateway/                        # Java backend module
│   ├── build.gradle.kts           # Gateway build configuration
│   └── src/
│       ├── main/java/com/me/webdesigner/
│       │   ├── GatewayHook.java            # Main module hook
│       │   └── WebDesignerApiRoutes.java   # REST API endpoints
│       └── main/resources/
│           ├── module.xml                   # Module metadata
│           └── web/                         # Frontend dist (copied during build)
│
├── frontend/                       # React + TypeScript frontend
│   ├── package.json               # npm dependencies
│   ├── webpack.config.js          # Webpack bundler config
│   ├── tsconfig.json              # TypeScript config
│   └── src/
│       ├── main.tsx                # React app entry point
│       ├── standalone.tsx          # Standalone mode entry
│       ├── App.tsx                 # Main app component
│       ├── api/axios.ts            # API client configuration
│       ├── components/             # React components
│       │   ├── Canvas.tsx
│       │   ├── PropertyEditor.tsx
│       │   ├── ComponentPalette.tsx
│       │   └── ...
│       ├── store/designerStore.ts  # Zustand state management
│       ├── styles/                 # CSS files
│       └── types/index.ts          # TypeScript type definitions
│
├── build/                          # Build output
│   └── Web-Designer-0.18.0.modl   # Signed module file
│
├── docs/                           # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md (this file)
│   └── ...
│
└── .claude/                        # Claude Code configuration
```

---

## Development Workflow

### Frontend Development (Hot Reload)

**Step 1**: Start Vite dev server

```bash
cd frontend
npm run dev

# Dev server runs at: http://localhost:5173
# Hot Module Replacement (HMR) enabled
```

**Step 2**: Configure API proxy

In `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/data/webdesigner': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
    },
  },
});
```

**Step 3**: Develop with instant feedback

- Edit files in `frontend/src/`
- Browser automatically reloads
- Check console for errors
- Use React DevTools for debugging

---

### Backend Development

**Step 1**: Make Java changes

Edit files in `gateway/src/main/java/com/me/webdesigner/`

**Step 2**: Build module

```bash
./gradlew clean zipModule signModule
```

**Step 3**: Deploy to Gateway

```bash
# Copy to Gateway modules directory
cp build/Web-Designer-0.18.0.modl \
   /path/to/ignition/data/var/ignition/modl/

# Restart Gateway or use Module Commissioning
```

**Step 4**: Check logs

```bash
# Gateway logs location
tail -f /path/to/ignition/logs/wrapper.log
```

---

### Full Build & Test Cycle

```bash
# 1. Clean previous builds
./gradlew clean

# 2. Build frontend
cd frontend && npm run build && cd ..

# 3. Build and sign module
./gradlew zipModule signModule

# 4. Deploy to Gateway
cp build/Web-Designer-0.18.0.modl \
   /usr/local/bin/ignition/data/var/ignition/modl/

# 5. Restart Gateway (if needed)
docker restart ignition-dev

# 6. Test in browser
open http://localhost:8088/data/webdesigner/
```

---

## Building

### Frontend Build

```bash
cd frontend

# Development build (with source maps)
npm run build

# Production build (minified)
npm run build:prod

# Watch mode (rebuild on change)
npm run watch
```

**Output**: `frontend/dist/` containing:
- `webdesigner.js` - Main bundle
- `standalone.js` - Standalone mode bundle
- `webdesigner.css` - Compiled styles

---

### Backend Build

```bash
# Compile Java code
./gradlew compileJava

# Build JAR (without frontend)
./gradlew gateway:jar

# Full module build (includes frontend dist)
./gradlew zipModule
```

**Output**: `build/` containing:
- `Web-Designer-0.18.0.unsigned.modl` - Unsigned module
- `Web-Designer-0.18.0.modl` - Signed module (if signing configured)

---

### Module Signing

**Prerequisites**:
- Java keystore with code signing certificate
- `sign.props` file with keystore credentials

**Setup**:

1. Create keystore:
```bash
keytool -genkeypair \
  -alias webdesigner \
  -keyalg RSA \
  -keysize 2048 \
  -validity 3650 \
  -keystore keystore.jks \
  -dname "CN=Your Name,OU=Development,O=Your Org,L=City,ST=State,C=US"
```

2. Create `sign.props`:
```properties
keystoreFile=keystore.jks
keystorePassword=yourPassword
certAlias=webdesigner
certPassword=yourPassword
```

3. Build signed module:
```bash
./gradlew signModule
```

---

## Testing

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Framework**: Jest + React Testing Library

**Example Test** (`frontend/src/components/__tests__/Canvas.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import Canvas from '../Canvas';

test('renders empty state when no view selected', () => {
  render(<Canvas />);
  expect(screen.getByText(/Select a view/i)).toBeInTheDocument();
});
```

---

### Backend Tests

```bash
# Run JUnit tests
./gradlew test

# Run specific test class
./gradlew test --tests WebDesignerApiRoutesTest

# Generate test report
./gradlew test jacocoTestReport
```

**Test Framework**: JUnit 5

**Example Test** (`gateway/src/test/java/com/me/webdesigner/WebDesignerApiRoutesTest.java`):
```java
@Test
public void testGetProjectsEndpoint() {
    // Test implementation
}
```

---

### Integration Tests

```bash
# Build and deploy to test Gateway
./gradlew clean zipModule
./deploy-to-test-gateway.sh

# Run end-to-end tests
cd frontend && npm run test:e2e
```

---

## Debugging

### Frontend Debugging

**Browser DevTools**:
1. Open Chrome/Firefox DevTools (F12)
2. Go to Sources tab
3. Set breakpoints in TypeScript files
4. Step through code execution

**React DevTools**:
- Install browser extension
- Inspect component tree
- View props and state
- Track re-renders

**Zustand DevTools**:
```typescript
import { devtools } from 'zustand/middleware';

const useDesignerStore = create(
  devtools((set) => ({
    // ... store definition
  }), { name: 'DesignerStore' })
);
```

---

### Backend Debugging

**IntelliJ IDEA**:
1. Create "Remote JVM Debug" run configuration
2. Set Gateway JVM args: `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005`
3. Start Gateway with debug args
4. Attach debugger from IntelliJ
5. Set breakpoints in Java files

**Eclipse**:
1. Debug Configurations → Remote Java Application
2. Connection Type: Standard (Socket Attach)
3. Host: localhost, Port: 5005
4. Click "Debug"

**Logging**:
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger logger = LoggerFactory.getLogger(GatewayHook.class);

logger.info("Web Designer module starting up");
logger.debug("Debug message: {}", variable);
logger.error("Error occurred", exception);
```

---

## Code Style

### Java (Backend)

**Style Guide**: Google Java Style Guide

**Key Points**:
- Indentation: 4 spaces
- Braces: Always use, even for single-line blocks
- Line length: 120 characters max
- Naming:
  - Classes: `PascalCase`
  - Methods: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

**Example**:
```java
public class WebDesignerApiRoutes {
    private static final String API_BASE = "/api/v1";

    public void setupRoutes(ModuleRoutes routes) {
        // Implementation
    }
}
```

---

### TypeScript/React (Frontend)

**Style Guide**: Airbnb React/JSX Style Guide

**Key Points**:
- Indentation: 2 spaces
- Quotes: Single quotes for strings
- Semicolons: Required
- Component naming: `PascalCase`
- File naming: `PascalCase.tsx` for components

**Example**:
```typescript
interface CanvasProps {
  viewPath: string;
  onComponentSelect: (componentId: string) => void;
}

export default function Canvas({ viewPath, onComponentSelect }: CanvasProps) {
  // Implementation
}
```

---

### Linting & Formatting

**Frontend**:
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix

# Format with Prettier
npm run format
```

**Backend**:
```bash
# Check style with Checkstyle (if configured)
./gradlew checkstyleMain

# Format with Spotless (if configured)
./gradlew spotlessApply
```

---

## Common Issues

### Issue: Frontend build fails with "Cannot find module"

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: Module doesn't load in Gateway

**Diagnosis**:
```bash
# Check Gateway logs
tail -f /path/to/ignition/logs/wrapper.log | grep webdesigner

# Look for errors like:
# - "Module signature invalid"
# - "Class not found"
# - "Dependency not satisfied"
```

**Solutions**:
- **Signature invalid**: Re-sign module with correct certificate
- **Class not found**: Check `gateway/build.gradle.kts` dependencies
- **Dependency not satisfied**: Verify Gateway version compatibility

---

### Issue: API returns 401 Unauthorized

**Cause**: Session cookie not being sent with requests

**Solution**:
```typescript
// In axios config
const apiClient = axios.create({
  withCredentials: true,  // Add this!
});
```

---

### Issue: Hot reload not working in Vite dev server

**Solutions**:
1. Check `vite.config.ts` HMR settings
2. Restart dev server
3. Clear browser cache
4. Check firewall/antivirus blocking WebSocket

---

### Issue: Gradle build fails with "Java version mismatch"

**Solution**:
```bash
# Check Java version
java -version

# Should be JDK 17+
# If not, install JDK 17 and set JAVA_HOME
export JAVA_HOME=/path/to/jdk-17
```

---

## Performance Tips

### Frontend

1. **Use React.memo for expensive components**:
```typescript
const Canvas = React.memo(({ viewPath }) => {
  // Expensive rendering
});
```

2. **Debounce rapid state updates**:
```typescript
const debouncedSave = useMemo(
  () => debounce(saveView, 1000),
  []
);
```

3. **Virtualize long lists**:
```typescript
import { FixedSizeList } from 'react-window';
```

---

### Backend

1. **Cache Gateway API calls**:
```java
private final Map<String, List<String>> projectCache = new ConcurrentHashMap<>();
```

2. **Use async operations for I/O**:
```java
CompletableFuture.supplyAsync(() -> loadView(projectName, viewPath));
```

---

## Resources

- [Ignition SDK Documentation](https://docs.inductiveautomation.com/docs/8.3/ignition-platform/developing-with-the-ignition-sdk)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Webpack Documentation](https://webpack.js.org/)

---

**Last Updated**: 2025-11-07
**Version**: 0.18.0
