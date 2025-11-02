import { useEffect } from 'react'
import { useDesignerStore } from '../store/designerStore'
import axios from 'axios'

export default function Canvas() {
  const {
    selectedProject,
    selectedView,
    viewContent,
    loadingView,
    setViewContent,
    setLoadingView,
    setSelectedComponent,
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
      >
        <div className="component-header">
          <span className="component-type">{componentType}</span>
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
        <h3>Canvas</h3>
        {selectedView && <span className="view-path">{selectedView}</span>}
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
