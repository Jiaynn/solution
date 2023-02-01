/**
 * @file Component StyleSeparator
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, action, observable, makeObservable, reaction } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { FieldState, FormState } from 'formstate-x'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { Loadings } from 'portal-base/common/loading'

import { Alert, SelectOption, Button } from 'react-icecream-2'
import { AddThinIcon, CloseCircleFilledIcon } from 'react-icecream-2/icons'
import { MultiSelect } from 'react-icecream-2/form-x'

import Role from 'portal-base/common/components/Role'
import { IamPermissionStore } from 'portal-base/user/iam'

import { KodoIamStore } from 'kodo/stores/iam'
import { BucketStore } from 'kodo/stores/bucket'

import { BucketImageStyleRole } from 'kodo/constants/role'
import { separatorTextMap, separatorList } from 'kodo/constants/image-style'

import { Auth } from 'kodo/components/common/Auth'
// import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { ImageStyleApis } from 'kodo/apis/bucket/image-style'

import styles from './style.m.less'

export interface IProps {
  bucketName: string
  onChanged(value: boolean): void
  onSubmitChange: (submit: () => Promise<void>) => void
}

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'separator'

export type StyleSeparatorForm = FormState<{
  separators: FieldState<string[]>
  selects: FieldState<string[]>
}>

export interface IStyleSeparatorInput {
  separators: string[]
  selects: string[]
}

function createFormState(data: IStyleSeparatorInput): StyleSeparatorForm {
  return new FormState({
    separators: new FieldState(data.separators),
    selects: new FieldState(data.selects)
  })
}

@observer
class InternalSeparator extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @observable.ref formState: StyleSeparatorForm = createFormState({
    separators: [],
    selects: []
  })

  iamStore = this.props.inject(KodoIamStore)
  featureStore = this.props.inject(FeatureConfigStore)
  iamPermissionStore = this.props.inject(IamPermissionStore)

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)

  @action.bound
  addSeparators() {
    const { separators, selects } = this.formState.$
    separators.set([...separators.value, ...selects.value])
    // 每次添加后清空输入框
    this.formState.$.selects.set([])
  }

  @action.bound
  deleteSeparator(index: number) {
    const data = this.formState.$.separators.value.slice()
    data.splice(index, 1)
    this.formState.$.separators.set(data)
  }

  @action.bound
  updateFormState(data: IStyleSeparatorInput) {
    this.formState = createFormState(data)
    this.disposable.addDisposer(this.formState.dispose)
  }

  @computed
  get availableSeparators() {
    // 已添加的要从列表里过滤掉
    return separatorList.filter(value => !this.formState.$.separators.value.includes(value))
  }

  @computed
  get bucketInfo() {
    const bucketStore = this.props.inject(BucketStore)
    return bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get isSeparatorsVisible() {
    if (this.iamStore.isActionDeny({
      actionName: 'SetSeparator',
      resource: this.props.bucketName
    })) {
      return false
    }

    return true
  }

  @computed
  get separatorsView() {
    return this.formState.$.separators.value.map((item, index) => (
      <div key={index} className={styles.separatorBox}>
        <div className={styles.separator}>
          <span>{item}</span>
          <p>{separatorTextMap[item]}</p>
          <CloseCircleFilledIcon
            width={22}
            height={22}
            className={styles.closeIcon}
            onClick={() => this.deleteSeparator(index)}
          />
        </div>
      </div>
    ))
  }

  @computed
  get alertView() {
    return (
      <Alert message={
        <>
          设置允许使用的样式分隔符集合，每次访问时只能使用集合中的一个字符。分隔符只支持这些半角字符：
          <span className={styles.separatorTip}>{separatorList.join(' ')}</span> 未设置时默认样式分隔符为
          <span className={styles.separatorTip}> -（中划线）</span>。<br />
          样式分隔符不能出现在您所设置的样式名中。<br />
          更换分隔符后，变更前的访问地址都将失效，需要使用新设置的分隔符才能保证正常访问。
          {/* <HelpDocLink doc="styleSeparator">了解更多</HelpDocLink> FIXME: 新文档还没好 */}
        </>
      } />
    )
  }

  @autobind
  @Loadings.handle(loadingId)
  async saveSeparators(): Promise<void> {
    const imageStyleApis = this.props.inject(ImageStyleApis)
    const newSeparators = this.formState.$.separators.value.join('')
    if (newSeparators === this.bucketInfo?.separator) return

    await imageStyleApis.setSeparator(this.props.bucketName, newSeparators)
    this.updateFormState(this.formState.value)
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.updateFormState({
      separators: this.bucketInfo!.separator.split(''),
      selects: this.formState.$.selects.value
    })

    this.disposable.addDisposer(reaction(
      () => this.formState.$.separators.value,
      () => {
        const newSeparators = this.formState.$.separators.value.join('')
        this.props.onChanged(newSeparators !== this.bucketInfo?.separator)
      },
      { fireImmediately: true }
    ))

    // 处理初始化的时候的 formState
    this.disposable.addDisposer(this.formState.dispose)

    this.props.onSubmitChange(this.saveSeparators)
  }

  render() {
    if (!this.isSeparatorsVisible) return null
    const { selects } = this.formState.$

    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <div className={styles.separatorContent}>
            <div className={styles.header}>
              <h4>样式分隔符</h4>
            </div>
            <div>
              {this.alertView}
              <div className={styles.formContent}>
                <div className={styles.separatorControl}>
                  <Role name={BucketImageStyleRole.SeparatorInput}>
                    <MultiSelect
                      state={selects}
                      collapsed={false}
                      disabled={disabled}
                      placeholder="请选择样式分隔符"
                      className={styles.separatorSelect}
                    >
                      {this.availableSeparators.map((data, index) => (
                        <SelectOption key={index} value={data}>{data}</SelectOption>
                      ))}
                    </MultiSelect>
                  </Role>
                  <Role name={BucketImageStyleRole.SeparatorAddCtrl}>
                    <Button
                      disabled={disabled}
                      icon={<AddThinIcon />}
                      className={styles.addButton}
                      onClick={this.addSeparators}
                    >
                      添加
                    </Button>
                  </Role>
                </div>
                <div className={styles.separators}>
                  {this.separatorsView}
                </div>
              </div>
            </div>
          </div>
        )}
      />
    )
  }
}

export default function AccessSetting(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSeparator {...props} inject={inject} />
    )} />
  )
}
