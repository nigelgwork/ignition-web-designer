import { create } from 'zustand'
import type { Project, View, ViewContent } from '../types'

interface DesignerState {
  // Projects
  projects: Project[]
  selectedProject: string | null

  // Views
  views: View[]
  selectedView: string | null
  viewContent: ViewContent | null
  viewModified: boolean
  savingView: boolean

  // Selected component in Canvas
  selectedComponentPath: string | null
  selectedComponentProps: Record<string, unknown> | null

  // Loading states
  loadingProjects: boolean
  loadingViews: boolean
  loadingView: boolean

  // Actions
  setProjects: (projects: Project[]) => void
  setSelectedProject: (projectName: string | null) => void
  setViews: (views: View[]) => void
  setSelectedView: (viewPath: string | null) => void
  setViewContent: (content: ViewContent | null) => void
  setSelectedComponent: (path: string | null, props: Record<string, unknown> | null) => void
  setLoadingProjects: (loading: boolean) => void
  setLoadingViews: (loading: boolean) => void
  setLoadingView: (loading: boolean) => void

  // View modification actions
  updateComponentProperty: (path: string, propertyName: string, value: unknown) => void
  deleteComponent: (path: string) => void
  addComponent: (parentPath: string, component: Record<string, unknown>) => void
  saveView: () => Promise<boolean>
  setViewModified: (modified: boolean) => void
}

export const useDesignerStore = create<DesignerState>((set) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  views: [],
  selectedView: null,
  viewContent: null,
  viewModified: false,
  savingView: false,
  selectedComponentPath: null,
  selectedComponentProps: null,
  loadingProjects: false,
  loadingViews: false,
  loadingView: false,

  // Actions
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setViews: (views) => set({ views }),
  setSelectedView: (selectedView) => set({ selectedView, viewModified: false }),
  setViewContent: (viewContent) => set({ viewContent, viewModified: false }),
  setSelectedComponent: (selectedComponentPath, selectedComponentProps) =>
    set({ selectedComponentPath, selectedComponentProps }),
  setLoadingProjects: (loadingProjects) => set({ loadingProjects }),
  setLoadingViews: (loadingViews) => set({ loadingViews }),
  setLoadingView: (loadingView) => set({ loadingView }),

  // View modification actions
  setViewModified: (viewModified) => set({ viewModified }),

  updateComponentProperty: (path, propertyName, value) =>
    set((state) => {
      if (!state.viewContent) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const component = getComponentByPath(newContent.content.root, path)

      if (component) {
        component[propertyName] = value
      }

      return {
        viewContent: newContent,
        viewModified: true,
        selectedComponentProps: component ? { ...component } : state.selectedComponentProps,
      }
    }),

  deleteComponent: (path) =>
    set((state) => {
      if (!state.viewContent || path === 'root') return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const pathParts = path.split('.')
      const parentPath = pathParts.slice(0, -1).join('.')
      const parent = parentPath
        ? getComponentByPath(newContent.content.root, parentPath)
        : newContent.content

      if (parent && Array.isArray(parent.children)) {
        const indexMatch = pathParts[pathParts.length - 1].match(/children\[(\d+)\]/)
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10)
          parent.children.splice(index, 1)
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        selectedComponentPath: null,
        selectedComponentProps: null,
      }
    }),

  addComponent: (parentPath, component) =>
    set((state) => {
      if (!state.viewContent) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const parent = getComponentByPath(newContent.content.root, parentPath)

      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(component)
      }

      return {
        viewContent: newContent,
        viewModified: true,
      }
    }),

  saveView: async () => {
    const state = useDesignerStore.getState()
    if (!state.viewContent || !state.selectedProject || !state.selectedView) {
      return false
    }

    set({ savingView: true })

    try {
      const axios = (await import('axios')).default
      await axios.put(
        `/data/webdesigner/api/v1/projects/${encodeURIComponent(state.selectedProject)}/view`,
        {
          content: state.viewContent.content,
        },
        {
          params: { path: state.selectedView },
        }
      )

      set({ viewModified: false, savingView: false })
      return true
    } catch (error) {
      console.error('Failed to save view:', error)
      set({ savingView: false })
      return false
    }
  },
}))

// Helper function to get component by path
function getComponentByPath(root: any, path: string): any {
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
