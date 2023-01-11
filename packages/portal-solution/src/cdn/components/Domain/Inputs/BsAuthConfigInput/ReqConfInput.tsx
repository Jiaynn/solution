import React, { ChangeEvent } from 'react'

import Input from 'react-icecream/lib/input'
import Select from 'react-icecream/lib/select'
import Icon from 'react-icecream/lib/icon'
import { isEmpty } from 'lodash'

import {
  userAuthReqObjectKeyOfTypeList,
  userAuthReqObjectKeyOfTypes,
  userAuthReqObjectKeyOfTypeMap,
  UserAuthReqConfObjectKeyTypes,
  UserAuthReqConfObjectKeyTypeMap
} from 'cdn/constants/domain'
import Error from '../common/Error'
import { IReqConfObject } from './index'

export interface IProps {
  value: IReqConfObject[],
  error?: IReqConfObject[],
  title: string,
  onChange: (value: IReqConfObject[]) => void
}

export const ReqConfInput = (props: IProps) => {

  let configParamSelectWrapper: HTMLElement | null = null

  const handleReqConfRemove = (index: number) => {
    const { value: reqConfObjectList } = props
    reqConfObjectList.splice(index, 1)
    props.onChange(reqConfObjectList)
  }

  const handleReqConfAdd = () => {
    const { value: reqConfObjectList } = props
    reqConfObjectList.push({
      key: '',
      value: '',
      type: userAuthReqObjectKeyOfTypes.custom
    })
    props.onChange(reqConfObjectList)
  }

  const handleSelectValueChanged = (index: number, value: string) => {
    const { value: reqConfObjectList } = props
    reqConfObjectList[index].type = value
    if (value !== userAuthReqObjectKeyOfTypes.custom) {
      reqConfObjectList[index].value = ''
    }
    props.onChange(reqConfObjectList)
  }

  const handleInput = (index: number, e: ChangeEvent<HTMLInputElement>, keyType: keyof IReqConfObject) => {
    const { value: reqConfObjectList } = props
    reqConfObjectList[index][keyType] = e.target.value.trim()
    props.onChange(reqConfObjectList)
  }

  const handleKeyInput = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    handleInput(index, e, 'key')
  }

  const handleValueInput = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    handleInput(index, e, 'value')
  }

  const tableLines = (list: IReqConfObject[]) => list && list.map(
    (it, index) => (
      <tr key={index} className="sources-table-line">
        <td className="sources-table-grid-key">
          <Input value={it.key} onChange={e => handleKeyInput(index, e)} />
        </td>
        <td className="sources-table-grid-type">
          <div className="line config-param-input-wrapper" ref={element => { configParamSelectWrapper = element }}>
            <Select
              className="config-param-select"
              value={it.type}
              onChange={value => handleSelectValueChanged(index, value as string)}
              getPopupContainer={() => configParamSelectWrapper!}
            >
              {
                userAuthReqObjectKeyOfTypeList.map(
                  type => (
                    <Select.Option key={type} value={type}>{userAuthReqObjectKeyOfTypeMap[type]}</Select.Option>
                  )
                )
              }
            </Select>
          </div>
        </td>
        <td className="sources-table-grid-value">
          <Input
            value={it.value}
            disabled={it.type !== userAuthReqObjectKeyOfTypes.custom}
            onChange={e => handleValueInput(index, e)}
          />
        </td>
        <td><Icon className="icon-remove" type="delete" onClick={() => handleReqConfRemove(index)} /></td>
        <td className="sources-table-grid-error">
          <Error
            error={
              props.error
              && props.error[index]
              && props.error[index].key
              && `key ${props.error[index].key}`
            }
          />
        </td>
        <td className="sources-table-grid-error">
          <Error
            error={
              props.error
              && props.error[index]
              && props.error[index].value
              && `value ${props.error[index].value}`
            }
          />
        </td>
      </tr>
    )
  )

  return (
    <div className="req-conf-content-wrapper">
      <div className="title-wrapper">
        <span className="second-level-title">{props.title}</span>
        <Icon className="icon-add" type="plus-circle" onClick={handleReqConfAdd} />
      </div>
      {
        !isEmpty(props.value)
        ? <table className="sources-table">
          <thead>
            <tr>
              <th>{UserAuthReqConfObjectKeyTypeMap[UserAuthReqConfObjectKeyTypes.key]}</th>
              <th>{UserAuthReqConfObjectKeyTypeMap[UserAuthReqConfObjectKeyTypes.type]}</th>
              <th>{UserAuthReqConfObjectKeyTypeMap[UserAuthReqConfObjectKeyTypes.value]}</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            { tableLines(props.value) }
          </tbody>
        </table>
        : null
      }
    </div>
  )
}
