import { useState, useEffect } from 'react'
import Tree from 'rc-tree'
import apiClient from '../api/axios'
import { useProjectStore } from '../store/projectStore'
import 'rc-tree/assets/index.css'
import '../styles/NamedQueryBrowser.css'

interface NamedQuery {
  name: string
  path: string
  category: string
  sql?: string
  parameters?: QueryParameter[]
  database?: string
}

interface QueryParameter {
  name: string
  type: string
  defaultValue?: any
}

interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
  isLeaf?: boolean
  icon?: string
  queryPath?: string
  queryData?: NamedQuery
}

const NamedQueryBrowser = () => {
  const { currentProject } = useProjectStore()
  const [queries, setQueries] = useState<NamedQuery[]>([])
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root:queries'])
  const [selectedQuery, setSelectedQuery] = useState<NamedQuery | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load named queries when project changes
  useEffect(() => {
    if (currentProject) {
      loadQueries()
    } else {
      setQueries([])
      setTreeData([])
    }
  }, [currentProject])

  const loadQueries = async () => {
    if (!currentProject) {
      setError('No project selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<{ queries: NamedQuery[] }>(
        `/data/webdesigner/api/v1/projects/${encodeURIComponent(currentProject)}/queries`
      )
      const queriesData = response.data.queries || []
      setQueries(queriesData)
      buildTreeData(queriesData)
    } catch (err: any) {
      console.error('Failed to load queries:', err)
      if (err.response?.status === 401) {
        setError('Unauthorized. Please log in to the Gateway.')
      } else if (err.response?.status === 403) {
        setError('Access denied. Designer permissions required.')
      } else if (err.response?.status === 404) {
        setError('Project not found or has no queries.')
      } else {
        setError('Failed to load named queries. Check Gateway connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  const buildTreeData = (queriesData: NamedQuery[]) => {
    // Group queries by category
    const folders = new Map<string, NamedQuery[]>()

    queriesData.forEach(query => {
      const folder = query.category || 'root'
      if (!folders.has(folder)) {
        folders.set(folder, [])
      }
      folders.get(folder)!.push(query)
    })

    // Build tree structure
    const nodes: TreeNode[] = []

    folders.forEach((folderQueries, folderName) => {
      if (folderName === 'root' || folderName === '') {
        // Add queries at root level
        folderQueries.forEach(query => {
          nodes.push({
            key: `query:${query.path}`,
            title: query.name,
            icon: '🔍',
            isLeaf: true,
            queryPath: query.path,
            queryData: query
          })
        })
      } else {
        // Add folder with queries
        nodes.push({
          key: `folder:${folderName}`,
          title: folderName,
          icon: '📁',
          children: folderQueries.map(query => ({
            key: `query:${query.path}`,
            title: query.name,
            icon: '🔍',
            isLeaf: true,
            queryPath: query.path,
            queryData: query
          }))
        })
      }
    })

    setTreeData(nodes)
    setExpandedKeys(['root:queries', ...nodes.filter(n => !n.isLeaf).map(n => n.key)])
  }

  const onSelect = async (selectedKeys: React.Key[], info: any) => {
    const node = info.node
    if (node.queryData) {
      // Load full query details from API
      try {
        const response = await apiClient.get(
          `/data/webdesigner/api/v1/projects/${encodeURIComponent(currentProject!)}/query`,
          { params: { path: node.queryData.path } }
        )
        const queryDetails = response.data
        setSelectedQuery({
          ...node.queryData,
          sql: queryDetails.sql || '',
          parameters: queryDetails.parameters || [],
          database: queryDetails.database || 'default'
        })
        setPreviewOpen(true)
      } catch (err) {
        console.error('Failed to load query details:', err)
        // Show basic info even if we can't load details
        setSelectedQuery(node.queryData)
        setPreviewOpen(true)
      }
    }
  }

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue as string[])
  }

  const onDragStart = (info: any) => {
    const node = info.node
    if (node.queryData) {
      // Set drag data for query binding
      info.event.dataTransfer.effectAllowed = 'copy'
      info.event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'query',
        queryPath: node.queryData.path,
        queryName: node.queryData.name,
        parameters: node.queryData.parameters || []
      }))
    }
  }

  const refresh = () => {
    loadQueries()
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setSelectedQuery(null)
  }

  return (
    <>
      <div className="query-browser">
        <div className="query-browser-header">
          <h3>Named Queries</h3>
          <button onClick={refresh} className="refresh-btn" title="Refresh">
            ↻
          </button>
        </div>

        <div className="query-browser-content">
          {error && (
            <div className="query-browser-error">
              {error}
              <button onClick={loadQueries}>Retry</button>
            </div>
          )}

          {loading && <div className="query-browser-loading">Loading queries...</div>}

          {!loading && !error && treeData.length === 0 && (
            <div className="query-browser-empty">
              <p>No named queries found</p>
              <p className="hint">Create queries in Designer</p>
            </div>
          )}

          {!loading && !error && treeData.length > 0 && (
            <Tree
              className="query-tree"
              treeData={treeData}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              onSelect={onSelect}
              draggable
              onDragStart={onDragStart}
              showIcon={false}
              titleRender={(node: any) => (
                <span className="query-node">
                  <span className="query-icon">{node.icon}</span>
                  <span className="query-title">{node.title}</span>
                </span>
              )}
            />
          )}
        </div>

        <div className="query-browser-footer">
          <span className="query-count">
            {queries.length} {queries.length === 1 ? 'query' : 'queries'}
          </span>
        </div>
      </div>

      {/* Query Preview Modal */}
      {previewOpen && selectedQuery && (
        <div className="query-preview-overlay" onClick={closePreview}>
          <div className="query-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="query-preview-header">
              <h2>🔍 {selectedQuery.name}</h2>
              <button onClick={closePreview} className="close-btn">×</button>
            </div>
            <div className="query-preview-body">
              <div className="query-info">
                <div className="query-info-row">
                  <span className="query-info-label">Path:</span>
                  <span className="query-info-value">{selectedQuery.path}</span>
                </div>
                <div className="query-info-row">
                  <span className="query-info-label">Database:</span>
                  <span className="query-info-value">{selectedQuery.database || 'default'}</span>
                </div>
              </div>

              {selectedQuery.parameters && selectedQuery.parameters.length > 0 && (
                <div className="query-parameters">
                  <h3>Parameters</h3>
                  {selectedQuery.parameters.map((param) => (
                    <div key={param.name} className="parameter-item">
                      <span className="parameter-name">{param.name}</span>
                      <span className="parameter-type">{param.type}</span>
                      {param.defaultValue && (
                        <span className="parameter-default">= {param.defaultValue}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="query-sql">
                <h3>SQL</h3>
                <pre>{selectedQuery.sql}</pre>
              </div>

              <div className="query-hint">
                💡 Drag this query to a property to create a query binding
              </div>
            </div>
            <div className="query-preview-footer">
              <button className="btn-close" onClick={closePreview}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NamedQueryBrowser
