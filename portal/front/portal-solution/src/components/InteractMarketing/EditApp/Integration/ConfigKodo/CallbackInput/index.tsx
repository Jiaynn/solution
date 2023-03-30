import { observer } from 'mobx-react-lite'
import React from 'react'

import { Icon, Input, Tooltip } from 'react-icecream'

import { useInjection } from 'qn-fe-core/di'

import SubConfigWrapper from '../../SubConfigWrapper'
import SubConfigTitle from '../../SubConfigTitle'

import AppConfigStore from 'store/interactMarketing/appConfig'

export interface CallbackInputProps {}

const CallbackInput: React.FC<CallbackInputProps> = observer(() => {
  const appConfigStore = useInjection(AppConfigStore)

  return (
    <SubConfigWrapper>
      <div>
        <SubConfigTitle
          id="integration-callback"
          style={{
            display: 'inline-block'
          }}
        >
          回调域名：
        </SubConfigTitle>
        <Input
          value={appConfigStore.config.callback}
          onChange={e => {
            appConfigStore.updateConfig({ callback: e.target.value })
          }}
          placeholder="请输入"
          style={{ width: '36rem', marginRight: '0.75rem' }}
        />

        <Tooltip
          arrowPointAtCenter
          placement="topLeft"
          title="为确保安全组件的运行需要填写回调域名，如果不填写也不影响直播应用，但安全服务将会失效"
        >
          <Icon type="question-circle" />
        </Tooltip>
      </div>
    </SubConfigWrapper>
  )
})
export default CallbackInput
