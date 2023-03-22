import * as React from 'react'
import {
  TextInput,
  Table,
  TableType,
  Dropdown,
  Menu,
  MenuItem,
  Button,
  Select,
  SelectOption as Option,
  Link
} from 'react-icecream-2'
import { DownThinIcon, SearchThinIcon } from 'react-icecream-2/icons'
import moment from 'moment'
import { useEffect, useState } from 'react'

import { Platform, Record } from './type'

import './style.less'

// 在这里通过将 Table 赋值给 BucketTable 对所需的泛型进行声明（Bucket）
// 这样后续在使用 BucketTable 时 TS 会结合 Bucket 类型进行检查
const BucketTable: TableType<Record> = Table

const records: Record[] = [
  {
    name: 'demo-1.0.1',
    description: '双十一大促_电商直播_tracecode1',
    linkPath: '',
    scene: '视频营销/统一消息推送',
    appId: 'tracecode1',
    updateTime: 1605600000000,
    platform: 'Android、iOS'
  },
  {
    name: 'demo-1.0.1',
    description: '双十一大促_电商直播_tracecode1',
    linkPath: '',
    scene: '视频营销/统一消息推送',
    appId: 'tracecode1',
    updateTime: 1605600000000,
    platform: 'Android、iOS'
  }
]

const prefixCls = 'lowcode-project-list'

const sceneOptions = [
  <Option key="1" value="1">视频营销/统一消息推送</Option>
]
const platformOptions = [
  <Option key="all" value="all">所有端</Option>,
  <Option key="Android" value="Android">Android</Option>,
  <Option key="iOS" value="iOS">iOS</Option>
]

export function ProjectList() {
  const [scene, setScene] = useState<string | null>(null)
  const [platform, setPlatform] = useState<string | null>(null)
  const [downloadsPath, setDownloadsPath] = useState('')

  useEffect(() => {
    window.electronBridgeApi.getDownloadsPath().then(value => {
      setDownloadsPath(value)
    })
  }, [])

  const onOpenEditor = (type: Platform, record: Record) => {
    window.electronBridgeApi.openEditor({
      platform: type,
      filePath: `${downloadsPath}/${record.name}`
    })
  }

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-header`}>
        <h1>应用管理</h1>

        <div className={`${prefixCls}-header-right`}>
          <Select style={{ width: 200 }} value={scene} onChange={value => setScene(value)}>
            {sceneOptions}
          </Select>

          <Select style={{ width: 200 }} value={platform} onChange={value => setPlatform(value)}>
            {platformOptions}
          </Select>

          <TextInput style={{ width: 240 }} placeholder="请输入项目名称" suffix={<SearchThinIcon />} />
        </div>
      </div>
      <BucketTable records={records}>
        <BucketTable.Column
          title="项目名称"
          render={(_, record) => <div>
            {record.icon}
            {record.name}
            {record.description}
          </div>}
        />
        <BucketTable.Column
          title="链路"
          accessor="linkPath"
          render={(_value, record) => <Link>{downloadsPath}/{record.name}</Link>}
        />
        <BucketTable.Column
          title="场景分类"
          accessor="scene"
        />
        <BucketTable.Column
          title="应用ID"
          accessor="appId"
        />
        <BucketTable.Column
          title="更新时间"
          accessor="updateTime"
          render={value => moment(value).format('YYYY-MM-DD HH:mm:ss')}
        />
        <BucketTable.Column
          title="端类型"
          accessor="platform"
        />
        <BucketTable.Column
          title="操作"
          render={(_, record) => <Dropdown
            trigger="click"
            overlay={
              <Menu>
                <MenuItem onClick={() => onOpenEditor('Android', record)}>Android</MenuItem>
                <MenuItem onClick={() => onOpenEditor('iOS', record)}>iOS</MenuItem>
              </Menu>
            }
          >
            <Button type="link" endIcon={<DownThinIcon />}>编译项目</Button>
          </Dropdown>}
        />
      </BucketTable>
    </div>
  )
}
