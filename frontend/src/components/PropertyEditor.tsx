import { useState } from 'react'
import { useDesignerStore } from '../store/designerStore'

export default function PropertyEditor() {
  const { selectedComponentPath, selectedComponentProps, updateComponentProperty } =
    useDesignerStore()
  const [editingProperty, setEditingProperty] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

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
                {Object.entries(selectedComponentProps).map(([key, value]) => (
                  <div key={key} className="property-item">
                    <div className="property-label">{key}</div>
                    {renderPropertyValue(key, value)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No properties to display</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
