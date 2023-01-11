/**
 * @file Input for domain source test 即 testURLPath 的输入组件
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observable, action, computed, reaction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import autobind from 'autobind-decorator'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { injectProps, useLocalStore } from 'qn-fe-core/local-store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { bindTextInput } from 'portal-base/common/form'

import Cluster from 'cdn/utils/async/cluster'

import { textRequired, textPattern } from 'cdn/transforms/form'
import { humanizeSourceURLScheme } from 'cdn/transforms/domain'

import { SourceType, SourceURLScheme } from 'cdn/constants/domain'

import TipIcon from 'cdn/components/TipIcon'

import DomainApis, { IDomainDetail, ITestSourceOptions } from 'cdn/apis/domain'

import Error from '../common/Error'

import './style.less'

const sourceTestURLPathPattern = {
  dynamic: /^((?!\.(jsp|action|php|asp|aspx|avi|mkv|mp4|mov|flv|rm|rmvb|swf|mp3|wav|wmv|rmi|aac)$).)+$/,
  protocol: /^((?!^(http|https):\/\/).)+$/
}

const validatedResults = {
  unTested: 'unTested',
  testing: 'testing',
  testFailed: 'testFailed'
}

enum TestResult {
  Pass = 'Pass', // 测试通过
  Failed = 'Failed', // 测试不通过
  RedirectHttps = 'RedirectHttps' // 强制 HTTPS 访问（处理成正常情况）
}

export type State = FieldState<string>

export type Value = string

export function createState(val: string) {
  return new FieldState(val != null ? val : '').validators(
    textRequired,
    v => textPattern(sourceTestURLPathPattern.dynamic)(v, '测试资源暂不支持动态资源和音视频格式'),
    v => textPattern(sourceTestURLPathPattern.protocol)(v, '测试资源无需填写协议以及域名，只需填写路径')
  )
}

export interface Props {
  domains: IDomainDetail[]
  state: State
  onTestTriggered: () => void
}

export default observer(function DomainSourceTestWrapper(props: Props) {
  const store = useLocalStore(LocalStore, props)

  return (
    <DomainSourceTest store={store} {...props} />
  )
})

enum LoadingType {
  TestSource = 'testSource'
}

const clusterTaskWorkerNum = 5

@injectable()
class LocalStore extends Store {

  loadings = Loadings.collectFrom(this, LoadingType)

  // null: 无结果（未测试或测试未完成）
  @observable testResult: Array<{ name: string, result: TestResult }> | null = null

  @observable testTriggered = false

  constructor(
    @injectProps() private props: Props,
    public toasterStore: Toaster,
    private domainApis: DomainApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  getResultDomains(type: TestResult): string[] {
    if (!this.testResult) {
      return []
    }
    return this.testResult.filter(r => r.result === type).map(r => r.name)
  }

  @computed get isLoadingTestSource() {
    return this.loadings.isLoading(LoadingType.TestSource)
  }

  @computed get failedDomains(): string[] {
    return this.getResultDomains(TestResult.Failed)
  }

  @computed get redirectDomains(): string[] {
    return this.getResultDomains(TestResult.RedirectHttps)
  }

  @computed get batchTestResult(): TestResult | null {
    if (!this.testResult) {
      return null
    }
    if (this.failedDomains.length === 0 && this.testResult.length === this.testSourceParams.length) {
      return TestResult.Pass
    }
    return TestResult.Failed
  }

  @computed get showRedirectHttpsWarning() {
    return (this.testResult || []).some(it => (
      it.result === TestResult.RedirectHttps
    ))
  }

  @action updateTestTriggered(testTriggered: boolean) {
    this.testTriggered = testTriggered
  }

  @action updateResult(result: Array<{ name: string, result: TestResult }>) {
    this.testResult = result
  }

  @action resetResult() {
    this.testResult = null
  }

  @computed get testSourceParams() {
    const domains = this.props.domains
    return domains.map(domain => ({
      domainName: domain.name,
      options: {
        protocol: domain.protocol,
        sourceHost: domain.source.sourceHost,
        sourceType: domain.source.sourceType,
        sourceDomain: domain.source.sourceDomain,
        sourceIPs: domain.source.sourceIPs,
        sourceURLScheme: domain.source.sourceURLScheme,
        advancedSources: domain.source.advancedSources,
        testURLPath: domain.source.testURLPath,
        testSourceHost: domain.source.testSourceHost
      }
    }))
  }

  @computed get testSourceParamsSign() {
    return JSON.stringify(this.testSourceParams)
  }

  @Loadings.handle(LoadingType.TestSource)
  testSource() {
    const testing = this.testSourceParamsSign

    const requestTask = (param: { domainName: string, options: ITestSourceOptions }) => {
      const { domainName, options } = param
      return this.domainApis.testSource(domainName, options).then(
        resp => ({ name: domainName, result: resp && resp.jumpHttps ? TestResult.RedirectHttps : TestResult.Pass }),
        () => ({ name: domainName, result: TestResult.Failed })
      )
    }

    const cluster = new Cluster(requestTask, clusterTaskWorkerNum)

    return cluster.start(this.testSourceParams).then(
      result => this.testSourceParamsSign === testing && this.updateResult(result)
    )
  }

  @computed get sourcePrefix(): string {
    const domain = this.props.domains[0]
    let hostText
    switch (domain.source.sourceType) {
      case SourceType.Domain:
        hostText = domain.source.sourceDomain || '<domain>'
        break
      case SourceType.Ip:
        hostText = domain.source.sourceIPs[0] || '<ip>'
        break
      case SourceType.Advanced:
        hostText = domain.source.advancedSources[0] && domain.source.advancedSources[0].addr || '<domain/ip>'
        break
      default:
    }
    return hostText + '/'
  }

  // 默认使用第一个域名的回源协议
  @computed get sourceURLScheme() {
    const domain = this.props.domains[0]
    const { sourceURLScheme } = domain.source

    return sourceURLScheme
  }

  @computed get inputPrefix() {
    const protocol = this.sourceURLScheme !== SourceURLScheme.Follow ? this.sourceURLScheme : 'http(s)'
    return `${protocol}://${this.sourcePrefix}`
  }

  @computed get shouldForbidTestSource(): boolean {
    return this.isLoadingTestSource || this.props.state.hasError
  }

  init() {
    // 测试条件发生改变时 reset 测试结果哦
    this.addDisposer(reaction(
      () => this.testSourceParamsSign,
      () => this.resetResult()
    ))

    // 由于没有 validator 实现测试资源可用性的功能，所以这里手动同步一次
    // 之所以要 trace validated，是因为需要在调用 fieldState.validate() 后重新同步一下状态
    // 又因为要规避用户点击测试导致的 validate 所以引入了 testTriggered 的状态
    this.addDisposer(reaction(
      () => [this.props.state.validated, this.batchTestResult],
      ([_, testResult]) => {
        if (!this.testTriggered) {
          const error = this.props.state.error
          || testResult === TestResult.Failed && '测试失败'
          || testResult === null && '资源待测试'
          this.props.state.setError(error)
        }
      }
    ))
  }
}

@observer
class DomainSourceTest extends React.Component<Props & { store: LocalStore }> {

  @autobind handleTestBtnClick() {
    this.props.store.updateTestTriggered(true)
    this.props.onTestTriggered()
    this.props.state.validate().then(({ hasError }) => {
      if (!hasError) {
        this.props.store.testSource()
      }
    }).then(() => {
      this.props.store.updateTestTriggered(false)
    })
  }

  getErrorTipForInput() {
    const error = this.props.state.error
    if (
      error === validatedResults.testing
      || error === validatedResults.testFailed
    ) {
      return null
    }

    if (error === validatedResults.unTested) {
      return <Error error="未测试" />
    }

    return <Error error={error} />
  }

  getTestResult() {
    const store = this.props.store
    if (!store.batchTestResult) {
      return null
    }

    if (store.showRedirectHttpsWarning) {
      return <TestRedirectResult sourceURLScheme={store.sourceURLScheme} redirectDomains={store.redirectDomains} />
    }

    return (
      store.batchTestResult === TestResult.Pass
        ? <div className="text-success">测试通过</div>
        : <div className="text-danger">域名「{store.failedDomains.join('、')}」测试未通过</div>
    )
  }

  getInputTip() {
    const testResult = this.getTestResult()
    const errorTip = this.getErrorTipForInput()
    return (
      <div className="input-tip">
        {testResult != null ? testResult : errorTip}
      </div>
    )
  }

  render() {
    const store = this.props.store
    const state = this.props.state

    return (
      <div className="domain-source-test-wrapper">
        <div className="line">
          <span className="sub-input-label">
            源站测试 &nbsp;
            <TipIcon tip={<SourceTestTips />} maxWidth="500px" />
          </span>
          <div className="text-input-wrapper">
            <Input
              placeholder="测试资源名"
              {...bindTextInput(state)}
              addonBefore={<span className="test-url-path-input-prefix">{store.inputPrefix}</span>}
            />
          </div>
          <Button className="test-btn" onClick={this.handleTestBtnClick}>源站测试</Button>
          {this.getInputTip()}
        </div>
      </div>
    )
  }
}

function SourceTestTips() {
  return (
    <ul className="comp-source-test-tips">
      <li className="tip-line">
        1. 建议使用静态文本作为测试资源，如：index.html .csv .txt，大小建议小于 1KB，请保证测试资源可访问；
      </li>
      <li className="tip-line">
        2. 源站测试时，当选择的回源协议是 HTTPS 时，请确保源站证书能够校验通过值为回源 HOST（默认为加速域名）的域名；
      </li>
      <li className="tip-line">
        3. 源站测试请求的 HOST HEADER 值是加速域名或指定的回源 HOST，与回源域名或回源 IP 无关，请确保源站有配置相应的 HOST；
      </li>
      <li className="tip-line">
        4. 批量添加域名时，系统会对每个域名都进行源站验证，只有所有域名都验证通过之后才能继续创建域名；
      </li>
      <li className="tip-line">
        5. 域名创建成功后，测试资源不要删除，后续如果域名配置发生更改系统会进行测试用以保证域名的访问性。
      </li>
    </ul>
  )
}

interface ITestRedirectResultProps {
  sourceURLScheme: string
  redirectDomains: string[]
}

function TestRedirectResult(props: ITestRedirectResultProps) {
  const { sourceURLScheme, redirectDomains } = props

  return (
    <div className="test-result redirect-result">
      <p>
        <span className="text-success">测试通过，</span>
        <span className="text-warning">
          检测到以下域名源站强制 HTTPS 访问 &nbsp;
          <TipIcon
            tip={(
              <>
                目前回源协议为：{humanizeSourceURLScheme(sourceURLScheme)}，
                可能导致回源访问重定向次数过多，建议您进行以下操作：
                <p className="tip-line help">
                  1. 关闭源站的强制 HTTPS 访问配置或修改 CDN 回源协议为 HTTPS 回源（创建域名环境下，需要先把加速域名协议切换到 HTTPS）。
                </p>
                <p className="tip-line help">
                  2. 调整后，重新刷新 CDN 目录缓存。
                </p>
              </>
            )}
          />
        </span>
      </p>
      <ul className="redirect-domains">
        {redirectDomains.map(it => (
          <li key={it} className="redirect-domains-item">{it}</li>
        ))}
      </ul>
    </div>
  )
}
