/*
 * @file 刷新预取 textarea 通用表单
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React from 'react'
import { action, computed, observable } from 'mobx'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'

import { transUrlsToArr } from 'cdn/transforms/refresh-prefetch'
import './style.less'

export interface IRPTextareaProps {
  placeholder: string
  submitBtnText?: string
  handleSubmit: (values: string[]) => void
}

export default observer(function _RPTextarea({
  placeholder,
  submitBtnText = '点击',
  handleSubmit
}: IRPTextareaProps) {

  const ref = React.useRef<{textAreaRef: HTMLTextAreaElement}>(null)
  const store = useLocalStore(LocalStore)

  React.useEffect(() => {
    if (ref.current && ref.current.textAreaRef) {
      // HACK textarea 多行兼容性 https://html.spec.whatwg.org/#the-placeholder-attribute
      ref.current.textAreaRef.placeholder = ref.current.textAreaRef.placeholder.replace(/\\n/g, '\n')
    }
  }, [])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    store.updateRpValues(e.target.value)
  }

  const handleClick = () => {
    handleSubmit(store.valueList)
  }

  return (
    <div className="comp-rp-textarea-wrapper">
      <Input.TextArea
        // FIXME
        ref={ref as any}
        className="rp-textarea-textarea"
        autosize={{ minRows: 6, maxRows: 10 }}
        placeholder={placeholder}
        value={store.rpValue}
        onChange={handleTextareaChange}
      />
      <Button type="primary" className="submit-btn" onClick={handleClick}>
        { submitBtnText }
      </Button>
    </div>
  )
})

@injectable()
class LocalStore extends Store {
  @observable rpValue!: string

  @computed
  get valueList(): string[] {
    return transUrlsToArr(this.rpValue)
  }

  @action
  updateRpValues(value: string) {
    this.rpValue = value
  }
}
