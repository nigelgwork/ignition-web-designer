import { useState } from 'react'
import { useDesignerStore } from '../store/designerStore'
import BindingEditor, { type Binding } from './BindingEditor'
import ScriptEditor from './ScriptEditor'

export default function PropertyEditor() {
  const {
    selectedComponentPath,
    selectedComponentProps,
    updateComponentProperty,
    setBinding,
    getBinding,
    removeBinding,
  } = useDesignerStore()
  const [editingProperty, setEditingProperty] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [bindingEditorOpen, setBindingEditorOpen] = useState(false)
  const [editingBindingProperty, setEditingBindingProperty] = useState<string | null>(null)
  const [dragOverProperty, setDragOverProperty] = useState<string | null>(null)
  const [scriptEditorOpen, setScriptEditorOpen] = useState(false)
  const [editingScriptEvent, setEditingScriptEvent] = useState<string | null>(null)

  const handleEdit = (propertyName: string, currentValue: unknown) => {
    setEditingProperty(propertyName)
    setEditValue(
      typeof currentValue === 'object'
        ? JSON.stringify(currentValue, null, 2)
        : String(currentValue)
    )
  }

  const handleSave = (propertyName: string) => {
    if (!selectedComponentPath) return

    let parsedValue: unknown = editValue
    // Try to parse as JSON for objects/arrays
    if (editValue.trim().startsWith('{') || editValue.trim().startsWith('[')) {
      try {
        parsedValue = JSON.parse(editValue)
      } catch {
        // Keep as string if parsing fails
      }
    } else if (editValue === 'true' || editValue === 'false') {
      parsedValue = editValue === 'true'
    } else if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
      parsedValue = Number(editValue)
    }

    updateComponentProperty(selectedComponentPath, propertyName, parsedValue)
    setEditingProperty(null)
    setEditValue('')
  }

  const handleCancel = () => {
    setEditingProperty(null)
    setEditValue('')
  }

  const handleOpenBindingEditor = (propertyName: string) => {
    setEditingBindingProperty(propertyName)
    setBindingEditorOpen(true)
  }

  const handleSaveBinding = (binding: Binding | null) => {
    if (!selectedComponentPath || !editingBindingProperty) return

    if (binding) {
      setBinding(selectedComponentPath, editingBindingProperty, binding)
    } else {
      removeBinding(selectedComponentPath, editingBindingProperty)
    }

    setBindingEditorOpen(false)
    setEditingBindingProperty(null)
  }

  // Drag-and-drop handlers for tag binding
  const handleDragOver = (e: React.DragEvent, propertyName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverProperty(propertyName)
  }

  const handleDragEnter = (e: React.DragEvent, propertyName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverProperty(propertyName)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only clear if leaving the property item entirely
    if (e.currentTarget === e.target) {
      setDragOverProperty(null)
    }
  }

  const handleDrop = (e: React.DragEvent, propertyName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverProperty(null)

    if (!selectedComponentPath) return

    try {
      const data = e.dataTransfer.getData('application/json')
      if (!data) return

      const dragData = JSON.parse(data)

      // Check if it's a tag being dropped
      if (dragData.type === 'tag' && dragData.tagPath) {
        // Auto-create a tag binding
        const tagBinding: Binding = {
          type: 'tag',
          config: {
            tagPath: dragData.tagPath,
            tagType: dragData.tagType || 'direct'
          },
          bidirectional: false
        }

        setBinding(selectedComponentPath, propertyName, tagBinding)

        console.log(`Created tag binding for ${propertyName}: ${dragData.tagPath}`)
      }
      // Check if it's a query being dropped
      else if (dragData.type === 'query' && dragData.queryPath) {
        // Auto-create a query binding
        const params: Record<string, any> = {}
        // Initialize parameters with empty values by default
        if (dragData.parameters && Array.isArray(dragData.parameters)) {
          dragData.parameters.forEach((param: any) => {
            params[param.name] = param.default || ''
          })
        }

        const queryBinding: Binding = {
          type: 'query',
          config: {
            queryName: dragData.queryName,
            queryPath: dragData.queryPath,
            params
          },
          bidirectional: false
        }

        setBinding(selectedComponentPath, propertyName, queryBinding)

        console.log(`Created query binding for ${propertyName}: ${dragData.queryPath}`)
      }
    } catch (error) {
      console.error('Failed to handle drop:', error)
    }
  }

  // Script editing handlers
  const handleOpenScriptEditor = (eventName: string) => {
    setEditingScriptEvent(eventName)
    setScriptEditorOpen(true)
  }

  const handleSaveScript = (script: string) => {
    if (!selectedComponentPath || !editingScriptEvent) return

    // Store script in component.events object
    updateComponentProperty(selectedComponentPath, `events.${editingScriptEvent}`, script)

    setScriptEditorOpen(false)
    setEditingScriptEvent(null)
  }

  const getScript = (eventName: string): string => {
    if (!selectedComponentProps) return ''
    const events = (selectedComponentProps as any).events || {}
    return events[eventName] || ''
  }

  const hasScript = (eventName: string): boolean => {
    return getScript(eventName).trim().length > 0
  }

  // Common Perspective component event handlers
  const getAvailableEvents = (): string[] => {
    if (!selectedComponentProps) return []

    const componentType = (selectedComponentProps as any).type || ''

    // Base events available for all components
    const baseEvents = ['onClick', 'onMouseEnter', 'onMouseLeave']

    // Component-specific events
    if (componentType.includes('button') || componentType.includes('Button')) {
      return [...baseEvents, 'onActionPerformed']
    } else if (componentType.includes('input') || componentType.includes('Input') || componentType.includes('textfield')) {
      return [...baseEvents, 'onChange', 'onFocus', 'onBlur']
    } else if (componentType.includes('view') || componentType.includes('container')) {
      return [...baseEvents, 'onStartup', 'onShutdown']
    }

    return baseEvents
  }

  const renderPropertyValue = (key: string, value: unknown) => {
    if (editingProperty === key) {
      return (
        <div className="property-edit">
          <textarea
            className="property-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSave(key)
              } else if (e.key === 'Escape') {
                handleCancel()
              }
            }}
            autoFocus
            rows={typeof value === 'object' ? 5 : 1}
          />
          <div className="property-edit-actions">
            <button className="save-property-btn" onClick={() => handleSave(key)}>
              Save
            </button>
            <button className="cancel-property-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="property-value" onClick={() => handleEdit(key, value)}>
        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
      </div>
    )
  }

  return (
    <div className="property-editor">
      <div className="property-editor-header">
        <h3>Properties</h3>
      </div>
      <div className="property-editor-content">
        {!selectedComponentPath ? (
          <div className="empty-state">
            <div className="empty-icon">⚙️</div>
            <h2>No Component Selected</h2>
            <p>Select a component in the canvas to edit its properties</p>
          </div>
        ) : (
          <div className="properties-list">
            <div className="property-section">
              <div className="section-header">Component</div>
              <div className="component-path">{selectedComponentPath}</div>
            </div>

            {selectedComponentProps && Object.keys(selectedComponentProps).length > 0 ? (
              <div className="property-section">
                <div className="section-header">Properties (Click to Edit)</div>
                {Object.entries(selectedComponentProps)
                  .filter(([key]) => key !== 'bindings') // Don't show bindings as a property
                  .map(([key, value]) => {
                    const hasBinding = selectedComponentPath && getBinding(selectedComponentPath, key)
                    const isDragOver = dragOverProperty === key
                    return (
                      <div
                        key={key}
                        className={`property-item ${isDragOver ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, key)}
                        onDragEnter={(e) => handleDragEnter(e, key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, key)}
                      >
                        <div className="property-label-row">
                          <div className="property-label">
                            {key}
                            {hasBinding && <span className="binding-indicator" title="Has binding">🔗</span>}
                          </div>
                          <button
                            className="binding-btn"
                            onClick={() => handleOpenBindingEditor(key)}
                            title="Add/Edit Binding"
                          >
                            ⚙️
                          </button>
                        </div>
                        {renderPropertyValue(key, value)}
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No properties to display</p>
              </div>
            )}

            {/* Scripts Section */}
            {selectedComponentProps && getAvailableEvents().length > 0 && (
              <div className="property-section">
                <div className="section-header">Event Scripts</div>
                {getAvailableEvents().map((eventName) => (
                  <div key={eventName} className="script-event-item">
                    <div className="script-event-label">
                      {eventName}
                      {hasScript(eventName) && (
                        <span className="script-indicator" title="Has script">📜</span>
                      )}
                    </div>
                    <button
                      className="edit-script-btn"
                      onClick={() => handleOpenScriptEditor(eventName)}
                      title="Edit script"
                    >
                      {hasScript(eventName) ? '✏️ Edit' : '+ Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BindingEditor
        isOpen={bindingEditorOpen}
        onClose={() => {
          setBindingEditorOpen(false)
          setEditingBindingProperty(null)
        }}
        onSave={handleSaveBinding}
        currentBinding={
          editingBindingProperty && selectedComponentPath
            ? getBinding(selectedComponentPath, editingBindingProperty)
            : null
        }
        propertyName={editingBindingProperty || ''}
      />

      <ScriptEditor
        isOpen={scriptEditorOpen}
        onClose={() => {
          setScriptEditorOpen(false)
          setEditingScriptEvent(null)
        }}
        onSave={handleSaveScript}
        initialScript={editingScriptEvent ? getScript(editingScriptEvent) : ''}
        scriptType="component"
        language="python"
        title={`Script: ${editingScriptEvent || ''}`}
      />
    </div>
  )
}
