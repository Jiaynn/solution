import React from 'react'

import { Input, Radio, Select } from 'react-icecream'

import { useInjection } from 'qn-fe-core/di'

import { observer } from 'mobx-react'

import { RadioChangeEvent } from 'react-icecream/lib/radio'

import { computed } from 'mobx'

import AppConfigStore from 'store/interactMarketing/appConfig'

import styles from './style.m.less'
import InputWrapper from 'components/InteractMarketing/common/InputWrapper'
import {
  AppScenariosId,
  IntegrationWayId
} from 'apis/_types/interactMarketingType'

export interface BasicInfoProps {}
export default observer(function BasicInfo(_props: BasicInfoProps) {
  const appConfigStore = useInjection(AppConfigStore)
  const { appName, appDesc, appScenarios, integrationWay } = appConfigStore.config

  const appNameTitleColor = computed(() => (appConfigStore.config.appName.length ? 'black' : 'red')).get()
  const appNameAlertColor = computed(() => (appConfigStore.isAppNameLegal ? '#929292' : 'red')).get()

  const onInputAppName: React.FormEventHandler<HTMLInputElement> = e => {
    const target = e.target as HTMLInputElement
    appConfigStore.updateConfig({ appName: target.value })
  }

  const onInputAppDesc: React.FormEventHandler<HTMLTextAreaElement> = e => {
    const target = e.target as HTMLInputElement
    appConfigStore.updateConfig({ appDesc: target.value })
  }

  const onAppScenariosChange = (value: IntegrationWayId) => {
    appConfigStore.updateConfig({ appScenarios: value })
  }

  const onIntegrationWayChange = (e: RadioChangeEvent) => {
    appConfigStore.updateConfig({ integrationWay: e.target.value })
  }

  return (
    <div className={styles.basicInfo}>
      <InputWrapper
        title="应用名称*"
        titleStyle={{
          alignSelf: 'flex-start',
          color: appNameTitleColor
        }}
        inputStyle={{ width: '33rem' }}
      >
        <Input
          placeholder="输入建议"
          maxLength={32}
          value={appName}
          onInput={onInputAppName}
          id="input-app-name"
        />
        <div
          style={{
            color: appNameAlertColor
          }}
        >
          支持中文、英文、数字或下划线组成，不支持特殊字符，字符长度为1-32
        </div>
      </InputWrapper>

      <InputWrapper
        title="应用描述"
        titleStyle={{ alignSelf: 'flex-start' }}
        inputStyle={{ width: '31.5rem' }}
      >
        <Input.TextArea
          placeholder="请输入备注"
          value={appDesc}
          onInput={onInputAppDesc}
        />
      </InputWrapper>

      <InputWrapper title="应用场景" inputStyle={{ width: '27rem' }}>
        <Select
          style={{ width: '27rem' }}
          placeholder="请选择"
          allowClear
          value={appScenarios}
          onChange={onAppScenariosChange}
        >
          <Select.Option value={AppScenariosId.Ecommerce} title="电商直播 ">
            电商直播
          </Select.Option>
          <Select.Option value={AppScenariosId.Interact} title="互动直播">
            互动直播
          </Select.Option>
        </Select>
      </InputWrapper>

      <InputWrapper title="集成方式">
        <Radio.Group value={integrationWay} onChange={onIntegrationWayChange}>
          <Radio value={IntegrationWayId.WithUI}>含UI集成</Radio>
          <Radio value={IntegrationWayId.Standard}>标准集成（不带UI）</Radio>
        </Radio.Group>
      </InputWrapper>
    </div>
  )
})
