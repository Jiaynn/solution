/**
 * @file Bill History Modal Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Modal from 'react-icecream/lib/modal'

import { ModalStore, IModalProps } from 'cdn/stores/modal'
import BillList from '../../common/Bill'

import './style.less'

interface IExtraProps {
  uid: number
  name: string
}

export type Props = IExtraProps & IModalProps

export default observer(function BillHistoryModal(props: Props) {
  const {
    uid,
    name,
    onSubmit,
    ...restProps
  } = props

  return (
    <Modal
      className="comp-bill-history-modal"
      title={`历史账单-${props.name}`}
      onOk={onSubmit}
      {...restProps}
    >
      <div className="bill-history-content">
        <BillList queryOptions={{ uid: props.uid }} size="small" />
      </div>
    </Modal>
  )
})

export class BillHistoryModalStore extends ModalStore<IExtraProps> {}
