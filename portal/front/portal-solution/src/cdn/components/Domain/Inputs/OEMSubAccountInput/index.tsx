/**
 * @file oem sub account select component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { debounce } from 'lodash'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import { observable, reaction, action, computed, makeObservable } from 'mobx'
import Disposable from 'qn-fe-core/disposable'
import { Loadings } from 'portal-base/common/loading'
import { bindInputNumber } from 'portal-base/common/form'
import Select, { SelectProps } from 'react-icecream/lib/select'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { debounceInterval, loadingText } from 'cdn/constants/async'
import { oemVendor } from 'cdn/constants/env'

import SubAccountApis, { ISubAccount, ISubAccountsOptions, SubAccountState } from 'cdn/apis/oem/sub-account'

import './style.less'

const PAGE_SIZE = 300

const oemParent = {
  uid: oemVendor,
  name: '当前帐户'
}

const defaultProps: SelectProps = {
  placeholder: '请选择子帐户',
  className: 'select-input-wrapper',
  showSearch: true,
  notFoundContent: '暂无符合条件的子帐户',
  filterOption: false,
  transitionName: '',
  choiceTransitionName: '', // 动画容易闪烁
  allowClear: false // 容易误触，数量也不多，不建议用
}

export function createState(uid?: number) {
  return new FieldState(uid)
}

export type State = ReturnType<typeof createState>

export type Value = number

export interface Props {
  withParent?: boolean
  state: State
}

export default observer(function SubAccountSelectWrapper(props: Props) {
  const toaster = useInjection(Toaster)
  const subAccountApis = useInjection(SubAccountApis)

  return (
    <SubAccountSelect
      toaster={toaster}
      subAccountApis={subAccountApis}
      withParent={props.withParent}
      {...bindInputNumber(props.state)}
    />
  )
})

enum LoadingType {
  GetSubAccountList = 'getSubAccountList'
}

export interface SubAccountSelectProps {
  value: number
  withParent?: boolean
  onChange: (v: number) => void
  toaster: Toaster
  subAccountApis: SubAccountApis
}

@observer
export class SubAccountSelect extends React.Component<SubAccountSelectProps> {
  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...Object.values(LoadingType))

  @observable searchName?: string
  @observable.ref subAccounts: ISubAccount[] = []

  constructor(props: SubAccountSelectProps) {
    super(props)
    makeObservable(this)
    Toaster.bindTo(this, this.props.toaster)
  }

  @action updateSubAccountList(subAccounts: ISubAccount[] = []) {
    this.subAccounts = subAccounts
  }

  @action updateSearchName(name: string) {
    this.searchName = name
  }

  @autobind handleSearch(domain: string) {
    this.updateSearchName(domain)
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.GetSubAccountList)
  }

  @computed get normalSubAccounts() {
    return (this.subAccounts || []).filter(it => it.state === SubAccountState.Normal)
  }

  @computed get searchOptions(): ISubAccountsOptions {
    return {
      limit: PAGE_SIZE,
      name: this.searchName
    }
  }

  @computed get optionsView() {
    const options = this.normalSubAccounts.map(
      account => (
        <Select.Option value={account.uid} key={account.uid}>
          {`${account.name}-${account.email}`}
        </Select.Option>
      )
    )

    return this.props.withParent
      ? (
        [(<Select.Option value={oemParent.uid} key={oemParent.uid}>{oemParent.name}</Select.Option>), ...options]
      )
      : options
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.GetSubAccountList)
  getSubAccountList() {
    return this.props.subAccountApis.getSubAccounts(this.searchOptions)
      .then(resp => this.updateSubAccountList(resp.infos || []))
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.searchName,
      _ => this.getSubAccountList(),
      {
        fireImmediately: true
      }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    let value: number | undefined
    if (this.props.value != null) {
      value = this.props.value
    } else {
      value = this.props.withParent ? oemParent.uid : undefined
    }

    const notFoundContent = this.isLoading
      ? loadingText
      : defaultProps.notFoundContent
    const selectProps: SelectProps = {
      ...defaultProps,
      onChange: this.props.onChange,
      value,
      notFoundContent,
      onSearch: debounce(this.handleSearch, debounceInterval)
    }

    return (
      <div className="comp-oem-sub-account-select">
        <Select {...selectProps}>
          {this.optionsView}
        </Select>
      </div>
    )
  }
}
