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
import { Modal } from 'react-icecream'

import { useData } from 'components/lowcode/ProjectList/useData'

import { Platform, ProjectInfo } from './type'

import './style.less'

// 在这里通过将 Table 赋值给 BucketTable 对所需的泛型进行声明（Bucket）
// 这样后续在使用 BucketTable 时 TS 会结合 Bucket 类型进行检查
const BucketTable: TableType<ProjectInfo> = Table

const prefixCls = 'lowcode-project-list'

const sceneTypeOptions = [
  <Option key={1} value={1}>视频营销/统一消息推送</Option>
]
const platformOptions = [
  <Option key="all" value="all">所有端</Option>,
  <Option key="Android" value="Android">Android</Option>,
  <Option key="iOS" value="iOS">iOS</Option>
]

const sceneMap = {
  1: '视频营销/统一消息推送'
}

export function LowcodeProjectList() {
  const [searchSceneType, setSearchSceneType] = useState<number>(1)
  const [searchPlatform, setSearchPlatform] = useState<Platform | 'all'>('all')
  const [downloadsPath, setDownloadsPath] = useState('')

  const [originalRecords, setOriginalRecords] = useState<ProjectInfo[]>([])
  const [filteredOriginalRecords, setFilteredOriginalRecords] = useState<ProjectInfo[]>([])
  const { records, loading, currentPage, pageSize, total, setPageInfo, setLoading } = useData(filteredOriginalRecords)

  const [searchProjectName, setSearchProjectName] = useState('')

  /**
   * 从 electron main 进程获取下载路径
   */
  useEffect(() => {
    window.electronBridgeApi.getDownloadsPath().then(value => {
      setDownloadsPath(value)
    })
  }, [])

  /**
   * 从缓存中读取项目列表
   */
  useEffect(() => {
    try {
      const list: ProjectInfo[] = JSON.parse(window.localStorage.getItem('projectList') || '[]')
      setOriginalRecords(list)
      setFilteredOriginalRecords(list)
    } catch (e) {
      Modal.error({
        title: '项目列表数据读取失败',
        content: e.message
      })
    }
  }, [])

  /**
   * 打开编辑器
   * @param type
   * @param record
   */
  const onOpenEditor = (type: Platform, record: ProjectInfo) => {
    window.electronBridgeApi.openEditor({
      platform: type,
      filePath: `${downloadsPath}/${record.name}`
    })
  }

  /**
   * 搜索
   */
  const onSearch = async () => {
    setLoading(true)
    const list = originalRecords
      .filter(item => item.sceneType === searchSceneType)
      .filter(item => {
        if (!searchPlatform || searchPlatform === 'all') return true
        return item.platform.includes(searchPlatform)
      })
      .filter(item => item.name.includes(searchProjectName))
    await new Promise(resolve => setTimeout(resolve, 300))
    setLoading(false)
    setFilteredOriginalRecords(list)
  }

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-header`}>
        <h1>应用管理</h1>

        <div className={`${prefixCls}-header-right`}>
          <Select
            style={{ width: 200 }}
            value={searchSceneType}
            onChange={(value: number) => {
              setSearchSceneType(value)
              onSearch()
            }}
          >
            {sceneTypeOptions}
          </Select>

          <Select
            style={{ width: 200 }}
            value={searchPlatform}
            onChange={(value: Platform | 'all') => {
              setSearchPlatform(value)
              onSearch()
            }}
          >
            {platformOptions}
          </Select>

          <TextInput
            style={{ width: 240 }}
            placeholder="请输入项目名称"
            suffix={<SearchThinIcon />}
            value={searchProjectName}
            onChange={value => setSearchProjectName(value)}
            inputProps={{
              onKeyPress: event => {
                if (event.key.toLowerCase() === 'enter') {
                  onSearch()
                }
              }
            }}
          />
        </div>
      </div>
      <BucketTable
        records={records}
        loading={loading}
        pagination={{ currentPage, pageSize, total, onChange: setPageInfo }}
        columns={[
          {
            title: '项目名称',
            render: (_, record) => <div>
              <div style={{ fontWeight: 500 }}>{record.name}</div>
              <div style={{ fontWeight: 400 }}>{record.description}</div>
            </div>
          },
          {
            title: '链路',
            render: (_value, record) => <Link style={{ wordBreak: 'break-all' }}>{downloadsPath}/{record.name}</Link>
          },
          {
            title: '场景分类',
            accessor: 'sceneType',
            render: value => sceneMap[value] || '未知'
          },
          {
            title: '应用ID',
            accessor: 'appId'
          },
          {
            title: '创建时间',
            accessor: 'createTime',
            render: value => moment(value).format('YYYY-MM-DD HH:mm:ss')
          },
          {
            title: '端类型',
            accessor: 'platform',
            render: value => value.join('、')
          },
          {
            title: '操作',
            render: (_, record) => <Dropdown
              trigger="click"
              overlay={
                <Menu>
                  {record.platform?.includes('Android') && <MenuItem onClick={() => onOpenEditor('Android', record)}>Android</MenuItem>}
                  {record.platform?.includes('iOS') && <MenuItem onClick={() => onOpenEditor('iOS', record)}>iOS</MenuItem>}
                </Menu>
              }
            >
              <Button type="link" endIcon={<DownThinIcon />}>编译项目</Button>
            </Dropdown>
          }
        ]}
      />
    </div>
  )
}
