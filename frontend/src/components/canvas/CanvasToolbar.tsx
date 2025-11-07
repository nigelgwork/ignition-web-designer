interface CanvasToolbarProps {
  selectedView: string | null
  canvasZoom: number
  viewModified: boolean
  savingView: boolean
  canUndo: boolean
  canRedo: boolean
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
}

export default function CanvasToolbar({
  selectedView,
  canvasZoom,
  viewModified,
  savingView,
  canUndo,
  canRedo,
  onSave,
  onUndo,
  onRedo,
}: CanvasToolbarProps) {
  return (
    <div className="canvas-header">
      <div className="canvas-header-left">
        <h3>Canvas</h3>
        {selectedView && <span className="view-path">{selectedView}</span>}
        {selectedView && <span className="zoom-indicator">{canvasZoom}%</span>}
      </div>
      <div className="canvas-header-right">
        <button
          className="undo-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          className="redo-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
        {viewModified && <span className="modified-indicator">● Modified</span>}
        <button
          className="save-btn"
          onClick={onSave}
          disabled={!viewModified || savingView}
          title="Save (Ctrl+S)"
        >
          {savingView ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
