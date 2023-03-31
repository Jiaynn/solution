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

import { Platform } from 'utils/electron'
import { useData } from 'components/lowcode/ProjectList/useData'

import { ProjectInfo } from './type'

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
const platformMap = {
  ios: 'iOS',
  android: 'Android'
}

export function LowcodeProjectList() {
  const [searchSceneType, setSearchSceneType] = useState<number>(1)
  const [searchPlatform, setSearchPlatform] = useState<Platform | 'all'>('all')

  const [originalRecords, setOriginalRecords] = useState<ProjectInfo[]>([])
  const [filteredOriginalRecords, setFilteredOriginalRecords] = useState<ProjectInfo[]>([])
  const { records, loading, currentPage, pageSize, total, setPageInfo, setLoading } = useData(filteredOriginalRecords)

  const [searchProjectName, setSearchProjectName] = useState('')

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
    const packageInfo = record.package[type.toLowerCase()]
    console.log('packageInfo', packageInfo)
    window.electronBridgeApi.unzip(
      packageInfo?.fileName,
      packageInfo?.filePath
    ).then(() => {
      Modal.success({
        content: '解压成功'
      })
      return window.electronBridgeApi.openEditor({
        platform: type,
        filePath: `${packageInfo?.filePath.replace('.zip', '')}`
      })
    }).then(() => {
      Modal.success({
        content: '打开编辑器成功'
      })
    }).catch(error => {
      Modal.error({
        title: '打开编辑器失败',
        content: error.message
      })
    })
  }

  /**
   * 搜索
   */
  const onSearch = async (info: {
    sceneType?: number
    platform?: Platform | 'all'
    projectName?: string
  }) => {
    const {
      sceneType, projectName, platform
    } = info
    setLoading(true)
    const list = originalRecords
      .filter(item => item.sceneType === sceneType)
      .filter(item => {
        if (!platform || platform === 'all') return true
        return !!item.package[platform.toLowerCase()]
      })
      .filter(item => item.name.includes(projectName || ''))
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
              onSearch({
                projectName: searchProjectName,
                platform: searchPlatform,
                sceneType: value
              })
            }}
          >
            {sceneTypeOptions}
          </Select>

          <Select
            style={{ width: 200 }}
            value={searchPlatform}
            onChange={(value: Platform | 'all') => {
              setSearchPlatform(value)
              onSearch({
                projectName: searchProjectName,
                platform: value,
                sceneType: searchSceneType
              })
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
                  onSearch({
                    projectName: searchProjectName,
                    platform: searchPlatform,
                    sceneType: searchSceneType
                  })
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
            render: (_value, record: ProjectInfo) => {
              const { android, ios } = record.package
              const androidLink = android?.filePath?.replace(`/${android?.fileName}`, '')
              const iosLink = ios?.filePath?.replace(`/${ios?.fileName}`, '')

              return (
                <div>
                  {
                    android && <div>
                      Android: <Link
                        style={{ wordBreak: 'break-all' }}
                        onClick={() => window.electronBridgeApi.openFile(androidLink || '')}
                      >{androidLink}</Link>
                    </div>
                  }
                  {
                    ios && <div>
                      iOS: <Link
                        style={{ wordBreak: 'break-all' }}
                        onClick={() => window.electronBridgeApi.openFile(iosLink || '')}
                      >{iosLink}</Link>
                    </div>
                  }
                </div>
              )
            }
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
            accessor: 'package',
            render: value => {
              const result: string[] = []
              if (value.android) {
                result.push(platformMap.android)
              }
              if (value.ios) {
                result.push(platformMap.ios)
              }
              return result.join('、')
            }
          },
          {
            title: '操作',
            render: (_, record: ProjectInfo) => <Dropdown
              trigger="click"
              overlay={
                <Menu>
                  {record.package.android && <MenuItem onClick={() => onOpenEditor('android', record)}>Android</MenuItem>}
                  {record.package.ios && <MenuItem onClick={() => onOpenEditor('ios', record)}>iOS</MenuItem>}
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
