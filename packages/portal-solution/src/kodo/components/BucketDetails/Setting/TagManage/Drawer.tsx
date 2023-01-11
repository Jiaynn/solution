/**
 * @file 标签管理 Drawer
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { observer, Observer } from 'mobx-react'
import { action, observable, computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { FormState, FieldState } from 'formstate-x'
import { makeCancelled } from 'qn-fe-core/exception'
import { bindTextInput, bindFormItem } from 'portal-base/common/form'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Role from 'portal-base/common/components/Role'
import { Drawer, Table as RawTable, Button, Input, Form, Popconfirm } from 'react-icecream/lib'

import { validateTagKeyPrefix, validateTagFormat, createTagSizeValidator } from 'kodo/transforms/bucket/setting/tag'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { BucketSettingTagRole } from 'kodo/constants/role'
import { maxAllowedTag, specialCharacter } from 'kodo/constants/bucket/setting/tag'

import { Auth } from 'kodo/components/common/Auth'
import Prompt from 'kodo/components/common/Prompt'

import { ITag, TagApis } from 'kodo/apis/bucket/setting/tag'

import styles from './style.m.less'

export class Table extends RawTable<ITagState> { }
export class TableColumn extends RawTable.Column<ITagState> { }

export enum TagState {
  Recorded = 'recorded', // 已经存在的
  Editing = 'editing', // 正在编辑的
  New = 'new' // 新增加的
}

export type ITagFormState = FormState<{
  Key: FieldState<string>
  Value: FieldState<string>
}>

export interface ITagState extends ITag {
  state: TagState
  form?: ITagFormState
}

export interface IProps extends IDetailsBaseOptions {
  visible: boolean
  onClose(): void
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalTagDrawer extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  tagApis = this.props.inject(TagApis)
  tagsData = observable.array<ITagState>()

  @computed get getTagsValue(): Array<ITag | undefined> {
    // 不能提前 filter,可能会导致后面在使用下标操作数据时位置错位
    return this.tagsData.map(
      data => {
        if (data.Key && data.Value) {
          return {
            Key: data.Key,
            Value: data.Value
          }
        }

        return undefined
      }
    )
  }

  @autobind
  createDuplicatedTagKeyValidator(self?: ITagFormState) {
    return (value: string) => {
      const tags = self
        ? this.tagsData.filter(tag => tag.form !== self)
        : this.tagsData

      return tags.some(tag => tag.Key === value) && '该标签已存在'
    }
  }

  @autobind
  tagAmountValidator() {
    if (this.tagsData.length > maxAllowedTag) {
      return `tag 数量最多允许 ${maxAllowedTag} 对`
    }
  }

  // 常见标签状态
  @autobind
  createTagFormState(initialValue?: ITag): ITagFormState {
    const Key = initialValue && initialValue.Key || ''
    const Value = initialValue && initialValue.Value || ''

    const state = new FormState({
      Key: new FieldState<string>(Key),
      Value: new FieldState<string>(Value).validators(
        validateTagFormat,
        createTagSizeValidator(32)
      )
    }).validators(this.tagAmountValidator)

    state.$.Key.validators(
      validateTagKeyPrefix,
      validateTagFormat,
      createTagSizeValidator(64),
      this.createDuplicatedTagKeyValidator(state)
    )

    return state
  }

  // 创建标签
  @action.bound
  createTag(initialValue?: ITag, state = TagState.Recorded): ITagState {
    const Key = initialValue && initialValue.Key || ''
    const Value = initialValue && initialValue.Value || ''

    return {
      Key,
      Value,
      state
    }
  }

  @action.bound
  initLocalTags(tags: ITag[]) {
    this.tagsData.splice(0, this.tagsData.length, ...tags.map(
      tag => this.createTag(tag)
    ))
  }

  // 获取数据
  @autobind
  @Toaster.handle()
  fetchTags() {
    const { bucketName } = this.props
    return this.tagApis.getTags(bucketName).then(this.initLocalTags)
  }

  @action.bound
  saveLocalTag(index: number) {
    const tag = this.tagsData[index]
    const { Key, Value } = tag.form!.$
    // 成功后同步本条状态
    this.tagsData[index] = this.createTag({
      Key: Key.value,
      Value: Value.value
    })
  }

  @action.bound
  deleteLocalTag(index: number) {
    this.tagsData.splice(index, 1)
  }

  @action.bound
  @Toaster.handle('保存成功')
  async handleSave(tag: ITagState, index: number) {
    const formData = await tag.form!.validate()
    if (formData.hasError) {
      throw makeCancelled()
    }
    const { Key, Value } = tag.form!.$
    const tagsValue = this.getTagsValue.slice() // 拷贝数据

    // 替换当前 tag 数据
    tagsValue[index] = {
      Key: Key.value,
      Value: Value.value
    }

    // 清理无效数据
    const tagsData = tagsValue.filter(Boolean)

    // 提交
    await this.tagApis.setTags(this.props.bucketName, tagsData as ITag[])
    this.saveLocalTag(index)
  }

  @action.bound
  editLocalTag(tag: ITagState) {
    tag.state = TagState.Editing
    tag.form = this.createTagFormState(tag)
  }

  @action.bound
  @Toaster.handle('删除成功')
  async handleDelete(index: number) {
    const tags = this.getTagsValue.slice() // 拷贝数据
    tags.splice(index, 1)
    const data = tags.filter(Boolean)
    if (data.length === 0) {
      await this.tagApis.clearTags(this.props.bucketName)
    } else {
      await this.tagApis.setTags(this.props.bucketName, data as ITag[])
    }

    this.deleteLocalTag(index)
  }

  @action.bound
  cancelLocalEdit(index: number) {
    const tag = this.tagsData[index]
    if (tag.state === TagState.New) { // 新建数据
      this.tagsData.splice(index, 1) // 裁剪掉
      return
    }

    if (tag.state === TagState.Editing) { // 编辑的数据
      tag.form = undefined // 直接清除
      tag.state = TagState.Recorded // 更新状态
    }
  }

  // 创建新的标签
  @action.bound
  createLocalTag() {
    const tag = this.createTag(undefined, TagState.New)
    tag.form = this.createTagFormState()
    this.tagsData.push(tag)
  }

  @computed get createButtonView() {
    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <Button
            type="dashed"
            onClick={() => this.createLocalTag()}
            disabled={this.tagsData.length >= maxAllowedTag || disabled}
          >
            添加
          </Button>
        )}
      />
    )
  }

  @autobind
  renderAction(tag: ITagState, index: number): React.ReactElement {
    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <div className={styles.actionBox}>
            {
              tag.state === TagState.Recorded
                ? (
                  <>
                    <Button
                      type="link"
                      disabled={disabled}
                      onClick={() => this.editLocalTag(tag)}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确定删除？"
                      onConfirm={() => this.handleDelete(index)}
                    >
                      <Button
                        type="link"
                        disabled={disabled}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </>
                )
                : (
                  <>
                    <Button
                      type="link"
                      disabled={disabled}
                      className={styles.fixInputPadding}
                      onClick={() => this.handleSave(tag, index)}
                    >
                      保存
                    </Button>
                    <Button
                      type="link"
                      disabled={disabled}
                      className={styles.fixInputPadding}
                      onClick={() => this.cancelLocalEdit(index)}
                    >
                      关闭
                    </Button>
                  </>
                )
            }
          </div>
        )}
      />
    )
  }

  renderKey(tag: ITagState): React.ReactElement {
    if (tag.state === TagState.Recorded) {
      return <>{tag.Key}</>
    }

    const form = tag.form!.$.Key
    return (
      <Form.Item {...bindFormItem(form)}>
        <Input placeholder="请输入标签键" {...bindTextInput(form)} />
      </Form.Item>
    )
  }

  renderValue(tag: ITagState): React.ReactElement {
    if (tag.state === TagState.Recorded) {
      return <>{tag.Value}</>
    }

    const form = tag.form!.$.Value
    return (
      <Form.Item {...bindFormItem(form)}>
        <Input placeholder="请输入标签值" {...bindTextInput(form)} />
      </Form.Item>
    )
  }

  render() {
    return (
      <Drawer
        width={640}
        title="标签管理"
        className={styles.drawer}
        onClose={this.props.onClose}
        visible={this.props.visible}
        onOk={this.props.onClose}
        okText="关闭"
      >
        <Prompt className={styles.prompt} type="assist">
          每个空间最多可添加 {maxAllowedTag} 对标签，标签区分大小写，仅支持大小写字母、数字、空格、
          {specialCharacter.split('').join(' ')}
        </Prompt>
        <Role name={BucketSettingTagRole.TagList}>
          <Table
            className={styles.table}
            pagination={false}
            dataSource={this.tagsData.slice()}
            footer={() => this.createButtonView}
            rowKey={(_, index) => String(index)}
          >
            <TableColumn
              key="key"
              title="标签键"
              render={
                (_, tag) => <Observer render={() => this.renderKey(tag)} />
              }
            />
            <TableColumn
              key="value"
              title="标签值"
              render={
                (_, tag) => <Observer render={() => this.renderValue(tag)} />
              }
            />
            <TableColumn
              key="action"
              title="操作"
              width="100px"
              render={
                (_, tag, index) => <Observer render={() => this.renderAction(tag, index)} />
              }
            />
          </Table>
        </Role>
      </Drawer>
    )
  }

  componentDidMount() {
    this.fetchTags()
  }
}

export default function TagDrawer(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalTagDrawer {...props} inject={inject} />
    )} />
  )
}
