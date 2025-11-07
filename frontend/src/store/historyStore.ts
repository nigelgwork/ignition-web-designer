import { create } from 'zustand'
import type { ViewContent } from '../types'

interface HistoryState {
  // History for undo/redo
  history: ViewContent[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean

  // Actions
  initializeHistory: (content: ViewContent | null) => void
  pushToHistory: (content: ViewContent) => void
  undo: () => ViewContent | null
  redo: () => ViewContent | null
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  // Initial state
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  // Actions
  initializeHistory: (viewContent) =>
    set({
      history: viewContent ? [viewContent] : [],
      historyIndex: viewContent ? 0 : -1,
      canUndo: false,
      canRedo: false,
    }),

  pushToHistory: (newContent) =>
    set((state) => {
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
    }),

  undo: () => {
    const state = get()
    if (state.historyIndex <= 0 || state.history.length === 0) return null

    const newIndex = state.historyIndex - 1
    const previousContent = state.history[newIndex]

    set({
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
    })

    return previousContent
  },

  redo: () => {
    const state = get()
    if (state.historyIndex >= state.history.length - 1) return null

    const newIndex = state.historyIndex + 1
    const nextContent = state.history[newIndex]

    set({
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < state.history.length - 1,
    })

    return nextContent
  },
}))
