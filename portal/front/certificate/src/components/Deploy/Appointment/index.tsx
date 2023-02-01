
/**
 * @file component Deploy Appointment
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'

import { useLocalStore } from 'qn-fe-core/local-store'
import Table, { SorterResult } from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { Link } from 'portal-base/common/router'

import { DomainStatus, humanizeDomainStatus, CertExpireSort, CompleteType } from '../../../constants/domain'
import { IDeployDomainCertInfo, IDeployDomain } from '../../../apis/domain'
import { AppointmentForDisplayStore, AppointmentForEditStore, getRowKey } from './store'
import './style.less'

const { Column } = Table

export enum ComponentType {
  Display = 'display',
  Edit = 'edit'
}

export interface AppointmentForDisplayProps {
  certId?: string
  orderId: string
  dnsNames: string[]
  completeType: CompleteType
}

export interface AppointmentForEditProps extends AppointmentForDisplayProps {
  onChange: (value: string[]) => void
}

function isCompleted(type: CompleteType) {
  return type === CompleteType.Renew
}

const createHandleTableChange = (store: AppointmentForDisplayStore | AppointmentForEditStore) => (
  _: unknown, filter: any, sorter: SorterResult<IDeployDomain>
) => {
  // 更新 filter, 重置后，isCurrentCert 为空数组
  if (filter) {
    store.updateIsCurrentCert(
      filter.isCurrentCert == null || filter.isCurrentCert.length === 0
      ? undefined
      : (filter.isCurrentCert[0] === 'true')
    )
    store.updateCanDeploy(
      filter.status == null || filter.status.length === 0
      ? undefined
      : (filter.status[0] === 'true')
    )
  }
  // 更新 sorter，重置后，order 为空，默认为 asc
  if (sorter) {
    store.updateExpireSort(
      sorter.order && sorter.order !== 'ascend'
      ? CertExpireSort.Desc
      : CertExpireSort.Asc
    )
  }
}

const columnDomain = (
  <Column
    title="域名"
    dataIndex="domainName"
    key="name"
    render={name => <Link to={`/cdn/domain/${name}`} target="_blank" rel="noopener">{name}</Link>}
  />
)

const columnDeployed = (
  <Column
    title="是否部署过旧书"
    dataIndex="isCurrentCert"
    key="deployed"
    filterMultiple={false}
    filters={[
      {
        text: '是',
        value: 'true'
      },
      {
        text: '否',
        value: 'false'
      }
    ]}
    render={isCurrentCert => (isCurrentCert ? '是' : '否')}
  />
)

const columnCertName = (
  <Column
    title={
      <span>
        已部署证书
        <Tooltip title="若选择部署则会更换对应域名的已部署证书"><Icon className="tip-icon" type="info-circle" /></Tooltip>
      </span>
    }
    dataIndex="certInfo"
    key="certName"
    render={(certInfo: IDeployDomainCertInfo) => {
      if (!certInfo) {
        return '-'
      }
      return certInfo.certName
    }}
  />
)

const columnAppointment = (
  <Column
    title={
      <span>
        是否已经预约
        <Tooltip title="未预约域名可在签发后修改部署"><Icon className="tip-icon" type="info-circle" /></Tooltip>
      </span>
    }
    dataIndex="isOrdered"
    key="appointed"
    render={(isOrdered: boolean) => (isOrdered ? '是' : '否')}
  />
)

function ColumnCertValidityPeriodRenderer(certInfo: IDeployDomainCertInfo) {
  if (!certInfo || !certInfo.expiredTime) {
    return <>-</>
  }
  const currentUnixTime = moment(certInfo.expiredTime).unix()
  const diffDays = Math.floor((currentUnixTime - Date.now() / 1000) / (3600 * 24))
  // 已经过期
  if (diffDays < 0) {
    return <span className="validity-period-expire">已过期</span>
  }
  // 两个月内可以部署
  if (diffDays <= 60) {
    return <span className="validity-period-deploy">{diffDays} 天</span>
  }
  return <span className="validity-period-normal">{diffDays} 天</span>
}

const columnValidityPeriod = (
  <Column
    title="已部署证书有效期"
    dataIndex="certInfo"
    key="validityPeriod"
    sorter
    render={(certInfo: IDeployDomainCertInfo) => <ColumnCertValidityPeriodRenderer {...certInfo} />}
  />
)

interface ColumnStatusRendererProps {
  domainStatus: DomainStatus
  canDeploy: boolean
}

function ColumnStatusRenderer({ domainStatus, canDeploy }: ColumnStatusRendererProps) {
  if (!canDeploy) {
    const cannotDeployTip = getCannotDeployTip(domainStatus)
    return (
      <>
        <Button type="link" disabled>不可部署</Button>
        <Tooltip title={cannotDeployTip}><Icon className="tip-icon" type="info-circle" /></Tooltip>
      </>
    )
  }
  return <Button type="link">可部署</Button>
}

const columnStatus = (
  <Column
    title="状态"
    dataIndex="domainStatus"
    key="status"
    filterMultiple={false}
    filters={[
      {
        text: '可部署',
        value: 'true'
      },
      {
        text: '不可部署',
        value: 'false'
      }
    ]}
    render={
      (domainStatus: DomainStatus, { canDeploy }: IDeployDomain) => (
        <ColumnStatusRenderer domainStatus={domainStatus} canDeploy={canDeploy} />
      )
    }
  />
)

export const AppointmentForDisplay = observer(function _ForDisplay(props: AppointmentForDisplayProps) {
  const store = useLocalStore(AppointmentForDisplayStore, props)
  const completed = isCompleted(props.completeType)
  return (
    <div className="deploy-appointment-wrapper">
      <Table
        rowKey={getRowKey}
        locale={{ emptyText: <span>暂无 CDN 域名可部署，<Link target="_blank" to="/cdn/domain/create">立即去创建</Link></span> }}
        pagination={store.pagination}
        dataSource={store.domains}
        onChange={createHandleTableChange(store)}
        loading={store.isLoading}
      >
        { columnDomain }
        { completed && columnDeployed }
        { columnCertName }
        { columnAppointment }
      </Table>
    </div>
  )
})

export const AppointmentForEdit = observer(function _ForEdit(props: AppointmentForEditProps) {
  const store = useLocalStore(AppointmentForEditStore, props)
  const completed = isCompleted(props.completeType)

  const domainSelectionTip = (
    <div className="domain-selection-tip">
      <span className="tip-desc">
        您已选中 <span className="domain-number">{store.selectedDomains && store.selectedDomains.length}</span> 个域名
      </span>
      {
        !store.canSelectDomain && (
          <span className="tip-warn">为避免请求超时，一次部署域名数量设置上限50个。若用户域名超过50个，可在证书签发后部署CDN。</span>
        )
      }
    </div>
  )

  return (
    <div className="deploy-appointment-wrapper">
      <Table
        rowKey={getRowKey}
        locale={{ emptyText: <span>暂无 CDN 域名可部署，<Link target="_blank" to="/cdn/domain/create">立即去创建</Link></span> }}
        pagination={store.pagination}
        dataSource={store.domains}
        rowSelection={{
          selections: store.canSelectDomain,
          selectedRowKeys: store.selectedRowKeys,
          getCheckboxProps: record => ({ disabled: !record.canDeploy }),
          onChange: (_, selectedList) => store.updateSelectedDomains(selectedList)
        }}
        onChange={createHandleTableChange(store)}
        loading={store.isLoading}
      >
        { columnDomain }
        { completed && columnDeployed }
        { columnCertName }
        { columnValidityPeriod }
        { columnStatus }
      </Table>
      {
        store.domains.length > 0 && domainSelectionTip
      }
    </div>
  )
})

function getCannotDeployTip(domainStatus: DomainStatus): string {
  if (domainStatus === DomainStatus.Success) {
    return '域名已成功预约部署'
  }
  return `该域名状态为 ${humanizeDomainStatus(domainStatus)}`
}
