/**
 * @desc component for 视频瘦身截帧的 swiper
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { reaction, comparer } from 'mobx'

import Disposable from 'qn-fe-core/disposable'

import 'swiper/dist/css/swiper.min.css'
import './style.less'

interface IProps {
  options?: object // object with Swiper parameters
  className?: string
  activeIndex?: number // 指定当前 swipe 的 activeIndex
  onChange?: (index?: number) => void
}

const defaultOptions = {
  // observer: true
  // In this case Swiper will be updated (reinitialized) each time if you change its style
  // (like hide/show) or modify its child elements (like adding/removing slides)
  observer: true,
  mousewheel: false,
  continuous: false,
  slidesPerView: 'auto',
  spaceBetween: 16,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  }
}

@observer
export default class Swiper extends React.Component<IProps> {
  private disposable = new Disposable()
  private comp: HTMLElement | null = null

  @autobind
  updateComp(ref: HTMLElement | null) {
    this.comp = ref
  }

  swiper!: any

  async createSwiper() {
    const { Swiper: SwiperJs, Navigation, Pagination, Scrollbar } = await import('swiper/dist/js/swiper.esm' as any)

    // 可能用到的组件
    const uses = [
      Navigation,
      this.props.options && (this.props.options as any).pagination && Pagination,
      this.props.options && (this.props.options as any).scrollbar && Scrollbar
    ].filter(Boolean)

    SwiperJs.use(uses)

    // 创建 swiper 实例
    this.swiper = new SwiperJs(this.comp, {
      ...defaultOptions,
      ...this.props.options
    })

    if (this.props.activeIndex != null) {
      this.swiper.slideTo(this.props.activeIndex)
    }
  }

  @autobind
  handlePrevClick() {
    const current = this.swiper.activeIndex
    if (this.props.onChange) {
      this.props.onChange(current)
    }
  }

  @autobind
  handleNextClick() {
    const current = this.swiper.activeIndex
    if (this.props.onChange) {
      this.props.onChange(current)
    }
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.options,
      () => this.createSwiper(),
      {
        fireImmediately: true,
        equals: comparer.structural
      }
    ))

    this.disposable.addDisposer(reaction(
      () => this.props.activeIndex,
      index => {
        if (index == null || !this.swiper) {
          return
        }
        this.swiper.slideTo(index)
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.swiper.destroy(true, true)
    this.disposable.dispose()
  }

  render() {
    const { children } = this.props

    const slides = React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return null
      }

      return (
        <div className="swiper-slide" key={child.key}>
          {child}
        </div>
      )
    })

    const className = [
      'swiper-container',
      this.props.className
    ].filter(Boolean).join(' ')

    const height = (
      this.comp
      ? this.comp.clientHeight
      : 'auto'
    )

    return (
      <div className={className} ref={this.updateComp}>
        <div className="swiper-button-prev" onClick={this.handlePrevClick}></div>
        <div className="swiper-wrapper" style={{ height }}>
          {slides}
        </div>
        <div className="swiper-button-next" onClick={this.handleNextClick}></div>
      </div>
    )
  }
}
