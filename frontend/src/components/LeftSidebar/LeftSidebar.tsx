import { useState, useEffect } from 'react'
import ProjectTree from '../ProjectTree'
import ComponentPalette from '../ComponentPalette'
import TagBrowser from '../TagBrowser'
import ScriptBrowser from '../ScriptBrowser'
import NamedQueryBrowser from '../NamedQueryBrowser'
import './LeftSidebar.css'

interface Panel {
  id: string
  icon: string
  label: string
  component: React.ComponentType
  ariaLabel: string
  shortcut: string
}

const PANELS: Panel[] = [
  {
    id: 'projects',
    icon: '📁',
    label: 'Projects',
    component: ProjectTree,
    ariaLabel: 'Project Explorer',
    shortcut: 'Ctrl+Shift+E'
  },
  {
    id: 'components',
    icon: '🧩',
    label: 'Components',
    component: ComponentPalette,
    ariaLabel: 'Component Palette',
    shortcut: 'Ctrl+Shift+C'
  },
  {
    id: 'tags',
    icon: '🏷️',
    label: 'Tags',
    component: TagBrowser,
    ariaLabel: 'Tag Browser',
    shortcut: 'Ctrl+Shift+T'
  },
  {
    id: 'scripts',
    icon: '📜',
    label: 'Scripts',
    component: ScriptBrowser,
    ariaLabel: 'Script Browser',
    shortcut: 'Ctrl+Shift+S'
  },
  {
    id: 'queries',
    icon: '🗄️',
    label: 'Queries',
    component: NamedQueryBrowser,
    ariaLabel: 'Named Query Browser',
    shortcut: 'Ctrl+Shift+Q'
  }
]

export default function LeftSidebar() {
  const [activePanel, setActivePanel] = useState<string>('projects')
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  // Load saved panel preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('webdesigner-active-panel')
    if (saved && PANELS.some(p => p.id === saved)) {
      setActivePanel(saved)
    }
  }, [])

  // Save active panel to localStorage
  useEffect(() => {
    localStorage.setItem('webdesigner-active-panel', activePanel)
  }, [activePanel])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'e':
            e.preventDefault()
            setActivePanel('projects')
            setIsCollapsed(false)
            break
          case 'c':
            e.preventDefault()
            setActivePanel('components')
            setIsCollapsed(false)
            break
          case 't':
            e.preventDefault()
            setActivePanel('tags')
            setIsCollapsed(false)
            break
          case 's':
            e.preventDefault()
            setActivePanel('scripts')
            setIsCollapsed(false)
            break
          case 'q':
            e.preventDefault()
            setActivePanel('queries')
            setIsCollapsed(false)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleTabClick = (panelId: string) => {
    if (activePanel === panelId && !isCollapsed) {
      // Clicking the active tab collapses the panel
      setIsCollapsed(true)
    } else {
      setActivePanel(panelId)
      setIsCollapsed(false)
    }
  }

  const activePanelConfig = PANELS.find(p => p.id === activePanel)
  const ActivePanelComponent = activePanelConfig?.component

  return (
    <aside className="left-sidebar-redesign">
      {/* Vertical Tab Bar */}
      <nav className="tab-bar" role="tablist" aria-label="Sidebar panels">
        {PANELS.map((panel) => (
          <button
            key={panel.id}
            className={`tab-button ${activePanel === panel.id && !isCollapsed ? 'active' : ''}`}
            onClick={() => handleTabClick(panel.id)}
            role="tab"
            aria-selected={activePanel === panel.id && !isCollapsed}
            aria-controls={`panel-${panel.id}`}
            aria-label={`${panel.ariaLabel} (${panel.shortcut})`}
            title={`${panel.label} (${panel.shortcut})`}
          >
            <span className="tab-icon" aria-hidden="true">{panel.icon}</span>
            <span className="tab-label">{panel.label}</span>
          </button>
        ))}

        {/* Collapse/Expand Toggle */}
        <button
          className="tab-button collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <span className="tab-icon" aria-hidden="true">
            {isCollapsed ? '▶' : '◀'}
          </span>
          <span className="tab-label">Toggle</span>
        </button>
      </nav>

      {/* Panel Container */}
      {!isCollapsed && (
        <div
          className="panel-container"
          role="tabpanel"
          id={`panel-${activePanel}`}
          aria-labelledby={`tab-${activePanel}`}
        >
          {ActivePanelComponent && <ActivePanelComponent />}
        </div>
      )}
    </aside>
  )
}
