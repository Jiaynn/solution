/**
 * @file 域名详情页面
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import Form, { FormProps } from 'react-icecream/lib/form'
import Modal, { ModalFuncProps } from 'react-icecream/lib/modal'
import Spin from 'react-icecream/lib/spin'
import Button from 'react-icecream/lib/button'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { RouterStore } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { Iamed } from 'portal-base/user/iam'
import Page from 'portal-base/common/components/Page'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import { ApiException } from 'qn-fe-core/client'
import { ComposibleValidatable } from 'formstate-x'

import { antdToPromise, AntdStyleMethod } from 'cdn/utils'

import { shouldForbidRemove, shouldForbidEnable, shouldForbidDisable } from 'cdn/transforms/domain'
import { isEnabled as isBsAuthEnabled } from 'cdn/transforms/domain/bs-auth'
import { getConfirmMessageForSourceConfigChange } from 'cdn/transforms/domain/source'

import BucketStore from 'cdn/stores/bucket'

import { useAutoScrollAnchor, BindRef } from 'cdn/hooks/misc'

import IamInfo from 'cdn/constants/iam-info'
import AbilityConfig from 'cdn/constants/ability-config'
import { DomainType, Protocol, OperatingState, OperationType, CertInputType, Platform } from 'cdn/constants/domain'
import { certConfigHelpURL } from 'cdn/constants/index'
import { isQiniu } from 'cdn/constants/env'

import TipIcon from 'cdn/components/TipIcon'
import SideModal from 'cdn/components/common/SideModal'
import SourceConfigInput from 'cdn/components/Domain/Inputs/SourceConfigInput'
import CacheConfigInput from 'cdn/components/Domain/Inputs/CacheConfigInput'
import DomainCacheIgnoreParamsConfigInput from 'cdn/components/Domain/Inputs/CacheConfigInput/IgnoreParams'
import RefererConfigInput from 'cdn/components/Domain/Inputs/RefererConfigInput'
import TimeRefererConfigInput from 'cdn/components/Domain/Inputs/TimeRefererConfigInput'
import BsAuthConfigInput from 'cdn/components/Domain/Inputs/BsAuthConfigInput'
import IpACLConfigInput from 'cdn/components/Domain/Inputs/IpACLConfigInput'
import HttpsConfigInput from 'cdn/components/Domain/Inputs/HttpsConfigInput/ForEdit'
import ImageSlimConfigInput from 'cdn/components/Domain/Inputs/ImageSlimConfigInput'
import FopConfigInput from 'cdn/components/Domain/Inputs/FopConfigInput'
import HeaderInput from 'cdn/components/Domain/Inputs/HeaderInput'
import HelpLink from 'cdn/components/common/HelpLink'
import OEMDisabled from 'cdn/components/common/OEMDisabled'
import Routes from 'cdn/constants/routes'

import DomainStateMessage from '../DomainStateMessage'
import BasicInfoBlock from '../BasicInfoBlock'
import PandomainBlock from '../PandomainBlock'
import SourceConfigBlock from '../SourceConfigBlock'
import CacheConfigBlock from '../CacheConfigBlock'
import AccessControlConfigBlock from '../AccessControlConfigBlock'
import HttpsConfigBlock from '../HttpsConfigBlock'
import ImageOptimizationConfigBlock from '../ImageOptimizationConfigBlock'
import ProgressInfoBlock from '../ProgressInfoBlock'
import HttpHeaderBlock from '../HttpHeaderBlock'
import PwdConfirm, { PwdConfirmStore } from '../../PwdConfirm'
import { IBaseDomainDetailProps } from '../common/store'

import LocalStore, { LoadingType, ConfigType } from './store'

const confirm = antdToPromise<ModalFuncProps, AntdStyleMethod<ModalFuncProps>, void>(Modal.confirm)

const formProps: FormProps = {
  layout: 'vertical',
  colon: false
}

export interface NormalAndPanDomainDetailProps extends IBaseDomainDetailProps {
  store: LocalStore
  routerStore: RouterStore
  bucketStore: BucketStore
  toasterStore: ToasterStore
  routes: Routes
  iamInfo: IamInfo
  abilityConfig: AbilityConfig
  bindRef: BindRef<ConfigType>
}

@observer
class NormalAndPanDomainDetail extends React.Component<NormalAndPanDomainDetailProps> {

  pwdConfirmStore = new PwdConfirmStore()

  constructor(props: NormalAndPanDomainDetailProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @autobind handleLoadMorePandomains() {
    this.props.store.fetchMorePandomains()
  }

  @autobind
  @ToasterStore.handle('删除成功')
  handleRemovePandomain(name: string) {
    return this.pwdConfirmStore.open(`确定要删除泛子域名 ${name}？`).then(
      () => this.props.store.removePandomain(name)
    )
  }

  @autobind handleCreatePandomain() {
    this.props.routerStore.push(this.props.routes.domainCreate({
      type: DomainType.Pan,
      pareDomain: this.props.name
    }))
  }

  @autobind handleConfigureSourceConfig() {
    this.props.store.startConfigure('sourceConfig')
  }

  @autobind handleConfigureSourceConfigCancel() {
    this.props.store.endConfigure('sourceConfig')
  }

  @autobind
  @ToasterStore.handle('修改成功')
  handleConfigureSourceConfigOk() {
    const store = this.props.store
    const bucketStore = this.props.bucketStore
    const isBucketPrivate = (bucketName: string) => bucketStore.isBucketPrivate(bucketName)

    return bucketStore.fetchBuckets().then(
      () => {
        const message = getConfirmMessageForSourceConfigChange(
          store.domainDetail!,
          store.sourceConfig,
          isBucketPrivate
        )
        if (message) {
          return confirm({
            title: '确认修改',
            content: message
          })
        }
      }
    ).then(
      () => this.pwdConfirmStore.open()
    ).then(
      () => store.submitSourceConfig()
    )
      .then(
        () => store.endConfigure('sourceConfig')
      )
  }

  @autobind handleConfigureCacheConfig() {
    this.props.store.startConfigure('cacheConfig')
  }

  @autobind handleConfigureCacheConfigCancel() {
    this.props.store.endConfigure('cacheConfig')
  }

  @autobind
  @ToasterStore.handle('修改缓存配置的申请已提交成功，正在处理')
  handleConfigureCacheConfigOk() {
    return this.props.store.submitCacheConfig().then(
      () => this.props.store.endConfigure('cacheConfig')
    )
  }

  @autobind handleConfigureRefererConfig() {
    this.props.store.startConfigure('refererConfig')
  }

  @autobind handleConfigureRefererConfigCancel() {
    this.props.store.endConfigure('refererConfig')
  }

  @autobind
  @ToasterStore.handle('修改域名防盗链的申请已提交成功，正在处理')
  handleConfigureRefererConfigOk() {
    return this.props.store.submitRefererConfig().then(
      () => this.props.store.endConfigure('refererConfig')
    )
  }

  @autobind handleConfigureTimeRefererConfig() {
    this.props.store.startConfigure('timeRefererConfig')
  }

  @autobind handleConfigureTimeRefererConfigCancel() {
    this.props.store.endConfigure('timeRefererConfig')
  }

  @autobind
  @ToasterStore.handle('修改时间戳防盗链的申请已提交成功，正在处理')
  handleConfigureTimeRefererConfigOk() {
    return this.props.store.submitTimeRefererConfig().then(
      () => this.props.store.endConfigure('timeRefererConfig')
    )
  }

  @autobind handleConfigureBsAuthConfig() {
    this.props.store.startConfigure('bsAuthConfig')
  }

  @autobind handleConfigureBsAuthConfigCancel() {
    this.props.store.endConfigure('bsAuthConfig')
  }

  @autobind
  @ToasterStore.handle('修改回源鉴权的申请已提交成功，正在处理')
  handleConfigureBsAuthConfigOk() {
    const confirmed: Promise<any> = (
      this.props.store.bsAuthConfig.enable
      ? Promise.resolve()
      : confirm({
        title: '确认',
        content: '您确认关闭回源鉴权吗？'
      })
    )
    return confirmed.then(
      () => this.props.store.submitBsAuthConfig()
    ).then(
      () => this.props.store.endConfigure('bsAuthConfig')
    )
  }

  @autobind handleConfigureIpACLConfig() {
    this.props.store.startConfigure('ipACLConfig')
  }

  @autobind handleConfigureIpACLConfigCancel() {
    this.props.store.endConfigure('ipACLConfig')
  }

  @autobind
  @ToasterStore.handle('修改 IP 黑白名单的申请已提交成功，正在处理')
  handleConfigureIpACLConfigOk() {
    return this.props.store.submitIpACLConfig().then(
      () => this.props.store.endConfigure('ipACLConfig')
    )
  }

  @autobind handleConfigureHttpsConfig() {
    this.props.store.startConfigure('httpsConfig')
  }

  @autobind handleConfigureResponseHeaderConfig() {
    this.props.store.startConfigure('responseHeaderControlConfig')
  }

  @autobind handleConfigureResponseHeaderConfigCancel() {
    this.props.store.endConfigure('responseHeaderControlConfig')
  }

  @autobind
  @ToasterStore.handle('修改 HTTP 响应头的申请已提交成功，正在处理')
  handleConfigureResponseHeaderConfigOk() {
    return this.props.store.submitResponseHeaderConfig().then(
      () => this.props.store.endConfigure('responseHeaderControlConfig')
    )
  }

  @autobind handleConfigureHttpsConfigCancel() {
    this.props.store.endConfigure('httpsConfig')
  }

  @autobind
  @ToasterStore.handle('修改 HTTPS 配置的申请已提交成功，正在处理')
  handleConfigureHttpsConfigOk() {
    const store = this.props.store
    const sslApplyLink = <a target="_blank" rel="noopener" href="/certificate/apply?shortName=TrustAsiaDVG5&years=1&limit=1">购买证书</a>

    const certInputType = store.httpsConfig.certInputType
    if (certInputType === CertInputType.Free && !store.cnamed) {
      return Promise.reject('请配置 CNAME')
    }

    return this.confirmForQiniuPrivate().then(
      () => this.pwdConfirmStore.open()
    ).then(
      () => this.props.store.updateHttpsConfig()
    ).then(
      () => this.props.store.endConfigure('httpsConfig')
    )
      .catch(e => {
        if (e instanceof ApiException && e.code === 500244) {
          Modal.error({
            title: '提示',
            content: <div>域名不满足一键申请免费证书条件，请前往 {sslApplyLink} 页自助购买免费证书。</div>
          })
          return Promise.reject('提交失败')
        }

        return Promise.reject(e)
      })
  }

  confirmForQiniuPrivate() {
    const store = this.props.store
    const { domainDetail, isQiniuPrivate } = store
    const bsAuthEnabled = isBsAuthEnabled(domainDetail!.bsauth)
    const isUpgrade = (
      domainDetail!.protocol === Protocol.Http
      && store.httpsConfig.protocol === Protocol.Https
    )

    const confirmed: Promise<any> = (
      isUpgrade && isQiniuPrivate && !bsAuthEnabled
      ? confirm({
        title: '升级 HTTPS',
        okText: '强制升级',
        content: (
          <div>
            <p>检测到该域名绑定的源站空间是私有空间</p>
            <p>为了您资源的安全，<strong>建议您开启回源鉴权后再升级！</strong></p>
          </div>
        )
      })
      : Promise.resolve()
    )

    return confirmed
  }

  @autobind handleConfigureImageSlimConfig() {
    this.props.store.startConfigure('imageSlimConfig')
  }

  @autobind handleConfigureImageSlimConfigCancel() {
    this.props.store.endConfigure('imageSlimConfig')
  }

  @autobind
  @ToasterStore.handle('修改图片瘦身的申请已提交成功，正在处理')
  handleConfigureImageSlimConfigOk() {
    return this.props.store.submitImageSlimConfig().then(
      () => this.props.store.endConfigure('imageSlimConfig')
    )
  }

  @autobind handleConfigureFopConfig() {
    this.props.store.startConfigure('fopConfig')
  }

  @autobind handleConfigureFopConfigCancel() {
    this.props.store.endConfigure('fopConfig')
  }

  @autobind
  @ToasterStore.handle('修改图片处理的申请已提交成功，正在处理')
  handleConfigureFopConfigOk() {
    return this.props.store.submitFopConfig().then(
      () => this.props.store.endConfigure('fopConfig')
    )
  }

  @autobind
  @ToasterStore.handle('启用成功')
  handleEnableDomain() {
    return this.pwdConfirmStore.open(`确定启用域名 ${this.props.store.name}？`).then(
      () => this.props.store.enableDomain()
    )
  }

  @autobind
  @ToasterStore.handle('停用成功')
  handleDisableDomain() {
    return this.pwdConfirmStore.open(`确定停用域名 ${this.props.store.name}？`).then(
      () => this.props.store.disableDomain()
    )
  }

  @autobind
  @ToasterStore.handle('删除成功')
  handleRemoveDomain() {
    if (this.props.store.pandomainList && this.props.store.pandomainList.length > 0) {
      return Promise.reject('请先删除或移动该泛域名的所有子域名')
    }
    return this.pwdConfirmStore.open(`确定删除域名 ${this.props.store.name}？`).then(
      () => this.props.store.removeDomain()
    )
  }

  @autobind
  @ToasterStore.handle()
  handleRefresh() {
    return this.props.store.fetchDomainDetail()
  }

  @autobind
  bindHandleConfigOk(config: ConfigType, handler: () => void) {
    const store = this.props.store
    return () => {
      (store.stateMap[config] as ComposibleValidatable<unknown>).validate().then(res => {
        if (!res.hasError) {
          handler()
        }
      })
    }
  }

  @computed get httpsConfigDisabled() {
    const store = this.props.store
    // HTTPS 配置对应的 input 没有错误提示，所以交互暂时不改
    return store.stillHttp
      || store.shouldDisableSubmit(LoadingType.SubmitHttpsConfig)
      || store.stateMap.httpsConfig.hasError
  }

  getBsAuthMismatchMessage() {
    const store = this.props.store
    const domain = store.domainDetail
    const isDomainBsAuthEnabled = isBsAuthEnabled(domain.bsauth)

    if (!isDomainBsAuthEnabled && store.isQiniuPrivate) {
      return (
        <p className="warning-message">
          监测到域名源站在七牛私有 BUCKET，建议打开
          <HelpLink href="https://developer.qiniu.com/fusion/kb/7455/monitoring-the-source-domain-stood-seven-cows-private-bucket-suggested-that-open-source-authentication-function">
            回源鉴权
          </HelpLink>
          功能。
        </p>
      )
    }

    if (
      isDomainBsAuthEnabled
      && store.isQiniuPrivate !== domain.bsauth.isQiniuPrivate
    ) {
      const { operationType, operatingState } = domain
      const message = getBsAuthBucketMismatchMessage(operationType, operatingState)
      if (message != null) {
        return (
          <p className="error-message">{message}</p>
        )
      }
    }
    return null
  }

  getMessagesBlock() {
    if (this.props.store.isBucketMissing) {
      return (
        <div className="messages-block">
          <p className="error-message">
            源站空间不存在，当前自定义域名失效，您可以更改源站或停用后删除此域名
          </p>
        </div>
      )
    }

    if (this.props.store.shouldForbidByCertExpired) {
      return (
        <div className="messages-block">
          <p className="warning-message">
            HTTPS 证书已经过期，请更新 HTTPS 证书后再进行其他配置。
            <OEMDisabled>
              如有证书配置问题，请&nbsp;
              <a href={certConfigHelpURL} target="_blank" rel="noopener">提交工单</a>
              &nbsp;反馈。
            </OEMDisabled>
          </p>
        </div>
      )
    }

    const bsAuthMatchMessage = this.getBsAuthMismatchMessage()
    const cnameConfigureMessage = (
      this.props.store.needConfigureCname
      ? (
        <p className="warning-message">
          请配置 CNAME
          <HelpLink
            className="cname-help-link"
            href="https://developer.qiniu.com/fusion/kb/1322/how-to-configure-cname-domain-name"
          >
            如何配置
          </HelpLink>
        </p>
      )
      : null
    )
    return (
      <div className="messages-block">
        <DomainStateMessage />
        {cnameConfigureMessage}
        {bsAuthMatchMessage}
      </div>
    )
  }

  // 顶部按钮（启/停用、删除 & 刷新）
  getTopOperations() {
    const domain = this.props.store.domainDetail
    const { iamActions } = this.props.iamInfo
    const offlined = domain.operatingState === OperatingState.Offlined
    const enableBtn = (
      offlined
      ? (
        <Iamed actions={[iamActions.OnlineDomain]}>
          <Button
            type="primary"
            disabled={!!shouldForbidEnable(domain)}
            loading={this.props.store.loadings.isLoading('enableDomain')}
            onClick={this.handleEnableDomain}
          >启用</Button>
        </Iamed>
      )
      : null
    )

    const disableTip = (
      !offlined
      ? (
        <Iamed actions={[iamActions.OfflineDomain]}>
          <TipIcon className="disable-tip-icon" tip="停用后可启用或删除域名" />
        </Iamed>
      )
      : null
    )
    const disableBtn = (
      !offlined
      ? (
        <Iamed actions={[iamActions.OfflineDomain]}>
          <Button
            type="danger"
            disabled={!!shouldForbidDisable(domain)}
            loading={this.props.store.loadings.isLoading('disableDomain')}
            onClick={this.handleDisableDomain}
          >停用</Button>
        </Iamed>
      )
      : null
    )

    const removeBtn = (
      offlined
      ? (
        <Iamed actions={[iamActions.DeleteDomain]}>
          <Button
            type="danger"
            disabled={!!shouldForbidRemove(domain)}
            loading={this.props.store.loadings.isLoading('removeDomain')}
            onClick={this.handleRemoveDomain}
          >删除</Button>
        </Iamed>
      )
      : null
    )

    const refreshBtn = (
      <Button
        type="ghost"
        onClick={this.handleRefresh}
      >刷新</Button>
    )
    return (
      <div className="top-btn-line">
        {enableBtn}
        {disableTip}
        {disableBtn}
        {removeBtn}
        {refreshBtn}
      </div>
    )
  }

  getMainContent() {
    const store = this.props.store
    const domain = store.domainDetail
    if (!domain) {
      return null
    }

    const loadingDomain = store.isLoadingDomainDetail
    const messages = this.getMessagesBlock()
    // 动态加速禁止时间戳防盗链、回源鉴权、图片瘦身、图片处理、七牛云存储
    const isDynamic = domain.platform === Platform.Dynamic

    // OEM 环境不支持泛子域名
    const pandomainBlock = (
      domain.type === DomainType.Wildcard && isQiniu
      ? (
        <PandomainBlock
          pandomainList={store.pandomainList}
          loading={(
            store.loadings.isLoading('pandomains')
            || store.loadings.isLoading('removePandomain')
          )}
          hasMore={store.pandomainListHasMore}
          handleLoadMore={this.handleLoadMorePandomains}
          handleRemovePandomain={this.handleRemovePandomain}
          handleCreatePandomain={this.handleCreatePandomain}
        />
      )
      : null
    )

    const progressInfoBlockProps = {
      domain: store.domainDetail,
      hurryUp: store.freeCertHurryUp
    }

    return (
      <div className="detail-content">
        {this.getTopOperations()}
        <Spin spinning={loadingDomain}>
          {messages}
          <OEMDisabled>
            <ProgressInfoBlock {...progressInfoBlockProps} />
          </OEMDisabled>
          <BasicInfoBlock
            domain={store.domainDetail}
            hasIcp={store.hasIcp}
            certInfo={store.certInfo}
            onRefresh={this.handleRefresh}
          />
        </Spin>
        {pandomainBlock}
        <SourceConfigBlock
          domain={domain}
          certInfo={store.certInfo}
          loading={loadingDomain}
          handleConfigure={this.handleConfigureSourceConfig}
        />
        <CacheConfigBlock
          domain={domain}
          certInfo={store.certInfo}
          isBucketMissing={store.isBucketMissing}
          loading={loadingDomain}
          handleConfigure={this.handleConfigureCacheConfig}
        />
        <AccessControlConfigBlock
          domain={domain}
          certInfo={store.certInfo}
          loading={loadingDomain}
          handleConfigureReferer={this.handleConfigureRefererConfig}
          handleConfigureTimeReferer={this.handleConfigureTimeRefererConfig}
          handleConfigureBsAuth={this.handleConfigureBsAuthConfig}
          handleConfigureIpACL={this.handleConfigureIpACLConfig}
        />
        {/** oem 环境父账号查看子账号创建的域名的时候不显示 https 配置 */}
        {
          (isQiniu || store.userStore.email === domain.oemMail) && (
            <HttpsConfigBlock
              domain={domain}
              certInfo={store.certInfo!}
              loading={loadingDomain}
              ref={this.props.bindRef('httpsConfig')}
              handleConfigure={this.handleConfigureHttpsConfig}
            />
          )
        }
        {
          !isDynamic && isQiniu
            ? (
              <ImageOptimizationConfigBlock
                domain={domain}
                isBucketMissing={store.isBucketMissing}
                loading={loadingDomain}
                certInfo={store.certInfo}
                handleConfigureImageSlimConfig={this.handleConfigureImageSlimConfig}
                handleConfigureFopConfig={this.handleConfigureFopConfig}
              />
            )
            : null
        }
        {
          isQiniu && (
            <HttpHeaderBlock
              domain={domain}
              loading={loadingDomain}
              certInfo={store.certInfo}
              handleConfigStart={this.handleConfigureResponseHeaderConfig}
              handleConfigCancel={this.handleConfigureResponseHeaderConfigCancel}
            />
          )
        }
      </div>
    )
  }

  render() {
    const store = this.props.store
    const stateMap = store.stateMap
    const { useStaticCacheConfig, cacheControlFieldLabel } = this.props.abilityConfig

    if (!stateMap) {
      return null
    }

    return (
      <Page className="domain-detail-wrapper">
        {this.getMainContent()}

        <SideModal
          title="回源配置"
          width="690px"
          visible={store.configuring.sourceConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitSourceConfig)}
          onCancel={this.handleConfigureSourceConfigCancel}
          onOk={this.bindHandleConfigOk('sourceConfig', this.handleConfigureSourceConfigOk)}
        >
          <Form>
            <SourceConfigInput
              modify
              hasIcp={store.hasIcp}
              domain={{ ...store.domainDetail, source: store.sourceConfigForSubmit }}
              state={stateMap.sourceConfig}
            />
          </Form>
        </SideModal>

        <SideModal
          title="缓存配置"
          width="840px"
          visible={store.configuring.cacheConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitCacheConfig)}
          onCancel={this.handleConfigureCacheConfigCancel}
          onOk={this.bindHandleConfigOk('cacheConfig', this.handleConfigureCacheConfigOk)}
        >
          <Form {...formProps} >
            <Form.Item key="cacheTimeConfig" label={cacheControlFieldLabel}>
              <CacheConfigInput
                domain={store.domainDetail}
                isQiniuPrivate={store.isQiniuPrivate}
                modify
                state={stateMap.cacheConfig}
              />
            </Form.Item>
            {(!useStaticCacheConfig || stateMap.cacheConfig.value.enabled) && (
              <Form.Item key="cacheIgnoreParamsConfig" label="忽略 URL 参数">
                <DomainCacheIgnoreParamsConfigInput
                  state={stateMap.cacheConfig.$.$.ignoreParams}
                />
              </Form.Item>
            )}
          </Form>
        </SideModal>

        <SideModal
          title="Referer 防盗链配置"
          visible={store.configuring.refererConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitRefererConfig)}
          onCancel={this.handleConfigureRefererConfigCancel}
          onOk={this.bindHandleConfigOk('refererConfig', this.handleConfigureRefererConfigOk)}
        >
          <Form>
            <RefererConfigInput state={stateMap.refererConfig} />
          </Form>
        </SideModal>

        <SideModal
          title={
            <>
              时间戳防盗链配置
              <Tooltip placement="bottom" title="设置时间戳防盗链后，可以有效避免被盗链的问题。">
                <Icon style={{ marginLeft: '5px', fontSize: '14px' }} type="question-circle" />
              </Tooltip>
            </>
          }
          visible={store.configuring.timeRefererConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitTimeRefererConfig)}
          onCancel={this.handleConfigureTimeRefererConfigCancel}
          onOk={this.bindHandleConfigOk('timeRefererConfig', this.handleConfigureTimeRefererConfigOk)}
        >
          <TimeRefererConfigInput
            domain={store.domainDetail}
            onEditBsAuth={this.handleConfigureBsAuthConfig}
            state={stateMap.timeRefererConfig}
          />
        </SideModal>

        <SideModal
          title="回源鉴权配置"
          visible={store.configuring.bsAuthConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitBsAuthConfig)}
          onCancel={this.handleConfigureBsAuthConfigCancel}
          onOk={this.bindHandleConfigOk('bsAuthConfig', this.handleConfigureBsAuthConfigOk)}
        >
          <Form>
            <BsAuthConfigInput
              modify
              isQiniuPrivate={store.isQiniuPrivate}
              domain={store.domainDetail}
              state={stateMap.bsAuthConfig}
            />
          </Form>
        </SideModal>

        <SideModal
          title="IP 黑白名单配置"
          visible={store.configuring.ipACLConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitIpAclConfig)}
          onCancel={this.handleConfigureIpACLConfigCancel}
          onOk={this.bindHandleConfigOk('ipACLConfig', this.handleConfigureIpACLConfigOk)}
        >
          <Form>
            <IpACLConfigInput state={stateMap.ipACLConfig} />
          </Form>
        </SideModal>

        <SideModal
          title="HTTPS 配置"
          width="750px"
          visible={store.configuring.httpsConfig}
          okBtnDisabled={this.httpsConfigDisabled}
          onCancel={this.handleConfigureHttpsConfigCancel}
          onOk={this.bindHandleConfigOk('httpsConfig', this.handleConfigureHttpsConfigOk)}
        >
          <Form>
            <HttpsConfigInput
              canSwitchProtocol={store.canSwitchProtocol}
              domain={store.domainDetail}
              certInfo={store.certInfo}
              needConfigureCname={store.needConfigureCname}
              isForbidAutoFreeCert={store.isForbidAutoFreeCert}
              state={stateMap.httpsConfig}
            />
          </Form>
        </SideModal>

        <SideModal
          title="图片自动瘦身配置"
          visible={store.configuring.imageSlimConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitImageSlimConfig)}
          onCancel={this.handleConfigureImageSlimConfigCancel}
          onOk={this.bindHandleConfigOk('imageSlimConfig', this.handleConfigureImageSlimConfigOk)}
        >
          <Form>
            <ImageSlimConfigInput state={stateMap.imageSlimConfig} />
          </Form>
        </SideModal>

        <SideModal
          title="图片处理配置"
          visible={store.configuring.fopConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitFopConfig)}
          onCancel={this.handleConfigureFopConfigCancel}
          onOk={this.bindHandleConfigOk('fopConfig', this.handleConfigureFopConfigOk)}
        >
          <Form>
            <FopConfigInput state={stateMap.fopConfig} />
          </Form>
        </SideModal>

        <SideModal
          title={
            <>
              添加 HTTP 响应头
              <Tooltip
                placement="bottom"
                title={
                  <div>若没有你想配置的 HTTP 响应头，请提交
                    <HelpLink href="https://support.qiniu.com/tickets/new/form?category=%E9%85%8D%E7%BD%AE%E9%97%AE%E9%A2%98&space=CDN">
                      工单
                    </HelpLink>
                    进行配置
                  </div>
                }
              >
                <Icon style={{ marginLeft: '5px', fontSize: '14px' }} type="question-circle" />
              </Tooltip>
            </>
          }
          width="720px"
          visible={store.configuring.responseHeaderControlConfig}
          okBtnDisabled={store.shouldDisableSubmit(LoadingType.SubmitRespHeaderConfig)}
          onCancel={this.handleConfigureResponseHeaderConfigCancel}
          onOk={this.bindHandleConfigOk('responseHeaderControlConfig', this.handleConfigureResponseHeaderConfigOk)}
        >
          <Form>
            <HeaderInput
              domain={store.domainDetail}
              state={stateMap.responseHeaderControlConfig}
            />
          </Form>
        </SideModal>

        <PwdConfirm {...this.pwdConfirmStore.bind()} />
      </Page>
    )
  }
}

