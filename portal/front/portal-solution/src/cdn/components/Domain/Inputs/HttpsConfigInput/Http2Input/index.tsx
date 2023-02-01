import React from 'react'

import TipIcon from 'cdn/components/TipIcon'
import Switch from '../../common/Switch'

export interface IHTTP2Input {
  isEnable: boolean
  value: boolean
  onChange: (value: boolean) => void
}

export default function HTTP2Input({ isEnable, value, onChange }: IHTTP2Input) {
  return (
    <div className="line">
      HTTP/2 访问
      <TipIcon tip="HTTP/2 是最新的 HTTP 协议，用以最小的网络延迟，提升网络速度，优化用户的网络体验；如需使用请您先配置 HTTPS 证书。" />
      <div style={{ display: 'inline-block', marginLeft: '24px' }}>
        <Switch
          checked={value}
          disabled={!isEnable}
          onChange={http2Enable => onChange(http2Enable)}
        />
      </div>
    </div>
  )
}
