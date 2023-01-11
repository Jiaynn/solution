import React from 'react'

export default function ConfigStatus(props: { enabled?: boolean, enabledTip?: string }) {
  if (props.enabled) {
    return (
      <span className="text-success">
        已开启{props.enabledTip ? `（${props.enabledTip}）` : null}
      </span>
    )
  }
  return <span className="text-warning">未开启</span>
}
