/**
 * @desc component for GuideStep
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import Button from 'react-icecream/lib/button'

export interface IGuideStepProps {
  activeIndex: number
  total: number
  onPrev(): void
  onNext(): void
  children: React.ReactNode
}

export default observer(function GuideStep(props: IGuideStepProps) {
  const { activeIndex, total, onPrev, onNext, children } = props

  const stepIcons = new Array(total).fill(null).map(
    (_: unknown, index: number) => <span key={index} className={`step-icon ${index === activeIndex ? 'current' : ''}`}></span>
  )

  return (
    <div className={classnames('comp-guide-step', { 'only-one-step': total === 1 })}>
      <div className="step-content">
        {children}
      </div>
      <div className="step-bar">
        {stepIcons}
      </div>
      <div className="step-directions">
        <Button className="prev-step" type="primary" size="small" disabled={activeIndex === 0} onClick={onPrev}>上一步</Button>
        <Button type="primary" size="small" onClick={onNext}>{activeIndex === total - 1 ? '开始使用' : '下一步'}</Button>
      </div>
    </div>
  )
})
