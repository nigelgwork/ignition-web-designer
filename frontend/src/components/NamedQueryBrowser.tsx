import { useState, useEffect } from 'react'
import Tree from 'rc-tree'
import apiClient from '../api/axios'
import 'rc-tree/assets/index.css'
import '../styles/NamedQueryBrowser.css'

interface NamedQuery {
  name: string
  path: string
  sql: string
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
  const [queries, setQueries] = useState<NamedQuery[]>([])
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root:queries'])
  const [selectedQuery, setSelectedQuery] = useState<NamedQuery | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load named queries on mount
  useEffect(() => {
    loadQueries()
  }, [])

  const loadQueries = async () => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call when backend is implemented
      // const response = await axios.get('/data/webdesigner/api/v1/projects/{name}/queries')
      // const queriesData = response.data.queries || []

      // For now, create mock queries
      const mockQueries: NamedQuery[] = [
        {
          name: 'GetActiveAlarms',
          path: 'alarms/GetActiveAlarms',
          database: 'default',
          sql: 'SELECT * FROM alarm_events WHERE ack_time IS NULL ORDER BY event_time DESC',
          parameters: []
        },
        {
          name: 'GetTagHistory',
          path: 'tags/GetTagHistory',
          database: 'default',
          sql: 'SELECT * FROM sqlt_data_1_2023_04 WHERE tagid = :tagId AND t_stamp BETWEEN :startTime AND :endTime',
          parameters: [
            { name: 'tagId', type: 'Integer' },
            { name: 'startTime', type: 'Timestamp' },
            { name: 'endTime', type: 'Timestamp' }
          ]
        },
        {
          name: 'GetUserList',
          path: 'users/GetUserList',
          database: 'default',
          sql: 'SELECT username, email, role FROM users WHERE active = 1',
          parameters: []
        }
      ]

      setQueries(mockQueries)
      buildTreeData(mockQueries)
    } catch (err) {
      console.error('Failed to load queries:', err)
      setError('Failed to load named queries. Check Gateway connection.')
    } finally {
      setLoading(false)
    }
  }

  const buildTreeData = (queriesData: NamedQuery[]) => {
    // Group queries by path prefix (folder)
    const folders = new Map<string, NamedQuery[]>()

    queriesData.forEach(query => {
      const pathParts = query.path.split('/')
      const folder = pathParts.length > 1 ? pathParts[0] : 'root'
      if (!folders.has(folder)) {
        folders.set(folder, [])
      }
      folders.get(folder)!.push(query)
    })

    // Build tree structure
    const nodes: TreeNode[] = []

    folders.forEach((folderQueries, folderName) => {
      if (folderName === 'root') {
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

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const node = info.node
    if (node.queryData) {
      setSelectedQuery(node.queryData)
      setPreviewOpen(true)
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
