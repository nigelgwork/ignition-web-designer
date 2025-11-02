import { useState } from 'react'

interface Component {
  name: string
  type: string
  icon: string
}

interface ComponentCategory {
  name: string
  components: Component[]
}

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: 'Layout',
    components: [
      { name: 'Container', type: 'ia.container.flex', icon: '📦' },
      { name: 'Coordinate Container', type: 'ia.container.coord', icon: '🎯' },
      { name: 'Column Container', type: 'ia.container.column', icon: '📊' },
    ],
  },
  {
    name: 'Input',
    components: [
      { name: 'Text Field', type: 'ia.input.text-field', icon: '📝' },
      { name: 'Text Area', type: 'ia.input.text-area', icon: '📄' },
      { name: 'Button', type: 'ia.input.button', icon: '🔘' },
      { name: 'Checkbox', type: 'ia.input.checkbox', icon: '☑️' },
      { name: 'Radio Group', type: 'ia.input.radio-group', icon: '🔵' },
    ],
  },
  {
    name: 'Display',
    components: [
      { name: 'Label', type: 'ia.display.label', icon: '🏷️' },
      { name: 'Image', type: 'ia.display.image', icon: '🖼️' },
      { name: 'Icon', type: 'ia.display.icon', icon: '⭐' },
      { name: 'Table', type: 'ia.display.table', icon: '📋' },
    ],
  },
]

export default function ComponentPalette() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Layout'])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  return (
    <div className="component-palette">
      <div className="palette-header">
        <h3>Components</h3>
      </div>
      <div className="palette-content">
        {COMPONENT_CATEGORIES.map((category) => (
          <div key={category.name} className="palette-category">
            <div
              className="category-header"
              onClick={() => toggleCategory(category.name)}
            >
              <span className="category-arrow">
                {expandedCategories.includes(category.name) ? '▼' : '▶'}
              </span>
              <span className="category-name">{category.name}</span>
            </div>
            {expandedCategories.includes(category.name) && (
              <div className="category-components">
                {category.components.map((component) => (
                  <div
                    key={component.type}
                    className="component-item"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('component-type', component.type)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                  >
                    <span className="component-icon">{component.icon}</span>
                    <span className="component-name">{component.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
