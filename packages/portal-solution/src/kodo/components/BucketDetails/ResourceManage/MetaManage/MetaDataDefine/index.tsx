/**
 * @file component MetaDataDefine
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate'
import autobind from 'autobind-decorator'
import { Button, Icon, Spin } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import Role from 'portal-base/common/components/Role'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { ValidatableObject } from 'kodo/utils/formstate'

import { countByte } from 'kodo/transforms/byte'

import { MetaStatus } from 'kodo/constants/bucket/resource'
import { BucketFileDetailRole } from 'kodo/constants/role'

import Prompt from 'kodo/components/common/Prompt'
import { Auth } from 'kodo/components/common/Auth'

import { IMeta, ResourceApis } from 'kodo/apis/bucket/resource'

import Meta from './Meta'
import styles from './style.m.less'

export interface IProps {
  bucket: string
  fname: string
  version: string
  defaultMetaList: IMeta[]
  dirty: boolean
  isFrozen: boolean
  isReadonlyShareBucket: boolean

  addMeta(meta: IMeta): void

  updateMeta(meta: IMeta, originName: string): void

  deleteMeta(name: string): void
}

interface DiDeps {
  inject: InjectFunc
}

export interface IMetaCopy extends IMeta {
  form: FormState<FormMetaValue>
}

const loadingId = 'meta'
export type MetaData = Omit<IMeta, 'status'>

export type FormMetaValue = ValidatableObject<MetaData>

@observer
class InternalMetaDataDefined extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  resourceApis = this.props.inject(ResourceApis)
  @observable.shallow metaListCopy: IMetaCopy[] = []

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)

  @computed
  get metaNameList() {
    return this.props.defaultMetaList.map(item => item.name)
  }

  @autobind
  verifyMetaLength(data: MetaData) {
    const metaSize = countByte(
      ...this.props.defaultMetaList.map(meta => (
        `x-qn-meta-${meta.name}${meta.value}`
      )),
      `x-qn-meta-${data.name}${data.value}`
    )

    if (metaSize > 1024) {
      return 'metadata 总长度超过 1024 字节'
    }

    return false
  }

  @autobind
  verifyMetaKey(value: string, originValue: string) {
    // 如果是更新，则键名可以保持一致
    value = value.trim()
    if (originValue && originValue === value) {
      return false
    }

    if (!value || !value.length) {
      return '不允许为空'
    }

    if (this.metaNameList.some(name => name.toLowerCase() === value.toLowerCase())) {
      return '键名已存在'
    }

    if (value.length >= 50) {
      return '最大长度限制 50 个字符'
    }

    if (!(/^[a-zA-Z0-9_-]*$/.test(value))) {
      return '包含非法字符'
    }
  }

  @autobind
  verifyMetaValue(value: string) {
    value = value.trim()
    if (!value || !value.length) {
      return '不允许为空'
    }

    if (value.length > 200) {
      return '最大长度限制 200 个字符'
    }

    if (!(/^[a-zA-Z0-9=-_\s+.]*$/.test(value))) {
      return '包含非法字符'
    }
  }

  @autobind
  createForm(initialValue: MetaData) {
    const form = new FormState<FormMetaValue>({
      name: new FieldState<string>(initialValue.name)
        .validators(
          value => this.verifyMetaKey(value, initialValue.name),
          () => this.verifyMetaLength({
            name: form.$.name.value,
            value: form.$.value.value
          })
        ),
      value: new FieldState<string>(initialValue.value)
        .validators(
          this.verifyMetaValue,
          () => this.verifyMetaLength({
            name: form.$.name.value,
            value: form.$.value.value
          })
        )
    })

    return form
  }

  @autobind
  saveMeta(data: IMeta[]) {
    return this.resourceApis.updateFileMeta(
      this.props.bucket,
      {
        key: this.props.fname,
        version: this.props.version
      },
      data
    )
  }

  @action.bound
  onMetaSaveCopyItem(index: number, data: IMeta) {
    const meta = { ...data, status: MetaStatus.Recorded }
    const form = this.createForm(data)
    this.metaListCopy[index] = {
      ...meta,
      form
    }
  }

  @autobind
  @Loadings.handle(loadingId)
  @Toaster.handle()
  onMetaAdd(data: IMeta, index: number) {
    const copy = this.props.defaultMetaList.slice()
    copy.push(data)

    const req = this.saveMeta(copy)
    req.then(action(() => {
      this.props.addMeta(data)
      this.onMetaSaveCopyItem(index, data)
    })).catch(() => { /**/ })

    return req
  }

  @autobind
  @Loadings.handle(loadingId)
  @Toaster.handle()
  onMetaUpdate(data: IMeta, index: number, originName: string) {
    const copy = this.props.defaultMetaList.slice()
    const location = copy.findIndex(item => item.name === originName)
    copy[location] = data

    const req = this.saveMeta(copy)
    req.then(action(() => {
      this.props.updateMeta(data, originName)
      this.onMetaSaveCopyItem(index, data)
    })).catch(() => { /**/ })

    return req
  }

  @autobind
  @Loadings.handle(loadingId)
  @Toaster.handle()
  deleteMeta(index: number) {
    const copy = this.props.defaultMetaList.slice()
    const originName = this.metaListCopy[index].name
    const location = copy.findIndex(item => item.name === originName)
    copy.splice(location, 1)

    const req = this.resourceApis.updateFileMeta(
      this.props.bucket,
      {
        key: this.props.fname,
        version: this.props.version
      },
      copy
    )

    req.then(() => {
      this.props.deleteMeta(originName)
      this.deleteNewLine(index)
    }).catch(() => { /**/ })

    return req
  }

  @action.bound
  updateMetaListCopy() {
    this.metaListCopy = this.props.defaultMetaList.slice().map(item => {
      const meta = { ...item, status: MetaStatus.Recorded }
      const form = this.createForm(meta)
      return { ...meta, form }
    })
  }

  @action.bound
  onMetaStatusChange(index: number, status: MetaStatus) {
    this.metaListCopy[index] = {
      ...this.metaListCopy[index],
      ...(status === MetaStatus.Editing && {
        form: this.createForm(this.metaListCopy[index])
      }),
      status
    }
  }

  @action.bound
  deleteNewLine(index: number) {
    this.metaListCopy.splice(index, 1)
  }

  @action.bound
  addMeta() {
    const initialValue = {
      name: '',
      value: ''
    }
    this.metaListCopy.push({
      ...initialValue,
      status: MetaStatus.New,
      form: this.createForm(initialValue)
    })
  }

  @computed
  get metaDataView() {
    return (// 在进行接口调用中让 table 处于不可选状态，这样可以防止快速操作多个数据导致的混乱
      <Spin spinning={this.loadings.isLoading(loadingId)}>
        <table className={styles.metaTable}>
          <thead>
            <tr>
              <td>参数</td>
              <td>值</td>
              <td>操作</td>
            </tr>
          </thead>
          <tbody>
            {
              this.metaListCopy.length
                ? this.metaListCopy.map((item, index) => (
                  <Meta // 考虑到每个 Meta 的校验逻辑都需要用 defaultMetaList，这里把校验逻辑写到外部，就不用传 defaultMetaList 了
                    {...item}
                    key={index}
                    index={index}
                    bucketName={this.props.bucket}
                    isFrozen={this.props.isFrozen}
                    isReadonlyShareBucket={this.props.isReadonlyShareBucket}
                    deleteMeta={this.deleteMeta}
                    deleteNewLine={this.deleteNewLine}
                    onMetaAdd={this.onMetaAdd}
                    onMetaUpdate={this.onMetaUpdate}
                    onMetaStatusChange={this.onMetaStatusChange}
                  />
                ))
                : (
                  <tr>
                    <td colSpan={3}>
                      <p className={styles.emptyData}>空数据</p>
                    </td>
                  </tr>
                )
            }
          </tbody>
        </table>
      </Spin>
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    // 只记录第一次接口拿到的数据，后面的增删改查都在初始数据的基础上进行操作，所以用 when
    this.disposable.addDisposer(reaction(
      () => this.props.dirty,
      dirty => {
        if (dirty) {
          this.updateMetaListCopy()
        }
      },
      { fireImmediately: true }
    ))
  }

  render() {
    return (
      <div className={styles.metaDataDefineContainer}>
        <hr className={styles.line} />
        <div className={styles.title}>元数据定义</div>
        <Prompt>
          自定义元数据，在 Header 中返回时均会冠以 x-qn-meta 的前缀，例如，name: value 的元数据，会以 x-qn-meta-name: value 在 Header 中返回。
          <p className={styles.warningInfo}>注意：参数名不区分大小写</p>
        </Prompt>
        {this.metaDataView}
        <Auth
          notIamUser
          render={disabled => (
            <Role name={BucketFileDetailRole.MetaDataAddEntry}>
              <Button
                disabled={disabled || this.props.isReadonlyShareBucket || this.props.isFrozen}
                type="dashed"
                className={styles.addButton}
                onClick={this.addMeta}
              >
                <Icon type="plus" />添加
              </Button>
            </Role>
          )}
        />
      </div>
    )
  }
}

export default function MetaDataDefined(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalMetaDataDefined {...props} inject={inject} />
    )} />
  )
}
