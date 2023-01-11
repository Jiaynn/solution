/**
 * @file OEM 账户冻结
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { Freezed as BaseFreezed, IFreezedProps } from 'portal-base/user/freezed'
import { Product } from 'portal-base/common/product'

import { oemConfig } from 'cdn/constants/env'

export default function Freezed() {
  const freezedProps: IFreezedProps = {
    navbarProps: {
      products: [Product.Cdn],
      linkItems: [],
      logoSrc: oemConfig.logo
    }
  }

  return (
    <BaseFreezed {...freezedProps} />
  )
}
