/**
 * @file Component StyleSeparator
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, action, reaction, observable, runInAction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Icon, Select, Button, PopupContainer, Tooltip, Drawer } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { FieldState, FormState } from 'formstate-x'
import { bindSelect } from 'portal-base/common/form'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import Role from 'portal-base/common/components/Role'

import docStyles from 'kodo/styles/card.m.less'

import { BucketStore } from 'kodo/stores/bucket'

import { BucketImageStyleRole } from 'kodo/constants/role'
import { separatorTextMap, separatorList } from 'kodo/constants/image-style'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import Prompt from 'kodo/components/common/Prompt'
import { Auth } from 'kodo/components/common/Auth'

import { ImageStyleApis } from 'kodo/apis/bucket/image-style'
import styles from './style.m.less'

export interface IProps {
  bucketName: string
  visible: boolean
  onOk(): void
  onCancel(): void
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
class InternalStyleSeparator extends React.Component<IProps & DiDeps> {

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

  loadings = Loadings.collectFrom(this, loadingId)
  disposable = new Disposable()

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
  get separatorsView() {
    return this.formState.$.separators.value.map((item, index) => (
      <div key={index} className={styles.separatorBox}>
        <div className={styles.separator}>
          <span>{item}</span>
          <p>{separatorTextMap[item]}</p>
          <Icon type="minus-circle" className={styles.closeIcon} onClick={() => this.deleteSeparator(index)} />
        </div>
      </div>
    ))
  }

  @computed
  get promptText() {
    return (
      <Prompt type="assist">
        设置允许使用的样式分隔符集合，每次访问时只能使用集合中的一个字符。分隔符只支持这些半角字符：
        <span className={styles.separatorTip}>{separatorList.join(' ')} </span>
        未设置时默认样式分隔符为<span className={styles.separatorTip}> -（中划线）</span>。<br />
        样式分隔符不能出现在您所设置的图片样式名中。<br />
        更换分隔符后，变更前的访问地址都将失效，需要使用新设置的分隔符才能保证正常访问。
      </Prompt>
    )
  }

  @autobind
  @Toaster.handle('样式分隔符保存成功')
  @Loadings.handle(loadingId)
  saveSeparators() {
    const imageStyleApis = this.props.inject(ImageStyleApis)
    const data = this.formState.$.separators.value.join('')
    const req = imageStyleApis.setSeparator(this.props.bucketName, data)
    req.then(() => {
      runInAction(() => {
        this.updateFormState(this.formState.value)
        this.props.onOk()
      })
    }).catch(() => { /**/ })

    return req
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          this.updateFormState({
            separators: this.bucketInfo!.separator.split(''),
            selects: this.formState.$.selects.value
          })
        }
      },
      { fireImmediately: true }
    ))

    // 处理初始化的时候的 formState
    this.disposable.addDisposer(this.formState.dispose)
  }

  render() {
    const { selects, separators } = this.formState.$

    return (
      <Drawer
        width={640}
        visible={this.props.visible}
        confirmLoading={this.loadings.isLoading(loadingId)}
        onOk={this.saveSeparators}
        onCancel={this.props.onCancel}
        title={
          <span className={styles.title}>
            样式分隔符设置
            <Tooltip title="文档">
              <HelpDocLink className={docStyles.extraButton} doc="styleSeparator" anchor="#set">
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        footer={
          <div className={styles.footer}>
            <Auth
              notProtectedUser
              render={disabled => (<>
                <Role name={BucketImageStyleRole.SeparatorResetCtrl}>
                  <Button onClick={this.props.onCancel} disabled={disabled}>关闭</Button>
                </Role>
                <Role name={BucketImageStyleRole.SeparatorSaveCtrl}>
                  <Button
                    type="primary"
                    onClick={this.saveSeparators}
                    loading={this.loadings.isLoading(loadingId)}
                    disabled={!separators.value.length || disabled}
                  >
                    保存
                  </Button>
                </Role>
              </>)}
            />
          </div>
        }
      >
        <div className={styles.separatorContent}>
          <div>
            {this.promptText}
            <PopupContainer className={styles.separatorControl}>
              <Role name={BucketImageStyleRole.SeparatorInput}>
                <Select
                  mode="multiple"
                  {...bindSelect(selects)}
                  placeholder="请选择样式分隔符"
                  className={styles.separatorSelect}
                >
                  {this.availableSeparators.map((data, index) => (
                    <Select.Option key={index} value={data}>{data}</Select.Option>
                  ))}
                </Select>
              </Role>
              <Auth
                notProtectedUser
                render={disabled => (
                  <Role name={BucketImageStyleRole.SeparatorAddCtrl}>
                    <Button
                      icon="plus"
                      className={styles.addButton}
                      onClick={this.addSeparators}
                      disabled={disabled}
                    >
                      添加
                    </Button>
                  </Role>
                )}
              />
            </PopupContainer>
            <div className={styles.separators}>
              {this.separatorsView}
            </div>
          </div>
        </div>
      </Drawer>
    )
  }
}

export default function StyleSeparator(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalStyleSeparator {...props} inject={inject} />
    )} />
  )
}
