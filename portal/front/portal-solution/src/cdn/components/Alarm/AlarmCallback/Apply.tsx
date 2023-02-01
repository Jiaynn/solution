/**
 * @file Alarm Callback Apply
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'

import Button from 'react-icecream/lib/button'

import './style.less'

export default function AlarmCallbackApply() {
  return (
    <div className="comp-alarm-callback-apply">
      <h4 className="apply-title">暂未开通</h4>
      <p className="apply-tips">
        告警通知回调功能支持将已配置的域名告警信息回调到固定的公网 URL，帮助您将告警信息集成到已有运维系统或消息通知系统中。
        <br />
        该功能目前在内测阶段，如需开通可以提交工单申请。
      </p>
      <Button
        target="_blank"
        href="https://support.qiniu.com/tickets/new/form?category=%E9%85%8D%E7%BD%AE%E9%97%AE%E9%A2%98&space=CDN"
        className="apply-submit"
        type="primary"
      >提交工单</Button>
    </div>
  )
}
