/*
 * @file 右侧滑出的浮层
 * @author nighca <nighca@live.cn>
 */

import React, { CSSProperties } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import autobind from 'autobind-decorator'
import Transition from 'react-transition-group/Transition'
import Icon from 'react-icecream/lib/icon'
import Button from 'react-icecream/lib/button'
import PopupContainer from 'react-icecream/lib/popup-container'

import './style.less'

export interface ISideModalProps {
  visible: boolean
  title?: React.ReactNode
  width?: string
  zIndex?: number
  okBtnDisabled?: boolean
  parentElement?: HTMLElement
  okBtnText?: string
  cancelBtnText?: string
  onOk?: () => void
  onCancel?: () => void
  children?: any
}

// SideModal 插槽
export const sideModalRoot = 'side-modal-root'

function ModalHeader(props: {
  title: React.ReactNode
  onCancel?: () => void
}) {
  return (
    <div className="side-modal-header">
      {props.title}
      <span className="side-modal-close" onClick={props.onCancel}>
        <Icon type="close" />
      </span>
    </div>
  )
}

function ModalFooter(props: {
  okBtnDisabled?: boolean
  okBtnText?: string
  cancelBtnText?: string
  onOk?: () => void
  onCancel?: () => void
}) {
  return (
    <div className="side-modal-footer">
      <Button type="ghost" onClick={props.onCancel}>{props.cancelBtnText || '取消'}</Button>
      <Button type="primary" disabled={props.okBtnDisabled} onClick={props.onOk}>{props.okBtnText || '确认'}</Button>
    </div>
  )
}

const defaultContainerWidth = '50%'

const transitionDuration = 300

const wrapperDefaultStyle = {
  opacity: 0.4,
  transition: `opacity ${transitionDuration}ms ease-in-out`
}

const wrapperTransitionStyles = {
  entering: { opacity: 0.4 },
  entered: { opacity: 1 }
}

const containerDefaultStyle = {
  transform: 'translateX(100%)',
  transition: `transform ${transitionDuration}ms ease-in-out`
}

const containerTransitionStyles = {
  entering: { transform: 'translateX(100%)' },
  entered: { transform: 'translateX(0%)' }
}

export default class SideModal extends React.Component<ISideModalProps, { top: number }> {
  state = {
    top: 0
  }

  wrapperElement: HTMLElement | null = null

  @autobind updateWrapperElement(el: HTMLElement | null) {
    this.wrapperElement = el
  }

  previousParentStyle: CSSProperties | null = null

  getParentElement() {
    return (
      this.props.parentElement
      || (this.wrapperElement && this.wrapperElement.parentElement)
    )
  }

  handleShow() {
    const parentElement = this.getParentElement()
    if (!parentElement) {
      return
    }

    const parentStyle = parentElement.style
    this.previousParentStyle = {
      overflow: parentStyle.overflow,
      overflowY: parentStyle.overflowY as CSSProperties['overflowY']
    }
    parentStyle.overflow = 'hidden'
    parentStyle.overflowY = 'hidden'
    this.setState({
      top: parentElement.scrollTop
    })
  }

  handleHide() {
    const previousParentStyle = this.previousParentStyle
    const parentElement = this.getParentElement()
    if (!parentElement || !previousParentStyle) {
      return
    }

    const parentStyle = parentElement.style
    parentStyle.overflow = previousParentStyle.overflow!
    parentStyle.overflowY = previousParentStyle.overflowY!
    this.previousParentStyle = null
  }

  componentDidUpdate(prevProps: ISideModalProps) {
    if (!prevProps.visible && this.props.visible) {
      this.handleShow()
    }
    if (prevProps.visible && !this.props.visible) {
      this.handleHide()
    }
  }

  @autobind
  updateDimensions() {
    if (this.props.visible) {
      const parentElement = this.getParentElement()
      this.setState({
        top: parentElement!.scrollTop
      })
    }
  }

  componentDidMount() {
    if (this.props.visible) {
      this.handleShow()
    }
    window.addEventListener('resize', this.updateDimensions)
  }

  componentWillUnmount() {
    if (this.props.visible) {
      this.handleHide()
    }
    window.removeEventListener('resize', this.updateDimensions)
  }

  @autobind handleMaskClick() {
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  }

  render() {
    const props = this.props
    const wrapperClassName = classNames({
      'side-modal-wrapper': true,
      'side-modal-wrapper-visible': props.visible
    })

    const zIndex = props.zIndex != null ? props.zIndex : 10
    const top = this.state.top + 'px'

    const sideModalContent = (
      <Transition in={props.visible} timeout={transitionDuration} mountOnEnter unmountOnExit>
        {state => (
          <div className={wrapperClassName}
            ref={this.updateWrapperElement}
            style={{
              zIndex,
              top,
              ...wrapperDefaultStyle,
              ...wrapperTransitionStyles[state as keyof typeof wrapperTransitionStyles]
            }}
          >
            <div className="side-modal-mask" onClick={this.handleMaskClick}></div>
            <div className="side-modal-container"
              style={{
                width: props.width || defaultContainerWidth,
                ...containerDefaultStyle,
                ...containerTransitionStyles[state as keyof typeof wrapperTransitionStyles]
              }}
            >
              <ModalHeader title={props.title || ''} onCancel={props.onCancel} />
              <div className="side-modal-body">
                <PopupContainer>{props.children}</PopupContainer>
              </div>
              <ModalFooter
                okBtnDisabled={props.okBtnDisabled}
                okBtnText={props.okBtnText}
                cancelBtnText={props.cancelBtnText}
                onOk={props.onOk}
                onCancel={props.onCancel}
              />
            </div>
          </div>
        )}
      </Transition>
    )

    const root = document.querySelector(`.${sideModalRoot}`)
    if (root) {
      return ReactDOM.createPortal(sideModalContent, root)
    }

    return sideModalContent
  }
}
