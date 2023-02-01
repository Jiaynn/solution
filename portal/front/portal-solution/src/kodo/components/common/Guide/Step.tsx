/**
 * @desc component for GuideStep
 * @author yaojingtian <yaojingtian@qiniu.com>
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { Button, Icon } from 'react-icecream/lib'

import GuidePrev from 'kodo/styles/icons/guide-prev.svg'
import GuideNext from 'kodo/styles/icons/guide-next.svg'

import style from './style.m.less'

export interface IGuideStepProps {
  activeIndex: number
  total: number
  onPrev(): void
  onNext(): void
  children: React.ReactNode
}

export default observer(function GuideStep(props: IGuideStepProps) {
  const { activeIndex, total, onPrev, onNext, children } = props

  const stepIcons = new Array(total).fill(null).map((_, index: number) => (
    <li
      key={index}
      className={classnames(
        style.stepIcon,
        index === activeIndex ? style.current : ''
      )}
    ></li>
  ))

  return (
    <div className={classnames(
      style.guideStep,
      {
        [style.onlyOneStep]: total === 1
      }
    )}
    >
      <div className={style.stepContent}>
        {children}
      </div>
      <div className={style.stepBar}>
        <Button
          type="link"
          className={style.prevStep}
          disabled={activeIndex === 0}
          onClick={onPrev}
        >
          <Icon component={() => <GuidePrev className={style.svgIcon} />} />
        </Button>
        <ul className={style.stepProgress}>
          {stepIcons}
        </ul>
        <Button
          type="link"
          className={style.nextStep}
          disabled={activeIndex === total - 1}
          onClick={onNext}
        >
          <Icon component={() => <GuideNext className={style.svgIcon} />} />
        </Button>
      </div>
    </div>
  )
})
