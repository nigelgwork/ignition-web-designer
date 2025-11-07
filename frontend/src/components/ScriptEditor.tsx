import { useState, useEffect, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import '../styles/ScriptEditor.css'

interface ScriptEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (script: string) => void
  initialScript?: string
  scriptType?: 'component' | 'transform' | 'project' | 'gateway'
  language?: 'python' | 'javascript'
  title?: string
  readOnly?: boolean
}

const ScriptEditor = ({
  isOpen,
  onClose,
  onSave,
  initialScript = '',
  scriptType = 'component',
  language = 'python',
  title = 'Script Editor',
  readOnly = false
}: ScriptEditorProps) => {
  const [script, setScript] = useState(initialScript)
  const [hasChanges, setHasChanges] = useState(false)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)

  useEffect(() => {
    setScript(initialScript)
    setHasChanges(false)
  }, [initialScript, isOpen])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Configure Python/Jython autocomplete
    if (language === 'python') {
      configurePythonAutocomplete(monaco)
    }

    // Focus editor
    editor.focus()
  }

  const configurePythonAutocomplete = (monaco: Monaco) => {
    // Register Ignition-specific completion items
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          // System functions
          {
            label: 'system.tag.readBlocking',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'system.tag.readBlocking([${1:tagPath}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Read tag values blocking'
          },
          {
            label: 'system.tag.writeBlocking',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'system.tag.writeBlocking([${1:tagPath}], [${2:value}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Write tag values blocking'
          },
          {
            label: 'system.db.runQuery',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'system.db.runQuery("${1:query}", "${2:database}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Execute database query'
          },
          {
            label: 'system.perspective.print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'system.perspective.print(${1:message})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print to session console'
          },
          {
            label: 'system.perspective.navigate',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'system.perspective.navigate(${1:pageUrl})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Navigate to page'
          },
          // Component event properties
          {
            label: 'self',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'self',
            documentation: 'Reference to current component'
          },
          {
            label: 'self.props',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'self.props.${1:propertyName}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Access component property'
          },
          {
            label: 'self.custom',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'self.custom.${1:customProperty}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Access custom component property'
          },
          {
            label: 'event',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'event',
            documentation: 'Event object'
          }
        ]

        return { suggestions }
      }
    })
  }

  const handleChange = (value: string | undefined) => {
    if (value !== undefined && value !== initialScript) {
      setScript(value)
      setHasChanges(true)
    } else if (value === initialScript) {
      setHasChanges(false)
    }
  }

  const handleSave = () => {
    onSave(script)
    setHasChanges(false)
  }

  const handleCancel = () => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirm) return
    }
    setScript(initialScript)
    setHasChanges(false)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (!readOnly) {
        handleSave()
      }
    }
    // Escape to close
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div className="script-editor-overlay" onKeyDown={handleKeyDown}>
      <div className="script-editor-modal">
        <div className="script-editor-header">
          <div className="script-header-left">
            <h2>{title}</h2>
            <span className="script-type-badge">{scriptType}</span>
            <span className="script-language-badge">{language}</span>
            {hasChanges && <span className="script-modified-indicator">●</span>}
          </div>
          <button
            onClick={handleCancel}
            className="close-btn"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <div className="script-editor-body">
          <Editor
            height="100%"
            defaultLanguage={language}
            value={script}
            onChange={handleChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: false,
              wordWrap: 'on',
              readOnly: readOnly,
              lineNumbers: 'on',
              folding: true,
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              suggest: {
                showKeywords: true,
                showSnippets: true
              }
            }}
          />
        </div>

        <div className="script-editor-footer">
          <div className="script-footer-info">
            <span className="script-lines-info">
              {script.split('\n').length} lines
            </span>
            {language === 'python' && (
              <span className="script-hint">
                💡 Type "system." for Ignition API suggestions
              </span>
            )}
          </div>
          <div className="btn-group">
            <button
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            {!readOnly && (
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={!hasChanges}
                title="Save (Ctrl+S)"
              >
                {hasChanges ? 'Save *' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScriptEditor
