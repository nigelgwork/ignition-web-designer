import { useState, useEffect } from 'react'
import Tree from 'rc-tree'
import apiClient from '../api/axios'
import ScriptEditor from './ScriptEditor'
import 'rc-tree/assets/index.css'
import '../styles/ScriptBrowser.css'

interface ProjectScript {
  name: string
  path: string
  type: 'module' | 'class' | 'gateway' | 'transform'
  content?: string
}

interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
  isLeaf?: boolean
  icon?: string
  scriptPath?: string
  scriptType?: string
  scriptContent?: string
}

const ScriptBrowser = () => {
  const [scripts, setScripts] = useState<ProjectScript[]>([])
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root:project', 'root:gateway'])
  const [selectedScript, setSelectedScript] = useState<ProjectScript | null>(null)
  const [scriptEditorOpen, setScriptEditorOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load project scripts on mount
  useEffect(() => {
    loadScripts()
  }, [])

  const loadScripts = async () => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call when backend is implemented
      // const response = await axios.get('/data/webdesigner/api/v1/projects/{name}/scripts')
      // const scriptsData = response.data.scripts || []

      // For now, create a mock structure
      const mockScripts: ProjectScript[] = [
        {
          name: 'startup',
          path: 'project/startup',
          type: 'module',
          content: '# Project startup script\nsystem.perspective.print("Project started")'
        },
        {
          name: 'utils',
          path: 'project/utils',
          type: 'module',
          content: '# Utility functions\ndef formatTemperature(value):\n    return "{:.1f}°F".format(value)'
        },
        {
          name: 'SessionStartup',
          path: 'gateway/SessionStartup',
          type: 'gateway',
          content: '# Session startup event\nlogger = system.util.getLogger("session")\nlogger.info("Session started")'
        }
      ]

      setScripts(mockScripts)
      buildTreeData(mockScripts)
    } catch (err) {
      console.error('Failed to load scripts:', err)
      setError('Failed to load scripts. Check Gateway connection.')
    } finally {
      setLoading(false)
    }
  }

  const buildTreeData = (scriptsData: ProjectScript[]) => {
    // Group scripts by type
    const projectScripts = scriptsData.filter(s => s.type === 'module' || s.type === 'class')
    const gatewayScripts = scriptsData.filter(s => s.type === 'gateway')
    const transformScripts = scriptsData.filter(s => s.type === 'transform')

    const nodes: TreeNode[] = [
      {
        key: 'root:project',
        title: 'Project Scripts',
        icon: '📁',
        children: projectScripts.map(script => ({
          key: `script:project:${script.path}`,
          title: script.name,
          icon: script.type === 'class' ? '📦' : '📄',
          isLeaf: true,
          scriptPath: script.path,
          scriptType: script.type,
          scriptContent: script.content
        }))
      },
      {
        key: 'root:gateway',
        title: 'Gateway Scripts',
        icon: '📁',
        children: gatewayScripts.map(script => ({
          key: `script:gateway:${script.path}`,
          title: script.name,
          icon: '⚙️',
          isLeaf: true,
          scriptPath: script.path,
          scriptType: script.type,
          scriptContent: script.content
        }))
      }
    ]

    if (transformScripts.length > 0) {
      nodes.push({
        key: 'root:transform',
        title: 'Transform Scripts',
        icon: '📁',
        children: transformScripts.map(script => ({
          key: `script:transform:${script.path}`,
          title: script.name,
          icon: '🔄',
          isLeaf: true,
          scriptPath: script.path,
          scriptType: script.type,
          scriptContent: script.content
        }))
      })
    }

    setTreeData(nodes)
  }

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const node = info.node
    if (node.scriptPath) {
      const script: ProjectScript = {
        name: node.title,
        path: node.scriptPath,
        type: node.scriptType,
        content: node.scriptContent || ''
      }
      setSelectedScript(script)
      setScriptEditorOpen(true)
    }
  }

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue as string[])
  }

  const handleSaveScript = async (content: string) => {
    if (!selectedScript) return

    try {
      // TODO: Implement save API call
      // await axios.put(
      //   `/data/webdesigner/api/v1/projects/{name}/script`,
      //   { content },
      //   { params: { path: selectedScript.path } }
      // )

      console.log(`Saved script: ${selectedScript.path}`)

      // Update local state
      const updatedScripts = scripts.map(s =>
        s.path === selectedScript.path ? { ...s, content } : s
      )
      setScripts(updatedScripts)
      buildTreeData(updatedScripts)

      setScriptEditorOpen(false)
      setSelectedScript(null)
    } catch (err) {
      console.error('Failed to save script:', err)
      alert('Failed to save script. Check console for details.')
    }
  }

  const handleNewScript = () => {
    const scriptName = prompt('Enter script name:')
    if (!scriptName) return

    const newScript: ProjectScript = {
      name: scriptName,
      path: `project/${scriptName}`,
      type: 'module',
      content: `# ${scriptName}\n# New project script\n\n`
    }

    const updatedScripts = [...scripts, newScript]
    setScripts(updatedScripts)
    buildTreeData(updatedScripts)
  }

  const refresh = () => {
    loadScripts()
  }

  return (
    <>
      <div className="script-browser">
        <div className="script-browser-header">
          <h3>Scripts</h3>
          <div className="script-browser-actions">
            <button onClick={handleNewScript} className="new-script-btn" title="New Script">
              +
            </button>
            <button onClick={refresh} className="refresh-btn" title="Refresh">
              ↻
            </button>
          </div>
        </div>

        <div className="script-browser-content">
          {error && (
            <div className="script-browser-error">
              {error}
              <button onClick={loadScripts}>Retry</button>
            </div>
          )}

          {loading && <div className="script-browser-loading">Loading scripts...</div>}

          {!loading && !error && treeData.length === 0 && (
            <div className="script-browser-empty">
              <p>No scripts found</p>
              <p className="hint">Click + to create a new script</p>
            </div>
          )}

          {!loading && !error && treeData.length > 0 && (
            <Tree
              className="script-tree"
              treeData={treeData}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              onSelect={onSelect}
              showIcon={false}
              defaultExpandAll={false}
              titleRender={(node: any) => (
                <span className="script-node">
                  <span className="script-icon">{node.icon}</span>
                  <span className="script-title">{node.title}</span>
                </span>
              )}
            />
          )}
        </div>

        <div className="script-browser-footer">
          <span className="script-count">
            {scripts.length} {scripts.length === 1 ? 'script' : 'scripts'}
          </span>
        </div>
      </div>

      {selectedScript && (
        <ScriptEditor
          isOpen={scriptEditorOpen}
          onClose={() => {
            setScriptEditorOpen(false)
            setSelectedScript(null)
          }}
          onSave={handleSaveScript}
          initialScript={selectedScript.content || ''}
          scriptType={selectedScript.type}
          language="python"
          title={`Script: ${selectedScript.name}`}
        />
      )}
    </>
  )
}

export default ScriptBrowser
