/*
 * @file component Cert of SSLOverview
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { Observer, observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import Table, { SorterResult } from 'react-icecream/lib/table'
import ToolTip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import Modal from 'react-icecream/lib/modal'

import { useTranslation } from 'portal-base/common/i18n'
import { ToasterStore } from 'portal-base/common/toaster'
import { Link, apps, basenameMap } from 'portal-base/common/router'

import { sslType } from '../../../constants/ssl'
import { humanizeTime } from '../../../utils/base'
import { shortNameToInfo, canRenew } from '../../../utils/certificate'
import EditableCell from '../../EditableCell'
import { ICertInfo } from '../../../apis/ssl'
import { CertOperationsRenderer } from '../ColumnRenderers'
import { isOEM } from '../../../constants/env'
import DownloadCertModal from '../DownloadCertModal'
import StateStore from './store'
import Search from './Search'
import * as messages from './messages'

import './style.less'

export interface ICertProps {
  store: StateStore
}

const Column = Table.Column

export default observer(function _CertOverview({ store }: ICertProps) {
  const toasterStore = useInjection(ToasterStore)

  const handleTableChange = React.useCallback((_pagination, _filters, sorter: SorterResult<ICertInfo>) => {
    store.updateSortedInfo(sorter)
  }, [store])

  const t = useTranslation()

  return (
    <>
      <Search state={store.searchState} onSearch={() => store.updateSearchOptions()} />
      <Table
        dataSource={store.sslcerts.slice()}
        pagination={store.pagination}
        rowKey={(record: ICertInfo) => record.certid}
        loading={store.isLoading}
        onChange={handleTableChange}
      >
        <Column
          title={t(messages.certId)}
          dataIndex="certid"
          key="certs.certid"
          render={certid => certid || '-'}
        />
        <Column<ICertInfo>
          title={t(messages.certRemark)}
          dataIndex="name"
          key="certs.name"
          render={(text, record, index) => <Observer render={() => (
            <EditableCell
              value={text}
              editable={!!store.certNameEditableMap.get(record.certid)}
              onChange={value => {
                const textValue = value.trim()
                if (textValue === '' || !/^[a-zA-Z0-9_\s\-*.()\u4e00-\u9fa5]+$/.test(textValue)) {
                  const errorStr = textValue === '' ? '备注名不能为空，请修改后重试' : '备注名含有非法字符，请输入中英文字符、数字、空格、_、-、*、.、()'
                  toasterStore.error(errorStr)
                  return Promise.reject('incorrect value')
                }
                return store.handleNameChange(index, record.certid, value)
              }}
              onCancel={() => store.handleCancelEdit(record.certid)} />)}
          />}
        />
        <Column
          title={t(messages.certCommonName)}
          dataIndex="common_name"
          key="certs.common_name"
          render={common_name => common_name || '-'}
        />
        {
          !isOEM && (
            <Column
              title="证书品牌"
              dataIndex="product_short_name"
              key="certs.brand"
              render={name => {
                if (!name) {
                  return '自有'
                }
                const info = shortNameToInfo(name)
                return (
                  <div style={{ lineHeight: '20px' }}>
                    {info.brand}<br />
                    {sslType[info.certType] != null ? `${sslType[info.certType].text}(${sslType[info.certType].code})` : '--'}
                  </div>
                )
              }}
            />
          )
        }
        <Column
          title={t(messages.issuedOn)}
          dataIndex="not_before"
          key="certs.not_before"
          sorter
          sortOrder={store.notBeforeSortOrder}
          render={not_before => humanizeTime(not_before, 'YYYY-MM-DD')}
        />
        <Column
          title={t(messages.expireAt)}
          dataIndex="not_after"
          key="certs.not_after"
          sorter
          sortOrder={store.notAfterSortOrder}
          render={(not_after, record: ICertInfo) => {
            const isAboutToExpire = canRenew(record.renewable)
            return (
              <span className={isAboutToExpire ? 'status-renewing' : ''}>
                { humanizeTime(not_after, 'YYYY-MM-DD') }
                {
                  isAboutToExpire && (
                    <ToolTip
                      placement="topLeft"
                      overlayClassName="tooltip"
                      arrowPointAtCenter
                      title="即将到期，请及时续费"
                    >
                      <Icon type="info-circle" className="status-icon" />
                    </ToolTip>
                  )
                }
              </span>
            )
          }}
        />
        <Column<ICertInfo>
          title={t(messages.operation)}
          dataIndex=""
          key="certs.operations"
          render={(_, record, index) => (
            <CertOperationsRenderer
              record={record}
              rowid={index}
              doOperation={info => store.handleOperation(info)}
            />
          )}
        />
      </Table>
      <Modal
        visible={store.domainBounded}
        onCancel={() => store.updateDomainBounded(false)}
        onOk={() => store.updateDomainBounded(false)}
      >
        <div className="modal-content">
          该证书已与<Link to={`${basenameMap[apps.fusionV2]}/domain`}> CDN 加速域名</Link>
          绑定，删除后会影响域名访问。<br />
          请先更换域名绑定的证书再进行删除。
        </div>
      </Modal>
      <Modal
        visible={store.storageBounded}
        onCancel={() => store.updateStorageBounded(false)}
        onOk={() => store.updateStorageBounded(false)}
      >
        <div className="modal-content">
          该证书已与<Link to={`/kodo/bucket/domain?bucketName=${store.boundedBucketName}`}> 存储源站域名 </Link>
          绑定，删除后会影响域名访问。<br />
          请先更换域名绑定的证书再进行删除。
        </div>
      </Modal>
      <DownloadCertModal store={store.downloadCertStore} />
    </>
  )
})
