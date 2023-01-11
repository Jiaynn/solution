/**
 * @file NoIcpWarning Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'

export default function NoIcpWarning(props: { desc?: React.ReactNode}) {
  return (
    <div className="comp-no-icp-warning">
      <span className="icp-text">域名未备案，</span>
      <span className="icp-desc">{props.desc || '覆盖范围只能选择海外'}</span>
    </div>
  )
}
