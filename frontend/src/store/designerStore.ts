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
}

export const useDesignerStore = create<DesignerState>((set) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  views: [],
  selectedView: null,
  viewContent: null,
  selectedComponentPath: null,
  selectedComponentProps: null,
  loadingProjects: false,
  loadingViews: false,
  loadingView: false,

  // Actions
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setViews: (views) => set({ views }),
  setSelectedView: (selectedView) => set({ selectedView }),
  setViewContent: (viewContent) => set({ viewContent }),
  setSelectedComponent: (selectedComponentPath, selectedComponentProps) =>
    set({ selectedComponentPath, selectedComponentProps }),
  setLoadingProjects: (loadingProjects) => set({ loadingProjects }),
  setLoadingViews: (loadingViews) => set({ loadingViews }),
  setLoadingView: (loadingView) => set({ loadingView }),
}))
