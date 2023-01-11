
import React from 'react'
import { observer, Observer } from 'mobx-react'
import { debounce } from 'lodash'
import { List, ListRowRenderer } from 'react-virtualized'

import Button from 'react-icecream/lib/button'
import Checkbox from 'react-icecream/lib/checkbox'
import Radio from 'react-icecream/lib/radio'
import Input from 'react-icecream/lib/input'
import Spin from 'react-icecream/lib/spin'
import { useLocalStore } from 'portal-base/common/utils/store'

import { MAX_DOMAIN_COUNT, OperatingState } from 'cdn/constants/domain'

import Popover from 'cdn/components/common/Popover'

import { IDomain } from 'cdn/apis/domain'

import LocalStore, { IDomainSelectorProps, protocolsOptions } from './store'

import './style.less'

const CheckboxGroup = Checkbox.Group
const domainListWidth = 320 // px

interface IDomainListProps {
  isLoading: boolean
  selected?: string
  domainList: IDomain[]
  onSelectChange: (value: string) => void
}

@observer
class DomainList extends React.Component<IDomainListProps, {}> {

  renderDomainItem: ListRowRenderer = ({ key, index, style }) => (
    <Observer key={key}
      render={() => {
        const domain = this.props.domainList[index]
        return (
          <li className="domain-list-item"
            style={{
              ...style,
              lineHeight: style.height + 'px'
            }}
          >
            <Radio
              checked={this.props.selected === domain.name}
              onChange={() => this.props.onSelectChange(domain.name)}
            >
              { domain.name }{ domain.operatingState === OperatingState.Deleted ? '(已删除)' : '' }
            </Radio>
          </li>
        )
      }} />
  )

  renderContent() {
    const { isLoading, domainList } = this.props

    if (!domainList.length) {
      return <div className="no-data">暂无数据</div>
    }

    return (
      <>
        <Spin spinning={isLoading}>
          <List
            className="domain-list-content"
            width={domainListWidth}
            height={240}
            rowHeight={32}
            rowCount={this.props.domainList.length}
            rowRenderer={this.renderDomainItem}
          />
        </Spin>
        <p className="domain-list-tip">注：此列表最多包含 { MAX_DOMAIN_COUNT } 个域名，如需更多，请使用搜索</p>
      </>
    )
  }

  render() {
    return (
      <div className="domain-list-wrapper" style={{ width: domainListWidth + 'px' }}>
        {this.renderContent()}
      </div>
    )
  }
}

function ProtocolFilter(props: {
  selectedOptions: string[],
  onChange: (selectedOptions: string[]) => void
}) {
  return (
    <div className="domain-protocol-filter-wrapper">
      <div className="domain-protocol-filter-label">按协议筛选：</div>
      <CheckboxGroup
        options={protocolsOptions}
        value={props.selectedOptions}
        onChange={props.onChange}
      />
    </div>
  )
}

function DomainSearchFilter(props: {
  onSearchChange: (val: string) => void,
  onSearch: (val: string) => void,
  onReset: () => void
}) {
  const handleDomainSearchChange = debounce(props.onSearchChange, 600)
  return (
    <div>
      <Input.Search
        placeholder="请输入关键词查询域名"
        style={{ width: 200 }}
        onSearch={val => props.onSearch(val)}
        onChange={e => handleDomainSearchChange((e.target as any).value)}
      />
      <Button className="reset-btn" onClick={() => props.onReset()}>清空已选</Button>
    </div>
  )
}

type PropsWithDeps = IDomainSelectorProps & {
  store: LocalStore
}

@observer
class DomainSelectorInner extends React.Component<PropsWithDeps> {
  render() {
    const { store } = this.props
    return (
      <div className="domain-selector-wrapper">
        <Popover trigger="click"
          placement="bottomLeft"
          overlayClassName="domain-selector"
          title={
            <DomainSearchFilter
              onSearchChange={store.updateDomainFilter}
              onSearch={(name: string) => store.searchDomainsByName(name)}
              onReset={() => store.reset()}
            />
          }
          onVisibleChange={(visible: boolean) => store.handleVisibleChange(visible)}
          content={
            <>
              <ProtocolFilter
                selectedOptions={store.protocols}
                onChange={(values: string[]) => store.handleProtocolChange(values)}
              />
              <DomainList
                isLoading={store.isLoading}
                domainList={store.domainList}
                selected={store.selectedDomain ? store.selectedDomain : undefined}
                onSelectChange={store.updateSelectedDomain}
              />
            </>
          }
        >
          <Button type="ghost" className="domain-selector-btn">
            { store.summary }
          </Button>
        </Popover>
      </div>
    )
  }
}

export default function DomainSelector(props: IDomainSelectorProps) {
  const store = useLocalStore(LocalStore, props)

  return (
    <DomainSelectorInner {...props} store={store} />
  )
}
