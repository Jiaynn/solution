/**
 * @file HTTPSSetting component
 * @description 证书设置的侧滑弹窗
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, reaction, action, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { FormState, FieldState } from 'formstate'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { makeCancelled } from 'qn-fe-core/exception'
import { Link } from 'portal-base/common/router'
import { Form, Drawer, Switch, Select, Alert } from 'react-icecream'

import { bindSwitchField } from 'kodo/utils/formstate'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import { CertStore } from 'kodo/stores/certificate'

import { getCertificatePath } from 'kodo/routes/certificate'

import FormTrigger from 'kodo/components/common/FormTrigger'

import Prompt from 'kodo/components/common/Prompt'

import styles from './style.m.less'

export interface IData {
  state?: boolean
  domain?: string // 要绑定的域名
  certificateId?: string
}

export interface IProps extends IData {
  onClose: () => void
  isVisible: boolean // 显示
}

interface DiDeps {
  inject: InjectFunc
}

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18, offset: 1 }
} as const

@observer
class InternalHTTPSSetting extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  disposable = new Disposable()
  form = this.createFormState()

  @action.bound
  clearFormStateAndClose() {
    this.form.reset()
    this.props.onClose()
  }

  // 证书管理提示信息
  @computed
  get certificateManagePromptView() {
    return (
      <Inject render={({ inject }) => (
        <Prompt>
          点击
          <Link to={getCertificatePath(inject)}> SSL 证书管理</Link>
          查看托管证书详情或申请、
          <Link to={getCertificatePath(inject, { openUpload: true })}>上传新 SSL 证书</Link>
        </Prompt>
      )} />
    )
  }

  // 证书生效时间提示
  @computed
  get certificateEffectiveTimeView() {
    return (
      <Alert
        type="warning"
        className={styles.effectiveTime}
        message="更新域名 HTTPS 配置后，约需 10 分钟生效"
      />
    )
  }

  // 当前域名可用的证书列表
  @computed
  get suitableCertification() {
    const certStore = this.props.inject(CertStore)
    return certStore.getSuitableListByDomain(this.props.domain) || []
  }

  @autobind
  initFormState() {
    const { domain } = this.props
    const certStore = this.props.inject(CertStore)
    const cert = certStore.certificationWithDomainMap.get(domain!)
    this.form = !cert
      ? this.createFormState()
      : this.createFormState({ certificateId: cert.certid, state: true })
  }

  @autobind
  createFormState(data?: IData) {
    return new FormState({
      state: new FieldState<boolean>(data && data.state || false),
      certificate: new FieldState<string>((data && data.certificateId) || '')
        .validators(val => !val && '必须选择证书')
    })
  }

  @autobind
  @Toaster.handle()
  fetchCertsInfo() {
    const certStore = this.props.inject(CertStore)
    return Promise.all([
      certStore.fetchList(), // 加载一下 所有的证书
      certStore.fetchListWithDomain() // 加载一下绑定了域名的证书
    ])
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.isVisible,
        visible => {
          if (visible) {
            this.initFormState() // 重新初始化 formstate
            this.fetchCertsInfo()
          }
        },
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @autobind
  @Toaster.handle('设置成功')
  async submitHTTPSCertificate() {
    const certStore = this.props.inject(CertStore)
    const result = await this.form.validate()

    if (result.hasError) {
      throw makeCancelled()
    }

    const domain = this.props.domain!
    const state = this.form.$.state.value
    const certId = this.form.$.certificate.value

    if (state) {
      await certStore.bindDomain(domain, certId)
    } else {
      await certStore.unbindDomain(domain, certId)
    }

    this.clearFormStateAndClose()
  }

  render() {
    const { onClose } = this.props
    const { state, certificate } = this.form.$

    return (
      <Drawer
        width={500}
        title="配置 HTTPS"
        onClose={onClose}
        visible={this.props.isVisible}
        onOk={this.submitHTTPSCertificate}
      >
        {this.certificateEffectiveTimeView}
        <Form layout="horizontal">
          <FormTrigger />
          <Form.Item
            required
            label="访问控制"
            {...formItemLayout}
          >
            <Switch
              checkedChildren="https"
              unCheckedChildren="http"
              {...bindSwitchField(state)}
            />
          </Form.Item>
          {
            state.value && (
              <div className={styles.customSelect}>
                <Form.Item
                  required
                  label="更换证书"
                  {...formItemLayout}
                  extra={this.certificateManagePromptView}
                >
                  <Select
                    placeholder="请选择证书"
                    // 解决 antd Select 组件 value = null 或 "" 时 placeholder 不显示问题
                    value={certificate.value || undefined}
                    onChange={certificate.onChange}
                  >
                    {
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      this.suitableCertification.map(({ certid, name, not_before, not_after }) => {
                        const [
                          beforeDateTime,
                          afterDateTime
                        ] = [not_before, not_after].map(val => humanizeTimestamp(val * 1000, 'YYYY-MM-DD'))

                        return (
                          <Select.Option key={certid} value={certid}>
                            <div className={styles.certTitle}>{name}({certid})</div>
                            <div className={styles.certUsefulTime}>证书有效期：{beforeDateTime} ~ {afterDateTime}</div>
                          </Select.Option>
                        )
                      })
                    }
                  </Select>
                </Form.Item>
              </div>
            )
          }
        </Form>
      </Drawer>
    )
  }

}

export default function HTTPSSetting(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalHTTPSSetting {...props} inject={inject} />
    )} />
  )
}
