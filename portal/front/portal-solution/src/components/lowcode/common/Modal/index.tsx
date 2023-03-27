import { Dialog } from 'react-icecream-2'
import React from 'react'
import './style.less'

interface LowcodeProps{
  visible:boolean
  handleCancel:()=>void
}

const prefixCls = 'lowcode-modal'
export const LowcodeModal: React.FC<LowcodeProps> = props => {
  const { handleCancel, visible } = props

  return (
    <Dialog
      visible={visible}
      onCancel={handleCancel}
      maskClickable
      footer={<></>}
      className={`${prefixCls}`}
    >
      <div className={`${prefixCls}-content`}>
        <div className={`${prefixCls}-content-avatar`}>
          <img src="https://www-static.qbox.me/_next/static/media/avatar.141b632259498b3d64010e695ca3b556.jpg" alt="" />
        </div>
        <div className={`${prefixCls}-content-desc`}>您好，我是您的专属售前顾问，我会为您提供专业的售前咨询服务!</div>
        <div className={`${prefixCls}-content-qrCode`}>
          <img src="https://www-static.qbox.me/_next/static/media/wechat_qr_code.c6aec6e4abf57af3597956b3fac09e2d.png" alt="" />
          <p>立即添加，获取优惠价格，<br /> 更有行业通用解决方案赠送</p>

        </div>

      </div>

    </Dialog>
  )
}

