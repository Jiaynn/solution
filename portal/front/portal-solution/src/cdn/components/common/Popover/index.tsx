/**
 * @file component Popover
 * @description 指定了 getPopupContainer 的 Popover，升级 icecream2 后不需要用该组件，它已经内置该功能
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React, { useContext } from 'react'
import IcecreamPopover, { PopoverProps } from 'react-icecream/lib/popover'
import { PopupContainerContext } from 'react-icecream/lib/popup-container'

export { PopoverProps } from 'react-icecream/lib/popover'

export default function Popover(props: PopoverProps) {
  const containerContext = useContext(PopupContainerContext)

  return (
    <IcecreamPopover
      getPopupContainer={containerContext.getContainer}
      {...props}
    />
  )
}
