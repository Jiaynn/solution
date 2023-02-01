import React from 'react'

import TipIcon from 'cdn/components/TipIcon'
import Switch from '../../common/Switch'

export interface IForceHTTPSInput {
  value: boolean
  onChange: (value: boolean) => void
}

export default function ForceHttpsInput({ value, onChange }: IForceHTTPSInput) {
  return (
    <div className="line">
      强制 HTTPS 访问&nbsp;
      <TipIcon tip="开启后用户的 HTTP 请求会强制跳转到 HTTPS 协议进行访问。关闭时默认兼容用户的 HTTP/HTTPS 请求。" />
      <div style={{ display: 'inline-block', marginLeft: '24px' }}>
        <Switch
          checked={value}
          onChange={newForceHttps => onChange(newForceHttps)}
        />
      </div>
    </div>
  )
}
