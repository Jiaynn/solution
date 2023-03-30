import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Radio, Button } from 'react-icecream-2'
import { CheckCircleFilledIcon } from 'react-icecream-2/icons'

import Modal from 'react-icecream/lib/modal'

import { Spin } from 'react-icecream'

import { useInjection } from 'qn-fe-core/di'

// import styles from './style.m.less'
import './style.less'

import Header from '../common/Header'

import useInteractMarketingRouter from 'routes/useLowcodeRouter'
import { ImageSolutionApis } from 'apis/image'

const prefixCls = 'comp-configuration-open-service'

export default observer(function OpenService() {
  const router = useInteractMarketingRouter()
  const apis = useInjection(ImageSolutionApis)

  const [step, setStep] = useState(1)
  const [isOpenSolution, setIsOpenSolution] = useState(false)
  const [loading, setLoading] = useState(false)
  /**
   * 跳转至开通服务
   */
  const onStep1ButtonClick = () => {
    setStep(2)
  }

  /**
   *  确认开通
   */
  const onStep2ButtonClick = async () => {
    try {
      setLoading(true)
      const res: boolean | null = (await apis.openSolution({
        solution_code: 'interact_marketing',
        mode: 0
      })) as any
      if (res) {
        setIsOpenSolution(res || false)
      }
      setLoading(false)
      setStep(3)
    } catch (error) {
      Modal.error({ content: `${error}` })
    }
  }

  /**
   * 跳转至应用列表
   */
  const onStep3ButtonClick = () => {
    router.toAppList()
  }

  return (
    <Spin spinning={loading} style={{ width: '100%', height: '100%' }}>
      <div className={prefixCls} style={{ position: 'relative' }}>
        <Header />

        {step === 1 && !isOpenSolution && (
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
                <Radio checked>按使用流量计费</Radio>
              </label>
              {/* <label className={`${prefixCls}-step2-label`}>
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
                </label> */}
              <Button
                className={`${prefixCls}-step2-button`}
                type="primary"
                onClick={onStep2ButtonClick}
              >
                确认开通
              </Button>
            </div>
          </div>
        )}

        {step === 3 && isOpenSolution && (
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
                开通成功
              </div>
              <div className={`${prefixCls}-step3-content-text`}>
                你已经开通了低代码解决方案服务，现在可以创建应用并完成功能配置
              </div>
              <Button
                className={`${prefixCls}-step3-button`}
                type="primary"
                onClick={onStep3ButtonClick}
              >
                创建应用
              </Button>
            </div>
          </div>
        )}
      </div>
    </Spin>
  )
})
