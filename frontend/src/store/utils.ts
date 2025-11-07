import type { ViewContent } from '../types'

// Helper function to get component by path
export function getComponentByPath(root: any, path: string): any {
  if (path === 'root') return root

  const parts = path.split('.').slice(1) // Remove 'root' prefix
  let current = root

  for (const part of parts) {
    const match = part.match(/children\[(\d+)\]/)
    if (match && current.children) {
      current = current.children[parseInt(match[1], 10)]
    } else {
      current = current[part]
    }

    if (!current) break
  }

  return current
}

// Helper function to add to history (called after mutations)
export function pushToHistory(state: any, newContent: ViewContent) {
  // Remove any history after current index (for branching)
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(newContent)

  // Limit history to 50 items
  const limitedHistory = newHistory.slice(-50)

  return {
    history: limitedHistory,
    historyIndex: limitedHistory.length - 1,
    canUndo: true,
    canRedo: false,
  }
}
