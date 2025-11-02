import { useDesignerStore } from '../store/designerStore'

export default function PropertyEditor() {
  const { selectedComponentPath, selectedComponentProps } = useDesignerStore()

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
                <div className="section-header">Properties</div>
                {Object.entries(selectedComponentProps).map(([key, value]) => (
                  <div key={key} className="property-item">
                    <div className="property-label">{key}</div>
                    <div className="property-value">
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </div>
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
