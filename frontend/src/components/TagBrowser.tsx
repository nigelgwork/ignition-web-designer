import { useState, useEffect } from 'react'
import Tree from 'rc-tree'
import apiClient from '../api/axios'
import 'rc-tree/assets/index.css'
import '../styles/TagBrowser.css'

interface TagProvider {
  name: string
}

interface Tag {
  name: string
  path: string
  type: string
  hasChildren: boolean
}

interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
  isLeaf?: boolean
  icon?: string
  tagPath?: string
  tagType?: string
}

const TagBrowser = () => {
  const [providers, setProviders] = useState<TagProvider[]>([])
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load tag providers on mount
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/data/webdesigner/api/v1/tags')
      const providersData = response.data.providers || []
      setProviders(providersData)

      // Convert providers to tree nodes
      const nodes: TreeNode[] = providersData.map((provider: TagProvider) => ({
        key: `provider:${provider.name}`,
        title: provider.name,
        icon: '📦',
        isLeaf: false,
        children: [] // Will be loaded on expand
      }))

      setTreeData(nodes)
    } catch (err) {
      console.error('Failed to load tag providers:', err)
      setError('Failed to load tag providers. Check Gateway connection.')
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async (providerName: string, path: string = '') => {
    try {
      const url = `/data/webdesigner/api/v1/tags/${encodeURIComponent(providerName)}`
      const params = path ? { path } : {}
      const response = await apiClient.get(url, { params })

      // TODO: Parse actual tag structure from response
      // For now, return empty array until API is implemented
      const tags = response.data.tags || []

      // Convert tags to tree nodes
      return tags.map((tag: Tag) => ({
        key: `tag:${providerName}:${tag.path}`,
        title: tag.name,
        icon: tag.hasChildren ? '📁' : '🏷️',
        isLeaf: !tag.hasChildren,
        tagPath: tag.path,
        tagType: tag.type,
        children: tag.hasChildren ? [] : undefined
      }))
    } catch (err) {
      console.error(`Failed to load tags for provider ${providerName}:`, err)
      return []
    }
  }

  const onExpand = async (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue as string[])

    // Find newly expanded nodes
    const newExpandedKeys = expandedKeysValue.filter(
      key => !expandedKeys.includes(key as string)
    )

    // Load children for newly expanded nodes
    for (const key of newExpandedKeys) {
      const keyStr = key as string

      if (keyStr.startsWith('provider:')) {
        // Load root tags for provider
        const providerName = keyStr.substring('provider:'.length)
        const tags = await loadTags(providerName)

        // Update tree data
        setTreeData(prevData =>
          updateTreeNode(prevData, keyStr, { children: tags })
        )
      } else if (keyStr.startsWith('tag:')) {
        // Load child tags
        const parts = keyStr.split(':')
        const providerName = parts[1]
        const tagPath = parts.slice(2).join(':')
        const childTags = await loadTags(providerName, tagPath)

        // Update tree data
        setTreeData(prevData =>
          updateTreeNode(prevData, keyStr, { children: childTags })
        )
      }
    }
  }

  const updateTreeNode = (
    nodes: TreeNode[],
    key: string,
    updates: Partial<TreeNode>
  ): TreeNode[] => {
    return nodes.map(node => {
      if (node.key === key) {
        return { ...node, ...updates }
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeNode(node.children, key, updates)
        }
      }
      return node
    })
  }

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const node = info.node
    if (node.tagPath) {
      console.log('Selected tag:', node.tagPath, 'Type:', node.tagType)
      // TODO: Enable drag-and-drop or show tag details
    }
  }

  const onDragStart = (info: any) => {
    const node = info.node
    if (node.tagPath) {
      // Set drag data for tag
      info.event.dataTransfer.effectAllowed = 'copy'
      info.event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'tag',
        tagPath: node.tagPath,
        tagType: node.tagType,
        name: node.title
      }))
    }
  }

  const filteredTreeData = searchQuery
    ? filterTreeNodes(treeData, searchQuery)
    : treeData

  const filterTreeNodes = (nodes: TreeNode[], query: string): TreeNode[] => {
    const lowerQuery = query.toLowerCase()
    return nodes.reduce((acc: TreeNode[], node) => {
      const matchesTitle = node.title.toLowerCase().includes(lowerQuery)
      const filteredChildren = node.children
        ? filterTreeNodes(node.children, query)
        : []

      if (matchesTitle || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        })
      }

      return acc
    }, [])
  }

  const refresh = () => {
    loadProviders()
    setExpandedKeys([])
    setSearchQuery('')
  }

  return (
    <div className="tag-browser">
      <div className="tag-browser-header">
        <h3>Tag Browser</h3>
        <button onClick={refresh} className="refresh-btn" title="Refresh">
          ↻
        </button>
      </div>

      <div className="tag-browser-search">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="tag-browser-content">
        {error && (
          <div className="tag-browser-error">
            {error}
            <button onClick={loadProviders}>Retry</button>
          </div>
        )}

        {loading && <div className="tag-browser-loading">Loading providers...</div>}

        {!loading && !error && treeData.length === 0 && (
          <div className="tag-browser-empty">
            <p>No tag providers found</p>
            <p className="hint">Configure tag providers in Gateway</p>
          </div>
        )}

        {!loading && !error && treeData.length > 0 && (
          <Tree
            className="tag-tree"
            treeData={filteredTreeData}
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            onSelect={onSelect}
            draggable
            onDragStart={onDragStart}
            showIcon={false}
            titleRender={(node: any) => (
              <span className="tag-node">
                <span className="tag-icon">{node.icon}</span>
                <span className="tag-title">{node.title}</span>
                {node.tagType && (
                  <span className="tag-type">{node.tagType}</span>
                )}
              </span>
            )}
          />
        )}
      </div>

      <div className="tag-browser-footer">
        <span className="tag-count">
          {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
        </span>
      </div>
    </div>
  )
}

export default TagBrowser
