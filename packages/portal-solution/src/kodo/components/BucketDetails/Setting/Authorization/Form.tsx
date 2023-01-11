/**
 * @file 空间授权 - 处理表单
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FormState, FieldState } from 'formstate'
import { reaction, action, observable, computed, runInAction, makeObservable } from 'mobx'
import { Form, Drawer, Input, Spin, Select } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { Loadings } from 'portal-base/common/loading'
import Role from 'portal-base/common/components/Role'

import { valuesOfEnum } from 'kodo/utils/ts'
import { bindPureValueField, bindTextInputField } from 'kodo/utils/formstate/bind'
import { bindFormItem, getValuesFromFormState, ValidatableObject } from 'kodo/utils/formstate'

import { validateBucketNameWithLabel } from 'kodo/transforms/bucket'

import { ShareType, shareNameMap, IShareUser } from 'kodo/constants/bucket/setting/authorization'
import { email as emailPattern } from 'kodo/constants/pattern'
import { BucketSettingAuthorizationRole } from 'kodo/constants/role'

import FormTrigger from 'kodo/components/common/FormTrigger'

export type IValue = Omit<IShareUser, 'uid'>

export type ShouldRenameBucket = boolean

interface IOnSubmitResult {
  isBucketNameConflict?: boolean
}

export interface IProps {
  title: string
  visible: boolean
  bucketName: string
  shareUsers: IShareUser[]
  onSubmit(data: IValue): Promise<IOnSubmitResult | undefined>
  onCancel(): void

  isShared?: boolean | null
  ownerEmail?: string | null
  data?: Partial<IShareUser>
}

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  Submit = 'submit'
}

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
} as const

@observer
class InternalAddAuthorization extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  userInfoStore = this.props.inject(UserInfo)

  disposable = new Disposable()
  @observable isBucketNameConflict: boolean
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))
  @observable.ref form: FormState<ValidatableObject<IValue>> | undefined = undefined

  @computed
  get isModifying() {
    // 通过 data 判断是否是处于编辑模式
    return !!this.props.data
  }

  // 原来的空间名有问题
  // 由于空间名称格式的变动
  // 以前的一些空间名称在现在可能不合规
  @computed
  get isRawBucketNameInvalid() {
    return !!validateBucketNameWithLabel(this.props.bucketName)
  }

  // 是否已经具有别名
  // 只有在编辑模式下有意义 (renamed 完成时)
  // @computed
  // get hasRenamedBucketName() {
  //   // 如果在新建模式下，肯定是没有的
  //   if (!this.isModifying) {
  //     return false
  //   }

  //   return this.props.data.tbl !== this.props.bucketName
  // }

  // // 是否展示输入别名的的表单输入框
  // // 新建模式下，发生命名冲突、空间原始名称有问题、都会显示
  // // 编辑模式下 如果 renamed，也是需要显示
  // @computed
  // get shouldShowRenameFormItem() {
  //   // 编辑模式中 只看有没有别名
  //   if (this.isModifying) {
  //     return this.hasRenamedBucketName
  //   }
  //
  //   // 新建模式检查冲突和原来名字的格式
  //   // return this.isRawBucketNameInvalid
  //   //   || this.isBucketNameConflict
  //
  //   // 新建模式现在固定显示
  //   return true
  // }

  @action.bound
  updateIsBucketNameConflict(state: boolean) {
    this.isBucketNameConflict = state
  }

  createFormState(initData?: Partial<IValue>) {
    const data = {
      tbl: this.props.bucketName,
      email: '',
      perm: ShareType.ReadOnly,
      ...initData
    }

    const state = new FormState({
      tbl: new FieldState(data.tbl).validators(
        bucketName => {
          // 纯展示，不校验
          if (this.isModifying) {
            return false
          }

          return validateBucketNameWithLabel(bucketName)
        }
      ),
      email: new FieldState(data.email).validators(
        // FIXME: 安全问题？是否会暴露其他用户的隐私
        email => {
          // 纯展示，不校验
          if (this.isModifying) {
            return false
          }

          if (!email && !email.trim()) {
            return '请输入邮箱地址'
          }

          if (/\s/.test(email)) {
            return '请不要输入包括空格在内的空白符'
          }

          if (!emailPattern.test(email)) {
            return '请检查邮箱地址格式'
          }

          // 不校验的话，新增的效果跟编辑 / 删除是类似的
          if (this.props.shareUsers.find(shareUser => shareUser.email === email)) {
            return '已授权该用户'
          }

          if (this.userInfoStore.email && this.userInfoStore.email === email) {
            return '不能把空间授权给当前用户'
          }

          if (this.props.ownerEmail) {
            if (this.props.ownerEmail === email) {
              return '不能把空间授权给所属用户'
            }

            if (this.userInfoStore.email && this.props.ownerEmail !== this.userInfoStore.email) {
              return `不能把非${shareNameMap[ShareType.Own]}空间再次授权给他人`
            }
          }
        }
      ),
      perm: new FieldState(data.perm)
    })

    return state
  }

  @action.bound
  initState() {
    this.form = this.createFormState(this.props.data)
    this.updateIsBucketNameConflict(false)
  }

  @autobind
  @Toaster.handle()
  async handleSubmit() {
    const result = await this.form!.validate()
    if (result.hasError) {
      return
    }

    const data = getValuesFromFormState(this.form!)
    const submitResult = await this.props.onSubmit(data)
    if (submitResult && submitResult.isBucketNameConflict) {
      runInAction(() => {
        this.updateIsBucketNameConflict(true)
        this.form!.$.tbl.setError('对方存在同名空间，请输入新的别名')
      })
    } else {
      // eslint-disable-next-line no-lonely-if
      if (this.isModifying) {
        this.toasterStore.success('权限修改成功')
      } else {
        this.toasterStore.success('授权成功')
      }
    }
  }

  @action
  init() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.visible,
        visible => {
          if (visible) {
            this.initState()
          }
        },
        { fireImmediately: true }
      )
    )
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    if (!this.props.visible) {
      return null
    }

    if (!this.form) {
      return (<Spin />)
    }

    const {
      email, tbl, perm
    } = this.form.$

    return (
      <Drawer
        title={this.props.title}
        visible={this.props.visible}
        width={540}
        onClose={this.props.onCancel}
        onOk={this.handleSubmit}
        confirmLoading={this.loadings.isLoading(Loading.Submit)}
      >
        <Role name={BucketSettingAuthorizationRole.EditAuthorizationBlock}>
          <Form
            onSubmit={e => {
              e.preventDefault()
              this.handleSubmit()
            }}
          >
            <FormTrigger />
            <Role name={BucketSettingAuthorizationRole.AuthorizationUserInput}>
              <Form.Item
                label="授权用户"
                {...formItemLayout}
                {...bindFormItem(email)}
                required={!this.isModifying}
              >
                <Input
                  placeholder="请输入用户邮箱"
                  type="text"
                  disabled={this.isModifying}
                  {...bindTextInputField(email)}
                />
              </Form.Item>
            </Role>
            <Role name={BucketSettingAuthorizationRole.AuthorizationShareTypeInput}>
              <Form.Item
                label="授予权限"
                {...formItemLayout}
                {...bindFormItem(perm)}
                required
              >
                <Select {...bindPureValueField(perm)}>
                  {[ShareType.ReadOnly, ShareType.ReadWrite].map(
                    shareType => (
                      <Select.Option key={shareType} value={shareType}>
                        {shareNameMap[shareType]}
                      </Select.Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Role>
            <Role name={BucketSettingAuthorizationRole.AuthorizationTblInput}>
              <Form.Item
                label="空间别名"
                {...formItemLayout}
                {...bindFormItem(tbl)}
                required={!this.isModifying}
              >
                <Input
                  type="text"
                  placeholder="请输入空间名称"
                  {...bindTextInputField(tbl)}
                  // 编辑模式下禁止编辑这个表单项
                  disabled={this.isModifying}
                />
              </Form.Item>
            </Role>
          </Form>
        </Role>
      </Drawer>
    )
  }
}

export default function AddAuthorization(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalAddAuthorization {...props} inject={inject} />
    )} />
  )
}
