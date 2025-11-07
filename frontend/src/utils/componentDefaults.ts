/**
 * Component Defaults - Provides sensible default properties for components
 *
 * When a component is dragged from the palette, it gets these defaults.
 * This makes the components immediately useful and visible.
 */

export interface ComponentDefaults {
  type: string
  props?: Record<string, any>
  layout?: {
    x: number
    y: number
    width: number
    height: number
  }
  meta?: {
    name: string
  }
}

/**
 * Get default properties for a component type
 */
export function getComponentDefaults(componentType: string): ComponentDefaults {
  const timestamp = Date.now()
  const baseName = componentType.split('.').pop() || 'Component'
  const name = `${baseName}_${timestamp}`

  // Base defaults - all components get these
  const base: ComponentDefaults = {
    type: componentType,
    meta: { name },
    layout: {
      x: 10,
      y: 10,
      width: 200,
      height: 100,
    },
  }

  // Type-specific defaults
  switch (componentType) {
    // DISPLAYS
    case 'ia.display.label':
      return {
        ...base,
        props: {
          text: 'Label Text',
          fontSize: 14,
          color: '#333333',
        },
        layout: { ...base.layout, width: 150, height: 30 },
      }

    case 'ia.display.image':
      return {
        ...base,
        props: {
          source: '',
          fit: 'contain',
        },
        layout: { ...base.layout, width: 200, height: 200 },
      }

    case 'ia.display.icon':
      return {
        ...base,
        props: {
          path: 'material/star',
          size: 24,
          color: '#ffc107',
        },
        layout: { ...base.layout, width: 50, height: 50 },
      }

    case 'ia.display.markdown':
      return {
        ...base,
        props: {
          source: '# Heading\n\nMarkdown content here...',
        },
        layout: { ...base.layout, width: 300, height: 150 },
      }

    case 'ia.display.gauge':
      return {
        ...base,
        props: {
          value: 75,
          min: 0,
          max: 100,
          unit: '%',
        },
        layout: { ...base.layout, width: 150, height: 150 },
      }

    case 'ia.display.tank':
      return {
        ...base,
        props: {
          value: 65,
          min: 0,
          max: 100,
          unit: '%',
        },
        layout: { ...base.layout, width: 100, height: 200 },
      }

    case 'ia.display.linear-gauge':
      return {
        ...base,
        props: {
          value: 50,
          min: 0,
          max: 100,
        },
        layout: { ...base.layout, width: 200, height: 50 },
      }

    // INPUTS
    case 'ia.input.button':
      return {
        ...base,
        props: {
          text: 'Button',
          backgroundColor: '#007bff',
          textColor: '#ffffff',
        },
        layout: { ...base.layout, width: 120, height: 40 },
      }

    case 'ia.input.textfield':
      return {
        ...base,
        props: {
          placeholder: 'Enter text...',
          value: '',
        },
        layout: { ...base.layout, width: 200, height: 36 },
      }

    case 'ia.input.textarea':
      return {
        ...base,
        props: {
          placeholder: 'Enter text...',
          value: '',
          rows: 4,
        },
        layout: { ...base.layout, width: 300, height: 100 },
      }

    case 'ia.input.toggle':
      return {
        ...base,
        props: {
          selected: false,
        },
        layout: { ...base.layout, width: 60, height: 30 },
      }

    case 'ia.input.checkbox':
      return {
        ...base,
        props: {
          text: 'Checkbox Label',
          selected: false,
        },
        layout: { ...base.layout, width: 150, height: 30 },
      }

    case 'ia.input.dropdown':
      return {
        ...base,
        props: {
          placeholder: 'Select option...',
          options: [],
        },
        layout: { ...base.layout, width: 200, height: 36 },
      }

    case 'ia.input.slider':
      return {
        ...base,
        props: {
          value: 50,
          min: 0,
          max: 100,
        },
        layout: { ...base.layout, width: 200, height: 50 },
      }

    case 'ia.input.numeric':
      return {
        ...base,
        props: {
          value: 0,
          min: 0,
          max: 100,
        },
        layout: { ...base.layout, width: 120, height: 36 },
      }

    // CONTAINERS
    case 'ia.container.flex':
      return {
        ...base,
        props: {
          direction: 'row',
          gap: 8,
        },
        layout: { ...base.layout, width: 400, height: 200 },
      }

    case 'ia.container.coord':
      return {
        ...base,
        props: {},
        layout: { ...base.layout, width: 400, height: 300 },
      }

    case 'ia.container.column':
      return {
        ...base,
        props: {
          columns: 2,
          gap: 8,
        },
        layout: { ...base.layout, width: 400, height: 200 },
      }

    case 'ia.container.tabs':
      return {
        ...base,
        props: {
          tabs: [
            { text: 'Tab 1' },
            { text: 'Tab 2' },
          ],
        },
        layout: { ...base.layout, width: 400, height: 300 },
      }

    // CHARTS
    case 'ia.chart.timeseries':
    case 'ia.chart.pie':
    case 'ia.chart.bar':
    case 'ia.chart.powerChart':
      return {
        ...base,
        props: {
          title: 'Chart Title',
        },
        layout: { ...base.layout, width: 400, height: 300 },
      }

    // TABLES
    case 'ia.display.table':
      return {
        ...base,
        props: {
          data: [],
          columns: [],
        },
        layout: { ...base.layout, width: 400, height: 300 },
      }

    // DEFAULT
    default:
      return base
  }
}
