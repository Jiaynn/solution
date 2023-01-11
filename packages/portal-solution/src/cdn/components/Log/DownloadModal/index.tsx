/*
 * @file 日志筛选条件
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React from 'react'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import Table from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'
import LightBox from 'react-icecream/lib/modal'
import { Translation, useTranslation } from 'portal-base/common/i18n'

import { humanizeFilesize } from 'cdn/transforms/unit'

import HelpLink from 'cdn/components/common/HelpLink'

import { ILog } from 'cdn/apis/log'
import { IModalOptions } from '../index'
import * as messages from './messages'

import './style.less'

const { Column } = Table

export interface IDownloadModalProps {
  visible: boolean
  logs: ILog[]
  toggleModal: (options: IModalOptions) => void
}

function renderFileSize(_: any, log: ILog): string {
  return humanizeFilesize(log.size)
}

function renderOpreation(_: unknown, log: ILog): JSX.Element {
  return (
    <Button
      size="small"
      shape="round"
      onClick={() => window.open(log.url, '_blank')}
    >
      <Translation>
        {t => t(messages.download)}
      </Translation>
    </Button>
  )
}

export default observer(function _DownloadModal(props: IDownloadModalProps) {

  const store = useLocalStore(LocalStore)
  const t = useTranslation()

  return (
    <LightBox
      className="download-modal"
      width="80%"
      title={t(messages.downloadList)}
      footer={null}
      visible={props.visible}
      onCancel={() => props.toggleModal({ visible: false, logs: [] })}
    >
      <p className="sub-title">
        {t(messages.downloadTitle)}
      </p>
      <Button
        className="download-selected"
        onClick={() => store.downloadSelectedLogs()}
      >
        {t(messages.downloadSelectd)}
      </Button>
      <HelpLink
        className="download-tip"
        href="https://developer.qiniu.com/fusion/kb/5909/cdn-log-download-selection"
      >
        {t(messages.downloadTip)}
      </HelpLink>
      <Table
        rowKey="name"
        className="log-table"
        pagination={false}
        dataSource={props.logs}
        rowSelection={{
          onChange: (_: unknown, selectedRows: ILog[]) => {
            store.updateSelectedLogs(selectedRows)
          }
        }}
      >
        <Column
          title={t(messages.fileName)}
          dataIndex="name"
        />
        <Column
          title={t(messages.fileSize)}
          render={renderFileSize}
        />
        <Column
          title={t(messages.downloadLog)}
          render={renderOpreation}
        />
      </Table>
    </LightBox>
  )
})

@injectable()
export class LocalStore extends Store {

  @observable.ref selectedLogs: ILog[] = []

  @action
  updateSelectedLogs(logs: ILog[]) {
    this.selectedLogs = logs
  }

  downloadSelectedLogs() {
    this.selectedLogs.slice().forEach((log: ILog) => {
      window.open(log.url, '_blank')
    })
  }
}
