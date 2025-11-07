import { useState, useRef, useEffect } from 'react'
import { useDesignerStore } from '../store'
import '../styles/MenuBar.css'

type MenuType = 'file' | 'edit' | 'view' | 'tools' | 'help' | null

export default function MenuBar() {
  const [openMenu, setOpenMenu] = useState<MenuType>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)
  const {
    selectedView,
    canUndo,
    canRedo,
    undo,
    redo,
    selectedComponentPath,
    selectedComponentPaths,
    clipboard,
    deleteComponent,
    saveView,
    isModified,
    zoomIn,
    zoomOut,
    zoomReset,
    toggleLeftSidebar,
    toggleRightSidebar,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    copyComponent,
    cutComponent,
    pasteComponent,
    duplicateComponent,
  } = useDesignerStore()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenu])

  const toggleMenu = (menu: MenuType) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const handleSave = () => {
    if (selectedView) {
      saveView()
      setOpenMenu(null)
    }
  }

  const handleUndo = () => {
    undo()
    setOpenMenu(null)
  }

  const handleRedo = () => {
    redo()
    setOpenMenu(null)
  }

  const handleDelete = () => {
    if (selectedComponentPath) {
      if (confirm('Delete selected component?')) {
        deleteComponent(selectedComponentPath)
      }
    }
    setOpenMenu(null)
  }

  const handleCopy = () => {
    copyComponent()
    setOpenMenu(null)
  }

  const handleCut = () => {
    cutComponent()
    setOpenMenu(null)
  }

  const handlePaste = () => {
    pasteComponent()
    setOpenMenu(null)
  }

  const handleDuplicate = () => {
    duplicateComponent()
    setOpenMenu(null)
  }

  const handleClose = () => {
    if (isModified) {
      if (confirm('You have unsaved changes. Close anyway?')) {
        useDesignerStore.getState().setSelectedView(null)
      }
    } else {
      useDesignerStore.getState().setSelectedView(null)
    }
    setOpenMenu(null)
  }

  const handleZoomIn = () => {
    zoomIn()
    setOpenMenu(null)
  }

  const handleZoomOut = () => {
    zoomOut()
    setOpenMenu(null)
  }

  const handleZoomReset = () => {
    zoomReset()
    setOpenMenu(null)
  }

  const handleToggleLeftSidebar = () => {
    toggleLeftSidebar()
    setOpenMenu(null)
  }

  const handleToggleRightSidebar = () => {
    toggleRightSidebar()
    setOpenMenu(null)
  }

  const handleAlignLeft = () => {
    alignLeft()
    setOpenMenu(null)
  }

  const handleAlignCenter = () => {
    alignCenter()
    setOpenMenu(null)
  }

  const handleAlignRight = () => {
    alignRight()
    setOpenMenu(null)
  }

  const handleAlignTop = () => {
    alignTop()
    setOpenMenu(null)
  }

  const handleAlignMiddle = () => {
    alignMiddle()
    setOpenMenu(null)
  }

  const handleAlignBottom = () => {
    alignBottom()
    setOpenMenu(null)
  }

  const canAlign = selectedComponentPaths.length >= 2

  return (
    <div className="menu-bar" ref={menuBarRef}>
      {/* File Menu */}
      <div className="menu-item">
        <button
          className={`menu-button ${openMenu === 'file' ? 'active' : ''}`}
          onClick={() => toggleMenu('file')}
        >
          File
        </button>
        {openMenu === 'file' && (
          <div className="menu-dropdown">
            <button
              className="menu-action"
              onClick={handleSave}
              disabled={!selectedView || !isModified}
            >
              <span className="menu-action-label">Save</span>
              <span className="menu-action-shortcut">Ctrl+S</span>
            </button>
            <div className="menu-divider" />
            <button
              className="menu-action"
              onClick={handleClose}
              disabled={!selectedView}
            >
              <span className="menu-action-label">Close View</span>
              <span className="menu-action-shortcut">Ctrl+W</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="menu-item">
        <button
          className={`menu-button ${openMenu === 'edit' ? 'active' : ''}`}
          onClick={() => toggleMenu('edit')}
        >
          Edit
        </button>
        {openMenu === 'edit' && (
          <div className="menu-dropdown">
            <button
              className="menu-action"
              onClick={handleUndo}
              disabled={!canUndo}
            >
              <span className="menu-action-label">Undo</span>
              <span className="menu-action-shortcut">Ctrl+Z</span>
            </button>
            <button
              className="menu-action"
              onClick={handleRedo}
              disabled={!canRedo}
            >
              <span className="menu-action-label">Redo</span>
              <span className="menu-action-shortcut">Ctrl+Y</span>
            </button>
            <div className="menu-divider" />
            <button
              className="menu-action"
              onClick={handleCopy}
              disabled={!selectedComponentPath || selectedComponentPath === 'root'}
            >
              <span className="menu-action-label">Copy</span>
              <span className="menu-action-shortcut">Ctrl+C</span>
            </button>
            <button
              className="menu-action"
              onClick={handleCut}
              disabled={!selectedComponentPath || selectedComponentPath === 'root'}
            >
              <span className="menu-action-label">Cut</span>
              <span className="menu-action-shortcut">Ctrl+X</span>
            </button>
            <button
              className="menu-action"
              onClick={handlePaste}
              disabled={!clipboard}
            >
              <span className="menu-action-label">Paste</span>
              <span className="menu-action-shortcut">Ctrl+V</span>
            </button>
            <button
              className="menu-action"
              onClick={handleDuplicate}
              disabled={!selectedComponentPath || selectedComponentPath === 'root'}
            >
              <span className="menu-action-label">Duplicate</span>
              <span className="menu-action-shortcut">Ctrl+D</span>
            </button>
            <div className="menu-divider" />
            <button
              className="menu-action"
              onClick={handleDelete}
              disabled={!selectedComponentPath}
            >
              <span className="menu-action-label">Delete</span>
              <span className="menu-action-shortcut">Del</span>
            </button>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="menu-item">
        <button
          className={`menu-button ${openMenu === 'view' ? 'active' : ''}`}
          onClick={() => toggleMenu('view')}
        >
          View
        </button>
        {openMenu === 'view' && (
          <div className="menu-dropdown">
            <button className="menu-action" onClick={handleZoomIn}>
              <span className="menu-action-label">Zoom In</span>
              <span className="menu-action-shortcut">Ctrl++</span>
            </button>
            <button className="menu-action" onClick={handleZoomOut}>
              <span className="menu-action-label">Zoom Out</span>
              <span className="menu-action-shortcut">Ctrl+-</span>
            </button>
            <button className="menu-action" onClick={handleZoomReset}>
              <span className="menu-action-label">Fit to Screen</span>
              <span className="menu-action-shortcut">Ctrl+0</span>
            </button>
            <div className="menu-divider" />
            <button className="menu-action" onClick={handleToggleLeftSidebar}>
              <span className="menu-action-label">Toggle Left Sidebar</span>
              <span className="menu-action-shortcut">Ctrl+B</span>
            </button>
            <button className="menu-action" onClick={handleToggleRightSidebar}>
              <span className="menu-action-label">Toggle Right Sidebar</span>
              <span className="menu-action-shortcut">Ctrl+Shift+B</span>
            </button>
          </div>
        )}
      </div>

      {/* Tools Menu */}
      <div className="menu-item">
        <button
          className={`menu-button ${openMenu === 'tools' ? 'active' : ''}`}
          onClick={() => toggleMenu('tools')}
        >
          Tools
        </button>
        {openMenu === 'tools' && (
          <div className="menu-dropdown">
            <button className="menu-action" onClick={handleAlignLeft} disabled={!canAlign}>
              <span className="menu-action-label">Align Left</span>
            </button>
            <button className="menu-action" onClick={handleAlignCenter} disabled={!canAlign}>
              <span className="menu-action-label">Align Center</span>
            </button>
            <button className="menu-action" onClick={handleAlignRight} disabled={!canAlign}>
              <span className="menu-action-label">Align Right</span>
            </button>
            <div className="menu-divider" />
            <button className="menu-action" onClick={handleAlignTop} disabled={!canAlign}>
              <span className="menu-action-label">Align Top</span>
            </button>
            <button className="menu-action" onClick={handleAlignMiddle} disabled={!canAlign}>
              <span className="menu-action-label">Align Middle</span>
            </button>
            <button className="menu-action" onClick={handleAlignBottom} disabled={!canAlign}>
              <span className="menu-action-label">Align Bottom</span>
            </button>
            <div className="menu-divider" />
            <button className="menu-action" disabled>
              <span className="menu-action-label">Distribute Horizontally</span>
            </button>
            <button className="menu-action" disabled>
              <span className="menu-action-label">Distribute Vertically</span>
            </button>
            <div className="menu-divider" />
            <button className="menu-action" disabled>
              <span className="menu-action-label">Group Components</span>
              <span className="menu-action-shortcut">Ctrl+G</span>
            </button>
            <button className="menu-action" disabled>
              <span className="menu-action-label">Ungroup Components</span>
              <span className="menu-action-shortcut">Ctrl+Shift+G</span>
            </button>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="menu-item">
        <button
          className={`menu-button ${openMenu === 'help' ? 'active' : ''}`}
          onClick={() => toggleMenu('help')}
        >
          Help
        </button>
        {openMenu === 'help' && (
          <div className="menu-dropdown">
            <button
              className="menu-action"
              onClick={() => {
                window.open('https://docs.inductiveautomation.com/docs/8.1/perspective/perspective-overview', '_blank')
                setOpenMenu(null)
              }}
            >
              <span className="menu-action-label">Perspective Documentation</span>
            </button>
            <button
              className="menu-action"
              onClick={() => {
                window.open('https://github.com/gaskony/ignition-web-designer', '_blank')
                setOpenMenu(null)
              }}
            >
              <span className="menu-action-label">GitHub Repository</span>
            </button>
            <div className="menu-divider" />
            <button
              className="menu-action"
              onClick={() => {
                alert('Web Designer v0.18.0 - Redesigned Sidebar\n\nDeveloped by Gaskony\nBuilt with Claude Code')
                setOpenMenu(null)
              }}
            >
              <span className="menu-action-label">About</span>
            </button>
          </div>
        )}
      </div>

      {/* Modified Indicator */}
      {isModified && (
        <div className="modified-indicator" title="Unsaved changes">
          ●
        </div>
      )}
    </div>
  )
}
