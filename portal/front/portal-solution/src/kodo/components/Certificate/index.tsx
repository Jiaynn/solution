/**
 * @file Certificate component
 * @description Certificate 管理
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import autobind from 'autobind-decorator'
import { InjectFunc, Inject } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { computed, action, observable, reaction, makeObservable } from 'mobx'
import { Table, Button, Popconfirm, Popover } from 'react-icecream/lib'

import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { VerificationModalStore } from 'portal-base/user/verification'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import { CertStore } from 'kodo/stores/certificate'

import { ICertificatePageOptions } from 'kodo/routes/certificate'

import { Auth } from 'kodo/components/common/Auth'

import { CertificateApis, ICertificate } from 'kodo/apis/certificate'

import Detail from './Detail'
import UploadDrawer from './UploadDrawer'

import styles from './style.m.less'

class CertTable extends Table<ICertificate> { }
class CertColumn extends Table.Column<ICertificate> { }

export interface IProps extends ICertificatePageOptions {
  openUpload?: boolean
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalCertificate extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  certStore = this.props.inject(CertStore)
  certificateApis = this.props.inject(CertificateApis)
  verificationModalStore = this.props.inject(VerificationModalStore)

  disposable = new Disposable()
  @observable currentPage = 1
  @observable uploadDrawerVisible = !!this.props.openUpload

  @autobind
  @Toaster.handle()
  fetchCertList() {
    return this.certStore.fetchList()
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props,
        this.fetchCertList,
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed
  get tableData() {
    return this.certStore.certificationList
  }

  @computed
  get paginationOptions() {
    return {
      defaultPageSize: 30,
      current: this.currentPage,
      total: this.tableData.length,
      onChange: this.handlePaginationChange
    }
  }

  @computed
  get uploadDrawerView() {
    return (
      <UploadDrawer
        {...this.props}
        isVisible={this.uploadDrawerVisible}
        onClose={() => this.updateDrawerVisible(false)}
      />
    )
  }

  @action.bound
  handlePaginationChange(current: number) {
    this.currentPage = current
  }

  @action.bound
  updateDrawerVisible(state: boolean) {
    this.uploadDrawerVisible = state
  }

  @autobind
  @Toaster.handle('删除成功')
  async handleDeleteCertificate(id: string) {
    await this.verificationModalStore.verify()
    const result = await this.certStore.delete(id)
    return result
  }

  @autobind
  @Toaster.handle('下载完成')
  async handleDownloadCertificate(id: string) {
    await this.verificationModalStore.verify()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { cert: { common_name, ca, pri } } = await this.certificateApis.getCertificate(id)
    const filename = common_name || 'sslcert'

    try {
      const zip = new JSZip()
      zip.file(filename + '.crt', ca)
      zip.file(filename + '.key', pri)

      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, filename + '.zip')
    } catch {
      throw new Error('当前浏览器不支持此功能，请更换浏览器')
    }
  }

  // 空间设置
  @autobind
  renderOperation(data: ICertificate): React.ReactNode {
    const { certid } = data

    return (
      <span className={styles.icons}>
        <Popover
          trigger="hover"
          placement="left"
          content={<Detail {...data} />}
          title="证书详情"
        >
          <Button type="link">详情</Button>
        </Popover>
        <Button type="link" onClick={() => this.handleDownloadCertificate(certid)}>
          下载
        </Button>
        <Popconfirm
          okText="确定"
          cancelText="取消"
          placement="bottom"
          title="确定删除该证书？"
          onConfirm={() => this.handleDeleteCertificate(certid)}
        >
          <Button type="link">删除</Button>
        </Popconfirm>
      </span>
    )
  }

  @computed
  get certificateTable() {
    return (
      <CertTable
        rowKey="certid"
        dataSource={this.tableData}
        loading={this.certStore.isLoading}
        pagination={this.paginationOptions}
      >
        <CertColumn
          key="name"
          dataIndex="name"
          title="证书名称"
          render={name => <span className={styles.space}>{name}</span>}
        />
        <CertColumn
          key="common_name"
          title="通用名称"
          // eslint-disable-next-line @typescript-eslint/naming-convention
          render={(_, { common_name }) => <span className={styles.space}>{common_name || '未指定'}</span>}
        />
        <CertColumn
          key="create_time"
          width="15%"
          title="上传时间"
          // eslint-disable-next-line @typescript-eslint/naming-convention
          render={(_, { create_time }) => humanizeTimestamp(create_time * 1000)}
        />
        <CertColumn
          key="not_before"
          width="16%"
          title="生效时间"
          // eslint-disable-next-line @typescript-eslint/naming-convention
          render={(_, { not_before }) => humanizeTimestamp(not_before * 1000)}
        />
        <CertColumn
          key="not_after"
          width="16%"
          title="到期时间"
          // eslint-disable-next-line @typescript-eslint/naming-convention
          render={(_, { not_after }) => humanizeTimestamp(not_after * 1000)}
        />
        <CertColumn
          key="operation"
          width="15%"
          title="操作"
          render={this.renderOperation}
        />
      </CertTable>
    )
  }

  // 创建按钮
  @computed
  get uploadButtonView() {
    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <Button
            icon="plus"
            type="primary"
            className={styles.button}
            disabled={disabled}
            onClick={() => this.updateDrawerVisible(true)}
          >
            上传证书
          </Button>
        )}
      />
    )
  }

  render() {
    return (
      <div className={styles.content}>
        <div className={styles.toolbar}>
          {this.uploadButtonView}
          {this.uploadDrawerView}
        </div>
        {this.certificateTable}
      </div>
    )
  }
}

export default function Certificate(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalCertificate {...props} inject={inject} />
    )} />
  )
}
