import React, { useState } from 'react'
import './style.less'
import { Button, Carousel, Divider, Link } from 'react-icecream-2'

import { useInjection } from 'qn-fe-core/di'
import { UserInfoStore } from 'portal-base/user/account'

import { LowcodeModal } from '../common/Modal'

const prefixCls = 'lowcode-prompt'
export const LowcodePrompt = () => {
  const userInfoStore = useInjection(UserInfoStore)
  const [visible, setVisible] = useState(false)
  function handleCancel() {
    setVisible(false)
  }

  const onToggleUser = () => {
    userInfoStore.signOutAndGoSignIn(window.location.href)
  }

  return (
    <div className={`${prefixCls}`}>
      <div className={`${prefixCls}-container`}>
        <div className={`${prefixCls}-container-title`}>功能预览</div>
        <Divider />
        <div className={`${prefixCls}-container-carousel`}>
          <Carousel autoplay>
            <img src="https://demo-qnrtc-files.qnsdk.com/lowcode/swiper01.png" alt="" />
            <img src="https://demo-qnrtc-files.qnsdk.com/lowcode/swiper02.png" alt="" />
          </Carousel>
        </div>

        <div className={`${prefixCls}-container-desc`}>
          <span>您当前不是受邀用户，暂时无法使用本产品，请联系客服。</span>
          <Link onClick={onToggleUser}>切换账号</Link>
        </div>
        <div className={`${prefixCls}-container-btns`}>
          <Button type="primary" className={`${prefixCls}-container-btns-btn`} onClick={() => setVisible(true)}>联系客服</Button>
          <LowcodeModal visible={visible} handleCancel={() => handleCancel()} />
        </div>
      </div>
    </div>
  )
}
