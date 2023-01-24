import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Radio, Button, Checkbox } from 'react-icecream'
import { CheckCircleFilledIcon } from 'react-icecream-2/icons'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'

import { Header } from 'components/Configuration/Header'

import './style.less'

const prefixCls = 'comp-configuration-open-service'

export default observer(function OpenService() {
  const routerStore = useInjection(RouterStore)

  const [values, setValues] = useState({
    billingModeChecked: false,
    serviceAgreementChecked: false
  })
  const [step, setStep] = useState(1)

  const onStep1ButtonClick = () => {
    setStep(2)
  }

  const onStep2ButtonClick = () => {
    setStep(3)
  }

  const onStep3ButtonClick = () => {
    routerStore.push('/kodo/configuration/step/1?shouldCreateBucket=true')
  }

  return (
    <div className={prefixCls}>
      <Header />

      {
        step === 1 && <div className={`${prefixCls}-step1`}>
          <Button type="primary" onClick={onStep1ButtonClick}>开通服务</Button>
        </div>
      }

      {
        step === 2 && <div className={`${prefixCls}-step2`}>
          <div className={`${prefixCls}-title ${prefixCls}-title-mt40`}>开通服务</div>

          <div className={`${prefixCls}-step2-content`}>
            <label className={`${prefixCls}-step2-label`}>
              <span className={`${prefixCls}-step2-label-text`}>计费模式：</span>
              <Radio
                value={values.billingModeChecked}
                onChange={event => setValues({ ...values, billingModeChecked: event.target.value })}
              >按使用流量计费</Radio>
            </label>
            <label className={`${prefixCls}-step2-label`}>
              <span className={`${prefixCls}-step2-label-text`}>服务协议：</span>
              <Checkbox
                value={values.serviceAgreementChecked}
                onChange={event => setValues({ ...values, serviceAgreementChecked: event.target.value })}
              >图片存储分发处理解决方案</Checkbox>
            </label>
          </div>

          <Button className={`${prefixCls}-step2-button`} type="primary" onClick={onStep2ButtonClick}>确认开通</Button>
        </div>
      }

      {
        step === 3 && <div className={`${prefixCls}-step3`}>
          <div className={`${prefixCls}-title ${prefixCls}-title-mt10`}>开通服务</div>

          <div className={`${prefixCls}-step3-content`}>
            <CheckCircleFilledIcon
              width={60}
              height={60}
              color="#52c41a"
              style={{ marginBottom: 20 }}
            />
            <div className={`${prefixCls}-title ${prefixCls}-title-mt10`}>开通服务</div>
            <div className={`${prefixCls}-step3-content-text`}>
              你已经开通了图片存储分发处理解决方案服务，现在可以进行方案的配置
            </div>
            <Button className={`${prefixCls}-step3-button`} type="primary" onClick={onStep3ButtonClick}>配置方案</Button>
          </div>
        </div>
      }
    </div>
  )
})
