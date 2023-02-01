/**
 * @desc 域名选择器 (单选)
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable, action, reaction, makeObservable } from 'mobx'
import { FieldState } from 'formstate-x'
import autobind from 'autobind-decorator'
import { debounce } from 'lodash'
import { useInjection } from 'qn-fe-core/di'
import Select, { SelectProps } from 'react-icecream/lib/select'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { bindSelect } from 'portal-base/common/form'
import Disposable from 'qn-fe-core/disposable'

import { debounceInterval, loadingText } from 'cdn/constants/async'

import DomainApis, { IDomain } from 'cdn/apis/domain'

import './style.less'

const PAGE_SIZE = 100

export type IValue = string

export type IState = FieldState<IValue>

interface IGetDomainsReq {
  name: string
  from: number
  size: number
}

export interface IProps {
  state: IState
  size?: SelectProps['size']
  disabled?: boolean
  getDomains?: (params: IGetDomainsReq) => Promise<{ domains: IDomain[] }>
  placeholder?: string
  allowClear?: boolean
}

export function createState(value?: IValue): IState {
  return new FieldState(value!)
}

export function getValue(state: IState): IValue {
  return state.value
}

const defaultProps: SelectProps = {
  size: 'default',
  placeholder: '请选择域名',
  className: 'comp-domain-select',
  disabled: false, // enable 可能会有诡异交互，慎用
  // other props: style

  filterOption: false,
  tokenSeparators: [',', ' ', ', '],
  showSearch: true,
  defaultActiveFirstOption: false,
  allowClear: false, // 容易误触，数量也不多，不建议用

  transitionName: '',
  choiceTransitionName: '', // 动画容易闪烁

  dropdownMatchSelectWidth: false, // 容易越过屏幕边界 TODO FIXME 现在还是越界了……
  dropdownStyle: { lineHeight: '14px' },

  notFoundContent: '暂无符合条件的域名'
}

enum Loading {
  GetDomainList = 'GetDomainList'
}

type PropsWithDeps = IProps & {
  domainApis: DomainApis
  toasterStore: ToasterStore
}

@observer
class DomainSelectInner extends React.Component<PropsWithDeps> {

  disposable = new Disposable()

  loadings = new Loadings(Loading.GetDomainList)

  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @observable.ref domainList: string[] = []
  @action updateDomainList(domains: IDomain[] = []) {
    this.domainList = domains.map(
      info => info.name
    )
  }

  @observable searchDomain = '' // 模糊搜索的域名
  @action updateSearchDomain(value: string) {
    this.searchDomain = value
  }

  @autobind handleSearch(domain: string) {
    this.updateSearchDomain(domain)
  }

  @computed get optionsView() {
    return this.domainList.map(
      (domain, index) => <Select.Option value={domain} key={index}>{domain}</Select.Option>
    )
  }

  @computed get isLoading() {
    return this.loadings.isLoading(Loading.GetDomainList)
  }

  render() {
    const notFoundContent = this.isLoading ? loadingText : defaultProps.notFoundContent
    const selectBinds = bindSelect(this.props.state)
    const selectProps: SelectProps = {
      ...defaultProps,
      ...selectBinds,
      // antd 的 select 要值为 undefined 才展示 placeholder，这里把 null 转成 undefined
      value: selectBinds.value == null ? undefined : selectBinds.value,
      size: this.props.size || defaultProps.size,
      disabled: this.props.disabled || defaultProps.disabled,
      onSearch: debounce(this.handleSearch, debounceInterval),
      notFoundContent,
      placeholder: this.props.placeholder == null ? defaultProps.placeholder : this.props.placeholder,
      loading: this.isLoading,
      allowClear: this.props.allowClear || defaultProps.allowClear
    }

    return (
      <Select {...selectProps}>
        {this.optionsView}
      </Select>
    )
  }

  @ToasterStore.handle()
  fetchDomainList(domain: string) {
    const fetchApi: (params: IGetDomainsReq) => Promise<{ domains: IDomain[] }> = this.props.getDomains
      || this.props.domainApis.searchDomains
    const req = fetchApi({
      name: domain,
      from: 0,
      size: PAGE_SIZE
    }).then(
      res => {
        this.updateDomainList(res.domains)
      }
    )

    return this.loadings.promise(Loading.GetDomainList, req)
  }

  init() {
    this.disposable.addDisposer(reaction(
      () => this.searchDomain,
      value => this.fetchDomainList(value),
      {
        fireImmediately: true,
        delay: debounceInterval
      }
    ))

    // 当清空查询前缀的时候，默认查询一次域名
    this.disposable.addDisposer(reaction(
      () => this.props.state.value,
      domain => {
        if (!domain) {
          this.handleSearch(null!)
        }
      }
    ))
  }
}

export default function DomainSelect(props: IProps) {
  const domainApis = useInjection(DomainApis)
  const toasterStore = useInjection(ToasterStore)

  return (
    <DomainSelectInner
      {...props}
      domainApis={domainApis}
      toasterStore={toasterStore}
    />
  )
}
