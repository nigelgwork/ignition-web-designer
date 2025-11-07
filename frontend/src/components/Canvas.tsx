import { useEffect, useState, useRef } from 'react'
import { useDesignerStore } from '../store/designerStore'
import apiClient from '../api/axios'

interface DragState {
  isDragging: boolean
  isResizing: boolean
  resizeHandle: string | null // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
  componentPath: string | null
  startX: number
  startY: number
  initialX: number
  initialY: number
  initialWidth: number
  initialHeight: number
}

export default function Canvas() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    componentPath: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialWidth: 0,
    initialHeight: 0,
  })
  const canvasRef = useRef<HTMLDivElement>(null)
  const {
    selectedProject,
    selectedView,
    viewContent,
    loadingView,
    viewModified,
    savingView,
    canUndo,
    canRedo,
    canvasZoom,
    selectedComponentPaths,
    setViewContent,
    setLoadingView,
    setSelectedComponent,
    toggleComponentSelection,
    addComponent,
    deleteComponent,
    saveView,
    undo,
    redo,
    zoomIn,
    zoomOut,
    zoomReset,
    toggleLeftSidebar,
    toggleRightSidebar,
    updateComponentLayout,
    copyComponent,
    cutComponent,
    pasteComponent,
    duplicateComponent,
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

      // Ctrl+W / Cmd+W - Close View
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault()
        handleCloseView()
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

      // Delete key - Delete selected component
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedPath = useDesignerStore.getState().selectedComponentPath
        if (selectedPath && selectedPath !== 'root') {
          e.preventDefault()
          if (confirm(`Delete component at ${selectedPath}?`)) {
            deleteComponent(selectedPath)
          }
        }
      }

      // Ctrl+B / Cmd+B - Toggle Left Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !e.shiftKey) {
        e.preventDefault()
        toggleLeftSidebar()
      }

      // Ctrl+Shift+B / Cmd+Shift+B - Toggle Right Sidebar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'b') {
        e.preventDefault()
        toggleRightSidebar()
      }

      // Ctrl++ / Cmd++ (Ctrl+= / Cmd+=) - Zoom In
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        zoomIn()
      }

      // Ctrl+- / Cmd+- - Zoom Out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        zoomOut()
      }

      // Ctrl+0 / Cmd+0 - Zoom Reset
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        zoomReset()
      }

      // Ctrl+C / Cmd+C - Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selectedPath = useDesignerStore.getState().selectedComponentPath
        if (selectedPath && selectedPath !== 'root') {
          e.preventDefault()
          copyComponent()
        }
      }

      // Ctrl+X / Cmd+X - Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        const selectedPath = useDesignerStore.getState().selectedComponentPath
        if (selectedPath && selectedPath !== 'root') {
          e.preventDefault()
          cutComponent()
        }
      }

      // Ctrl+V / Cmd+V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const clipboard = useDesignerStore.getState().clipboard
        if (clipboard) {
          e.preventDefault()
          pasteComponent()
        }
      }

      // Ctrl+D / Cmd+D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        const selectedPath = useDesignerStore.getState().selectedComponentPath
        if (selectedPath && selectedPath !== 'root') {
          e.preventDefault()
          duplicateComponent()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewModified, savingView, canUndo, canRedo, undo, redo, zoomIn, zoomOut, zoomReset, toggleLeftSidebar, toggleRightSidebar, deleteComponent, copyComponent, cutComponent, pasteComponent, duplicateComponent])

  const loadViewContent = async (projectName: string, viewPath: string) => {
    setLoadingView(true)
    try {
      const response = await apiClient.get(
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

  const handleComponentClick = (
    componentPath: string,
    props: Record<string, unknown>,
    e: React.MouseEvent
  ) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Click for multi-select
      toggleComponentSelection(componentPath, props)
    } else {
      // Regular click for single select
      setSelectedComponent(componentPath, props)
    }
  }

  const handleSave = async () => {
    const success = await saveView()
    if (success) {
      alert('View saved successfully!')
    } else {
      alert('Failed to save view. Check console for errors.')
    }
  }

  const handleCloseView = () => {
    if (viewModified) {
      if (confirm('You have unsaved changes. Close anyway?')) {
        useDesignerStore.getState().setSelectedView(null)
      }
    } else {
      useDesignerStore.getState().setSelectedView(null)
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

  // Component repositioning handlers
  const handleMouseDown = (e: React.MouseEvent, path: string, component: any) => {
    // Only start drag if component has layout, not on delete button, and not root
    if (path === 'root' || !component.layout) return
    if ((e.target as HTMLElement).className.includes('delete-btn')) return
    if ((e.target as HTMLElement).className.includes('resize-handle')) return // Let resize handler deal with it

    e.stopPropagation()

    const layout = component.layout
    setDragState({
      isDragging: true,
      isResizing: false,
      resizeHandle: null,
      componentPath: path,
      startX: e.clientX,
      startY: e.clientY,
      initialX: layout.x || 0,
      initialY: layout.y || 0,
      initialWidth: layout.width || 0,
      initialHeight: layout.height || 0,
    })
  }

  const handleResizeMouseDown = (e: React.MouseEvent, path: string, component: any, handle: string) => {
    e.stopPropagation()

    const layout = component.layout
    setDragState({
      isDragging: false,
      isResizing: true,
      resizeHandle: handle,
      componentPath: path,
      startX: e.clientX,
      startY: e.clientY,
      initialX: layout.x || 0,
      initialY: layout.y || 0,
      initialWidth: layout.width || 0,
      initialHeight: layout.height || 0,
    })
  }

  useEffect(() => {
    const GRID_SIZE = 20 // Snap to 20px grid

    const snapToGrid = (value: number) => {
      return Math.round(value / GRID_SIZE) * GRID_SIZE
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.componentPath) return
      if (!dragState.isDragging && !dragState.isResizing) return

      const deltaX = (e.clientX - dragState.startX) / (canvasZoom / 100)
      const deltaY = (e.clientY - dragState.startY) / (canvasZoom / 100)

      if (dragState.isDragging) {
        // Regular dragging
        const newX = dragState.initialX + deltaX
        const newY = dragState.initialY + deltaY

        updateComponentLayout(dragState.componentPath, {
          x: snapToGrid(newX),
          y: snapToGrid(newY),
        })
      } else if (dragState.isResizing && dragState.resizeHandle) {
        // Resizing
        const handle = dragState.resizeHandle
        let newX = dragState.initialX
        let newY = dragState.initialY
        let newWidth = dragState.initialWidth
        let newHeight = dragState.initialHeight

        // Handle different resize directions
        if (handle.includes('e')) {
          newWidth = dragState.initialWidth + deltaX
        }
        if (handle.includes('w')) {
          newX = dragState.initialX + deltaX
          newWidth = dragState.initialWidth - deltaX
        }
        if (handle.includes('s')) {
          newHeight = dragState.initialHeight + deltaY
        }
        if (handle.includes('n')) {
          newY = dragState.initialY + deltaY
          newHeight = dragState.initialHeight - deltaY
        }

        // Enforce minimum size
        newWidth = Math.max(40, newWidth)
        newHeight = Math.max(20, newHeight)

        // Snap to grid
        updateComponentLayout(dragState.componentPath, {
          x: snapToGrid(newX),
          y: snapToGrid(newY),
          width: snapToGrid(newWidth),
          height: snapToGrid(newHeight),
        })
      }
    }

    const handleMouseUp = () => {
      if (dragState.isDragging || dragState.isResizing) {
        setDragState({
          isDragging: false,
          isResizing: false,
          resizeHandle: null,
          componentPath: null,
          startX: 0,
          startY: 0,
          initialX: 0,
          initialY: 0,
          initialWidth: 0,
          initialHeight: 0,
        })
      }
    }

    if (dragState.isDragging || dragState.isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, canvasZoom, updateComponentLayout])

  const renderComponent = (component: any, path: string = 'root') => {
    if (!component || typeof component !== 'object') {
      return null
    }

    const componentType = component.type || 'unknown'
    const componentProps = { ...component }
    delete componentProps.children

    const isSelected = selectedComponentPaths.includes(path)
    const className = `component-preview ${isSelected ? 'selected' : ''}`

    // Check if component has layout information
    const layout = component.layout || component.position
    const hasLayout = layout && typeof layout === 'object'

    // Build style for absolute positioning if layout exists
    const style: React.CSSProperties = hasLayout
      ? {
          position: 'absolute',
          left: layout.x !== undefined ? `${layout.x}px` : 0,
          top: layout.y !== undefined ? `${layout.y}px` : 0,
          width: layout.width !== undefined ? `${layout.width}px` : 'auto',
          height: layout.height !== undefined ? `${layout.height}px` : 'auto',
        }
      : {}

    return (
      <div
        key={path}
        className={className}
        style={{
          ...style,
          cursor: hasLayout && path !== 'root' ? (dragState.isDragging ? 'grabbing' : 'grab') : 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleComponentClick(path, componentProps, e)
        }}
        onMouseDown={(e) => handleMouseDown(e, path, component)}
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
          <div className="component-children" style={{ position: hasLayout ? 'relative' : 'static' }}>
            {component.children.map((child: any, index: number) =>
              renderComponent(child, `${path}.children[${index}]`)
            )}
          </div>
        )}
        {/* Resize handles for selected components with layout */}
        {isSelected && hasLayout && path !== 'root' && (
          <>
            <div className="resize-handle resize-n" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 'n')} />
            <div className="resize-handle resize-s" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 's')} />
            <div className="resize-handle resize-e" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 'e')} />
            <div className="resize-handle resize-w" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 'w')} />
            <div className="resize-handle resize-ne" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 'ne')} />
            <div className="resize-handle resize-nw" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 'nw')} />
            <div className="resize-handle resize-se" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 'se')} />
            <div className="resize-handle resize-sw" onMouseDown={(e) => handleResizeMouseDown(e, path, component, 'sw')} />
          </>
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
          {selectedView && <span className="zoom-indicator">{canvasZoom}%</span>}
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
          <div
            className="view-render"
            style={{
              transform: `scale(${canvasZoom / 100})`,
              transformOrigin: 'top left'
            }}
          >
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
