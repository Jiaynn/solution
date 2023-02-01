/**
 * @file Current Bill Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'

import Modal from 'react-icecream/lib/modal'
import { useLocalStore } from 'qn-fe-core/local-store'

import BillListView from 'cdn/components/Financial/common/Bill/ListView'
import { Props, BillStore } from './store'

import './style.less'

export { CurrentBillModalStore } from './store'

export default observer(function CurrentBillModal(props: Props) {

  const dateView = React.useMemo(() => (
    <p className="bill-date">
      当前计费周期&nbsp;
      {moment().startOf('month').format('YYYY-MM-DD')}-
      {moment().format('YYYY-MM-DD')}
    </p>
  ), [])

  const billTipView = (
    <div className="bill-tip">
      <p className="bill-tip-title">计费说明</p>
      <ul className="bill-tip-list">
        <li className="bill-tip-list-item">
          1、按量付费资源采用月结算模式，针对未出账结算的资源，我们会每天根据用户的使用量进行计费，生
          成实时消费明细。因账单尚未出账，以下数据仅作参考，不是最终的账单费用。
        </li>
        <li className="bill-tip-list-item">
          2、实时消费明细每日上午 8 点更新一次，计费周期为未结算月份 1 号 0:00 至当日 0:00 。更多说明请参考文档
        </li>
      </ul>
    </div>
  )

  const {
    uid,
    name,
    onSubmit,
    ...restProps
  } = props

  const store = useLocalStore(BillStore, {
    uid,
    onSubmit,
    visible: props.visible
  })

  return (
    <Modal
      className="comp-current-bill-modal"
      title={`本月账单明细-${name}`}
      width="640px"
      onOk={onSubmit}
      {...restProps}
    >
      <div className="current-bill-content">
        {dateView}
        <BillListView
          size="small"
          loading={store.isLoading}
          dataSource={store.billForListView}
        />
        {billTipView}
      </div>
    </Modal>
  )
})
