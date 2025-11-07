import SelectionHandles from './SelectionHandles'
import ComponentSimulator from './ComponentSimulator'

interface DragState {
  isDragging: boolean
  isResizing: boolean
}

interface CanvasComponentProps {
  component: any
  path: string
  isSelected: boolean
  selectedComponentPaths: string[]
  dragState: DragState
  onComponentClick: (path: string, props: Record<string, unknown>, e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent, path: string, component: any) => void
  onResizeMouseDown: (e: React.MouseEvent, path: string, component: any, handle: string) => void
  onDeleteComponent: (e: React.MouseEvent, path: string) => void
  onDrop: (e: React.DragEvent, parentPath: string) => void
  onDragOver: (e: React.DragEvent) => void
}

export default function CanvasComponent({
  component,
  path,
  isSelected,
  selectedComponentPaths,
  dragState,
  onComponentClick,
  onMouseDown,
  onResizeMouseDown,
  onDeleteComponent,
  onDrop,
  onDragOver,
}: CanvasComponentProps) {
  if (!component || typeof component !== 'object') {
    return null
  }

  const componentType = component.type || 'unknown'
  const componentProps = { ...component }
  delete componentProps.children

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
        onComponentClick(path, componentProps, e)
      }}
      onMouseDown={(e) => onMouseDown(e, path, component)}
      onDrop={(e) => onDrop(e, path)}
      onDragOver={onDragOver}
    >
      <div className="component-header">
        <span className="component-type">{componentType}</span>
        {path !== 'root' && (
          <button
            className="delete-btn"
            onClick={(e) => onDeleteComponent(e, path)}
            title="Delete component"
          >
            ✕
          </button>
        )}
      </div>

      {/* Render component simulation */}
      {path !== 'root' && !component.children && (
        <div className="component-simulation">
          <ComponentSimulator component={component} />
        </div>
      )}

      {component.children && Array.isArray(component.children) && (
        <div className="component-children" style={{ position: hasLayout ? 'relative' : 'static' }}>
          {component.children.map((child: any, index: number) => {
            const childPath = `${path}.children[${index}]`
            return (
              <CanvasComponent
                key={childPath}
                component={child}
                path={childPath}
                isSelected={selectedComponentPaths.includes(childPath)}
                selectedComponentPaths={selectedComponentPaths}
                dragState={dragState}
                onComponentClick={onComponentClick}
                onMouseDown={onMouseDown}
                onResizeMouseDown={onResizeMouseDown}
                onDeleteComponent={onDeleteComponent}
                onDrop={onDrop}
                onDragOver={onDragOver}
              />
            )
          })}
        </div>
      )}
      {/* Resize handles for selected components with layout */}
      {isSelected && hasLayout && path !== 'root' && (
        <SelectionHandles
          onResizeMouseDown={(e, handle) => onResizeMouseDown(e, path, component, handle)}
        />
      )}
    </div>
  )
}
