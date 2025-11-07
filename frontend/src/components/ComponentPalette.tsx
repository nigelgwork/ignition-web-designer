import { useState, useEffect } from 'react'
import apiClient from '../api/axios'

interface Component {
  name: string
  type: string
  category: string
  description: string
}

interface ComponentCategory {
  name: string
  icon: string
  components: Component[]
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, string> = {
  container: '📦',
  display: '🖼️',
  input: '⌨️',
  chart: '📊',
  table: '📋',
  navigation: '🧭',
  scheduling: '📅',
  alarm: '🔔',
  misc: '⚙️',
}

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
  container: 'Containers',
  display: 'Displays',
  input: 'Inputs',
  chart: 'Charts',
  table: 'Tables',
  navigation: 'Navigation',
  scheduling: 'Scheduling',
  alarm: 'Alarms',
  misc: 'Miscellaneous',
}

export default function ComponentPalette() {
  const [componentCategories, setComponentCategories] = useState<ComponentCategory[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['container', 'display', 'input'])
  const [loading, setLoading] = useState(true)

  // Load components from API
  useEffect(() => {
    loadComponents()
  }, [])

  const loadComponents = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<{ components: Component[] }>(
        '/data/webdesigner/api/v1/perspective/components'
      )

      // Group components by category
      const categoriesMap = new Map<string, Component[]>()
      response.data.components.forEach((component) => {
        const category = component.category || 'misc'
        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, [])
        }
        categoriesMap.get(category)!.push(component)
      })

      // Convert to array format
      const categories: ComponentCategory[] = Array.from(categoriesMap.entries()).map(
        ([categoryKey, components]) => ({
          name: CATEGORY_NAMES[categoryKey] || categoryKey,
          icon: CATEGORY_ICONS[categoryKey] || '⚙️',
          components: components.sort((a, b) => a.name.localeCompare(b.name)),
        })
      )

      // Sort categories by name
      categories.sort((a, b) => a.name.localeCompare(b.name))

      setComponentCategories(categories)
    } catch (error) {
      console.error('Error loading components:', error)
      setComponentCategories([])
    } finally {
      setLoading(false)
    }
  }

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
        <button onClick={loadComponents} className="refresh-btn" title="Refresh components">
          ↻
        </button>
      </div>
      <div className="palette-content">
        {loading ? (
          <div className="loading-state">Loading components...</div>
        ) : componentCategories.length === 0 ? (
          <div className="empty-state">No components available</div>
        ) : (
          componentCategories.map((category) => (
            <div key={category.name} className="palette-category">
              <div
                className="category-header"
                onClick={() => toggleCategory(category.name)}
              >
                <span className="category-arrow">
                  {expandedCategories.includes(category.name) ? '▼' : '▶'}
                </span>
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.components.length})</span>
              </div>
              {expandedCategories.includes(category.name) && (
                <div className="category-components">
                  {category.components.map((component) => (
                    <div
                      key={component.type}
                      className="component-item"
                      draggable
                      title={component.description}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('component-type', component.type)
                        e.dataTransfer.effectAllowed = 'copy'
                      }}
                    >
                      <span className="component-name">{component.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
