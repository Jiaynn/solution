/*
 * @file AddDomain Confirm Modal component
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'

import { makeCancelled } from 'qn-fe-core/exception'
import Modal from 'react-icecream/lib/modal'

export default function openConfirmModal(price: number, domainNumber: number) {
  const warnText = '* 添加域名后证书的有效期不会变化，如需延长证书有效期可在证书即将过期时通过续费增加证书有效期。'
  const text = price > 0
    ? `您的添加的域名已超出现有额度，点击确定将支付 ${price} 元购买域名额度，支付成功后请耐心等待审核。`
    : `您添加了 ${domainNumber} 个域名，在额度范围内无需支付，提交成功后请耐心等待审核。`
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: '注意',
      content: (
        <>
          {text}
          <br />
          {warnText}
        </>
      ),
      onCancel: () => reject(makeCancelled()),
      onOk: resolve
    })
  })
}
