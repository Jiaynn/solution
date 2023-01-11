/**
 * @file create bucket transfer
 * @description bucket 创建跨区域同步任务
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { computed, observable, action, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import { FieldState, FormState, ValidationResponse } from 'formstate-x'
import Role from 'portal-base/common/components/Role'
import {
  bindFormItem, bindSelect, bindSwitch, bindTextInput
} from 'portal-base/common/form'

import { isWritable } from 'kodo/transforms/bucket/setting/authorization'

import { ConfigStore } from 'kodo/stores/config'
import { IRegion } from 'kodo/stores/config/types'

import { Form, Input, Switch, Drawer, Select } from 'kodo/polyfills/icecream'

import { TransferRole } from 'kodo/constants/role'
import { RegionSymbol } from 'kodo/constants/region'
import { crossProducts } from 'kodo/constants/transfer'

import FormTrigger from 'kodo/components/common/FormTrigger'
import Prompt from 'kodo/components/common/Prompt'
import { TransferBaseStore } from './store'

export interface IFormFields {
  name: string
  srcProduct: typeof crossProducts[number]
  srcRegion: RegionSymbol | undefined
  srcBucket: string | undefined
  destProduct: typeof crossProducts[number]
  destRegion: RegionSymbol | undefined
  destBucket: string | undefined
  isSync: boolean
}

type IFormState = FormState<{
  [K in keyof IFormFields]: FieldState<IFormFields[K]>
}>

export interface IProps {
  store: TransferBaseStore

  visible: boolean
  taskNames: string[] // 已存在的任务名称列表
  isSubmitting: boolean
  onSubmit(task: IFormFields): void
  onCancel(): void
}

interface DiDeps {
  inject: InjectFunc
}

const formItemProps = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 }
}

@observer
class InternalCreateTransferTask extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  disposable = new Disposable()
  @observable.ref form: IFormState
  toasterStore = this.props.inject(Toaster)
  configStore = this.props.inject(ConfigStore)

  @computed get globalConfig() {
    return this.configStore.getFull()
  }

  // 根据用户选择的当前的产品获取当前的区域列表
  @computed get srcRegionList() {
    const { srcProduct } = this.form.value
    return this.configStore.getRegion({ product: srcProduct, allRegion: true })
  }

  @computed get isSrcBucketLoading(): boolean {
    const { srcProduct } = this.form.value
    const bucketStore = this.props.store.bucketListStoreMap.get(srcProduct)!
    return bucketStore ? bucketStore.isLoading() : false
  }

  // 根据当前用户选择的产品和区域获取当前空间列表
  @computed get srcBucketList(): string[] {
    const { srcRegion, srcProduct } = this.form.value
    const bucketStore = this.props.store.bucketListStoreMap.get(srcProduct)!
    return (srcRegion && bucketStore.getNameListByRegion(srcRegion)) || []
  }

  // 根据用户选择的当前的产品获取当前的目标区域列表
  @computed get destRegionList() {
    const { destProduct } = this.form.value
    return this.configStore.getRegion({ product: destProduct, allRegion: true })
  }

  @computed get isDestBucketLoading(): boolean {
    const { destProduct } = this.form.value
    const bucketStore = destProduct && this.props.store.bucketListStoreMap.get(destProduct)
    return bucketStore ? bucketStore.isLoading() : false
  }

  // 根据当前用户选择的产品和区域获取当前目标空间列表
  @computed get destBucketList(): string[] {
    const { destRegion, destProduct } = this.form.value
    const bucketStore = destProduct && this.props.store.bucketListStoreMap.get(destProduct)
    const bucketList = (destRegion && bucketStore && bucketStore.getListByRegion(destRegion)) || []
    return bucketList.filter(bucket => isWritable(bucket.perm)).map(bucket => bucket.tbl)
  }

  @autobind
  taskNameValidator(value: string | void): ValidationResponse {
    if (!value) {
      return '请输入名称'
    }

    const name = value.trim()
    if (!name) {
      return '名称不能为空'
    }

    if (name.length < 4 || name.length > 63) {
      return '4 ～ 63 个字符长度'
    }

    if (!/^[a-zA-Z]/.test(name[0])) {
      return '字母开头'
    }

    if (/[^a-zA-Z0-9-]/.test(name)) {
      return '只能包含字母、数字、中划线'
    }

    if (this.props.taskNames.includes(name)) {
      return '任务名称已存在'
    }
  }

  @action.bound
  initAndResetFormState() {
    const defaultSelectProduct = this.configStore.product
    const defaultSelectRegionValue = undefined
    const defaultSelectBucketValue = undefined
    const required = value => !value && '不能为空'

    const form = new FormState({
      name: new FieldState('').validators(this.taskNameValidator),
      srcProduct: new FieldState(defaultSelectProduct).validators(required),
      srcRegion: new FieldState<string | undefined>(defaultSelectRegionValue).validators(required),
      srcBucket: new FieldState<string | undefined>(defaultSelectBucketValue).validators(required),
      destProduct: new FieldState(defaultSelectProduct).validators(required),
      destRegion: new FieldState<string | undefined>(defaultSelectRegionValue).validators(required),
      destBucket: new FieldState<string | undefined>(defaultSelectBucketValue).validators(required),
      isSync: new FieldState(false)
    })

    form.$.srcProduct.validators((product: string) => {
      const { destProduct } = form.value
      return product === destProduct && product !== this.configStore.product
        && '不允许创建目标和源产品都非当前产品的任务'
    })

    form.$.destProduct.validators((product: string) => {
      const { srcProduct } = form.value
      return product === srcProduct && product !== this.configStore.product
        && '不允许创建目标和源产品都非当前产品的任务'
    })

    // 检查源区域是否与目标区域相同
    form.$.srcRegion.validators((region: RegionSymbol) => {
      const { srcProduct, destProduct, destRegion } = form.value
      // 不同产品可以同步
      if (srcProduct !== destProduct) {
        return false
      }
      return region === destRegion && '不支持相同区域的空间内容同步'
    })

    // 检查目标区域是否与源区域相同
    form.$.destRegion.validators((region: RegionSymbol) => {
      const { srcProduct, destProduct, srcRegion } = form.value
      // 不同产品可以同步
      if (srcProduct !== destProduct) {
        return false
      }
      return region === srcRegion && '不支持相同区域的空间内容同步'
    })

    // 切换 region 时重置 bucket 选项
    this.disposable.addDisposer(reaction(
      () => form.value.srcRegion,
      () => form.$.srcBucket.set(defaultSelectBucketValue)
    ))

    // 切换 region 时重置 bucket 选项
    this.disposable.addDisposer(reaction(
      () => form.value.destRegion,
      () => form.$.destBucket.set(defaultSelectBucketValue)
    ))

    // 切换源产品时更新当前空间列表
    // 同时重置当前选择的 region
    this.disposable.addDisposer(reaction(
      () => form.value.srcProduct,
      product => {
        form.$.srcRegion.set(defaultSelectRegionValue)
        const listStore = this.props.store.bucketListStoreMap.get(product)!
        this.toasterStore.promise(listStore.fetchList())
      },
      { fireImmediately: true }
    ))

    // 切换目标产品时更新当前空间列表、region
    // 同时重置当前选择的 region
    this.disposable.addDisposer(reaction(
      () => form.value.destProduct,
      product => {
        form.$.destRegion.set(defaultSelectRegionValue)
        const { srcProduct } = form.value
        if (srcProduct !== product) {
          // 选到跟 src 相同的区域不发送请求
          const listStore = this.props.store.bucketListStoreMap.get(product)!
          this.toasterStore.promise(listStore.fetchList())
        }
      }
    ))

    this.form = form
    this.disposable.addDisposer(form.dispose)
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          this.initAndResetFormState()
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @autobind
  async handleSubmit(event: React.MouseEvent<HTMLElement>) {
    if (event) {
      event.preventDefault()
    }
    if ((await this.form.validate()).hasError) {
      return
    }

    this.props.onSubmit(this.form.value)
  }

  // 产品选择
  @autobind
  renderProductSelect(
    label: string,
    state: FieldState<string>,
    enabled?: boolean
  ) {

    // 跨区域同步的跨产品同步未启用
    if (!this.globalConfig.objectStorage.transfer.crossProduct.enable) {
      return null
    }

    return (
      <Form.Item
        required
        label={label}
        {...formItemProps}
        {...bindFormItem(state)}
      >
        <Select
          placeholder={'请选择' + label}
          disabled={!enabled}
          {...bindSelect(state)}
        >
          {crossProducts.map(product => {
            const config = this.configStore.getFull(product)
            return (
              <Select.Option key={product} value={product}>
                {config.site.productName || product}
              </Select.Option>
            )
          })}
        </Select>
      </Form.Item>
    )
  }

  // 区域选择
  @autobind
  renderRegionSelect(
    label: string,
    regionList: Readonly<IRegion[]>,
    state: FieldState<RegionSymbol | undefined>
  ) {
    return (
      <Form.Item
        required
        label={label}
        {...formItemProps}
        {...bindFormItem(state)}
      >
        <Select
          placeholder={'请选择' + label}
          {...bindSelect(state as any)}
        >
          {regionList.filter(i => !i.invisible).map(region => (
            <Select.Option
              key={region.symbol}
              value={region.symbol}
            >
              {region.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    )
  }

  // 空间选择
  @autobind
  renderBucketSelect(
    label: string,
    bucketList: string[],
    state: FieldState<string | undefined>,
    isLoading: boolean,
    extra?: React.ReactNode
  ) {
    return (
      <Form.Item
        required
        label={label}
        extra={extra}
        {...formItemProps}
        {...bindFormItem(state)}
      >
        <Select
          showSearch
          loading={isLoading}
          placeholder={'请选择' + label}
          notFoundContent="暂无数据"
          {...bindSelect(state as any)}
        >
          {bucketList.map(bucket => (
            <Select.Option key={bucket} value={bucket}>
              {bucket}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    )
  }

  render() {
    if (this.form == null) {
      return null
    }

    const formFields = this.form.$

    return (
      <Drawer
        title="创建任务"
        width={640}
        visible={this.props.visible}
        onClose={this.props.onCancel}
        confirmLoading={this.props.isSubmitting}
        onOk={this.handleSubmit}
      >
        <Role name={TransferRole.CreateTaskForm}>
          <Form onSubmit={this.handleSubmit}>
            <FormTrigger />
            <Form.Item
              required
              label="同步任务名称"
              {...formItemProps}
              {...bindFormItem(formFields.name)}
              extra={<Prompt>字母开头，4 ~ 63 个字符长 ，可包含 字母、数字、中划线</Prompt>}
            >
              <Input placeholder="请输入同步任务名称" type="text" {...bindTextInput(formFields.name)} />
            </Form.Item>
            {this.renderProductSelect(
              '源存储产品',
              formFields.srcProduct,
              this.globalConfig.objectStorage.transfer.crossProduct.sourceProductSelect.enable
            )}
            {this.renderRegionSelect(
              '源存储区域',
              this.srcRegionList,
              formFields.srcRegion
            )}

            {this.renderBucketSelect(
              '源存储空间',
              this.srcBucketList,
              formFields.srcBucket,
              this.isSrcBucketLoading
            )}

            {this.renderProductSelect(
              '目标存储产品',
              formFields.destProduct,
              true
            )}

            {this.renderRegionSelect(
              '目标存储区域',
              this.destRegionList,
              formFields.destRegion
            )}

            {this.renderBucketSelect(
              '目标存储空间',
              this.destBucketList,
              formFields.destBucket,
              this.isDestBucketLoading,
              (<Prompt>如果目标空间为非空存储空间，在 Key 相同的情况下，文件会被覆盖。</Prompt>)
            )}

            <Form.Item
              label="是否同步历史数据"
              {...formItemProps}
              {...bindFormItem(formFields.isSync)}
              hasFeedback={false}
              extra={
                <Prompt>
                  开启同步历史数据会将 Bucket 原有数据同步到目标 Bucket。如果关闭同步历史数据，则仅同步此跨区域同步任务创建时间点后的数据，历史数据不同步。
                </Prompt>
              }
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
                {...bindSwitch(formFields.isSync)}
              />
            </Form.Item>
          </Form>
        </Role>
      </Drawer>
    )
  }
}

export default function CreateTransferTask(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalCreateTransferTask {...props} inject={inject} />
    )} />
  )
}
