/**
 * @file Input for array values
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { FieldState } from 'formstate-x'
import Button from 'react-icecream/lib/button'

import Link from 'cdn/components/common/Link/LegacyLink'

import './style.less'

export interface Props<T> {
  className?: string
  limit?: number
  state: Array<FieldState<T>>
  onAdd: () => void
  onDelete: (index: number) => void
  renderInput: (state: FieldState<T>) => React.ReactNode
}

export default observer(function MultiInputs<T>({
  limit,
  className,
  state,
  onAdd,
  onDelete,
  renderInput
}: Props<T>) {
  const validStates = state && state.slice(0, Math.min(state.length, limit!)) || []

  return (
    <div className={classnames('comp-multi-inputs', className)}>
      {validStates.map(
        (s, index) => {
          const input = renderInput(s)
          return (
            <div key={`multi-inputs-${index}`} className="line">
              <span className="input-wrapper">{input}</span>
              {index > 0 && (
                <Link className="link-button" onClick={() => onDelete(index)}>删除</Link>
              )}
            </div>
          )
        }
      )}
      {(!limit || validStates.length < limit) && (
        <Button type="ghost" size="small" onClick={onAdd}>添加</Button>
      )}
    </div>
  )
})
