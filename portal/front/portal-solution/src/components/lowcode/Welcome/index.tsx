import React, { useState } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { lowcodePath } from 'utils/router'
import './style.less'
import { LowcodeModal } from '../common/Modal'

const prefixCls = 'lowcode-welcome'
export const LowcodeWelcome = () => {
  const routerStore = useInjection(RouterStore)
  const [visible, setVisible] = useState(false)
  function handleCancel() {
    setVisible(false)
  }
  const onClick = () => {
    routerStore.push(`${lowcodePath}/scene/list`)
  }

  return (
    <div className={`${prefixCls}`}>
      <div className={`${prefixCls}-name`}>
        <img src="https://demo-qnrtc-files.qnsdk.com/lowcode/logo.png" alt="" />
        <p>七牛低代码平台</p>
      </div>
      <div className={`${prefixCls}-btn`} onClick={onClick}>立即开始</div>
      <div className={`${prefixCls}-footer`}>本产品目前为邀请制使用，只对受邀请用户开放，如果您不是邀请用户或者不确定是否在名单内，请 <a onClick={() => setVisible(true)}>联系客服</a>  。</div>
      <LowcodeModal visible={visible} handleCancel={() => handleCancel()} />
    </div>
  )

}
