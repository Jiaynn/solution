/**
 * @file component Meta
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { FormState } from 'formstate'
import { action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button, Form, Input } from 'react-icecream/lib'
import Disposable from 'qn-fe-core/disposable'
import Role from 'portal-base/common/components/Role'

import { bindFormItem, bindTextInputField, getValuesFromFormState } from 'kodo/utils/formstate'

import { MetaStatus } from 'kodo/constants/bucket/resource'
import { BucketFileDetailRole } from 'kodo/constants/role'

import { Auth } from 'kodo/components/common/Auth'

import { IMeta } from 'kodo/apis/bucket/resource'

import { FormMetaValue } from './index'
import styles from './style.m.less'

export interface IProps extends IMeta {
  bucketName: string
  form: FormState<FormMetaValue>
  index: number
  isFrozen: boolean
  isReadonlyShareBucket: boolean

  deleteMeta(index: number): void

  deleteNewLine(index: number): void

  onMetaAdd(value: IMeta, index: number): void

  onMetaUpdate(value: IMeta, index: number, originName: string): void

  onMetaStatusChange(index: number, status: MetaStatus): void
}

class Meta extends React.Component<IProps> {
  disposable = new Disposable()

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get metaValue(): IMeta {
    return {
      ...getValuesFromFormState(this.props.form),
      status: this.props.status
    }
  }

  @action.bound
  handleSaveMeta() {
    this.props.form.validate().then(res => {
      if (res.hasError) {
        return
      }
      if (this.props.status === MetaStatus.New) {
        this.props.onMetaAdd(this.metaValue, this.props.index)
      } else {
        this.props.onMetaUpdate(this.metaValue, this.props.index, this.props.name)
      }
    })
  }

  @action.bound
  handleClose() {
    // 关闭时，如果当前是新增，则直接删除该行，不然则恢复已记录状态
    if (this.props.status === MetaStatus.New) {
      this.props.deleteNewLine(this.props.index)
      return
    }
    this.props.onMetaStatusChange(this.props.index, MetaStatus.Recorded)
  }

  @computed
  get editingView() {
    return (
      <Role name={BucketFileDetailRole.MetaDataInputItem}>
        <tr>
          <td>
            <Form.Item {...bindFormItem(this.props.form.$.name)}>
              <Input placeholder="请输入参数" {...bindTextInputField(this.props.form.$.name)} />
            </Form.Item>
          </td>
          <td>
            <Form.Item {...bindFormItem(this.props.form.$.value)}>
              <Input placeholder="请输入值" {...bindTextInputField(this.props.form.$.value)} />
            </Form.Item>
          </td>
          <td>
            <Button
              type="link"
              disabled={this.props.isReadonlyShareBucket || this.props.isFrozen}
              className={styles.operation}
              onClick={this.handleSaveMeta}
            >
              保存
            </Button>
            <Button
              disabled={this.props.isReadonlyShareBucket || this.props.isFrozen}
              className={styles.operation}
              onClick={this.handleClose}
              type="link"
            >
              关闭
            </Button>
          </td>
        </tr>
      </Role>
    )
  }

  @computed
  get defaultView() {
    return (
      <tr>
        <td>
          <p>{this.props.name}</p>
        </td>
        <td>
          <p>{this.props.value}</p>
        </td>
        <td>
          <Auth notProtectedUser notIamUser>
            <Role name={BucketFileDetailRole.MetaDataEditEntry}>
              <Button
                type="link"
                className={styles.operation}
                disabled={this.props.isReadonlyShareBucket || this.props.isFrozen}
                onClick={() => this.props.onMetaStatusChange(
                  this.props.index,
                  MetaStatus.Editing
                )}
              >
                编辑
              </Button>
            </Role>
          </Auth>
          <Auth notIamUser>
            <Role name={BucketFileDetailRole.MetaDataDeleteEntry}>
              <Button
                type="link"
                className={styles.operation}
                disabled={this.props.isReadonlyShareBucket || this.props.isFrozen}
                onClick={() => this.props.deleteMeta(this.props.index)}
              >
                删除
              </Button>
            </Role>
          </Auth>
        </td>
      </tr>
    )
  }

  render() {
    return [MetaStatus.Editing, MetaStatus.New].includes(this.props.status)
      ? this.editingView
      : this.defaultView
  }
}

export default observer(Meta)
