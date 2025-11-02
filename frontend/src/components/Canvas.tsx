import { useDesignerStore } from '../store/designerStore'

export default function Canvas() {
  const { selectedView, viewContent } = useDesignerStore()

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
        ) : viewContent ? (
          <div className="view-preview">
            <pre>{JSON.stringify(viewContent, null, 2)}</pre>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h2>View: {selectedView}</h2>
            <p>Content loading will be implemented in Phase 3+</p>
          </div>
        )}
      </div>
    </div>
  )
}
