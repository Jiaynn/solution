/*
 * @file 刷新预取操作记录
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React from 'react'
import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'
import { assign, trim } from 'lodash'
import { useLocalStore } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Table from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'
import { PaginationProps } from 'react-icecream/lib/pagination'
import Radio from 'react-icecream/lib/radio'
import { useTranslation } from 'portal-base/common/i18n'

import { humanizeRPState } from 'cdn/transforms/refresh-prefetch'

import { defaultQueryParam } from 'cdn/constants/refresh-prefetch'

import RefreshPrefetchApis, { TRPLog, IQueryLogParam, ILogItem, ILogResult, IsDir } from 'cdn/apis/refresh-prefetch'

import * as messages from './messages'

import RefreshSVG from './refresh.svg'
import './style.less'

const FormItem = Form.Item
const Column = Table.Column

enum LoadingType {
  LoadLog = 'loadLog'
}

@injectable()
class LocalStore extends Store {

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable pageSize = 10
  @observable logType: TRPLog = 'refresh'
  @observable.ref queryLogParam: IQueryLogParam = { ...defaultQueryParam, pageSize: this.pageSize }
  @observable.ref logResult?: ILogResult
  @observable searchUrlForDisplay = ''
  @observable searchUrlForSubmit = ''

  constructor(
    private toasterStore: Toaster,
    private refreshPrefetchApis: RefreshPrefetchApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed
  get isLoadingLog() {
    return this.loadings.isLoading(LoadingType.LoadLog)
  }

  @computed
  get paginationInfo() {
    if (!this.logResult) {
      return
    }
    const { total, pageNo } = this.logResult
    return { total, pageNo }
  }

  @computed
  get logList(): ILogItem[] {
    if (!(this.logResult && this.logResult.items)) {
      return []
    }
    return this.logResult.items.slice()
  }

  @action
  resetQueryLogParam() {
    this.queryLogParam = { ...defaultQueryParam, pageSize: this.pageSize }
  }

  @action
  updatePageSize(pageSize: number) {
    this.pageSize = pageSize
  }

  @action
  updateQueryLogParam(param: Partial<IQueryLogParam>) {
    this.queryLogParam = assign({}, this.queryLogParam, param)
  }

  @action
  updateLogType(type: TRPLog) {
    this.logType = type
  }

  @action
  updateLogResult(result: ILogResult) {
    this.logResult = result
  }

  @action
  updateSearchUrlForDisplay(url: string) {
    this.searchUrlForDisplay = url
  }

  @action
  updateSearchUrlForSubmit() {
    this.searchUrlForSubmit = trim(this.searchUrlForDisplay)
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.LoadLog)
  fetchRefreshPrefetchLog() {
    return this.refreshPrefetchApis.getRefreshPrefetchLog(this.queryLogParam, this.logType).then(
      (result: ILogResult) => {
        this.updateLogResult(result)
      }
    )
  }

  init() {
    this.resetQueryLogParam()
    this.fetchRefreshPrefetchLog()
  }
}

export default observer(function _RPLog() {

  const store = useLocalStore(LocalStore)
  const t = useTranslation()

  const handleTypeChange = React.useCallback((type: TRPLog) => {
    store.updateLogType(type)
    store.updateQueryLogParam({ pageNo: defaultQueryParam.pageNo })
    store.fetchRefreshPrefetchLog()
  }, [store])

  const handleChangeSearchUrl = React.useCallback(e => {
    store.updateSearchUrlForDisplay(e.target.value)
  }, [store])

  const handleResetSearch = React.useCallback(() => {
    store.resetQueryLogParam()
    store.updateSearchUrlForDisplay('')
    store.updateSearchUrlForSubmit()
    store.fetchRefreshPrefetchLog()
  }, [store])

  const handleSearchByUrl = React.useCallback(() => {
    store.resetQueryLogParam()
    store.updateSearchUrlForSubmit()
    store.updateQueryLogParam({ urls: store.searchUrlForSubmit ? [store.searchUrlForSubmit] : undefined })
    store.fetchRefreshPrefetchLog()
  }, [store])

  const handlePageChange = React.useCallback((page: number) => {
    const pageNo = page - 1
    if (store.paginationInfo?.pageNo !== pageNo) {
      store.updateQueryLogParam({ pageNo })
      store.fetchRefreshPrefetchLog()
    }
  }, [store])

  const handleTableChange = ({ pageSize }: PaginationProps) => {
    if (pageSize != null && store.pageSize !== pageSize) {
      store.updatePageSize(pageSize)
      store.updateQueryLogParam({ pageNo: defaultQueryParam.pageNo })
      store.fetchRefreshPrefetchLog()
    }
  }

  const renderOperationType = React.useCallback(() => {
    if (store.logType === 'refresh') {
      return t(messages.logType.refresh)
    }
    return t(messages.logType.prefetch)
  }, [store, t])

  const renderRefreshFileType = (isDir: IsDir) => (isDir === 'no' ? t(messages.file) : t(messages.directory))

  const renderStatus = (_: unknown, item: ILogItem) => (
    <span className={item.state}>{t(humanizeRPState(item.state))}</span>
  )

  return (
    <div className="comp-rp-log-wrapper">
      <Form
        className="filter-containter"
        layout="inline"
        colon={false}
      >
        <FormItem label={t(messages.operationType)}>
          <Radio.Group
            value={store.logType}
            onChange={e => handleTypeChange(e.target.value)}
            className="log-type"
          >
            <Radio value="refresh">{t(messages.logType.refresh)}</Radio>
            <Radio value="prefetch">{t(messages.logType.prefetch)}</Radio>
          </Radio.Group>
        </FormItem>
        <section className="search-input-wrapper">
          <FormItem className="url-input">
            <Input.Search
              allowClear
              placeholder={t(messages.urlInputPlaceholder)}
              value={store.searchUrlForDisplay}
              disabled={store.isLoadingLog}
              onSearch={handleSearchByUrl}
              onChange={handleChangeSearchUrl}
            />
          </FormItem>
          <FormItem className="reload-form-item">
            <Button
              className="btn-reload"
              type="link"
              shape="circle"
              size="small"
              disabled={store.isLoadingLog}
              onClick={handleResetSearch}
            >
              <RefreshSVG className="btn-icon" />
            </Button>
          </FormItem>
        </section>
      </Form>
      <div className="log-container">
        <Table
          rowKey={(item: ILogItem) => item.requestId + item.url}
          loading={store.isLoadingLog}
          dataSource={store.logList}
          onChange={handleTableChange}
          pagination={
            store.paginationInfo
            && {
              total: store.paginationInfo.total,
              pageSize: store.pageSize,
              onChange: handlePageChange,
              current: store.paginationInfo.pageNo + 1,
              showQuickJumper: true,
              showSizeChanger: true
            }
          }
        >
          <Column
            title="URL"
            dataIndex="url"
            className="url-column"
          />
          <Column
            className="create-at"
            title={t(messages.submitTime)}
            dataIndex="createAt"
            width="25%"
          />
          {
            // 只有刷新有区分文件类型（目录、文件）
            store.logType === 'refresh' && (
              <Column
                title={t(messages.refetchType)}
                dataIndex="isDir"
                width="15%"
                render={renderRefreshFileType}
              />
            )
          }
          <Column
            title={t(messages.operationType)}
            width="15%"
            dataIndex="opType"
            render={renderOperationType}
          />
          <Column
            title={t(messages.state)}
            render={renderStatus}
            width="15%"
          />
        </Table>
      </div>
    </div>
  )
})
