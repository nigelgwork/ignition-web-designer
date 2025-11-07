import { create } from 'zustand'
import type { ViewContent } from '../types'
import { getComponentByPath } from './utils'

interface UIState {
  // UI State
  leftSidebarVisible: boolean
  rightSidebarVisible: boolean
  canvasZoom: number

  // UI actions
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setCanvasZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void

  // Alignment actions (operate on viewContent and selectedComponentPaths)
  alignLeft: (viewContent: ViewContent | null, selectedPaths: string[]) => ViewContent | null
  alignCenter: (viewContent: ViewContent | null, selectedPaths: string[]) => ViewContent | null
  alignRight: (viewContent: ViewContent | null, selectedPaths: string[]) => ViewContent | null
  alignTop: (viewContent: ViewContent | null, selectedPaths: string[]) => ViewContent | null
  alignMiddle: (viewContent: ViewContent | null, selectedPaths: string[]) => ViewContent | null
  alignBottom: (viewContent: ViewContent | null, selectedPaths: string[]) => ViewContent | null
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  leftSidebarVisible: true,
  rightSidebarVisible: true,
  canvasZoom: 100,

  // UI actions
  toggleLeftSidebar: () => set((state) => ({ leftSidebarVisible: !state.leftSidebarVisible })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarVisible: !state.rightSidebarVisible })),
  setCanvasZoom: (canvasZoom) => set({ canvasZoom }),
  zoomIn: () => set((state) => ({ canvasZoom: Math.min(state.canvasZoom + 10, 200) })),
  zoomOut: () => set((state) => ({ canvasZoom: Math.max(state.canvasZoom - 10, 25) })),
  zoomReset: () => set({ canvasZoom: 100 }),

  // Alignment actions - align selected components
  alignLeft: (viewContent, selectedPaths) => {
    if (!viewContent || selectedPaths.length < 2) return null

    const newContent = JSON.parse(JSON.stringify(viewContent))

    // Find leftmost x position
    let minX = Infinity
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout?.x !== undefined) {
        minX = Math.min(minX, comp.layout.x)
      }
    }

    if (minX === Infinity) return null

    // Align all to leftmost
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout) {
        comp.layout.x = minX
      }
    }

    return newContent
  },

  alignCenter: (viewContent, selectedPaths) => {
    if (!viewContent || selectedPaths.length < 2) return null

    const newContent = JSON.parse(JSON.stringify(viewContent))

    // Calculate average center X
    let sumCenterX = 0
    let count = 0
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout?.x !== undefined && comp?.layout?.width !== undefined) {
        sumCenterX += comp.layout.x + comp.layout.width / 2
        count++
      }
    }

    if (count === 0) return null
    const centerX = sumCenterX / count

    // Align all to center
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout) {
        comp.layout.x = centerX - (comp.layout.width || 0) / 2
      }
    }

    return newContent
  },

  alignRight: (viewContent, selectedPaths) => {
    if (!viewContent || selectedPaths.length < 2) return null

    const newContent = JSON.parse(JSON.stringify(viewContent))

    // Find rightmost position
    let maxRight = -Infinity
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout?.x !== undefined && comp?.layout?.width !== undefined) {
        maxRight = Math.max(maxRight, comp.layout.x + comp.layout.width)
      }
    }

    if (maxRight === -Infinity) return null

    // Align all to rightmost
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout) {
        comp.layout.x = maxRight - (comp.layout.width || 0)
      }
    }

    return newContent
  },

  alignTop: (viewContent, selectedPaths) => {
    if (!viewContent || selectedPaths.length < 2) return null

    const newContent = JSON.parse(JSON.stringify(viewContent))

    // Find topmost y position
    let minY = Infinity
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout?.y !== undefined) {
        minY = Math.min(minY, comp.layout.y)
      }
    }

    if (minY === Infinity) return null

    // Align all to topmost
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout) {
        comp.layout.y = minY
      }
    }

    return newContent
  },

  alignMiddle: (viewContent, selectedPaths) => {
    if (!viewContent || selectedPaths.length < 2) return null

    const newContent = JSON.parse(JSON.stringify(viewContent))

    // Calculate average center Y
    let sumCenterY = 0
    let count = 0
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout?.y !== undefined && comp?.layout?.height !== undefined) {
        sumCenterY += comp.layout.y + comp.layout.height / 2
        count++
      }
    }

    if (count === 0) return null
    const centerY = sumCenterY / count

    // Align all to middle
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout) {
        comp.layout.y = centerY - (comp.layout.height || 0) / 2
      }
    }

    return newContent
  },

  alignBottom: (viewContent, selectedPaths) => {
    if (!viewContent || selectedPaths.length < 2) return null

    const newContent = JSON.parse(JSON.stringify(viewContent))

    // Find bottommost position
    let maxBottom = -Infinity
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout?.y !== undefined && comp?.layout?.height !== undefined) {
        maxBottom = Math.max(maxBottom, comp.layout.y + comp.layout.height)
      }
    }

    if (maxBottom === -Infinity) return null

    // Align all to bottommost
    for (const path of selectedPaths) {
      const comp = getComponentByPath(newContent.content.root, path)
      if (comp?.layout) {
        comp.layout.y = maxBottom - (comp.layout.height || 0)
      }
    }

    return newContent
  },
}))
