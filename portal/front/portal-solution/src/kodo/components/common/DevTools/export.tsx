import React from 'react'
import { saveAs } from 'file-saver'
import { Button, Dropdown, Menu, MenuItem } from 'react-icecream-2'

// @types/json-schema-md-doc 类型不太对就没有安装
import { JSONSchemaMarkdown } from 'json-schema-md-doc'

import { convertToStandard } from 'kodo/stores/config/utils'
import { combinedConfig } from 'kodo/stores/config/schema'

import pkg from '../../../../../package.json'

class QiniuJSONSchemaMarkdown extends JSONSchemaMarkdown {
  constructor() {
    super()
    this.footer = `\n _provide to portal-kodo-front(${pkg.version})._`
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private footer: string
  writePath() { /** */ } // 不要输出 path
  writeAdditionalProperties() { /** */ } // 不要输出 AdditionalProperties 说明
  load(schema: any) { return super.load(schema) }
  generate() { return super.generate() }
}

interface DownloadButtonProps {
  data?: string
  name: string
  getData?: () => string
}

function DownloadButton(props: React.PropsWithChildren<DownloadButtonProps>) {
  const handleClick = () => {
    const data = props.getData != null ? props.getData() : props.data
    const blob = new Blob([data || ''], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, props.name)
  }

  return (
    <Button type="link" onClick={handleClick}>
      {props.children}
    </Button>
  )
}

function DownloadMarkdown() {
  const data = React.useMemo<string>(() => {
    const schemaMarkdown = new QiniuJSONSchemaMarkdown()
    schemaMarkdown.load(JSON.stringify(convertToStandard(combinedConfig)))
    return schemaMarkdown.generate()
  }, [])

  return (
    <DownloadButton data={data} name={`portal-kodo-front-config-document@${pkg.version}.md`}>
      配置说明文档（md）
    </DownloadButton>
  )
}

function DownloadJsonSchema() {
  const data = React.useMemo<string>(() => (
    JSON.stringify(convertToStandard(combinedConfig), undefined, 2)
  ), [])

  return (
    <DownloadButton data={data} name={`portal-kodo-front-config-schema@${pkg.version}.json`}>
      配置描述文档（json schema）
    </DownloadButton>
  )
}

interface DownloadCurrentConfigProps {
  getCurrentConfig: () => string
}

function DownloadCurrentConfig(props: DownloadCurrentConfigProps) {
  return (
    <DownloadButton getData={props.getCurrentConfig} name={`portal-kodo-front-config@${pkg.version}.json`}>
      当前配置（json）
    </DownloadButton>
  )
}

interface ExportDropdownProps extends DownloadCurrentConfigProps {}

export function ExportDropdown(props: ExportDropdownProps) {
  const overlay = (
    <Menu>
      <MenuItem>
        <DownloadCurrentConfig getCurrentConfig={props.getCurrentConfig} />
      </MenuItem>
      <MenuItem>
        <DownloadMarkdown />
      </MenuItem>
      <MenuItem>
        <DownloadJsonSchema />
      </MenuItem>
    </Menu>
  )
  return (
    <Dropdown trigger="hover" overlay={overlay}>
      <Button type="secondary">导出</Button>
    </Dropdown>
  )
}
