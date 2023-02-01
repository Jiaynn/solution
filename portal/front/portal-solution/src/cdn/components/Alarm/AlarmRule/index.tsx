/**
 * @file 告警服务首页
 * @author zhouhang <zhouhang@qiniu.com>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'

import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { useLocalStore } from 'portal-base/common/utils/store'
import { Button, Popover } from 'react-icecream-2'
import { SearchThinIcon } from 'react-icecream-2/icons'
import { InputGroup, Select, SelectOption as Option, TextInput } from 'react-icecream-2/form-x'

import { alarmRuleSearchTypeOptions, alarmRuleSearchTypeNameMap, AlarmRuleSearchType } from 'cdn/constants/alarm'
import RuleList, { AlarmConfigForDisplay } from './List'
import AlarmModal, { AlarmModalType } from './Modal/AlarmModal'
import LocalStore from './store'

import './style.less'

export interface Props {
  domain?: string
}

interface PropsWithDeps extends Props {
  store: LocalStore
  toasterStore: ToasterStore
}

@observer
class AlarmInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)

    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @autobind
  @ToasterStore.handle()
  handleOpenAlarmModal(config?: AlarmConfigForDisplay, type?: AlarmModalType) {
    return this.props.store.alarmModalStore.open({ config, type }).then((value: AlarmConfigForDisplay) => (
      this.props.store.upsertConfig(value)
    ))
  }

  @autobind
  handleDeleteConfig(rule: string) {
    this.props.store.deleteConfig(rule)
  }

  @autobind
  handleBatchDeleteConfigs() {
    this.props.store.batchDeleteConfigs()
  }

  @autobind
  handleSwitch(config: AlarmConfigForDisplay, isEnable: boolean) {
    this.props.store.updateStatus(config, isEnable)
  }

  @computed get headerView() {
    const store = this.props.store
    return (
      <div className="rule-header">
        <div>
          <Button type="primary" onClick={() => this.handleOpenAlarmModal()}>新建告警规则</Button>
          <Popover
            buttons={{
              onOk: this.handleBatchDeleteConfigs
            }}
            trigger="click"
            content={'确定删除这 ' + store.selectedIds.length + ' 条规则吗？'}
          >
            <Button
              style={{ marginLeft: '12px' }}
              disabled={store.selectedIds.length === 0}
            >
              批量删除
            </Button>
          </Popover>
        </div>
        <InputGroup style={{ width: '400px' }}>
          <Select style={{ flex: '0 0 120px' }} state={store.searchFormState.$.searchType}>
            {
              alarmRuleSearchTypeOptions.map(({ value }) => (
                <Option key={value} value={value}>{alarmRuleSearchTypeNameMap[value]}</Option>
              ))
            }
          </Select>
          {
            store.searchFormState.$.searchType.value === AlarmRuleSearchType.Domain && (
              <TextInput
                suffix={<SearchThinIcon />}
                placeholder="请输入域名查询"
                state={store.searchFormState.$.domain}
              />
            )
          }
          {
            store.searchFormState.$.searchType.value === AlarmRuleSearchType.Rule && (
              <TextInput
                suffix={<SearchThinIcon />}
                placeholder="请输入规则名称查询"
                state={store.searchFormState.$.rule}
              />
            )
          }
        </InputGroup>
      </div>
    )
  }

  @computed get alarmConfigView() {
    const store = this.props.store
    return (
      <div className="rule-content">
        <RuleList
          selectedIds={store.selectedIds}
          loading={store.isLoading}
          onChange={store.updateSelectedIds}
          configs={store.filterConfigList || []}
          onDelete={this.handleDeleteConfig}
          onSwitch={this.handleSwitch}
          onView={this.handleOpenAlarmModal}
        />
      </div>
    )
  }

  render() {
    return (
      <div className="comp-alarm-rule">
        {this.headerView}
        {this.alarmConfigView}
        <AlarmModal
          {...this.props.store.alarmModalStore.bind()}
        />
      </div>
    )
  }
}

export default observer(function Alarm(props: Props) {
  const toasterStore = useInjection(ToasterStore)
  const store = useLocalStore(LocalStore, props)

  return (
    <AlarmInner
      toasterStore={toasterStore}
      store={store}
      {...props}
    />
  )
})
