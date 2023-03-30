import React, { useEffect, useState } from 'react'

import { Checkbox, Spin } from 'react-icecream'

import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'

import styles from './style.m.less'
import InputWrapper from 'components/InteractMarketing/common/InputWrapper'
import TooltipIcon from 'components/InteractMarketing/EditApp/Integration/ConfigKodo/CallbackInput/TooltipIcon'
import { SelectableId } from 'apis/_types/interfactMarketingType'

import AppConfigStore from 'store/interactMarketing/appConfig'

export interface ComponentsProps {}

export default observer(function Components(_props: ComponentsProps) {
  const appConfigStore = useInjection(AppConfigStore)

  const { appParam } = appConfigStore
  const [loadingAppParam, setLoadingAppParam] = useState(true)
  useEffect(() => {
    appConfigStore.fetchAppParam()
    setLoadingAppParam(false)
  }, [appConfigStore])

  return (
    <Spin spinning={loadingAppParam}>
      <Checkbox.Group
        value={appConfigStore.config.component}
        onChange={(value: string[]) => {
          appConfigStore.updateConfig({ component: value })
        }}
        className={styles.componentsWrapper}
      >
        {appParam?.map(v => (
          <InputWrapper
            title={v.type}
            key={v.type}
            inputStyle={{ width: 'fit-content' }}
          >
            {v.items.map(c => (
              <Checkbox
                key={c.componentId}
                value={c.componentId}
                disabled={c.default === SelectableId.No}
              >
                {`${c.name} `}
                {c.remark && c.remark !== '' && (
                  <TooltipIcon title={c.remark} />
                )}
              </Checkbox>
            ))}
          </InputWrapper>
        ))}
      </Checkbox.Group>
    </Spin>
  )
})
