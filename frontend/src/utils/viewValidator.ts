/**
 * View and Component Validation Utility (Frontend)
 *
 * Validates view structures and component hierarchy on the client side
 * before sending to the backend.
 *
 * Features:
 * - View structure validation
 * - Component validation
 * - Type checking
 * - Required field validation
 * - Size limits
 * - Circular reference detection
 * - Duplicate name detection
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface Component {
  type: string
  meta?: {
    name?: string
  }
  props?: Record<string, any>
  layout?: {
    x?: number
    y?: number
    width?: number
    height?: number
  }
  children?: Component[]
  [key: string]: any
}

export interface View {
  root: Component
  params?: Record<string, any>
  custom?: Record<string, any>
}

// Configuration
const MAX_NESTING_DEPTH = 20
const MAX_COMPONENT_COUNT = 500
const MAX_NAME_LENGTH = 100
const MIN_SIZE = 1
const MAX_SIZE = 10000

/**
 * Validate a complete view structure
 */
export function validateView(view: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check null/undefined
  if (!view) {
    errors.push('View cannot be null or undefined')
    return { valid: false, errors, warnings }
  }

  // Check required fields
  if (!view.root) {
    errors.push('View must have a root component')
    return { valid: false, errors, warnings }
  }

  // Validate root component
  const componentNames = new Set<string>()
  let componentCount = 0

  validateComponent(view.root, 0, componentNames, componentCount, errors, warnings, (count) => {
    componentCount = count
  })

  // Check component count limit
  if (componentCount > MAX_COMPONENT_COUNT) {
    errors.push(`Too many components (${componentCount}). Maximum allowed: ${MAX_COMPONENT_COUNT}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate a single component and its children
 */
function validateComponent(
  component: any,
  depth: number,
  componentNames: Set<string>,
  componentCount: number,
  errors: string[],
  warnings: string[],
  updateCount: (count: number) => void
): void {
  // Increment counter
  componentCount++
  updateCount(componentCount)

  // Check nesting depth
  if (depth > MAX_NESTING_DEPTH) {
    errors.push(`Component nesting too deep (depth: ${depth}). Maximum allowed: ${MAX_NESTING_DEPTH}`)
    return
  }

  // Check if component is an object
  if (!component || typeof component !== 'object') {
    errors.push(`Component at depth ${depth} is not an object`)
    return
  }

  // Validate required fields
  if (!component.type) {
    errors.push(`Component at depth ${depth} missing required field: type`)
    return
  }

  // Validate type field
  if (typeof component.type !== 'string' || component.type.trim() === '') {
    errors.push(`Component at depth ${depth} has invalid type`)
    return
  }

  const type = component.type

  // Validate type format (should be namespace.category.name)
  if (!isValidComponentType(type)) {
    warnings.push(`Component type '${type}' does not follow standard format (namespace.category.name)`)
  }

  // Validate meta.name if present
  if (component.meta && component.meta.name) {
    const name = component.meta.name

    if (typeof name !== 'string') {
      warnings.push(`Component name must be a string, got ${typeof name}`)
    } else {
      // Check name length
      if (name.length > MAX_NAME_LENGTH) {
        errors.push(`Component name '${name}' exceeds maximum length (${MAX_NAME_LENGTH})`)
      }

      // Check for duplicate names
      if (componentNames.has(name)) {
        warnings.push(`Duplicate component name: ${name}`)
      } else {
        componentNames.add(name)
      }

      // Check name format
      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        warnings.push(`Component name '${name}' contains invalid characters. Use only letters, numbers, underscores, and hyphens.`)
      }
    }
  }

  // Validate children if present
  if (component.children !== undefined) {
    if (!Array.isArray(component.children)) {
      errors.push(`Component '${type}' has invalid children (must be array)`)
    } else {
      component.children.forEach((child: any, index: number) => {
        if (!child || typeof child !== 'object') {
          errors.push(`Child ${index} of component '${type}' is not an object`)
        } else {
          validateComponent(child, depth + 1, componentNames, componentCount, errors, warnings, updateCount)
        }
      })
    }
  }

  // Validate layout if present
  if (component.layout) {
    validateLayout(component.layout, type, errors, warnings)
  }

  // Validate props if present
  if (component.props !== undefined) {
    if (typeof component.props !== 'object' || Array.isArray(component.props)) {
      warnings.push(`Component '${type}' has invalid props (expected object)`)
    }
  }
}

/**
 * Validate layout object
 */
function validateLayout(
  layout: any,
  componentType: string,
  errors: string[],
  warnings: string[]
): void {
  if (!layout || typeof layout !== 'object') {
    warnings.push(`Component '${componentType}' has invalid layout (must be object)`)
    return
  }

  // Validate numeric fields
  const numericFields = ['x', 'y', 'width', 'height']

  numericFields.forEach((field) => {
    if (field in layout) {
      const value = layout[field]

      if (typeof value !== 'number' || isNaN(value)) {
        warnings.push(`Component '${componentType}' layout.${field} must be a number`)
      } else {
        // Check width and height are positive
        if ((field === 'width' || field === 'height') && value < MIN_SIZE) {
          warnings.push(`Component '${componentType}' has invalid ${field}: ${value} (minimum: ${MIN_SIZE})`)
        }

        // Check maximum size
        if (value > MAX_SIZE) {
          warnings.push(`Component '${componentType}' layout.${field} exceeds maximum (${MAX_SIZE})`)
        }
      }
    }
  })
}

/**
 * Quick validation check - just checks critical errors
 */
export function isValidView(view: any): boolean {
  const result = validateView(view)
  return result.valid
}

/**
 * Validate component type format
 */
export function isValidComponentType(type: string): boolean {
  if (!type || typeof type !== 'string' || type.trim() === '') {
    return false
  }

  // Component types should follow format: namespace.category.name
  // Examples: ia.display.label, ia.input.button
  const parts = type.split('.')
  return parts.length >= 2
}

/**
 * Sanitize component name
 */
export function sanitizeComponentName(name: string): string {
  if (!name) {
    return ''
  }

  // Remove invalid characters
  let sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_')

  // Trim to max length
  if (sanitized.length > MAX_NAME_LENGTH) {
    sanitized = sanitized.substring(0, MAX_NAME_LENGTH)
  }

  return sanitized
}

/**
 * Validate property value by type
 */
export function validatePropertyValue(value: any, expectedType?: string): { valid: boolean; error?: string } {
  // Allow null/undefined
  if (value === null || value === undefined) {
    return { valid: true }
  }

  // If no expected type, allow any value
  if (!expectedType) {
    return { valid: true }
  }

  // Type-specific validation
  switch (expectedType.toLowerCase()) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: `Expected string, got ${typeof value}` }
      }
      break

    case 'number':
    case 'int':
    case 'integer':
    case 'float':
    case 'double':
      if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: `Expected number, got ${typeof value}` }
      }
      break

    case 'boolean':
    case 'bool':
      if (typeof value !== 'boolean') {
        return { valid: false, error: `Expected boolean, got ${typeof value}` }
      }
      break

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return { valid: false, error: `Expected object, got ${typeof value}` }
      }
      break

    case 'array':
      if (!Array.isArray(value)) {
        return { valid: false, error: `Expected array, got ${typeof value}` }
      }
      break

    default:
      // Unknown type, allow it
      return { valid: true }
  }

  return { valid: true }
}

/**
 * Check if view has unsaved changes by comparing with original
 */
export function hasUnsavedChanges(current: any, original: any): boolean {
  return JSON.stringify(current) !== JSON.stringify(original)
}

/**
 * Deep clone a view or component
 */
export function cloneView(view: any): any {
  return JSON.parse(JSON.stringify(view))
}

/**
 * Check for circular references in view structure
 */
export function hasCircularReferences(obj: any, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false
  }

  if (seen.has(obj)) {
    return true
  }

  seen.add(obj)

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (hasCircularReferences(obj[key], seen)) {
        return true
      }
    }
  }

  return false
}
