/**
 * @file HTTP 头部设置模块
 * @author zhuhao <zhuhao@qiniu.com>
 * @author hejinxin <hejinxin@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { computed } from 'mobx'
import autobind from 'autobind-decorator'
import { differenceWith } from 'lodash'
import { ArrayFormState, FieldState, FormState, TransformedState } from 'formstate-x-v3'
import Popconfirm from 'react-icecream/lib/popconfirm'
import Select from 'react-icecream/lib/select'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'
import Button from 'react-icecream/lib/button'
import { injectProps, useLocalStore } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { bindInput, bindSelect } from 'cdn/utils/form/formstate-x-v3'

import { textRequired } from 'cdn/transforms/form'
import { validateValue } from 'cdn/transforms/domain/http-header'

import {
  ResponseHeaderControlOp,
  responseHeaderControlOpList,
  responseHeaderControlKeyList,
  responseHeaderControlValueList
} from 'cdn/constants/domain'

import { IDomainDetail, IRespHeaderOptions, IResponseHeaderControl } from 'cdn/apis/domain'

import Error from '../common/Error'

import './style.less'

function createControlState(conf: IResponseHeaderControl) {
  const formState = new FormState({
    op: new FieldState(conf.op).withValidator(op => textRequired(op, '不能为空')),
    key: new FieldState(conf.key).withValidator(key => textRequired(key, '不能为空')),
    value: new FieldState(conf.value)
  })
  formState.$.value.withValidator(() => validateValue(formState.value))

  return formState
}

const isValidSetConfig = (it: IResponseHeaderControl) => (it.op === ResponseHeaderControlOp.Set) && it.key && it.value

const isValidDelConfig = (it: IResponseHeaderControl) => (it.op === ResponseHeaderControlOp.Del) && it.key

const isValidOpConfig = (it: IResponseHeaderControl) => isValidDelConfig(it) || isValidSetConfig(it)

export function createState(list: IResponseHeaderControl[]) {
  const uiState = new ArrayFormState(list, createControlState)

  return new TransformedState(
    uiState,
    respHeaderControls => {
      const values = respHeaderControls
        .filter(isValidOpConfig)
        .map(it => {
          if (it.op === ResponseHeaderControlOp.Del) {
            return { ...it, value: '' }
          }
          return it
        })
      return { responseHeaderControls: values }
    },
    ({ responseHeaderControls }) => responseHeaderControls
  )
}

export type Value = IRespHeaderOptions

export type State = ReturnType<typeof createState>

export interface Props {
  domain: IDomainDetail
  state: State
}

export default observer(function HeaderInput(props: Props) {
  const store = useLocalStore(LocalStore, props)

  const addTag = (
    <Button
      type="dashed"
      className="add-tag"
      disabled={store.disableAddTag}
      onClick={store.addEmptyControl}
    >
      <Icon type="plus" />添加
    </Button>
  )

  const renderRowOperation = (index: number) => {
    const header = props.state.$.$[index]
    const popConfirmOp = (
      <Popconfirm
        placement="top"
        title={`确定要删除 ${header.value.key || ''} 这条配置吗？`}
        okText="确认"
        okType="danger"
        cancelText="取消"
        onConfirm={() => store.removeControl(index)}
      >
        <Icon className="icon-remove" type="minus-circle" />
      </Popconfirm>
    )

    const regularOp = (
      <Icon
        className="icon-remove"
        type="minus-circle"
        onClick={() => store.removeControl(index)}
      />
    )

    return store.shouldConfirmDelete(index) ? popConfirmOp : regularOp
  }

  const tableRows = props.state.$.$.map(
    (controlState, index) => (
      <tr key={index} className="sources-table-line">
        <td className="sources-table-grid-key">
          <Select
            placeholder="请选择 HTTP 响应头"
            {...bindSelect(controlState.$.key)}
          >
            {
              store.availableControlKeyList.map(field => (
                <Select.Option key={field.key} value={field.value}>{field.value}</Select.Option>
              ))
            }
          </Select>
        </td>
        <td className="sources-table-grid-op">
          <Select
            placeholder="请选择操作"
            {...bindSelect(controlState.$.op)}
          >
            {
              responseHeaderControlOpList.map(op => (
                <Select.Option key={op.key} value={op.key}>{op.value}</Select.Option>
              ))
            }
          </Select>
        </td>
        <td className="sources-table-grid-value">
          <Input
            placeholder="请输入对应值, 区分大小写"
            disabled={controlState.value.op === ResponseHeaderControlOp.Del}
            {...bindInput(controlState.$.value)}
          />
        </td>
        <td className="sources-table-grid-operation">
          { renderRowOperation(index) }
        </td>
        <td><Error style={{ marginTop: 0 }} error={controlState.error} /></td>
      </tr>
    )
  )

  return (
    <div className="domain-response-header-input-wrapper">
      <table className="respheader-table">
        <thead>
          <tr>
            <th>HTTP 响应头</th>
            <th>响应头操作</th>
            <th>值</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
      {addTag}
    </div>
  )
})

@injectable()
export class LocalStore extends Store {
  constructor(@injectProps() private props: Props) {
    super()
  }

  // 禁止添加按钮:
  // 1. 已选响应头超过可选响应头长度
  // 2. 当前编辑项存在一个满足未完成编辑条件的响应头行
  @computed get disableAddTag() {
    return this.props.state.$.$.length >= responseHeaderControlKeyList.length
      || this.props.state.$.value.filter(
        it => !it.key || (it.op !== ResponseHeaderControlOp.Del && !it.value)
      ).length > 0
  }

  @computed get availableControlKeyList() {
    return differenceWith(responseHeaderControlValueList, this.props.state.$.value, (l, r) => l.key === r.key)
  }

  @autobind addEmptyControl() {
    this.props.state.$.append({
      value: '',
      key: this.availableControlKeyList[0].key,
      op: ResponseHeaderControlOp.Set
    })
  }

  @autobind removeControl(targetIndex: number) {
    this.props.state.$.remove(targetIndex)
  }

  @autobind shouldConfirmDelete(index: number) {
    const header = this.props.state.$.$[index].value
    const isDeleteOp = header.op === ResponseHeaderControlOp.Del
    const isSetOp = header.op === ResponseHeaderControlOp.Set
    return header.key && (isDeleteOp || (isSetOp && header.value))
  }
}
