/*
 * @file component Contact of SSLOverview
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'

import Table from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'
import Select from 'react-icecream/lib/select'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'
import { useLocalStore } from 'qn-fe-core/local-store'
import { bindSelect, bindTextInput } from 'portal-base/common/form'

import { IContact } from '../../../../apis/ssl'
import { userSearchFieldOptionList, UserSearchField } from '../../../../constants/info'
import StateStore from './store'
import { ContactDrawer } from './Drawer'

import './style.less'

const { Search } = Input
const { Column } = Table
const { Option } = Select

export interface IValue {
  field: string
  keyword: string
}

export type IState = FormState<{
  field: FieldState<string>
  keyword: FieldState<string>
}>

export function createState(value?: IValue): IState {
  value = {
    field: UserSearchField.RemarkName,
    keyword: '',
    ...value
  }
  return new FormState({
    field: new FieldState(value.field),
    keyword: new FieldState(value.keyword)
  })
}

export function getValue(state: IState): IValue {
  return {
    field: state.$.field.$,
    keyword: state.$.keyword.$
  }
}

export interface IContactProps {}

export default observer(function _Contact(_props: IContactProps) {
  const store = useLocalStore(StateStore)
  const state = store.searchState
  return (
    <div className="contact-wrapper">
      <div className="line">
        <span className="group">
          <Button onClick={() => store.openAddContactDrawer()} type="primary">新增联系人信息</Button>
          <Button
            type="default"
            disabled={store.selectedDeleteDisabled}
            onClick={() => store.openDeleteSelectedContactModal()}
          >
            批量删除联系人信息
          </Button>
        </span>
        <span className="group">
          <Select style={{ width: '120px' }} {...bindSelect(state.$.field)}>
            {getSearchFieldOptions()}
          </Select>
          <Search style={{ width: '200px' }} {...bindTextInput(state.$.keyword)} placeholder="关键字查询" />
          <Icon onClick={() => store.fetchContactList()} type="sync" />
        </span>
      </div>
      <Table
        rowKey="id"
        dataSource={store.filteredContactList}
        rowSelection={{ onChange: (_, selectedList) => store.updateSelectedContactList(selectedList) }}
        pagination={{ pageSize: 10 }}
        loading={store.isLoading}
      >
        <Column
          key="remarkName"
          title="备注名称"
          dataIndex="remarkName"
          render={
            (remarkName, record: IContact) => (record.isDefault ? `${remarkName} (默认)` : remarkName)
          }
        />
        <Column key="name" title="姓名" render={row => <span>{row.lastName + row.firstName}</span>} />
        <Column key="position" title="职位" dataIndex="position" />
        <Column key="phone" title="电话" dataIndex="phone" />
        <Column key="operation"
          title="操作"
          render={(_, record: IContact) => (
            <div className="operation">
              <Button onClick={() => store.openModifyContactDrawer(record)} type="link">编辑</Button>
              <Button onClick={() => store.openDeleteConfirm(record.id!)} type="link">删除</Button>
            </div>
          )}
        />
      </Table>
      <ContactDrawer store={store.drawerStore} />
    </div>
  )
})

function getSearchFieldOptions() {
  return userSearchFieldOptionList.map(({ value, label }) => <Option key={value} value={value}>{label}</Option>)
}
