import { useEffect } from 'react'
import { useDesignerStore } from '../store/designerStore'
import axios from 'axios'

export default function Canvas() {
  const {
    selectedProject,
    selectedView,
    viewContent,
    loadingView,
    viewModified,
    savingView,
    canUndo,
    canRedo,
    setViewContent,
    setLoadingView,
    setSelectedComponent,
    addComponent,
    deleteComponent,
    saveView,
    undo,
    redo,
  } = useDesignerStore()

  // Load view content when a view is selected
  useEffect(() => {
    if (selectedProject && selectedView) {
      loadViewContent(selectedProject, selectedView)
    } else {
      setViewContent(null)
      setSelectedComponent(null, null)
    }
  }, [selectedProject, selectedView])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (viewModified && !savingView) {
          handleSave()
        }
      }

      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) {
          undo()
        }
      }

      // Ctrl+Y / Cmd+Y OR Ctrl+Shift+Z / Cmd+Shift+Z - Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault()
        if (canRedo) {
          redo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewModified, savingView, canUndo, canRedo, undo, redo])

  const loadViewContent = async (projectName: string, viewPath: string) => {
    setLoadingView(true)
    try {
      const response = await axios.get(
        `/data/webdesigner/api/v1/projects/${encodeURIComponent(projectName)}/view`,
        {
          params: { path: viewPath },
        }
      )
      setViewContent(response.data)
    } catch (error) {
      console.error('Error loading view content:', error)
      setViewContent(null)
    } finally {
      setLoadingView(false)
    }
  }

  const handleComponentClick = (componentPath: string, props: Record<string, unknown>) => {
    setSelectedComponent(componentPath, props)
  }

  const handleSave = async () => {
    const success = await saveView()
    if (success) {
      alert('View saved successfully!')
    } else {
      alert('Failed to save view. Check console for errors.')
    }
  }

  const handleDeleteComponent = (e: React.MouseEvent, path: string) => {
    e.stopPropagation()
    if (confirm(`Delete component at ${path}?`)) {
      deleteComponent(path)
    }
  }

  const handleDrop = (e: React.DragEvent, parentPath: string) => {
    e.preventDefault()
    e.stopPropagation()

    const componentType = e.dataTransfer.getData('component-type')
    if (componentType) {
      // Create new component from palette
      const newComponent = {
        type: componentType,
        meta: {
          name: `Component_${Date.now()}`,
        },
        props: {},
      }
      addComponent(parentPath, newComponent)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const renderComponent = (component: any, path: string = 'root') => {
    if (!component || typeof component !== 'object') {
      return null
    }

    const componentType = component.type || 'unknown'
    const componentProps = { ...component }
    delete componentProps.children

    return (
      <div
        key={path}
        className="component-preview"
        onClick={(e) => {
          e.stopPropagation()
          handleComponentClick(path, componentProps)
        }}
        onDrop={(e) => handleDrop(e, path)}
        onDragOver={handleDragOver}
      >
        <div className="component-header">
          <span className="component-type">{componentType}</span>
          {path !== 'root' && (
            <button
              className="delete-btn"
              onClick={(e) => handleDeleteComponent(e, path)}
              title="Delete component"
            >
              ✕
            </button>
          )}
        </div>
        {component.children && Array.isArray(component.children) && (
          <div className="component-children">
            {component.children.map((child: any, index: number) =>
              renderComponent(child, `${path}.children[${index}]`)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="canvas">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <h3>Canvas</h3>
          {selectedView && <span className="view-path">{selectedView}</span>}
        </div>
        <div className="canvas-header-right">
          <button
            className="undo-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            className="redo-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
          {viewModified && <span className="modified-indicator">● Modified</span>}
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!viewModified || savingView}
            title="Save (Ctrl+S)"
          >
            {savingView ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="canvas-content">
        {!selectedView ? (
          <div className="empty-state">
            <div className="empty-icon">🎨</div>
            <h2>No View Selected</h2>
            <p>Select a view from the project tree to start editing</p>
          </div>
        ) : loadingView ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h2>Loading View...</h2>
          </div>
        ) : viewContent ? (
          <div className="view-render">
            {viewContent.content?.root ? (
              renderComponent(viewContent.content.root)
            ) : (
              <div className="view-preview">
                <pre>{JSON.stringify(viewContent, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h2>Failed to Load View</h2>
            <p>Unable to load view content from the server</p>
          </div>
        )}
      </div>
    </div>
  )
}
