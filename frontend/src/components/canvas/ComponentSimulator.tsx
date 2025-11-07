/**
 * ComponentSimulator - Renders visual simulations of Perspective components
 *
 * This provides a more realistic preview of components in the designer canvas.
 * Not a full implementation, but gives users a better sense of what they're building.
 */

interface ComponentSimulatorProps {
  component: any
}

export default function ComponentSimulator({ component }: ComponentSimulatorProps) {
  const type = component.type || 'unknown'
  const props = component.props || {}

  // Helper to get prop value with fallback
  const getProp = (key: string, fallback: any = '') => {
    return props[key] !== undefined ? props[key] : fallback
  }

  // Render based on component type
  switch (type) {
    // DISPLAYS
    case 'ia.display.label':
      return (
        <div style={{ padding: '4px', fontSize: getProp('fontSize', 14), color: getProp('color', '#333') }}>
          {getProp('text', 'Label')}
        </div>
      )

    case 'ia.display.image':
      return (
        <div style={{
          background: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '50px',
          color: '#999'
        }}>
          🖼️ Image
        </div>
      )

    case 'ia.display.icon':
      return (
        <div style={{ fontSize: getProp('size', 24), textAlign: 'center', padding: '8px' }}>
          ⭐
        </div>
      )

    case 'ia.display.markdown':
      return (
        <div style={{ padding: '8px', fontSize: '14px', fontFamily: 'monospace', color: '#555' }}>
          {getProp('source', '# Markdown\nContent here...')}
        </div>
      )

    // INPUTS
    case 'ia.input.button':
      return (
        <button style={{
          padding: '8px 16px',
          background: getProp('backgroundColor', '#007bff'),
          color: getProp('textColor', 'white'),
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          {getProp('text', 'Button')}
        </button>
      )

    case 'ia.input.textfield':
      return (
        <input
          type="text"
          placeholder={getProp('placeholder', 'Enter text...')}
          value={getProp('value', '')}
          readOnly
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      )

    case 'ia.input.textarea':
      return (
        <textarea
          placeholder={getProp('placeholder', 'Enter text...')}
          value={getProp('value', '')}
          readOnly
          rows={getProp('rows', 4)}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
      )

    case 'ia.input.toggle':
      const isOn = getProp('selected', false)
      return (
        <div style={{
          width: '50px',
          height: '24px',
          background: isOn ? '#4caf50' : '#ccc',
          borderRadius: '12px',
          position: 'relative',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: isOn ? '28px' : '2px',
            transition: 'left 0.2s'
          }} />
        </div>
      )

    case 'ia.input.checkbox':
      const checked = getProp('selected', false)
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={checked}
            readOnly
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>{getProp('text', 'Checkbox')}</span>
        </label>
      )

    case 'ia.input.dropdown':
      return (
        <select style={{
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          boxSizing: 'border-box',
          background: 'white',
          cursor: 'pointer'
        }}>
          <option>{getProp('placeholder', 'Select option...')}</option>
        </select>
      )

    case 'ia.input.slider':
      const value = getProp('value', 50)
      return (
        <div style={{ padding: '8px' }}>
          <input
            type="range"
            min={getProp('min', 0)}
            max={getProp('max', 100)}
            value={value}
            readOnly
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '4px' }}>{value}</div>
        </div>
      )

    // CONTAINERS
    case 'ia.container.flex':
      return (
        <div style={{
          display: 'flex',
          flexDirection: getProp('direction', 'row') as any,
          gap: '8px',
          padding: '8px',
          border: '1px dashed #ccc',
          minHeight: '50px',
          background: 'rgba(0,123,255,0.05)'
        }}>
          <div style={{ fontSize: '12px', color: '#007bff' }}>Flex Container</div>
        </div>
      )

    case 'ia.container.coord':
      return (
        <div style={{
          position: 'relative',
          border: '1px dashed #28a745',
          minHeight: '100px',
          background: 'rgba(40,167,69,0.05)',
          padding: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#28a745' }}>Coordinate Container</div>
        </div>
      )

    case 'ia.container.column':
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getProp('columns', 2)}, 1fr)`,
          gap: '8px',
          padding: '8px',
          border: '1px dashed #ffc107',
          background: 'rgba(255,193,7,0.05)'
        }}>
          <div style={{ fontSize: '12px', color: '#ffc107' }}>Column Container</div>
        </div>
      )

    // CHARTS
    case 'ia.chart.timeseries':
    case 'ia.chart.pie':
    case 'ia.chart.bar':
    case 'ia.chart.powerChart':
      const chartType = type.split('.').pop()
      return (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '150px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          📊 {chartType?.toUpperCase()} CHART
        </div>
      )

    // TABLES
    case 'ia.display.table':
      return (
        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ background: '#f5f5f5', padding: '8px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>
            Column 1 | Column 2 | Column 3
          </div>
          <div style={{ padding: '8px' }}>
            Row 1 | Data | Data<br />
            Row 2 | Data | Data
          </div>
        </div>
      )

    // GAUGES
    case 'ia.display.gauge':
      return (
        <div style={{
          width: '100px',
          height: '100px',
          border: '8px solid #ddd',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          margin: '8px auto'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{getProp('value', 50)}%</div>
        </div>
      )

    case 'ia.display.tank':
      const level = getProp('value', 75)
      return (
        <div style={{
          width: '80px',
          height: '120px',
          border: '2px solid #666',
          borderRadius: '4px',
          position: 'relative',
          margin: '8px auto',
          background: '#f0f0f0'
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${level}%`,
            background: 'linear-gradient(to top, #2196f3, #64b5f6)',
            transition: 'height 0.3s'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '18px',
            fontWeight: 'bold',
            color: level > 50 ? 'white' : '#333'
          }}>
            {level}%
          </div>
        </div>
      )

    // DEFAULT (Unknown component type)
    default:
      return (
        <div style={{
          padding: '12px',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          color: '#6c757d',
          fontSize: '13px',
          fontFamily: 'monospace'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {type}
          </div>
          {props && Object.keys(props).length > 0 && (
            <div style={{ fontSize: '11px', opacity: 0.7 }}>
              {Object.keys(props).slice(0, 3).join(', ')}
              {Object.keys(props).length > 3 && '...'}
            </div>
          )}
        </div>
      )
  }
}
