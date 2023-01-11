/**
 * @file 镜像回源 (image / mirror / source)
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// TODO: copy 回 kodo admin

import * as React from 'react'
import { computed, action, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FieldState } from 'formstate-x'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Spin, Checkbox, Drawer, Icon, Tooltip } from 'react-icecream/lib'

import Disposable from 'qn-fe-core/disposable'
import { getMessage } from 'qn-fe-core/exception'
import { ApiException } from 'qn-fe-core/client'
// import { getMessageOfException } from 'portal-base/common/utils/exception'
// import globalExceptionStore from 'portal-base/common/stores/exception'
import { Loadings } from 'portal-base/common/loading'
import { bindCheckbox } from 'portal-base/common/form'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { KodoProxyApiException } from 'portal-base/kodo/apis/proxy'

import { valuesOfEnum } from 'kodo/utils/ts'

import docStyles from 'kodo/styles/card.m.less'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { SourceMode, fileName } from 'kodo/constants/bucket/setting/source'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { ISourceLine, ISourceConfig, SourceApis } from 'kodo/apis/bucket/setting/source'
import { ResourceApis } from 'kodo/apis/bucket/resource'

import Source, { Value, State, createState, getValue, isLinesEmpty } from './Source'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  visible: boolean
  onVisibleChange(visible: boolean): void
}

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetSource = 'getSource',
  GetRobot = 'getRobot',
  Submit = 'submit'
}

// TODO: 删掉 & 提示信息细化（分接口、按文档） 用 /mirrorConfig/set 之后也许可以删掉
function getExceptionMessage(error: any): string {
  const prefix = '部分保存失败'
  const defaultMessage = '未知错误'

  if (!(error instanceof ApiException)) {
    const message = getMessage(error)
    return `${prefix}：${message || defaultMessage}`
  }

  const { code } = error

  // HACK: 不应该消费后端 error 字段的信息，目前维持现状，后续用 /mirrorConfig/set 之后应该可以去掉
  const errorMessage = error instanceof KodoProxyApiException ? error.payload.error : undefined

  const message = errorMessage || getMessage(error) || defaultMessage

  return `[${code}] ${prefix}：${message}`
}

@observer
class InternalSourceMain extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  userInfoStore = this.props.inject(UserInfo)
  sourceApis = this.props.inject(SourceApis)
  resourceApis = this.props.inject(ResourceApis)

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  // 保存实际线路，用于删除，后端接口垃圾
  originalLines: ISourceLine[]

  @observable.ref form: State

  @observable.ref isRobotFileExist = false // 检测不一定准确、也不太重要，所以宽松点比较好
  defaultRobotFieldState = new FieldState(false)

  @computed
  get isInitializing() {
    return this.loadings.isLoading(Loading.GetSource) || this.loadings.isLoading(Loading.GetRobot)
  }

  @action.bound
  createState(config: ISourceConfig) {
    const sources = sourcesAdaptor(config)

    // HACK: 如果一开始就是禁用，那么就假装里面没数据
    // TODO: 用 /mirrorConfig/set 实现可以绕开这个？
    if (isLinesEmpty(sources)) {
      const defaultEmptySourceConfig = {
        bucket: this.props.bucketName,
        lines: []
      } as ISourceConfig
      config = defaultEmptySourceConfig
    }

    const mode = config.source_mode || SourceMode.Normal

    const value: Value = {
      lines: sources,
      mode,
      host: config.host || '',
      rawQueryEnabled: config.mirror_raw_query_option || false,
      ...(
        mode !== SourceMode.Fragment
          ? {}
          : {
            fragmentSize: config.fragment_opt!.fragment_size,
            ignoreEtagCheck: config.fragment_opt!.ignore_etag_check
          }
      ),
      sourceRetryCodes: config.source_retry_codes || [],
      headers: config.pass_headers || []
    }

    if (this.form) {
      this.form.dispose()
    }
    this.form = createState(value)
    this.disposable.addDisposer(this.form.dispose)
  }

  @computed
  get value() {
    return getValue(this.form)
  }

  // @autobind handleResetClick() {
  //   this.form.reset()
  // }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.GetSource)
  getSource() {
    return this.sourceApis.getMirrorConfig(this.props.bucketName)
      .then(res => {
        this.originalLines = sourcesAdaptor(res)
        return res
      })
  }

  @autobind
  @Loadings.handle(Loading.Submit)
  async doSubmit(value: Value) {
    const { bucketName } = this.props

    // TODO: 按目前实现，禁用期间修改的部分配置不会被保存，行为不一致
    // （前者指的是一开始就是禁用状态，点启用，改配置，再点禁用，最后点保存确定）
    // （后者指的是一开始就是启用状态，改配置，点禁用，保存）
    // 如果把后者的行为也改成不保存配置变更，那么就要保存完整的 originalSource 而不是 originalLines 了
    // 并且就算改了，后面的 n 个接口也要做类似调整，很麻烦，就先不搞了
    // 毕竟禁用了，这些配置和状态信息就不重要了
    // 其实，因为现在禁用不清空配置，所以下次启用的时候还能看到上次信息，这本身就很奇怪
    // 然而禁用清空又是做不到的
    // TODO: 用 /mirrorConfig/set 之后也许可以删掉
    if (isLinesEmpty(this.originalLines) && isLinesEmpty(value.lines)) {
      return
    }

    // 下面这堆接口是串行的，主要是不能并发（而不是顺序）
    // TODO: 提示信息细化（分接口、按文档）
    // TODO: 用 /mirrorConfig/set 代替 /source/set 等接口？

    await this.sourceApis.setSource(bucketName, {
      sources: value.lines,
      host: value.host,
      source_retry_codes: value.sourceRetryCodes,
      originalLines: this.originalLines // 用于禁用（清空删除）
    }, this.defaultRobotFieldState.value)

    this.originalLines = sourcesAdaptor({
      sources: value.lines
    })

    await this.sourceApis.enableSourceRawQuery(bucketName, !!value.rawQueryEnabled)

    await this.sourceApis.passMirrorHeaders(bucketName, value.headers!)

    await this.sourceApis.setSourceMode(
      bucketName,
      value.mode !== SourceMode.Fragment
        ? { mode: value.mode! }
        : {
          mode: SourceMode.Fragment,
          fragment: {
            size: value.fragmentSize!,
            ignoreEtagCheck: !!value.ignoreEtagCheck
          }
        }
    )
  }

  @action
  updateBucketInfo(_value: Value) {
    // TODO: 问题详见 kodo admin 相同地方，暂不处理
  }

  @action.bound
  updateRobotFileState(isExist: boolean) {
    this.isRobotFileExist = isExist
  }

  @Toaster.handle(undefined, `获取 ${fileName} 文件信息失败`)
  @Loadings.handle(Loading.GetRobot)
  fetchRobotFileState() {
    return this.resourceApis.isFileAvailable(this.props.bucketName, { key: fileName })
      .then(this.updateRobotFileState)
  }

  @autobind
  async handleSaveClick() {
    const result = await this.form.validate()

    // TODO: scroll into view
    if (result.hasError) {
      return
    }

    try {
      await this.doSubmit(this.value)
    } catch (err) {
      // TODO: 用 @ToasterStore.handle('保存成功！', '部分保存失败：{{msg}}') 代替
      const message = getExceptionMessage(err)
      this.toasterStore.error(message)
      return
    }

    this.updateBucketInfo(this.value)
    this.toasterStore.success('保存成功！')

    this.props.onVisibleChange(false)
  }

  @computed
  get mainView() {
    if (!this.form) {
      return (<Spin />)
    }

    return (
      <Spin spinning={this.isInitializing}>
        <div className={styles.wrapper}>
          <Source state={this.form} bucketName={this.props.bucketName} />
        </div>
      </Spin>
    )
  }

  render() {
    return (
      <Drawer
        title={
          <span>
            镜像回源
            <Tooltip title="文档">
              <HelpDocLink doc="source" className={docStyles.extraButton}>
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        footerExtra={
          // TODO: robot 已存在时的交互优化和状态显示优化
          <Checkbox disabled={this.isRobotFileExist} {...bindCheckbox(this.defaultRobotFieldState)}>
            自动生成默认的 {fileName} 配置文件（仅当 {fileName} 不存在）
          </Checkbox>
        }
        visible={this.props.visible}
        onClose={() => this.props.onVisibleChange(false)}
        onOk={this.handleSaveClick}
        confirmLoading={this.loadings.isLoading(Loading.Submit)}
        okButtonProps={{ disabled: this.userInfoStore.isBufferedUser || this.isInitializing }}
        width="640"
      >
        {this.mainView}
      </Drawer>
    )
  }

  init() {
    this.getSource().then(this.createState)
    this.fetchRobotFileState()
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          // TODO: 更新，但是不清空？
          this.init()
        }
      },
      {
        fireImmediately: true
      }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function SourceMain(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSourceMain {...props} inject={inject} />
    )} />
  )
}

// TODO: 兼容老接口，后续应从前端去掉，因为无法保证正确性 + 老 kodo portal + @strii
function sourcesAdaptor(config: Pick<ISourceConfig, 'source' | 'sources'>) {
  return config.sources
    || config.source && config.source.split(';').map(
      url => ({
        addr: url,
        weight: 1,
        backup: false
      })
    )
    || []
}
