import ProjectTree from './components/ProjectTree'
import Canvas from './components/Canvas'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 Web Designer</h1>
        <span className="version">v0.3.0 - Phase 3</span>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <ProjectTree />
        </aside>

        <main className="main-content">
          <Canvas />
        </main>
      </div>
    </div>
  )
}
