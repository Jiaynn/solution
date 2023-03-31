import React, { useState } from 'react'
import {
  Button,
  Divider,
  Dropdown,
  Input,
  Menu,
  Select,
  Spin,
  Table
} from 'react-icecream'

import { observer } from 'mobx-react'

import { withQueryParams } from 'qn-fe-core/utils'

import moment from 'moment'

import { PaginationProps } from 'react-icecream/lib/pagination'

import { ButtonProps } from 'react-icecream/lib/button'

import { useLocalStore } from 'qn-fe-core/local-store'

import { useMount } from 'ahooks'

import PageContainer from '../common/PageContainer'
import {
  AppListItem,
  AppPackingStatusLabel,
  AppPackStatusId,
  AppScenariosId,
  AppStatus
} from 'apis/_types/interactMarketingType'

import styles from './style.m.less'
import DownloadModal, { ModalContext } from '../common/DownloadModal'
import useInteractMarketingRouter from '../../../routes/useLowcodeRouter'
import AppListStore from './store'

import Refresh from './Refresh'

const { Column } = Table as any

const BtnDownload: React.FC<
  {
    packed: boolean
    onRefresh: () => void
  } & ButtonProps
> = props => {
  const { packed, onRefresh, ...params } = props
  return (
    <span>
      <a {...params} type="link">
        {packed ? '下载源文件' : AppPackingStatusLabel.Packing}
      </a>
      {!packed && <Refresh onRefresh={onRefresh} />}
    </span>
  )
}

export interface AppListProps {}

export default observer(function AppList(_props: AppListProps) {
  const router = useInteractMarketingRouter()
  const store = useLocalStore(AppListStore)
  const { pageSize } = store.query
  const { loading, curId } = store
  const { list, total_count: total } = store.data

  useMount(() => {
    store.fetchIsOpenSolution().then(() => {
      if (!store.isOpenSolution) {
        router.toOpenService()
      }
    })
  })

  const onAppNameInput: React.ChangeEventHandler<HTMLInputElement> = e => {
    const value = (e.target as HTMLInputElement).value
    store.updateQuery({
      ...store.query,
      appName: value
    })
  }

  const onScenariosInput = (value: AppScenariosId) => {
    store.updateQuery({
      ...store.query,
      scenarios: value
    })
  }

  const onClickBtnSearch = () => {
    store.search()
  }

  const onClickBtnReset = () => {
    store.resetData()
  }

  const onTableChange = (pagination: PaginationProps) => {
    store.updateQuery({
      ...store.query,
      pageNum: pagination.current || 1,
      pageSize: pagination.pageSize || 10
    })
    store.search()
  }

  const onClickAppInfo = (appId: string) => {
    router.toAppInfo(appId)
  }

  const onClickAppCreate = () => {
    router.toAppCreate()
  }

  const toPiliUsage = (hub: string) => {
    window.open(
      withQueryParams('https://portal.qiniu.com/pili/statistics/usage/flow', {
        hub
      }),
      '_blank'
    )
  }

  const toRtcUsage = (appId: string) => {
    window.open(
      withQueryParams('https://portal.qiniu.com/rtn/statistics/rtc', { appId }),
      '_blank'
    )
  }

  const onClickAppEdit = (appId: string) => {
    router.toAppEdit(appId)
  }

  const [visible, setVisible] = useState(false)
  const onClickDownload = (appId: string) => {
    store.updateCurId(appId)
    setVisible(true)
  }

  return (
    <PageContainer title="应用管理">
      <ModalContext.Provider value={{ visible, setVisible }}>
        <DownloadModal appId={curId} />
      </ModalContext.Provider>

      <div className={styles.filterBar}>
        <div className={styles.title}>应用名称：</div>
        <div className={styles.inputAppName}>
          <Input
            placeholder="请输入"
            allowClear
            value={store.query.appName}
            onChange={onAppNameInput}
          />
        </div>
        <div className={styles.title}>应用场景：</div>
        <div className={styles.inputScenarios}>
          <Select
            placeholder="请选择"
            style={{ width: '24rem' }}
            value={store.query.scenarios}
            onChange={onScenariosInput}
            allowClear
          >
            <Select.Option value={AppScenariosId.Ecommerce}>
              电商直播
            </Select.Option>
            <Select.Option value={AppScenariosId.Interact}>
              互动直播
            </Select.Option>
          </Select>
        </div>

        <Button
          className={styles.btnSearch}
          type="primary"
          onClick={onClickBtnSearch}
        >
          查询
        </Button>
        <Button onClick={onClickBtnReset}>重置</Button>
      </div>

      <Button
        className={styles.btnCreateApp}
        icon="plus"
        type="primary"
        title="新建应用"
        onClick={onClickAppCreate}
      >
        新建应用
      </Button>

      <Spin spinning={loading}>
        <Table
          rowKey={row => row.appId}
          dataSource={list}
          onChange={onTableChange}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSize,
            total,
            pageSizeOptions: ['10', '20', '50']
          }}
        >
          <Column<AppListItem> title="应用ID" dataIndex="appId" key="appId" />
          <Column<AppListItem>
            title="应用名称"
            dataIndex="appName"
            key="appName"
          />
          <Column<AppListItem>
            title="应用场景"
            dataIndex="appScenarios"
            key="appScenarios"
          />
          <Column<AppListItem>
            title="集成方式"
            dataIndex="integrationWay"
            key="integrationWay"
          />
          <Column<AppListItem>
            title="配置状态"
            dataIndex="status"
            key="status"
            filters={[
              {
                text: '完成',
                value: '完成'
              },
              {
                text: '未完成',
                value: '未完成'
              }
            ]}
            width="7rem"
            filterMultiple={false}
            onFilter={(value, record) => record.status === value}
          />
          <Column<AppListItem>
            title="创建时间"
            render={value =>
              moment.unix(Math.round(value)).format('YYYY-MM-DD HH:mm:ss')
            }
            dataIndex="createTime"
            key="createTime"
            sorter={(a, b) => Number(a.createTime) - Number(b.createTime)}
          />
          <Column<AppListItem>
            title="操作"
            dataIndex="operation"
            render={(_text, record) => {
              const { appId, hub, status, packStatus } = record
              return (
                <span>
                  <Button type="link" onClick={() => onClickAppInfo(appId)}>
                    应用详情
                  </Button>
                  <Divider type="vertical" />

                  <Button type="link" onClick={() => onClickAppEdit(appId)}>
                    编辑应用
                  </Button>
                  <Divider type="vertical" />

                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item onClick={() => toPiliUsage(hub)}>
                          视频直播
                        </Menu.Item>
                        <Menu.Item onClick={() => toRtcUsage(appId)}>
                          实时音视频
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <a> 查看用量 </a>
                  </Dropdown>
                  <Divider type="vertical" />

                  <span>
                    <BtnDownload
                      onClick={() => onClickDownload(appId)}
                      disabled={
                        status === AppStatus.UnCompleted ||
                        packStatus !== AppPackStatusId.PackCompleted
                      }
                      packed={packStatus === AppPackStatusId.PackCompleted}
                      onRefresh={() => {
                        store.search()
                      }}
                    />
                  </span>
                </span>
              )
            }}
          />
        </Table>
      </Spin>
    </PageContainer>
  )
})
