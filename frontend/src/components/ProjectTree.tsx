import { useEffect, useState } from 'react'
import Tree from 'rc-tree'
import 'rc-tree/assets/index.css'
import { useDesignerStore } from '../store/designerStore'
import axios from 'axios'
import type { TreeNode, Project, View } from '../types'

export default function ProjectTree() {
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const {
    projects,
    selectedProject,
    views,
    setProjects,
    setSelectedProject,
    setViews,
    setLoadingProjects,
    setLoadingViews,
  } = useDesignerStore()

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Load views when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadViews(selectedProject)
    }
  }, [selectedProject])

  // Update tree data when projects/views change
  useEffect(() => {
    const newTreeData: TreeNode[] = projects.map((project) => ({
      key: `project-${project.name}`,
      title: project.name,
      isLeaf: false,
      children:
        selectedProject === project.name
          ? views.map((view) => ({
              key: `view-${project.name}-${view.path}`,
              title: view.name,
              isLeaf: true,
            }))
          : [],
    }))
    setTreeData(newTreeData)
  }, [projects, views, selectedProject])

  const loadProjects = async () => {
    setLoadingProjects(true)
    try {
      const response = await axios.get<{ projects: string[] }>(
        '/data/webdesigner/api/v1/projects'
      )
      const projectList: Project[] = response.data.projects.map((name) => ({ name }))
      setProjects(projectList)
    } catch (error) {
      console.error('Error loading projects:', error)
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadViews = async (projectName: string) => {
    setLoadingViews(true)
    try {
      const response = await axios.get<{ project: string; views: View[] }>(
        `/data/webdesigner/api/v1/projects/${encodeURIComponent(projectName)}/views`
      )
      setViews(response.data.views)
    } catch (error) {
      console.error('Error loading views:', error)
      setViews([])
    } finally {
      setLoadingViews(false)
    }
  }

  const handleExpand = (expandedKeys: React.Key[]) => {
    // Find newly expanded project
    const expandedProjectKey = expandedKeys.find(
      (key) => typeof key === 'string' && key.startsWith('project-')
    )
    if (expandedProjectKey && typeof expandedProjectKey === 'string') {
      const projectName = expandedProjectKey.replace('project-', '')
      if (projectName !== selectedProject) {
        setSelectedProject(projectName)
      }
    }
  }

  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0]
    if (key && typeof key === 'string' && key.startsWith('view-')) {
      // Extract view path from key
      const viewPath = key.replace(`view-${selectedProject}-`, '')
      console.log('Selected view:', { project: selectedProject, path: viewPath })

      // Find the actual View object to get the correct path
      const view = views.find((v) => key === `view-${selectedProject}-${v.path}`)
      if (view) {
        useDesignerStore.getState().setSelectedView(view.path)
      }
    }
  }

  return (
    <div className="project-tree">
      <div className="tree-header">
        <h3>Projects</h3>
        <button onClick={loadProjects} className="refresh-btn">
          ↻
        </button>
      </div>
      <div className="tree-content">
        {treeData.length === 0 ? (
          <div className="empty-state">No projects found</div>
        ) : (
          <Tree
            treeData={treeData}
            onExpand={handleExpand}
            onSelect={handleSelect}
            defaultExpandAll={false}
          />
        )}
      </div>
    </div>
  )
}
