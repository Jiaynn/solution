/**
 * @file Source URL Rewrite Component
 * @author linchen <gakiclin@gmail.com>
 */

import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import { runInAction } from 'mobx'
import cns from 'classnames'
import { FieldState, FormState } from 'formstate-x'
import Icon from 'react-icecream/lib/icon'
import Alert from 'react-icecream/lib/alert'
import Button from 'react-icecream/lib/button'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { useModal } from 'cdn/hooks/modal'

import { maxSourceUrlRewriteLimit } from 'cdn/constants/domain'

import TipIcon from 'cdn/components/TipIcon'
import { SortEnd, SortDragHandle, SortableElement, SortableContainer, arrayMove } from 'cdn/components/common/Sortable'

import { UrlRewrite } from 'cdn/apis/domain'

import ConfigSvg from './images/config.svg'
import ConfigModal from './ConfigModal'

import './style.less'

interface UrlRewriteForDisplay extends UrlRewrite {
  isCollapsed: boolean
}

export function createState(list: UrlRewrite[]) {
  return new FormState(list.map((it, index) => new FieldState({ ...it, isCollapsed: index !== 0 })))
}

export type State = ReturnType<typeof createState>

export type Value = UrlRewrite[]

export function getValue(state: State): Value {
  return state.value.map(it => {
    const { isCollapsed, ...restValues } = it
    return restValues
  })
}

interface UrlRewriteItemHandler {
  onUpdate: (index: number) => void
  onRemove: (index: number) => void
  onCollapseChange: (index: number, isCollapsed: boolean) => void
}

interface UrlRewriteItemProps extends UrlRewriteItemHandler {
  urlRewriteItemIndex: number
  info: UrlRewriteForDisplay
}

function UrlRewriteItem({
  urlRewriteItemIndex: index,
  info,
  onUpdate,
  onRemove,
  onCollapseChange
}: UrlRewriteItemProps) {

  const handleCollapsed = useCallback(() => (
    onCollapseChange(index, !info.isCollapsed)
  ), [onCollapseChange, index, info])

  const removePart = (
    <div className="handle-remove">
      <Icon
        className="icon-remove"
        type="minus-circle"
        onClick={() => onRemove(index)}
      />
    </div>
  )

  const movePart = (
    <SortDragHandle />
  )

  return (
    <li className="comp-url-rewrite-item">
      <div className="url-rewrite-item-header">
        <div className="url-rewrite-item-title">
          <p className="url-rewrite-item-title-label">规则&nbsp;{index + 1}</p>
          <Icon className="url-rewrite-item-title-icon" onClick={handleCollapsed} type={info.isCollapsed ? 'down' : 'up'} />
        </div>
        <div className="url-rewrite-item-operations">
          {removePart}
          {movePart}
        </div>
      </div>
      {
        !info.isCollapsed && (
          <article className="url-rewrite-item-content-wrapper">
            <section className="url-rewrite-item-content">
              <p className="url-rewrite-item-content-title">匹配规则</p>
              <p className="url-rewrite-item-content-value">{info.pattern}</p>
            </section>
            <section className="url-rewrite-item-content">
              <p className="url-rewrite-item-content-title">改写规则</p>
              <p className="url-rewrite-item-content-value">{info.repl}</p>
            </section>
            <div className="url-rewrite-item-content-config">
              <ConfigSvg onClick={() => onUpdate(index)} className="url-rewrite-item-content-config-icon" />
            </div>
          </article>
        )
      }
    </li>
  )
}

const SortableUrlRewriteItem = SortableElement(UrlRewriteItem)

interface UrlRewriteItemListProps extends UrlRewriteItemHandler {
  list: UrlRewriteForDisplay[]
}

function UrlRewriteItemList({ list, ...restProps }: UrlRewriteItemListProps) {
  const items = list.map((it, index) => (
    <SortableUrlRewriteItem
      key={index}
      index={index}
      urlRewriteItemIndex={index}
      info={it}
      {...restProps}
    />
  ))

  return (
    <ul className="comp-url-rewrite-list">
      {items}
    </ul>
  )
}

const SortableUrlRewriteItemList = SortableContainer(UrlRewriteItemList)

export interface Props {
  state: State
}

export default observer(function SourceUrlRewrite({ state }: Props) {
  const toaster = useInjection(Toaster)
  const modalStore = useModal<{ info?: UrlRewrite }, UrlRewrite>()

  const handleUpdate = useCallback((index: number) => {
    toaster.promise(
      modalStore.open(
        {
          info: state.$[index].value
        }
      ).then(result => {
        state.$[index].onChange({ ...state.$[index].value, ...result })
      })
    )
  }, [modalStore, toaster, state])

  const handleCreate = useCallback(() => {
    toaster.promise(
      modalStore.open().then(result => {
        runInAction(() => {
          state.$.push(new FieldState({ ...result, isCollapsed: false }))
        })
      })
    )
  }, [modalStore, toaster, state])

  const handleRemove = useCallback((index: number) => {
    runInAction(() => {
      const [legacyItem] = state.$.splice(index, 1)
      legacyItem.dispose()
    })
  }, [state])

  const handleCollapseChange = useCallback((index: number, isCollapsed: boolean) => {
    state.$[index].onChange({ ...state.$[index].value, isCollapsed })
  }, [state])

  const handleSortEnd = useCallback(({ oldIndex, newIndex }: SortEnd) => {
    runInAction(() => {
      const fields = arrayMove(state.$, oldIndex, newIndex)
      state.$ = fields
    })
  }, [state])

  const isCreateBtnVisible = state.value.length < maxSourceUrlRewriteLimit

  const titleClassNames = cns({
    'source-url-rewrite-title': true,
    'source-url-rewrite-title-with-create-btn': isCreateBtnVisible
  })

  return (
    <section className="comp-source-url-rewrite">
      <div className={titleClassNames}>
        <span className="source-url-rewrite-title-label">
          回源改写 &nbsp;<TipIcon maxWidth="400px" tip={<UrlRewriteTip />} />
        </span>
        { isCreateBtnVisible && <Button type="link" icon="plus" onClick={handleCreate}>添加规则</Button> }
      </div>
      <Alert className="op-tips" type="info" closable message="按从上至下顺序，采取优先匹配原则" />
      <SortableUrlRewriteItemList
        useDragHandle
        list={state.value}
        onUpdate={handleUpdate}
        onRemove={handleRemove}
        onCollapseChange={handleCollapseChange}
        onSortEnd={handleSortEnd}
        helperClass="sortable-list-in-url-rewrite-config-input-wrapper"
      />
      <ConfigModal {...modalStore.bind()} />
    </section>
  )
})

function UrlRewriteTip() {
  return (
    <ul className="comp-url-rewrite-tip">
      <li>1. 支持正则表达式；</li>
      <li>2. 回源改写功能不影响缓存&nbsp;key，仍按改写前的&nbsp;key&nbsp;进行缓存；</li>
      <li>3. 匹配优先级从上至下，匹配其中一条，不再继续向下执行；</li>
      <li>4. 支持改写&nbsp;path&nbsp;和&nbsp;query&nbsp;参数，不对域名进行改写。</li>
    </ul>
  )
}
