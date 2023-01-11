import * as React from 'react'
import JSONEditor from 'jsoneditor'
import { useInjection } from 'qn-fe-core/di'

import { Alert, Drawer, DrawerFooter } from 'react-icecream-2'
import { SettingIcon } from 'react-icecream-2/icons'

import { ConfigStore } from 'kodo/stores/config'
import { combinedConfig } from 'kodo/stores/config/schema'
import { convertToStandard } from 'kodo/stores/config/utils'

import { ImportConfigButton } from './import'
import { ExportDropdown } from './export'

import styles from './style.m.less'
import 'jsoneditor/dist/jsoneditor.css'

interface JsonEditorProps<T extends {}> {
  value: T | null
  onCreateEditor: (v: JSONEditor) => void
}

function JsonEditor<T extends {}>(props: JsonEditorProps<T>) {
  const { value, onCreateEditor } = props
  const editorInstanceRef = React.useRef<JSONEditor | null>(null)
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (container == null) return
    if (editorInstanceRef.current == null) {
      editorInstanceRef.current = new JSONEditor(container, {
        schema: convertToStandard(combinedConfig),
        modes: ['form', 'code'],
        mode: 'form'
      }, value)

      onCreateEditor(editorInstanceRef.current)
    }

    editorInstanceRef.current.set(value)
    const currentEditorInstance = editorInstanceRef.current
    return () => {
      editorInstanceRef.current = null
      currentEditorInstance.destroy()
    }
  }, [container, onCreateEditor, value])

  return (<div className={styles.editor} ref={ref => setContainer(ref)}></div>)
}

// 仅用于开发环境下方便修改本地配置
function ConfigEditor() {
  const configStore = useInjection(ConfigStore)
  const [visible, setVisible] = React.useState(false)
  const editorInstanceRef = React.useRef<JSONEditor | null>(null)
  const [importedConfig, setImportedConfig] = React.useState(null)

  const handleUpdate = React.useCallback(async () => {
    if (editorInstanceRef.current == null) return
    const newConfig = editorInstanceRef.current.get()
    configStore.updateFullConfig(newConfig)
    setVisible(false)
  }, [configStore])

  const handleGetCurrentConfig = React.useCallback(() => {
    if (editorInstanceRef.current == null) return ''
    const newConfig = editorInstanceRef.current.get()
    return JSON.stringify(newConfig, undefined, 2)
  }, [])

  const footerView = React.useMemo(() => (
    <div className={styles.drawerFooter}>
      <ImportConfigButton onUpdate={v => setImportedConfig(v)} />
      <span>
        <DrawerFooter okText="确定更新" />
        <ExportDropdown getCurrentConfig={handleGetCurrentConfig} />
      </span>
    </div>
  ), [handleGetCurrentConfig])

  return (
    <div>
      <div
        className={styles.openEditor}
        onClick={() => setVisible(v => !v)}
      >
        <SettingIcon className={styles.icon} />
        配置调试
      </div>
      <Drawer
        width={800}
        title="配置调试"
        visible={visible}
        footer={footerView}
        onOk={handleUpdate}
        className={styles.drawer}
        onCancel={() => setVisible(false)}
      >
        <div className={styles.drawerContent}>
          <Alert
            icon
            type="warning"
            className={styles.alert}
            message="调试工具的更新效果仅作用于本地环境，刷新之后改动即会丢失哦 😯"
          />
          <JsonEditor
            value={importedConfig || configStore.normalizedConfig}
            onCreateEditor={editor => { editorInstanceRef.current = editor }}
          />
        </div>
      </Drawer>
    </div>
  )
}

export default function DevTools() {
  return (
    <div className={styles.devtools}>
      <ConfigEditor />
    </div>
  )
}
