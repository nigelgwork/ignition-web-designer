import { useState, useEffect } from 'react'
import '../styles/BindingEditor.css'

export type BindingType =  | 'tag' | 'property' | 'expression' | 'expressionStructure' | 'query' | null

export type TransformType = 'map' | 'format' | 'script'

export interface Binding {
  type: BindingType
  config: any
  transforms?: Transform[]
  bidirectional?: boolean
}

export interface Transform {
  type: TransformType
  config: any
}

interface BindingEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (binding: Binding | null) => void
  currentBinding?: Binding | null
  propertyName?: string
  propertyType?: string
}

const BindingEditor = ({
  isOpen,
  onClose,
  onSave,
  currentBinding,
  propertyName,
  propertyType
}: BindingEditorProps) => {
  const [bindingType, setBindingType] = useState<BindingType>(currentBinding?.type || null)
  const [tagPath, setTagPath] = useState('')
  const [tagType, setTagType] = useState<'direct' | 'indirect' | 'expression'>('direct')
  const [propertyPath, setPropertyPath] = useState('')
  const [expression, setExpression] = useState('')
  const [expressionStructure, setExpressionStructure] = useState('')
  const [queryName, setQueryName] = useState('')
  const [queryPath, setQueryPath] = useState('')
  const [queryParams, setQueryParams] = useState<Record<string, any>>({})
  const [pollingEnabled, setPollingEnabled] = useState(false)
  const [pollingInterval, setPollingInterval] = useState(1000)
  const [bidirectional, setBidirectional] = useState(false)
  const [transforms, setTransforms] = useState<Transform[]>([])

  useEffect(() => {
    if (currentBinding) {
      setBindingType(currentBinding.type)
      setBidirectional(currentBinding.bidirectional || false)
      setTransforms(currentBinding.transforms || [])

      // Load config based on type
      if (currentBinding.type === 'tag') {
        setTagPath(currentBinding.config?.tagPath || '')
        setTagType(currentBinding.config?.tagType || 'direct')
      } else if (currentBinding.type === 'property') {
        setPropertyPath(currentBinding.config?.path || '')
      } else if (currentBinding.type === 'expression') {
        setExpression(currentBinding.config?.expression || '')
      } else if (currentBinding.type === 'expressionStructure') {
        setExpressionStructure(JSON.stringify(currentBinding.config?.structure || {}, null, 2))
      } else if (currentBinding.type === 'query') {
        setQueryName(currentBinding.config?.queryName || '')
        setQueryPath(currentBinding.config?.queryPath || '')
        setQueryParams(currentBinding.config?.params || {})
        setPollingEnabled(currentBinding.config?.polling?.enabled || false)
        setPollingInterval(currentBinding.config?.polling?.interval || 1000)
      }
    } else {
      // Reset form
      setBindingType(null)
      setTagPath('')
      setTagType('direct')
      setPropertyPath('')
      setExpression('')
      setExpressionStructure('')
      setQueryName('')
      setQueryPath('')
      setQueryParams({})
      setPollingEnabled(false)
      setPollingInterval(1000)
      setBidirectional(false)
      setTransforms([])
    }
  }, [currentBinding, isOpen])

  const handleSave = () => {
    if (!bindingType) {
      // No binding type selected - remove binding
      onSave(null)
      return
    }

    const binding: Binding = {
      type: bindingType,
      config: {},
      bidirectional,
      transforms: transforms.length > 0 ? transforms : undefined
    }

    // Set config based on type
    if (bindingType === 'tag') {
      binding.config = {
        tagPath,
        tagType
      }
    } else if (bindingType === 'property') {
      binding.config = {
        path: propertyPath
      }
    } else if (bindingType === 'expression') {
      binding.config = {
        expression
      }
    } else if (bindingType === 'expressionStructure') {
      try {
        binding.config = {
          structure: JSON.parse(expressionStructure)
        }
      } catch (e) {
        alert('Invalid JSON in expression structure')
        return
      }
    } else if (bindingType === 'query') {
      binding.config = {
        queryName,
        queryPath,
        params: queryParams,
        polling: pollingEnabled ? {
          enabled: true,
          interval: pollingInterval
        } : undefined
      }
    }

    onSave(binding)
  }

  const handleRemoveBinding = () => {
    onSave(null)
  }

  const addTransform = (type: TransformType) => {
    setTransforms([...transforms, { type, config: {} }])
  }

  const removeTransform = (index: number) => {
    setTransforms(transforms.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div className="binding-editor-overlay" onClick={onClose}>
      <div className="binding-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="binding-editor-header">
          <h2>Property Binding</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="binding-editor-body">
          {propertyName && (
            <div className="binding-property-info">
              <strong>Property:</strong> {propertyName}
              {propertyType && <span className="property-type">({propertyType})</span>}
            </div>
          )}

          {/* Binding Type Selector */}
          <div className="binding-type-selector">
            <label>Binding Type:</label>
            <div className="binding-types">
              <button
                className={bindingType === null ? 'active' : ''}
                onClick={() => setBindingType(null)}
              >
                None
              </button>
              <button
                className={bindingType === 'tag' ? 'active' : ''}
                onClick={() => setBindingType('tag')}
              >
                🏷️ Tag
              </button>
              <button
                className={bindingType === 'property' ? 'active' : ''}
                onClick={() => setBindingType('property')}
              >
                🔗 Property
              </button>
              <button
                className={bindingType === 'expression' ? 'active' : ''}
                onClick={() => setBindingType('expression')}
              >
                ƒ Expression
              </button>
              <button
                className={bindingType === 'expressionStructure' ? 'active' : ''}
                onClick={() => setBindingType('expressionStructure')}
              >
                📊 Structure
              </button>
              <button
                className={bindingType === 'query' ? 'active' : ''}
                onClick={() => setBindingType('query')}
              >
                🗃️ Query
              </button>
            </div>
          </div>

          {/* Binding Configuration */}
          {bindingType === 'tag' && (
            <div className="binding-config">
              <h3>Tag Binding</h3>
              <div className="form-group">
                <label>Tag Type:</label>
                <select value={tagType} onChange={(e) => setTagType(e.target.value as any)}>
                  <option value="direct">Direct Tag Reference</option>
                  <option value="indirect">Indirect Tag Reference</option>
                  <option value="expression">Tag Expression</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tag Path:</label>
                <input
                  type="text"
                  value={tagPath}
                  onChange={(e) => setTagPath(e.target.value)}
                  placeholder="[default]PLC1/Temperature"
                />
                <span className="hint">
                  {tagType === 'direct' && 'e.g., [default]PLC1/Temperature'}
                  {tagType === 'indirect' && 'e.g., {path/to/tag/path/property}'}
                  {tagType === 'expression' && 'e.g., {[default]PLC1/Temp} * 1.8 + 32'}
                </span>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={bidirectional}
                    onChange={(e) => setBidirectional(e.target.checked)}
                  />
                  Bidirectional (read & write)
                </label>
              </div>
            </div>
          )}

          {bindingType === 'property' && (
            <div className="binding-config">
              <h3>Property Binding</h3>
              <div className="form-group">
                <label>Component Property Path:</label>
                <input
                  type="text"
                  value={propertyPath}
                  onChange={(e) => setPropertyPath(e.target.value)}
                  placeholder="view.root.children[0].props.value"
                />
                <span className="hint">
                  Reference another component's property using dot notation
                </span>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={bidirectional}
                    onChange={(e) => setBidirectional(e.target.checked)}
                  />
                  Bidirectional (read & write)
                </label>
              </div>
            </div>
          )}

          {bindingType === 'expression' && (
            <div className="binding-config">
              <h3>Expression Binding</h3>
              <div className="form-group">
                <label>JavaScript Expression:</label>
                <textarea
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="return value * 1.8 + 32"
                  rows={5}
                />
                <span className="hint">
                  JavaScript expression with access to 'value' and other properties
                </span>
              </div>
            </div>
          )}

          {bindingType === 'expressionStructure' && (
            <div className="binding-config">
              <h3>Expression Structure Binding</h3>
              <div className="form-group">
                <label>JSON Structure with Expressions:</label>
                <textarea
                  value={expressionStructure}
                  onChange={(e) => setExpressionStructure(e.target.value)}
                  placeholder={'{\n  "key": "expression here"\n}'}
                  rows={8}
                />
                <span className="hint">
                  JSON object where values can be expressions or bindings
                </span>
              </div>
            </div>
          )}

          {bindingType === 'query' && (
            <div className="binding-config">
              <h3>Query Binding</h3>

              <div className="form-group">
                <label>Query Name:</label>
                <input
                  type="text"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="GetUsers"
                />
                <span className="hint">
                  Display name for this query
                </span>
              </div>

              <div className="form-group">
                <label>Query Path:</label>
                <input
                  type="text"
                  value={queryPath}
                  onChange={(e) => setQueryPath(e.target.value)}
                  placeholder="users/GetUserList"
                />
                <span className="hint">
                  Path to named query in project (e.g., folder/QueryName)
                </span>
              </div>

              <div className="form-group">
                <label>Parameters:</label>
                <div className="query-parameters">
                  {Object.keys(queryParams).length === 0 ? (
                    <div className="no-parameters">
                      <p>No parameters configured</p>
                      <button
                        className="add-param-btn"
                        onClick={() => setQueryParams({ 'param1': '' })}
                      >
                        + Add Parameter
                      </button>
                    </div>
                  ) : (
                    <>
                      {Object.entries(queryParams).map(([key, value]) => (
                        <div key={key} className="parameter-row">
                          <input
                            type="text"
                            className="param-name"
                            value={key}
                            onChange={(e) => {
                              const newParams = { ...queryParams }
                              delete newParams[key]
                              newParams[e.target.value] = value
                              setQueryParams(newParams)
                            }}
                            placeholder="paramName"
                          />
                          <input
                            type="text"
                            className="param-value"
                            value={value}
                            onChange={(e) => {
                              setQueryParams({ ...queryParams, [key]: e.target.value })
                            }}
                            placeholder="value or {expression}"
                          />
                          <button
                            className="remove-param-btn"
                            onClick={() => {
                              const newParams = { ...queryParams }
                              delete newParams[key]
                              setQueryParams(newParams)
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        className="add-param-btn"
                        onClick={() => {
                          const newParamKey = `param${Object.keys(queryParams).length + 1}`
                          setQueryParams({ ...queryParams, [newParamKey]: '' })
                        }}
                      >
                        + Add Parameter
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={pollingEnabled}
                    onChange={(e) => setPollingEnabled(e.target.checked)}
                  />
                  Enable Polling
                </label>
              </div>

              {pollingEnabled && (
                <div className="form-group">
                  <label>Polling Interval (ms):</label>
                  <input
                    type="number"
                    value={pollingInterval}
                    onChange={(e) => setPollingInterval(parseInt(e.target.value) || 1000)}
                    min="100"
                    step="100"
                  />
                  <span className="hint">
                    How often to re-execute the query (in milliseconds)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Transforms Section */}
          {bindingType && bindingType !== null && (
            <div className="binding-transforms">
              <h3>Transforms</h3>
              <div className="transform-actions">
                <button onClick={() => addTransform('map')}>+ Map</button>
                <button onClick={() => addTransform('format')}>+ Format</button>
                <button onClick={() => addTransform('script')}>+ Script</button>
              </div>
              {transforms.map((transform, index) => (
                <div key={index} className="transform-item">
                  <span className="transform-type">{transform.type.toUpperCase()}</span>
                  <button onClick={() => removeTransform(index)} className="remove-btn">
                    ×
                  </button>
                </div>
              ))}
              {transforms.length === 0 && (
                <p className="hint">No transforms applied</p>
              )}
            </div>
          )}
        </div>

        <div className="binding-editor-footer">
          <button onClick={handleRemoveBinding} className="btn-remove">
            Remove Binding
          </button>
          <div className="btn-group">
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-save">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BindingEditor
