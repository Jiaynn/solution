/*
 * @file component Company of SSLOverview
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { FormState, FieldState } from 'formstate-x'
import { observer } from 'mobx-react'

import Table from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'
import Select from 'react-icecream/lib/select'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'
import { useLocalStore } from 'qn-fe-core/local-store'
import { bindSelect, bindTextInput } from 'portal-base/common/form'

import { companySearchFieldOptionList, CompanySearchField } from '../../../../constants/info'
import { ICompany } from '../../../../apis/ssl'
import StateStore from './store'
import { CompanyDrawer } from './Drawer'

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
    field: CompanySearchField.RemarkName,
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

export interface ICompanyProps {}

export default observer(function _Company(_props: ICompanyProps) {
  const store = useLocalStore(StateStore)
  const state = store.searchState
  return (
    <div className="company-wrapper">
      <div className="line">
        <span className="group">
          <Button onClick={() => store.openAddCompanyDrawer()} type="primary">新增公司信息</Button>
          <Button
            type="default"
            disabled={store.selectedDeleteDisabled}
            onClick={() => store.openDeleteSelectedCompanyModal()}
          >
            批量删除公司信息
          </Button>
        </span>
        <span className="group">
          <Select style={{ width: '120px' }} {...bindSelect(state.$.field)}>
            {getSearchFieldOptions()}
          </Select>
          <Search style={{ width: '200px' }} {...bindTextInput(state.$.keyword)} placeholder="关键字查询" />
          <Icon onClick={() => store.fetchCompanyList()} type="sync" />
        </span>
      </div>
      <Table
        rowKey="id"
        dataSource={store.filteredCompanyList}
        rowSelection={{ onChange: (_, selectedList) => store.updateSelectedCompanyList(selectedList) }}
        pagination={{ pageSize: 10 }}
        loading={store.isLoading}
      >
        <Column
          key="remarkName"
          title="备注名称"
          dataIndex="remarkName"
          render={
            (remarkName, record: ICompany) => (record.isDefault ? `${remarkName} (默认)` : remarkName)
          }
        />
        <Column key="name" title="公司名称" dataIndex="name" />
        <Column key="division" title="部门" dataIndex="division" />
        <Column key="phone" title="座机电话" dataIndex="phone" />
        <Column key="operation"
          title="操作"
          render={(_, record: ICompany) => (
            <div className="operation">
              <Button onClick={() => store.openModifyCompanyDrawer(record)} type="link">编辑</Button>
              <Button onClick={() => store.openDeleteConfirm(record.id!)} type="link">删除</Button>
            </div>
          )}
        />
      </Table>
      <CompanyDrawer store={store.drawerStore} />
    </div>
  )
})

function getSearchFieldOptions() {
  return companySearchFieldOptionList.map(({ value, label }) => <Option key={value} value={value}>{label}</Option>)
}
