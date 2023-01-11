/**
 * @file DomainList store
 * @author linchen <gakiclin@gmail.com>
 */

import { computed, action } from 'mobx'
import { FieldState } from 'formstate-x'
import { uniqBy, differenceBy, intersectionBy } from 'lodash'
import { observeInjectable as injectable } from 'qn-fe-core/store'
import Disposable from 'qn-fe-core/disposable'
import { injectProps } from 'qn-fe-core/local-store'

import { IDomain } from 'cdn/apis/domain'

import { IProps } from '.'

export type State = FieldState<IDomain[]>

export type Value = IDomain[]

export function createState(domains: IDomain[] = []): State {
  return new FieldState(domains)
}

export function getValue(state: State): Value {
  return state.value || []
}

@injectable()
export default class LocalStore extends Disposable {
  constructor(
    @injectProps() public props: IProps
  ) {
    super()
  }

  @computed get selectedList() {
    return getValue(this.props.state)
  }

  @computed get selectedDomainsForDisplay() {
    return intersectionBy(this.props.domainList, this.selectedList)
  }

  @computed get isEmptySelected() {
    return this.selectedDomainsForDisplay.length === 0
  }

  @computed get isPartialSelected() {
    return !this.isEmptySelected && this.selectedDomainsForDisplay.length < this.props.domainList.length
  }

  @computed get isFullSelected() {
    return !this.isEmptySelected && this.selectedDomainsForDisplay.length === this.props.domainList.length
  }

  @computed get domainList() {
    return this.props.domainList
  }

  @action.bound
  handleClear() {
    this.props.state.onChange(
      differenceBy(this.selectedList, this.selectedDomainsForDisplay, 'name')
    )
  }

  @action.bound
  handleCheckDomainChange(domain: IDomain, checked: boolean) {
    if (checked) {
      this.props.state.onChange([...this.props.state.value, domain])
    } else {
      this.props.state.onChange(
        this.props.state.value.filter(it => it.name !== domain.name)
      )
    }
  }

  @action.bound
  handleFullSelected(selectAll: boolean) {
    if (selectAll) {
      this.props.state.onChange(
        uniqBy([...this.props.state.value, ...this.props.domainList], 'name')
      )
      return
    }
    // 避免半选的状态下，选中的列表数据被清除
    if (!this.isPartialSelected) {
      this.props.state.onChange(
        differenceBy(this.selectedList, this.selectedDomainsForDisplay, 'name')
      )
    }
  }
}

