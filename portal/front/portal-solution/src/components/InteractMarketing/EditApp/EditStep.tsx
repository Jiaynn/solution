import * as React from 'react'
import { Steps } from 'react-icecream'

import styles from './style.m.less'

const { Step } = Steps

const STEPS = [
  {
    title: '创建应用',
    description: '创建应用，填写应用的基本信息'
  },
  {
    title: '功能组件选配',
    description:
      '配置直播应用的运行组件，包括直播基础，互动电商购物等模块组件，可根据实际需要选配'
  },
  {
    title: '应用集成',
    description:
      '配置应用集成相关信息，包括直播空间、域名、实时音视频等服务，并提供应用源文件下载，可快速集成'
  }
] as const

export interface EditStepProps {
  step: number
}
export default function EditStep(props: EditStepProps) {
  const step = props.step

  return (
    <Steps className={styles.steps} current={step - 1}>
      {STEPS.map((stepItem, index) => (
        <Step
          {...stepItem}
          className={styles.step}
          key={index}
        />
      ))}
    </Steps>
  )
}
