/**
 * @file boundDomain component
 * @description 域名绑定相关的逻辑实现
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'

import autobind from 'autobind-decorator'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { reaction, computed, observable, action, runInAction, makeObservable } from 'mobx'
import { FieldState, FormState } from 'formstate-x'
import { observer } from 'mobx-react'

import { Inject, InjectFunc } from 'qn-fe-core/di'
import { makeCancelled } from 'qn-fe-core/exception'
import Disposable from 'qn-fe-core/disposable'
import { Checkbox, Form, Input, Modal } from 'react-icecream'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { bindTextInput, bindFormItem, bindCheckbox } from 'portal-base/common/form'
import { KodoProxyApiException, KodoProxyErrorCode } from 'portal-base/kodo/apis/proxy'
import { Link } from 'portal-base/common/router'
import Role from 'portal-base/common/components/Role'

import { validateURL } from 'kodo/utils/url'
import { valuesOfEnum } from 'kodo/utils/ts'

import { generateOwnerVerificationData } from 'kodo/transforms/domain'

import { DomainStore } from 'kodo/stores/domain'
import { ConfigStore } from 'kodo/stores/config'

import { getCDNDomainListPath } from 'kodo/routes/cdn'

import { RegionSymbol } from 'kodo/constants/region'
import { BucketDomainRole } from 'kodo/constants/role'
import { DomainScope } from 'kodo/constants/domain'

import { Auth } from 'kodo/components/common/Auth'
import Prompt from 'kodo/components/common/Prompt'
import { showBoundSuccessModal } from './AddDomainRecord'

import baseStyles from './style.m.less'
import styles from './bound-domain-modal.m.less'

export interface IProps {
  onClose: () => void
  bucketName: string
  region: RegionSymbol
  visible: boolean // 显示
}

export type InputState = FormState<{
  domain: FieldState<string>
  s3ScopeEnabled: FieldState<boolean>
}>

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
} as const

enum Loading {
  Submit = 'submit'
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalBoundDomain extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  disposable = new Disposable()
  @observable domainConflictedState: string | number | null
  @observable.ref formState: InputState
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  @autobind
  copyFeedback(_: string, state: boolean) {
    const toasterStore = this.props.inject(Toaster)

    if (state) {
      toasterStore.info('已成功拷贝到剪切板')
    } else {
      toasterStore.error('拷贝失败')
    }
  }

  @action.bound
  updateDomainConflictedState(state: string | number | null) {
    this.domainConflictedState = state
  }

  @computed
  get regionConfig() {
    const configStore = this.props.inject(ConfigStore)
    return configStore.getRegion({ region: this.props.region })
  }

  @action.bound
  initFormStateAndConflictedState() {
    this.formState = new FormState({
      domain: new FieldState<string>('').validators(this.domainValidator),
      s3ScopeEnabled: new FieldState<boolean>(false)
    })

    this.disposable.addDisposer(this.formState.dispose)
    this.updateDomainConflictedState(null)
  }

  // 域名格式验证
  @autobind
  domainValidator(domain: string) {
    if (!domain) {
      return '请输入要绑定的域名'
    }

    const domainStore = this.props.inject(DomainStore)

    if (
      (domainStore.sourceDomainListGroupByBucketName.get(this.props.bucketName) || [])
        .some(item => item.domain === domain)
    ) {
      return '该域名已经存在，请重新输入'
    }

    if (/^https?:\/\//i.test(domain)) {
      return '请勿输入 http(s) 协议头'
    }

    // 这里其实是域名，拿 URL 校验其实不太合理
    return validateURL(domain, {
      allowHash: false,
      allowSearch: false,
      ignoreProtocol: true,
      allowPort: this.regionConfig.objectStorage.domain.allowPort.enable
    })
  }

  @autobind
  @Toaster.handle()
  async handleBindDomain() {
    const result = await this.formState.validate()

    if (result.hasError) {
      throw makeCancelled()
    }

    // TODO: s3 协议接入
    const { bucketName } = this.props
    const domainStore = this.props.inject(DomainStore)
    const { domain, s3ScopeEnabled } = this.formState.value
    const scope = s3ScopeEnabled ? DomainScope.S3 : DomainScope.IO
    const req = domainStore.bindSourceBucket(domain, bucketName, scope)
    this.loadings.promise(Loading.Submit, req)

    try {
      await req
    } catch (error) {
      if ((error instanceof KodoProxyApiException) && ([
        KodoProxyErrorCode.CDNDomainConflictedWithOther, // cdn 域名被其他用户绑定
        KodoProxyErrorCode.CDNDomainConflictedWithSelf, // cdn 域名被自己其他空间绑定
        KodoProxyErrorCode.SourceDomainConflictedWithOther,  // 源站域名被其他用户绑定
        KodoProxyErrorCode.SourceDomainConflictedWithSelf // 源站域名被自己其他空间绑定
      ] as Array<string | number>).includes(error.code)) {

        this.updateDomainConflictedState(error.code)
        throw makeCancelled()
      }

      throw error
    }

    runInAction(() => {
      this.props.onClose() // 关闭自己
      showBoundSuccessModal(this.props.inject, bucketName, scope) // 显示域名绑定提示
    })
  }

  @autobind
  @Toaster.handle('解绑成功')
  async handleUnBindDomain() {
    const result = await this.formState.validate()

    if (result.hasError) {
      throw makeCancelled()
    }

    const domain = this.formState.$.domain.$
    const domainStore = this.props.inject(DomainStore)
    const req = domainStore.unbindSourceBucket(domain)
    this.loadings.promise(Loading.Submit, req)

    await req
    this.updateDomainConflictedState(null)
  }

  @computed
  get formView() {
    if (!this.formState) {
      return null
    }

    return (
      <Role name={BucketDomainRole.BindSourceDomainForm}>
        <Form layout="horizontal">
          <Form.Item
            label="当前空间"
            {...formItemLayout}
          >
            <div className={baseStyles.formValue}>
              <span className={baseStyles.ellipsis}>
                {this.props.bucketName}
              </span>
            </div>
          </Form.Item>
          <Role name={BucketDomainRole.BindSourceDomainInput}>
            <Form.Item
              required
              label="输入域名"
              {...formItemLayout}
              {...bindFormItem(this.formState.$.domain)}
            >
              <Input placeholder="请输入域名" {...bindTextInput(this.formState.$.domain)} />
            </Form.Item>
          </Role>
          {this.regionConfig.objectStorage.domain.awsS3.enable && (
            <Auth featureKeys={['KODO.KODO_S3API']}>
              <Checkbox {...bindCheckbox(this.formState.$.s3ScopeEnabled)}>
                用于 S3 兼容协议的接口访问
              </Checkbox>
            </Auth>
          )}
        </Form>
      </Role>
    )
  }

  @computed
  get ownerVerifiedView() {
    if (!this.formState) { return null }
    const { rootDomain, token, host } = generateOwnerVerificationData(this.formState.$.domain.value)
    return (
      <div className={styles.ownerVerified}>
        <div className={styles.field}>
          <label className={styles.label}>
            域名：
          </label>
          <span className={styles.value}>
            {rootDomain}
          </span>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            主机记录：
          </label>
          <span className={styles.value}>
            {token}
          </span>
          {token && (
            <CopyToClipboard
              onCopy={this.copyFeedback}
              className={baseStyles.copyBtn}
              text={token}
            >
              <a href="javascript:;">点击复制</a>
            </CopyToClipboard>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            记录值：
          </label>
          <span className={styles.value}>
            {host}
          </span>
          {host && (
            <CopyToClipboard
              onCopy={this.copyFeedback}
              className={baseStyles.copyBtn}
              text={host}
            >
              <a href="javascript:;">点击复制</a>
            </CopyToClipboard>
          )}
        </div>
      </div>
    )
  }

  @computed
  get fixConflictedView() {
    // 没有发生冲突情况
    if (this.domainConflictedState == null) {
      return null
    }

    // 源站域名被其他用户绑定
    if (this.domainConflictedState === KodoProxyErrorCode.SourceDomainConflictedWithOther) {
      return (
        <Prompt type="assist">
          域名已经被其他用户绑定！<br />
          您可以强制解除该域名的绑定记录，需要验证域名所有权。<br />
          请登录域名提供商提供的域名管理界面，在待绑定域名下添加特定的
          <strong>&nbsp;TXT 记录&nbsp;</strong>，内容如下：<br />
          {this.ownerVerifiedView}
          <span className={styles.warnText}>
            注意：解除域名绑定记录，可能导致原本绑定该域名的空间无法通过该域名访问，请谨慎操。
          </span>
        </Prompt>
      )
    }

    // CDN 域名被其他用户绑定 这种私有云不会出现
    if (this.domainConflictedState === KodoProxyErrorCode.CDNDomainConflictedWithOther) {
      return (
        <Prompt type="assist">
          当前域名已被其他用户作为加速域名绑定到空间！请至&nbsp;
          <Link
            rel="noopener"
            target="_blank"
            to={getCDNDomainListPath()}
          >
            CDN
          </Link>
          &nbsp;找回域名再做绑定。
        </Prompt>
      )
    }

    // 源站域名被自己的其他空间绑定
    if (this.domainConflictedState === KodoProxyErrorCode.SourceDomainConflictedWithSelf) {
      return (
        <Prompt type="assist">
          域名已被绑定至当前账号的其他空间下，请前往该空间进行解绑。
        </Prompt>
      )
    }

    // 域名已经绑定到自己的 CDN 服务里了 这种私有云不会出现
    if (this.domainConflictedState === KodoProxyErrorCode.CDNDomainConflictedWithSelf) {
      return (
        <Prompt type="assist">
          当前域名已作为加速域名绑定到空间！请先至&nbsp;
          <Link
            rel="noopener"
            target="_blank"
            to={getCDNDomainListPath()}
          >
            CDN
          </Link>
          &nbsp;进行解绑。
        </Prompt>
      )
    }
  }

  @computed
  get isOkButtonDisabled() {
    return this.domainConflictedState === KodoProxyErrorCode.SourceDomainConflictedWithSelf
  }

  @computed
  get modalOkText() {
    return this.domainConflictedState === KodoProxyErrorCode.SourceDomainConflictedWithOther
      ? '我已添加TXT验证记录，提交'
      : '绑定域名'
  }

  @autobind
  handleModalOk() {
    if (this.domainConflictedState === KodoProxyErrorCode.SourceDomainConflictedWithOther) {
      this.handleUnBindDomain()
    } else {
      this.handleBindDomain()
    }
  }

  render() {
    return (
      <Modal
        closable
        width={560}
        title="绑定域名"
        cancelText="取消"
        maskClosable={false}
        okText={this.modalOkText}
        onOk={this.handleModalOk}
        visible={this.props.visible}
        onCancel={this.props.onClose}
        okButtonProps={{
          disabled: this.isOkButtonDisabled,
          loading: this.loadings.isLoading(Loading.Submit)
        }}
      >
        {this.formView}
        {this.fixConflictedView}
      </Modal>
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          this.initFormStateAndConflictedState()
        }
      },
      { fireImmediately: true }
    ))

    this.disposable.addDisposer(reaction(
      () => this.formState && this.formState.value.domain,
      () => {
        this.updateDomainConflictedState(null)
      }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function BoundDomain(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalBoundDomain {...props} inject={inject} />
    )} />
  )
}
