/**
 * Main store export - combines all modular stores into a unified interface
 * This provides backward compatibility with the previous designerStore
 */

import { useProjectStore } from './projectStore'
import { useSelectionStore } from './selectionStore'
import { useHistoryStore } from './historyStore'
import { useUIStore } from './uiStore'
import type { ViewContent } from '../types'

/**
 * Combined hook that provides access to all store functionality
 * This maintains the same interface as the previous useDesignerStore
 */
export function useDesignerStore() {
  const projectStore = useProjectStore()
  const selectionStore = useSelectionStore()
  const historyStore = useHistoryStore()
  const uiStore = useUIStore()

  // Wrap actions that need to coordinate between stores
  const setViewContent = (content: ViewContent | null) => {
    projectStore.setViewContent(content)
    historyStore.initializeHistory(content)
    selectionStore.clearComponentSelection()
  }

  const updateComponentProperty = (path: string, propertyName: string, value: unknown) => {
    projectStore.updateComponentProperty(path, propertyName, value)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
      // Update selected component props to reflect changes
      const component = require('./utils').getComponentByPath(newContent.content.root, path)
      if (component && path === selectionStore.selectedComponentPath) {
        selectionStore.updateSelectedComponentProps({ ...component })
      }
    }
  }

  const updateComponentLayout = (path: string, layout: { x?: number; y?: number; width?: number; height?: number }) => {
    projectStore.updateComponentLayout(path, layout)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
    }
  }

  const deleteComponent = (path: string) => {
    projectStore.deleteComponent(path)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
      selectionStore.clearComponentSelection()
    }
  }

  const addComponent = (parentPath: string, component: Record<string, unknown>) => {
    projectStore.addComponent(parentPath, component)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
    }
  }

  const setBinding = (path: string, propertyName: string, binding: any) => {
    projectStore.setBinding(path, propertyName, binding)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
      // Update selected component props
      const component = require('./utils').getComponentByPath(newContent.content.root, path)
      if (component && path === selectionStore.selectedComponentPath) {
        selectionStore.updateSelectedComponentProps({ ...component })
      }
    }
  }

  const removeBinding = (path: string, propertyName: string) => {
    projectStore.removeBinding(path, propertyName)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
      // Update selected component props
      const component = require('./utils').getComponentByPath(newContent.content.root, path)
      if (component && path === selectionStore.selectedComponentPath) {
        selectionStore.updateSelectedComponentProps({ ...component })
      }
    }
  }

  const undo = () => {
    const previousContent = historyStore.undo()
    if (previousContent) {
      projectStore.setViewContent(previousContent)
      projectStore.setViewModified(historyStore.historyIndex !== 0)
    }
  }

  const redo = () => {
    const nextContent = historyStore.redo()
    if (nextContent) {
      projectStore.setViewContent(nextContent)
      projectStore.setViewModified(historyStore.historyIndex !== 0)
    }
  }

  const copyComponent = () => {
    projectStore.copyComponent(selectionStore.selectedComponentPath)
  }

  const cutComponent = () => {
    projectStore.cutComponent(selectionStore.selectedComponentPath)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
      selectionStore.clearComponentSelection()
    }
  }

  const pasteComponent = () => {
    projectStore.pasteComponent(selectionStore.selectedComponentPath)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
    }
  }

  const duplicateComponent = () => {
    projectStore.duplicateComponent(selectionStore.selectedComponentPath)
    const newContent = projectStore.viewContent
    if (newContent) {
      historyStore.pushToHistory(newContent)
    }
  }

  // Alignment actions that coordinate between UI store and project store
  const alignLeft = () => {
    const newContent = uiStore.alignLeft(projectStore.viewContent, selectionStore.selectedComponentPaths)
    if (newContent) {
      projectStore.setViewContent(newContent)
      projectStore.setViewModified(true)
      historyStore.pushToHistory(newContent)
    }
  }

  const alignCenter = () => {
    const newContent = uiStore.alignCenter(projectStore.viewContent, selectionStore.selectedComponentPaths)
    if (newContent) {
      projectStore.setViewContent(newContent)
      projectStore.setViewModified(true)
      historyStore.pushToHistory(newContent)
    }
  }

  const alignRight = () => {
    const newContent = uiStore.alignRight(projectStore.viewContent, selectionStore.selectedComponentPaths)
    if (newContent) {
      projectStore.setViewContent(newContent)
      projectStore.setViewModified(true)
      historyStore.pushToHistory(newContent)
    }
  }

  const alignTop = () => {
    const newContent = uiStore.alignTop(projectStore.viewContent, selectionStore.selectedComponentPaths)
    if (newContent) {
      projectStore.setViewContent(newContent)
      projectStore.setViewModified(true)
      historyStore.pushToHistory(newContent)
    }
  }

  const alignMiddle = () => {
    const newContent = uiStore.alignMiddle(projectStore.viewContent, selectionStore.selectedComponentPaths)
    if (newContent) {
      projectStore.setViewContent(newContent)
      projectStore.setViewModified(true)
      historyStore.pushToHistory(newContent)
    }
  }

  const alignBottom = () => {
    const newContent = uiStore.alignBottom(projectStore.viewContent, selectionStore.selectedComponentPaths)
    if (newContent) {
      projectStore.setViewContent(newContent)
      projectStore.setViewModified(true)
      historyStore.pushToHistory(newContent)
    }
  }

  // Return combined interface
  return {
    // State from all stores
    ...projectStore,
    ...selectionStore,
    ...historyStore,
    ...uiStore,

    // Wrapped actions that coordinate between stores
    setViewContent,
    updateComponentProperty,
    updateComponentLayout,
    deleteComponent,
    addComponent,
    setBinding,
    removeBinding,
    undo,
    redo,
    copyComponent,
    cutComponent,
    pasteComponent,
    duplicateComponent,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
  }
}

// Also export individual stores for direct access if needed
export { useProjectStore } from './projectStore'
export { useSelectionStore } from './selectionStore'
export { useHistoryStore } from './historyStore'
export { useUIStore } from './uiStore'
export { getComponentByPath, pushToHistory } from './utils'
