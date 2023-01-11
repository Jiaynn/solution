/**
 * @file 质量保障服务首页
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'

import Modal from 'react-icecream/lib/modal'
import Spin from 'react-icecream/lib/spin'
import { Link } from 'portal-base/common/router'
import Page from 'portal-base/common/components/Page'
import { useLocalStore } from 'portal-base/common/utils/store'

import { isLastDayOfMonth } from 'cdn/utils/datetime'

import { primeItems, PrimeLevel, PrimeStatus } from 'cdn/constants/qas'

import { IQasPrimeStatus } from 'cdn/apis/qas'
import PrimeItem from './Prime'
import CheckModal from './Check'
import Specification from './Specification'
import PrimeDescTable from './Prime/Table'
import Collapse, { Panel, CollapseStore } from './Collapse'

import LocalStore from './store'

import './style.less'

enum PrimePanelKey {
  Detail = 'detail',
  // eslint-disable-next-line
  Specification = 'specification'
}

const primeItemConfirm = {
  [PrimeStatus.Toon]: {
    title: '温馨提示',
    content: '确定取消开通申请？'
  },
  [PrimeStatus.Tooff]: {
    title: '温馨提示',
    content: '确定取消关闭申请？'
  },
  [PrimeStatus.Actived]: {
    title: '温馨提示',
    content: (
      <div>
        取消套餐将于次月 1 日生效，是否确定取消服务？
        <br />
        若已经申请开通其他 QAS 套餐服务，该套餐次月 1 日自动取消，无需手动取消。
      </div>
    )
  }
}

@observer
class QualityAssuranceServiceInner extends React.Component<{ store: LocalStore }> {
  collapseStore = new CollapseStore([PrimePanelKey.Detail, PrimePanelKey.Specification])

  @autobind
  handleCheckLastDay(item: IQasPrimeStatus) {
    if (isLastDayOfMonth()) {
      Modal.warning({
        title: '温馨提示',
        content: '根据活动规则，每月最后一天无法进行服务开通、关闭或变更的申请，如有变更的需求可电话联系售前咨询（400-808-9176 转 1）。'
      })
      return
    }
    return this.handlePrimeItemClick(item)
  }

  @autobind
  handlePrimeItemClick(item: IQasPrimeStatus) {
    switch (item.state) {
      case PrimeStatus.Original: {
        this.props.store.updateCheckPrimeVisible(true)
        this.props.store.updateTargetLevel(item.level)
        break
      }
      case PrimeStatus.Tooff: {
        if (this.props.store.toonPrimeLevel) {
          Modal.confirm({
            title: '温馨提示',
            content: '您已经申请开通其他 QAS 套餐服务，该套餐次月 1 日自动取消，无需手动取消。'
          })
          break
        }
        // 默认提示
        /* eslint-disable */
      }
      default: {
        Modal.confirm({
          title: primeItemConfirm[item.state].title,
          content: primeItemConfirm[item.state].content,
          onOk: () => this.props.store.cancelPrime(item.level)
        })
        break
      }
    }
  }

  @autobind
  handleConfirmOpenPrime() {
    this.props.store.updateCheckPrimeVisible(false)
    this.props.store.openPrime()
  }

  renderDescription() {
    return (
      <>
        <h1 className="qas-title">QAS 质量保障，享受更高的服务保障和赔偿</h1>
        <p className="qas-desc">
          开启质量保障服务后，七牛将会为您提供更优质的智能调度及运维服务，达到更高的服务可用性标准，为您的业务保驾护航。
          <br />
          官方标准服务可用性参考：<Link target="_blank" to="https://www.qiniu.com/sla-fusion">CDN 服务可用性保障。</Link>
        </p>
      </>
    )
  }

  renderPrimeItems() {
    const getPrimeStatus = (level: PrimeLevel) => this.props.store.qasInfo.levelstates.find(item => level === item.level)

    const items = primeItems.map(item => (
      <PrimeItem
        item={item}
        key={item.level}
        status={getPrimeStatus(item.level)!}
        onClick={this.handleCheckLastDay}
      />
    ))

    return (
      <Spin spinning={this.props.store.isLoading}>
        <div className="prime-items">
          {items}
        </div>
      </Spin>
    )
  }

  renderPrimeDetail() {
    return (
      <Panel
        title="套餐服务详情"
        key={PrimePanelKey.Detail}
        store={this.collapseStore}
      >
        <div className="qas-prime-detail">
          <PrimeDescTable />
        </div>
      </Panel>
    )
  }

  renderSpecification() {
    return (
      <Panel
        title="活动说明"
        key={PrimePanelKey.Specification}
        store={this.collapseStore}
      >
        <div className="qas-specification">
          <Specification />
        </div>
      </Panel>
    )
  }

  renderCheckModal() {
    return (
      <CheckModal
        visible={this.props.store.isPrimeCheckVisible}
        current={this.props.store.activePrimeLevel}
        onOK={() => this.handleConfirmOpenPrime()}
        onCancel={() => this.props.store.updateCheckPrimeVisible(false)}
      />
    )
  }

  render() {
    return (
      <Page className="comp-qas" header={null} hasSpace={false}>
        {this.renderDescription()}
        {this.renderPrimeItems()}
        <Collapse
          onChange={this.collapseStore.updateCollapseKeys}
          defaultActiveKey={[PrimePanelKey.Detail, PrimePanelKey.Specification]}
        >
          {this.renderPrimeDetail()}
          {this.renderSpecification()}
        </Collapse>
        {this.renderCheckModal()}
      </Page>
    )
  }
}

export default function QualityAssuranceService() {
  const store = useLocalStore(LocalStore)

  return (
    <QualityAssuranceServiceInner store={store} />
  )
}