export interface Props {
  anchor?: string
  name: string
}

export default observer(function NormalAndPanDomainDetailWrapper(props: Props) {
  const [bindRef] = useAutoScrollAnchor(props.anchor as ConfigType)

  const store = useLocalStore(LocalStore, { ...props, bindRef })
  const routerStore = useInjection(RouterStore)
  const bucketStore = useInjection(BucketStore)
  const toasterStore = useInjection(ToasterStore)
  const routes = useInjection(Routes)
  const iamInfo = useInjection(IamInfo)
  const abilityConfig = useInjection(AbilityConfig)

  return (
    <NormalAndPanDomainDetail
      {...props}
      store={store}
      bindRef={bindRef}
      routerStore={routerStore}
      bucketStore={bucketStore}
      toasterStore={toasterStore}
      routes={routes}
      iamInfo={iamInfo}
      abilityConfig={abilityConfig}
    />
  )
})

function getBsAuthBucketMismatchMessage(operationType: OperationType, operatingState: string) {
  const helpLink = (
    <HelpLink href="https://developer.qiniu.com/fusion/kb/7454/detected-domain-source-station-change-need-to-change-back-to-the-source-authentication-configuration">
      回源鉴权
    </HelpLink>
  )

  if (operatingState === OperatingState.Success) {
    return (
      <>
        检测到域名源站发生改变，需重新修改{helpLink}配置
      </>
    )
  }

  if (operatingState === OperatingState.Processing) {
    if (operationType === OperationType.ModifySource) {
      return (
        <>
          检测到域名更改源站处理中，处理成功后请修改{helpLink}配置
        </>
      )
    }
    return (
      <>
        检测到域名源站发生改变，当前操作处理成功后请修改{helpLink}配置
      </>
    )
  }
  return null
}
