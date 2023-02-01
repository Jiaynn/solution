/**
 * @file User Financial Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { Modal } from 'react-icecream/lib'
import { useLocalStore } from 'qn-fe-core/local-store'
import { noop } from 'lodash'

import { IFinancial } from 'cdn/apis/oem/financial'

import BillHistoryModal from './Modal/BillHistory'
import UserFinancialModal from './Modal/UserFinancial'
import UpdateBillModal from './Modal/UpdateBill'
import CurrentBillModal from './Modal/CurrentBill'
import SearchBar from './SearchBar'
import ListView from './ListView'
import CoefficientTip, { isNormalCoefficient } from './CoefficientTip'
import { LocalStore } from './store'

import './style.less'

export default observer(function UserFinancial() {

  const store = useLocalStore(LocalStore)

  const handleEditFinancial = React.useCallback((info: IFinancial) => {
    store.toasterStore.promise(
      store.userFinancialModalStore.open(info)
    )
      .then(result => {
        if (isNormalCoefficient(result.coefficient)) {
          store.updateFinancial(info.uid, result)
          return
        }
        Modal.confirm({
          title: '请确认以下信息',
          content: <CoefficientTip isFirst={!info.chargeType} />,
          onOk: () => store.updateFinancial(info.uid, result)
        })
      })
      .catch(noop)
  }, [store])

  const handleUpdateBill = React.useCallback((info: IFinancial) => {
    store.toasterStore.promise(
      store.updateBillModalStore.open({
        uid: info.uid,
        name: info.name,
        onFinancialConfig: () => handleEditFinancial(info)
      })
        .then(result => {
          store.updateBill(info.uid, result)
        })
        .catch(noop)
    )
  }, [store, handleEditFinancial])

  return (
    <div className="comp-financial-user">
      <SearchBar state={store.searchState} />
      <ListView
        pagination={store.pagination}
        loading={store.isLoading}
        dataSource={store.financialList}
        onEdit={handleEditFinancial}
        onShowCurrent={store.handleShowCurrent}
        onShowHistory={store.handleShowHistory}
        onUpdateBill={handleUpdateBill}
      />
      <UserFinancialModal {...store.userFinancialModalStore.bind()} />
      <UpdateBillModal {...store.updateBillModalStore.bind()} />
      <BillHistoryModal {...store.billHistoryModalStore.bind()} />
      <CurrentBillModal {...store.currentBillModalStore.bind()} />
    </div>
  )
})
