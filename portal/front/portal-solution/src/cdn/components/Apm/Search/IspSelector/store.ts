import { observable, computed, reaction, action } from 'mobx'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { isps, ispTextMap } from 'cdn/constants/isp'

export interface IProps {
  value: string[]
  onChange: (v: string[]) => void
}

const apmIspList = [isps.telecom, isps.unicom, isps.mobile]

export const ispOptions = apmIspList.map(
  isp => ({
    label: ispTextMap[isp],
    value: isp
  })
)

@injectable()
export default class LocalStore extends Store {
  @observable.shallow selectedIsps!: string[]
  @observable isps!: string[]

  constructor(
    @injectProps() private props: IProps
  ) {
    super()
  }

  @computed get summary() {
    if (this.selectedIsps && this.selectedIsps.length === 3) {
      return '全部运营商'
    }
    return `已选 ${this.selectedIsps ? this.selectedIsps.length : 0}/3 个运营商`
  }

  @autobind confirmChange() {
    this.props.onChange(this.selectedIsps)
  }

  @action.bound updateIsps(selectedIsps: string[]) {
    this.selectedIsps = selectedIsps
  }

  @action.bound onIspChange(target: string) {
    const selectedIsps = this.selectedIsps.indexOf(target) >= 0
      ? this.selectedIsps.filter(isp => isp !== target)
      : [...this.selectedIsps.slice(), target]
    this.updateIsps(selectedIsps)
  }

  init() {
    this.addDisposer(reaction(
      () => this.props.value,
      selectedIsps => {
        this.updateIsps(selectedIsps)
      },
      { fireImmediately: true }
    ))
  }
}
