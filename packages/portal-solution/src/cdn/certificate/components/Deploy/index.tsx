/*
 * @file component Deploy
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'

import { useLocalStore } from 'qn-fe-core/local-store'
import Table from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'
import Alert from 'react-icecream/lib/alert'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { ICertInfo } from 'portal-base/certificate'
import { Link } from 'portal-base/common/router'

import { DomainStatus, humanizeDomainStatus, CertExpireSort } from '../../constants/domain'
import { humanizeSSLDomainType, SSLDomainType } from '../../constants/ssl'
import { IDeployDomain, IDeployDomainCertInfo } from '../../apis/domain'
import PageWithBreadcrumb from '../Layout/PageWithBreadcrumb'
import DeployStore, { getRowKey } from './store'
import './style.less'

const { Column } = Table

export interface IDeployProps {
  id: string
}

export default observer(function _Deploy(props: IDeployProps) {
  const store = useLocalStore(DeployStore, props)
  return (
    <PageWithBreadcrumb>
      <div className="deploy-wrapper">
        <CertAlert cert={store.cert} />
        <div className="action">
          <Button
            type="primary"
            disabled={!store.selectedDomains || store.selectedDomains.length === 0}
            onClick={() => store.openBatchDeployModal()}
          >
            批量部署
          </Button>
          <span className="action-desc">已选中 <span className="domain-number">{store.selectedDomains && store.selectedDomains.length}</span> 项</span>
        </div>
        <Table
          rowKey={getRowKey}
          locale={{ emptyText: <span>暂无 CDN 域名可部署，<Link target="_blank" to="/cdn/domain/create">立即去创建</Link></span> }}
          pagination={store.pagination}
          dataSource={store.domains}
          rowSelection={{
            selections: true,
            selectedRowKeys: store.selectedRowKeys,
            getCheckboxProps: record => ({ disabled: getCannotDeployTip(record) }),
            onChange: (_, selectedList) => store.updateSelectedDomains(selectedList)
          }}
          onChange={(_, filter, sorter) => {
            // 更新 filter, 重置后，isCurrentCert 为空数组
            if (filter) {
              store.updateIsCurrentCert(
                filter.isCurrentCert == null || filter.isCurrentCert.length === 0
                ? undefined
                : (filter.isCurrentCert[0] === 'true' as any)
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
          }}
          loading={store.isLoading}
        >
          <Column
            title="域名"
            dataIndex="domainName"
            key="name"
            render={name => <Link to={`/cdn/domain/${name}`} target="_blank" rel="noopener">{name}</Link>}
          />
          <Column
            title="已部署本证书"
            dataIndex="isCurrentCert"
            key="isCurrentCert"
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
          <Column
            title="已部署其他证书"
            dataIndex="certInfo"
            key="certInfo"
            sorter
            render={(certInfo: IDeployDomainCertInfo) => {
              const isCurrentCert = !certInfo || certInfo.certId === store.cert.certid
              // expiredTime 格式为带时区的时间格式，日期和时间之间用 T 分隔，比如 2018-09-19T09:30:24+08:00
              const expireTime = certInfo && certInfo.expiredTime && moment(certInfo.expiredTime).format('YYYY-MM-DD')
              const hostMsg = isCurrentCert ? '否' : certInfo.certName
              return !expireTime ? hostMsg : hostMsg + ` 有效期至 ${expireTime}`
            }}
          />
          <Column
            title="操作"
            dataIndex="domainName"
            key="operation"
            render={(_: string, record: IDeployDomain) => {
              const cannotDeployTip = getCannotDeployTip(record)
              if (cannotDeployTip) {
                return (
                  <>
                    <Button type="link" disabled>部署</Button>
                    <Tooltip title={cannotDeployTip}><Icon className="tip-icon" type="info-circle" /></Tooltip>
                  </>
                )
              }
              return <Button type="link" onClick={() => store.openDeployModal(record)}>部署</Button>
            }}
          />
        </Table>
      </div>
    </PageWithBreadcrumb>
  )
})

interface ICertAlertProps {
  cert: ICertInfo
}

function CertAlert({ cert }: ICertAlertProps) {
  if (!cert) {
    return null
  }
  const domainTypeStr = humanizeSSLDomainType(cert.product_type as SSLDomainType)
  const domainMsg = domainTypeStr ? `${cert.name} ${domainTypeStr}` : cert.name

  return (
    <Alert
      className="deploy-notice"
      type="warning"
      message={
        <span className="cert-info">
          {domainMsg}，还有
          <span className="effect-days">
            {Math.floor((cert.not_after - Date.now() / 1000) / (3600 * 24))}
          </span>
          天过期，该证书适用于以下域名部署 CDN。
        </span>
      }
    />
  )
}

function getCannotDeployTip(record: IDeployDomain): string {
  if (!record.isCurrentCert && record.domainStatus === DomainStatus.Success) {
    return ''
  }
  return record.isCurrentCert ? '域名已经部署本证书，详情请点击域名查看' : `该域名状态为${humanizeDomainStatus(record.domainStatus)}，详情请点击域名查看`
}
