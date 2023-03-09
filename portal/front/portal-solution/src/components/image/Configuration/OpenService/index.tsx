import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Radio, Button, Checkbox, Loading } from 'react-icecream-2'
import { CheckCircleFilledIcon } from 'react-icecream-2/icons'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'
import Modal from 'react-icecream/lib/modal'

import { ConfigurationHeader } from 'components/image/Configuration/common/ConfigurationHeader'
import { ImageSolutionApis } from 'apis/image'
import { imagePath } from 'utils/router'

import './style.less'

const prefixCls = 'comp-configuration-open-service'

export default observer(function OpenService() {
  const routerStore = useInjection(RouterStore)
  const solution = useInjection(ImageSolutionApis)
  const [values, setValues] = useState({
    billingModeChecked: true,
    serviceAgreementChecked: false
  })
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isOpenSolution, setIsOpenSolution] = useState(false)
  const [isConfigSolution, setIsConfigSolution] = useState(false)

  const onStep1ButtonClick = () => {
    setStep(2)
  }
  const onStep2ButtonClick = async () => {
    try {
      await solution.openSolution({
        solution_code: 'image',
        mode: 0
      })
      setIsOpenSolution(true)
      setStep(3)
    } catch (error) {
      Modal.error({ content: `${error}` })
    }

  }

  const onStep3ButtonClick = () => {
    // 是否为第一次进行配置，通过props传递，默认为false:第一次进行配置，如果在后续配置完成后更新状态，通过props值传递的状态也随之更新
    routerStore.push(
      `${imagePath}/configuration/step/1?shouldCreateBucket=${!isConfigSolution}&configurationState=${isConfigSolution}`
    )
  }

  useEffect(() => {
    // 是否开通服务
    const getIsOpenSolution = async () => {
      const [openStateRes, configStateRes] = await Promise.all([
        solution.isOpenSolution({ solution_code: 'image' }),
        solution.isConfigSolution({ solution_code: 'image' })
      ])
      setIsOpenSolution(openStateRes.status)
      setIsConfigSolution(configStateRes.status)
      setLoading(false)
      if (openStateRes.status && configStateRes.status) {
        routerStore.push(`${imagePath}/configuration/step/1?shouldCreateBucket=${!configStateRes.status}&configurationState=${configStateRes.status}`)
      }

    }
    getIsOpenSolution()
  }, [routerStore, solution])

  return (
    <div>
      {
        loading
          ? <Loading loading={loading} style={{ marginTop: '25%' }} />
          : <div className={prefixCls}>
            <ConfigurationHeader />
            {(step === 1 && !isOpenSolution && !isConfigSolution) && (
              <div className={`${prefixCls}-step1`}>
                <Button type="primary" onClick={onStep1ButtonClick}>
                  开通服务
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className={`${prefixCls}-step2`}>
                <div className={`${prefixCls}-title ${prefixCls}-title-mt40`}>
                  开通服务
                </div>

                <div className={`${prefixCls}-step2-content`}>
                  <label className={`${prefixCls}-step2-label`}>
                    <span className={`${prefixCls}-step2-label-text`}>
                      计费模式：
                    </span>
                    <Radio
                      checked={values.billingModeChecked}
                      onChange={(checked: boolean) => setValues({
                        ...values,
                        billingModeChecked: checked
                      })}
                    >
                      按使用流量计费
                    </Radio>
                  </label>
                  <label className={`${prefixCls}-step2-label`}>
                    <span className={`${prefixCls}-step2-label-text`}>
                      服务协议：
                    </span>
                    <Checkbox
                      checked={values.serviceAgreementChecked}
                      onChange={(checked: boolean) => {
                        setValues({
                          ...values,
                          serviceAgreementChecked: checked
                        })
                      }}
                    >
                      图片存储分发处理解决方案
                    </Checkbox>
                  </label>
                </div>

                <Button
                  className={`${prefixCls}-step2-button`}
                  type="primary"
                  onClick={onStep2ButtonClick}
                >
                  确认开通
                </Button>
              </div>
            )}

            {(step === 3 || isOpenSolution && !isConfigSolution) && (
              <div className={`${prefixCls}-step3`}>
                <div className={`${prefixCls}-title ${prefixCls}-title-mt10`}>
                  开通服务
                </div>

                <div className={`${prefixCls}-step3-content`}>
                  <CheckCircleFilledIcon
                    width={60}
                    height={60}
                    color="#52c41a"
                    style={{ marginBottom: 20 }}
                  />
                  <div className={`${prefixCls}-title ${prefixCls}-title-mt10`}>
                    开通服务
                  </div>
                  <div className={`${prefixCls}-step3-content-text`}>
                    你已经开通了图片存储分发处理解决方案服务，现在可以进行方案的配置
                  </div>
                  <Button
                    className={`${prefixCls}-step3-button`}
                    type="primary"
                    onClick={onStep3ButtonClick}
                  >
                    配置方案
                  </Button>
                </div>
              </div>
            )}
          </div>
      }
    </div>
  )
})
