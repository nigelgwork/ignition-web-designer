import { create } from 'zustand'

interface SelectionState {
  // Selected component(s) in Canvas
  selectedComponentPath: string | null // Primary selection
  selectedComponentProps: Record<string, unknown> | null
  selectedComponentPaths: string[] // Multi-select support

  // Actions
  setSelectedComponent: (path: string | null, props: Record<string, unknown> | null) => void
  toggleComponentSelection: (path: string, props: Record<string, unknown>) => void
  clearComponentSelection: () => void
  updateSelectedComponentProps: (props: Record<string, unknown> | null) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  // Initial state
  selectedComponentPath: null,
  selectedComponentProps: null,
  selectedComponentPaths: [],

  // Actions
  setSelectedComponent: (selectedComponentPath, selectedComponentProps) =>
    set({
      selectedComponentPath,
      selectedComponentProps,
      selectedComponentPaths: selectedComponentPath ? [selectedComponentPath] : []
    }),

  toggleComponentSelection: (path, props) =>
    set((state) => {
      const isSelected = state.selectedComponentPaths.includes(path)

      if (isSelected) {
        // Remove from selection
        const newPaths = state.selectedComponentPaths.filter(p => p !== path)
        return {
          selectedComponentPaths: newPaths,
          selectedComponentPath: newPaths.length > 0 ? newPaths[0] : null,
          selectedComponentProps: newPaths.length > 0 ? props : null
        }
      } else {
        // Add to selection
        const newPaths = [...state.selectedComponentPaths, path]
        return {
          selectedComponentPaths: newPaths,
          selectedComponentPath: path,
          selectedComponentProps: props
        }
      }
    }),

  clearComponentSelection: () =>
    set({
      selectedComponentPath: null,
      selectedComponentProps: null,
      selectedComponentPaths: []
    }),

  updateSelectedComponentProps: (selectedComponentProps) =>
    set({ selectedComponentProps }),
}))
