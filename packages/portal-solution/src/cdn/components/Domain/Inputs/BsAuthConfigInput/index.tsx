/**
 * @file 域名回源鉴权配置
 * @author nighca <nighca@live.cn>
 */

import { eq, isEmpty } from 'lodash'
import React from 'react'
import { reaction, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import Disposable from 'qn-fe-core/disposable'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'
import Input from 'react-icecream/lib/input'
import Select from 'react-icecream/lib/select'
import InputNumber from 'react-icecream/lib/input-number'

import { getIntValue } from 'cdn/transforms'

import { nonEmptyArray } from 'cdn/utils'

import { ErrorOfMap } from 'cdn/transforms/form'
import { timeLimitTextToTimeLimit, timeLimitToTimeLimitText, getDefaultBsAuthConfig } from 'cdn/transforms/domain/bs-auth'

import { useStateBinding } from 'cdn/hooks/form'

import {
  bsAuthMethodList,
  contentTypes,
  bsAuthMethods,
  UserAuthReqConfObjectTypeForTitles,
  UserAuthReqConfObjectTypes,
  UserAuthReqConfObjectTypeList,
  BsAuthMethodType,
  UserAuthReqConfObjectType
} from 'cdn/constants/domain'

import { IDomainDetail } from 'cdn/apis/domain'

import Switch from '../common/Switch'
import Error from '../common/Error'
import { addHr } from '../common'
import { ReqConfInput } from './ReqConfInput'
import { Value, State, getValue, createState } from './formstate'

import './style.less'

export { State, createState, getValue, getDefaultBsAuthConfig }

export interface IReqConfObject {
  key: string
  type: string
  value: string
}
export interface IUserAuthReqConf {
  header: IReqConfObject[]
  urlquery: IReqConfObject[]
  body: IReqConfObject[]
}

export interface IUserBsauthResultCacheConf {
  cacheEnable: boolean
  cacheDuration: number
}

export interface IBsAuthConfig {
  enable: boolean
  userAuthUrl: string
  method: string
  parameters: string[]
  successStatusCode: number
  failureStatusCode: number
  timeLimitText: string
  timeLimit: number
  strict: boolean
  path?: string[]
  userAuthContentType: string
  userAuthReqConf: IUserAuthReqConf,
  userBsauthResultCacheConf: IUserBsauthResultCacheConf
  backSourceWithResourcePath: boolean
}

export interface Props {
  state: State
  domain: IDomainDetail
  isQiniuPrivate: boolean
  modify: boolean
}

export default observer(function DomainBsAuthConfigInputWrapper(props: Props) {
  const { state, ...restProps } = props

  const { value, error, onChange } = useStateBinding<State, Value, Error>(
    props.state
  )

  return (
    <DomainBsAuthConfigInput
      {...restProps}
      error={error}
      value={value}
      onChange={onChange}
    />
  )
})

type Error = ErrorOfMap<Omit<IBsAuthConfig, 'parameters'> & { parameters: string }>

export interface IDomainBsAuthConfigInputProps {
  domain: IDomainDetail
  isQiniuPrivate: boolean
  modify: boolean
  value: IBsAuthConfig
  error: Error
  onChange: (value: IBsAuthConfig) => void
}

@observer
class DomainBsAuthConfigInput extends React.Component<IDomainBsAuthConfigInputProps, {}> {

  disposable = new Disposable()

  strictSelectWrapper: HTMLElement | null = null

  constructor(props: IDomainBsAuthConfigInputProps) {
    super(props)
    makeObservable(this)
  }

  componentDidMount() {
    // 外部传入 timeLimit 发生变化跟当前 timeLimitText 不匹配时
    // 更新 timeLimitText
    this.disposable.addDisposer(reaction(
      () => this.props.value.timeLimit,
      timeLimit => {
        const { value, onChange } = this.props
        if (!eq(
          timeLimit,
          timeLimitTextToTimeLimit(value.timeLimitText)
        )) {
          onChange({
            ...value,
            timeLimitText: timeLimitToTimeLimitText(timeLimit)
          })
        }
      },
      { fireImmediately: true }
    ))
    // 配置启用时
    // 如果请求方法不存在，默认选中 HEAD 方法
    // userAuthReqConf 对象中的属性为空，置为空数组
    this.disposable.addDisposer(reaction(
      () => this.props.value.enable,
      enable => {
        const { value, onChange } = this.props
        if (!enable) {
          return
        }
        value.userAuthReqConf.header = value.userAuthReqConf.header || []
        value.userAuthReqConf.urlquery = value.userAuthReqConf.urlquery || []
        value.userAuthReqConf.body = value.userAuthReqConf.body || []
        if (!value.method) {
          onChange({
            ...value,
            method: bsAuthMethods.head,
            userAuthReqConf: value.userAuthReqConf
          })
          return
        }
        onChange({
          ...value,
          userAuthReqConf: value.userAuthReqConf
        })
      },
      { fireImmediately: true }
    ))
    // 如果请求方法为 GET 或 HEAD，userAuthReqConf.body 为空
    // 如果请求方法为 POST，userAuthReqConf.body 可编辑
    this.disposable.addDisposer(reaction(
      () => this.props.value.method,
      method => {
        const { value, onChange } = this.props
        if (method === bsAuthMethods.get || method === bsAuthMethods.head) {
          value.userAuthReqConf.body = []
          onChange({
            ...value,
            userAuthReqConf: value.userAuthReqConf
          })
        }
      }
    ))
    // 当请求方法不为 GET 或 HEAD，且 userAuthReqConf.body 至少有一项时，Content-Type 为默认值，否则为空
    this.disposable.addDisposer(reaction(
      () => this.isContentTypeVisible,
      isContentTypeVisible => {
        const { value, onChange } = this.props
        // 直接修改 value 中的值，避免其他 onChange 函数运行时造成改动被原值覆盖
        value.userAuthContentType = isContentTypeVisible ? contentTypes.json : ''
        onChange({ ...value })
      }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @autobind handleEnableChange(enable: boolean) {
    const { value: bsAuthConfig, onChange, domain } = this.props
    // 开启的话，给一些默认值，而不是使用当前值
    if (!domain.bsauth.enable && enable) {
      onChange({
        ...getDefaultBsAuthConfig(),
        enable: true
      })
      return
    }
    onChange({
      ...bsAuthConfig,
      enable
    })
  }

  getTips() {
    const { modify, isQiniuPrivate } = this.props
    return (
      <div key="tips" className="help">
        <p className="line">注意：</p>
        <ul className="tips">
          <li>使用回源鉴权功能，每次请求都要鉴权，访问量大时，需考虑鉴权服务器的压力和访问性能。</li>
          <li><span className="text-warning">回源鉴权与时间戳防盗链功能不能同时开启。</span></li>
          {isQiniuPrivate && <li>
            <span className="text-warning">
              私有空间绑定的域名开启回源鉴权，建议将 .m3u8 设置为不缓存。
              {modify && '如果当前没有配置我们会默认增加一条 .m3u8 不缓存的规则，如果已有配置我们不会修改。'}
            </span>
          </li>}
          {isQiniuPrivate && <li>七牛私有空间一键开启即可，无需填写配置。</li>}
        </ul>
      </div>
    )
  }

  @autobind handleUserAuthUrlChange(e: React.FormEvent<any>) {
    const { value: bsAuthConfig, onChange } = this.props
    onChange({
      ...bsAuthConfig,
      userAuthUrl: (e.target as any).value.trim()
    })
  }

  getUserAuthUrlInput() {
    const { value: bsAuthConfig, error } = this.props
    return (
      <div key="user-auth-url-input">
        <h4 className="line">鉴权服务器地址</h4>
        <p className="line">格式： https://auth.example.com/cdnauth 或者 http://127.0.0.1:8080/cdnauth</p>
        <div className="line">
          <div className="text-input-wrapper">
            <Input
              placeholder="请输入鉴权服务器地址"
              value={bsAuthConfig.userAuthUrl}
              onChange={this.handleUserAuthUrlChange}
            />
          </div>
          <Error error={error && error.userAuthUrl} />
        </div>
      </div>
    )
  }

  @autobind handleMethodChange(e: RadioChangeEvent) {
    const { value: bsAuthConfig, onChange } = this.props
    onChange({
      ...bsAuthConfig,
      method: (e.target as any).value
    })
  }

  getMethodInput() {
    const bsAuthConfig = this.props.value
    const radios = bsAuthMethodList.map(
      method => <Radio key={method} value={method}>{method}</Radio>
    )
    return (
      <div key="method-input">
        <h4 className="line">请求方法</h4>
        <div className="line">
          <Radio.Group
            value={bsAuthConfig.method}
            onChange={this.handleMethodChange}
          >{radios}</Radio.Group>
        </div>
      </div>
    )
  }

  @autobind handleParametersChange(e: React.FormEvent<any>) {
    const { value: bsAuthConfig, onChange } = this.props
    const parametersText: string = (e.target as any).value
    const parameters = parametersText.split('\n')
    onChange({
      ...bsAuthConfig,
      parameters
    })
  }

  getParametersInput() {
    const { value: bsAuthConfig, error } = this.props
    const parametersText = (bsAuthConfig.parameters || []).join('\n')
    return (
      <div key="parameters-input">
        <h4 className="line">鉴权参数</h4>
        <p className="line">约定需要传递的 URL 参数，每行输入一个，用回车分隔，最多支持输入 20 条。</p>
        <div className="line">
          <div className="text-input-wrapper">
            <Input.TextArea
              autosize={{ minRows: 5, maxRows: 10 }}
              placeholder="请输入鉴权参数，例如&#10;param1&#10;param2"
              value={parametersText}
              onChange={this.handleParametersChange}
            />
          </div>
          <Error error={error && error.parameters} />
        </div>
      </div>
    )
  }

  @autobind handleSuccessStatusCodeChange(e: React.FormEvent<any>) {
    const { value: bsAuthConfig, onChange } = this.props
    onChange({
      ...bsAuthConfig,
      successStatusCode: getIntValue(e)
    })
  }

  @autobind handleFailureStatusCodeChange(e: React.FormEvent<any>) {
    const { value: bsAuthConfig, onChange } = this.props
    onChange({
      ...bsAuthConfig,
      failureStatusCode: getIntValue(e)
    })
  }

  getStatusCodeInput() {
    const { value: bsAuthConfig, error } = this.props
    return (
      <div key="status-code-input">
        <h4 className="line">鉴权返回状态码</h4>
        <p className="line">约定合法请求鉴权返回内容，三位数字，建议不使用 5XX</p>
        <p className="line">建议鉴权成功返回状态码: 2XX，鉴权失败返回状态码: 4XX</p>
        <div className="line status-code-input-line">
          <label className="status-code-input-label">鉴权成功</label>
          <div className="text-input-wrapper status-code-input-wrapper">
            <Input
              type="number"
              placeholder="2XX"
              value={bsAuthConfig.successStatusCode}
              onChange={this.handleSuccessStatusCodeChange}
            />
          </div>
          <Error error={error && error.successStatusCode} />
        </div>
        <div className="line status-code-input-line">
          <label className="status-code-input-label">鉴权失败</label>
          <div className="text-input-wrapper status-code-input-wrapper">
            <Input
              type="number"
              placeholder="4XX"
              value={bsAuthConfig.failureStatusCode}
              onChange={this.handleFailureStatusCodeChange}
            />
          </div>
          <Error error={error && error.failureStatusCode} />
        </div>
      </div>
    )
  }

  @autobind handleTimeLimitChange(e: React.FormEvent<any>) {
    const { value: bsAuthConfig, onChange } = this.props
    const timeLimitText = (e.target as any).value
    const timeLimit = timeLimitTextToTimeLimit(timeLimitText)
    onChange({
      ...bsAuthConfig,
      timeLimitText,
      timeLimit
    })
  }

  getTimeLimitInput() {
    const { value: bsAuthConfig, error } = this.props
    return (
      <div key="time-limit-input">
        <h4 className="line">超时等待时间</h4>
        <p className="line">范围：最小 0.1s，最大 10s</p>
        <div className="line">
          <div className="text-input-wrapper time-limit-input-wrapper">
            <Input
              type="number"
              addonAfter={<span className="time-limit-unit">秒</span>}
              value={bsAuthConfig.timeLimitText}
              onChange={this.handleTimeLimitChange}
            />
          </div>
          <Error error={error && error.timeLimit} />
        </div>
      </div>
    )
  }

  @autobind handleStrictChange(strictValue: string) {
    const { value: bsAuthConfig, onChange } = this.props
    onChange({
      ...bsAuthConfig,
      strict: strictValue === 'true'
    })
  }

  @autobind updateStrictSelectWrapper(element: HTMLElement | null) {
    this.strictSelectWrapper = element
  }

  getStrictInput() {
    const bsAuthConfig = this.props.value
    const strictValue = !!bsAuthConfig.strict + ''
    return (
      <div key="strict-input">
        <h4 className="line">鉴权超时</h4>
        <div className="line">
          <div className="text-input-wrapper strict-input-wrapper" ref={this.updateStrictSelectWrapper}>
            <Select
              value={strictValue}
              onChange={this.handleStrictChange}
              getPopupContainer={() => this.strictSelectWrapper!}
            >
              <Select.Option value="false">鉴权通过</Select.Option>
              <Select.Option value="true">鉴权失败</Select.Option>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  @autobind handleCacheInputEnableChange(enable: boolean) {
    const { value, onChange } = this.props
    onChange({
      ...value,
      userBsauthResultCacheConf: {
        cacheEnable: enable,
        cacheDuration: enable
          ? value.userBsauthResultCacheConf.cacheDuration
          : 240
      }
    })
  }

  @autobind handleCacheInputDurationChange(duration: number) {
    const { value, onChange } = this.props
    onChange({
      ...value,
      userBsauthResultCacheConf: {
        ...value.userBsauthResultCacheConf,
        cacheDuration: duration
      }
    })
  }

  getCacheInput() {
    const { userBsauthResultCacheConf } = this.props.value
    const defaultCacheConfig = getDefaultBsAuthConfig().userBsauthResultCacheConf
    const { cacheEnable, cacheDuration } = userBsauthResultCacheConf || defaultCacheConfig
    return (
      <div key="cache-input">
        <h4 className="line">鉴权结果缓存</h4>
        <div className="line">
          <div className="text-input-wrapper cache-input-wrapper" >
            <Switch checked={cacheEnable} onChange={this.handleCacheInputEnableChange} />
            {
              cacheEnable && (
                <div className="cache-time-input">
                  <span className="cache-input-label">鉴权结果缓存时间</span>
                  <InputNumber
                    min={1}
                    max={86400}
                    precision={0}
                    formatter={value => `${value} 秒`}
                    value={cacheDuration}
                    onChange={this.handleCacheInputDurationChange}
                  />
                </div>
              )
            }
          </div>
        </div>
      </div>
    )
  }

  @autobind handleBackSourceWithResourcePathChange(checked: boolean) {
    const { value: bsAuthConfig, onChange } = this.props
    onChange({
      ...bsAuthConfig,
      backSourceWithResourcePath: checked
    })
  }

  getBackSourceWithResourcePathInput() {
    const bsAuthConfig = this.props.value
    return (
      <div key="back-source-width-path-input">
        <h4 className="line">完整 URL 回源鉴权</h4>
        <p className="line">是否将用户请求的完整资源路径拼接在鉴权服务地址后回源鉴权，默认关闭 - 不拼接</p>
        <div className="line">
          <Switch
            checked={bsAuthConfig.backSourceWithResourcePath}
            onChange={this.handleBackSourceWithResourcePathChange}
          />
        </div>
      </div>
    )
  }

  @computed get isPostMethod() {
    return this.props.value.method === bsAuthMethods.post
  }
  @computed get isUserAuthReqConfBodyEmpty() {
    return isEmpty(this.props.value.userAuthReqConf.body)
  }
  @computed get isContentTypeVisible() {
    return this.isPostMethod && !this.isUserAuthReqConfBodyEmpty
  }

  @autobind handleContentTypeChange(contentType: string) {
    const { value: bsAuthConfig, onChange } = this.props
    onChange({
      ...bsAuthConfig,
      userAuthContentType: contentType
    })
  }
  getUserAuthContentTypeInput() {
    const { value: bsAuthConfig } = this.props
    const isVisible = this.isContentTypeVisible
    return (
      isVisible
      ? <div key="content-type-input">
        <h4 className="line">Content-Type</h4>
        <div className="line">
          <div className="text-input-wrapper">
            <Select
              value={bsAuthConfig.userAuthContentType}
              onChange={this.handleContentTypeChange}
            >
              <Select.Option value={contentTypes.json}>{contentTypes.json}</Select.Option>
              <Select.Option value={contentTypes.formUrlencoded}>{contentTypes.formUrlencoded}</Select.Option>
            </Select>
          </div>
        </div>
      </div>
      : null
    )
  }

  @autobind handleReqConfInput(objectType: UserAuthReqConfObjectType, value: IReqConfObject[]) {
    const { value: bsAuthConfig, onChange } = this.props
    bsAuthConfig.userAuthReqConf[objectType] = value
    onChange({
      ...bsAuthConfig,
      userAuthReqConf: bsAuthConfig.userAuthReqConf
    })
  }
  // 当请求方法为 GET 或 HEAD 时 ，删除请求配置对象中的 body 属性
  @autobind isShowReqConfOfBodyInput(method: BsAuthMethodType, objectType: UserAuthReqConfObjectType) {
    if (
      (method === bsAuthMethods.get || method === bsAuthMethods.head)
      && objectType === UserAuthReqConfObjectTypes.body
    ) {
      return false
    }
    return true
  }
  getUserAuthReqConfInput() {
    const { value: bsAuthConfig, error } = this.props
    return (
      <div key="req-conf-input">
        <h4 className="line req-conf-title">更多参数</h4>
        <p className="line">你可以添加更多需要传递的参数，这些参数不参与鉴权。</p>
        {
          UserAuthReqConfObjectTypeList.filter(
            objectType => this.isShowReqConfOfBodyInput(bsAuthConfig.method as BsAuthMethodType, objectType)
          ).map(
            objectType => (
              <ReqConfInput
                key={objectType}
                title={UserAuthReqConfObjectTypeForTitles[objectType]}
                error={error?.userAuthReqConf?.[objectType] as IReqConfObject[]}
                value={bsAuthConfig.userAuthReqConf[objectType]}
                onChange={value => this.handleReqConfInput(objectType, value)}
              />
            )
          )
        }
      </div>
    )
  }

  getInputs() {
    // 七牛私有空间一键开启即可，无需填写配置
    if (this.props.isQiniuPrivate) {
      return []
    }
    return [
      this.getUserAuthUrlInput(),
      this.getMethodInput(),
      this.getParametersInput(),
      this.getUserAuthReqConfInput(),
      this.getBackSourceWithResourcePathInput(),
      this.getUserAuthContentTypeInput(),
      this.getStatusCodeInput(),
      this.getTimeLimitInput(),
      this.getStrictInput(),
      this.getCacheInput()
    ]
  }

  getDetailContent() {
    const bsAuthConfig = this.props.value
    if (!bsAuthConfig.enable) {
      return null
    }
    return (
      <div>
        {addHr(nonEmptyArray([
          this.getTips(),
          ...this.getInputs()
        ]))}
      </div>
    )
  }

  render() {
    const { value: bsAuthConfig, domain, isQiniuPrivate } = this.props
    const shouldDisableSwitch = domain.timeACL.enable && !bsAuthConfig.enable
    const tipForDisable = (
      shouldDisableSwitch
      ? <p className="line">时间戳防盗链与回源鉴权功能不能同时开启</p>
      : null
    )

    const warningForQiniuPrivate = (
      isQiniuPrivate
      ? (
        <span
          className="text-warning"
          style={{
            verticalAlign: 'middle',
            marginLeft: '1em'
          }}
        >
          源站在七牛私有 BUCKET，建议打开回源鉴权功能。
        </span>
      )
      : null
    )

    return (
      <div className="domain-bs-auth-config-input-wrapper">
        {tipForDisable}
        <div className="line">
          <Switch disabled={shouldDisableSwitch} checked={bsAuthConfig.enable} onChange={this.handleEnableChange} />
          {warningForQiniuPrivate}
        </div>
        {this.getDetailContent()}
      </div>
    )
  }
}
