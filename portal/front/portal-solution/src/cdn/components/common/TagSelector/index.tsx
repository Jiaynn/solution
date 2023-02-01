/**
 * @file Tag Selector Component
 * @author linchen <gakiclin@gmail.com>
 */

import ReactDOM from 'react-dom'
import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, ReactNode, CSSProperties } from 'react'
import { FieldState } from 'formstate-x'
import { differenceBy } from 'lodash'
import { observer, Observer } from 'mobx-react'
import { List as VirtualizedList, ListRowRenderer } from 'react-virtualized'
import Spin from 'react-icecream/lib/spin'
import Checkbox from 'react-icecream/lib/checkbox'
import Select from 'antd/lib/select' // FIXME
import Button from 'react-icecream/lib/button'
import { useInjection } from 'qn-fe-core/di'
import { I18nStore, useTranslation } from 'portal-base/common/i18n'

import { useTags } from 'cdn/hooks/tag'
import { useIsFirst } from 'cdn/hooks/misc'

import Popover, { PopoverProps } from 'cdn/components/common/Popover'

import * as messages from './messages'

import './style.less'

export type SelectorRefContent = { markStale: () => void }

export interface SimpleTagSelectorProps {
  width?: number
  limit?: number
  style?: CSSProperties
  state: FieldState<string[]>
}

export const SimpleTagSelector = observer(function _SimpleTagSelector(props: SimpleTagSelectorProps) {
  const selectorRef = useRef<SelectorRefContent>(null)
  const [popoverVisible, setPopoverVisible] = useState(false)
  const i18n = useInjection(I18nStore)

  const handlePopoverVisibleChange = useCallback((visible: boolean) => {
    setPopoverVisible(visible)
    if (visible && selectorRef.current) {
      selectorRef.current.markStale()
    }
  }, [])

  const selectRef = useCallback((select: Select) => {
    if (!select) {
      return
    }
    // eslint-disable-next-line react/no-find-dom-node
    const inst = ReactDOM.findDOMNode(select) as Element
    // FIXME: 点击 select 的三角图标的时候 click 事件不会冒泡到 popover，所以需要手动监听并同步一次
    const target = inst?.getElementsByClassName('ant-select-arrow')[0]
    target?.addEventListener('click', () => setPopoverVisible(v => !v))
  }, [])

  return (
    <TagSelectorContainer
      visible={popoverVisible}
      onVisibleChange={handlePopoverVisibleChange}
      selectorRef={selectorRef}
      {...props}
    >
      <Select
        placeholder={i18n.t(messages.pickTags)}
        ref={selectRef}
        style={{ width: props.width || 140 }}
        value={humanizeSelectedTags(props.state.value, i18n)}
        dropdownRender={() => <span></span>}
      />
    </TagSelectorContainer>
  )
})

function humanizeSelectedTags(tags: string[], i18n: I18nStore) {
  if (!tags.length) {
    return undefined
  }

  if (tags.length === 1) {
    return tags[0]
  }

  return i18n.t(messages.selectedTip, tags.length)
}

export interface TagSelectorProps extends SimpleTagSelectorProps {
  selectorRef?: React.RefObject<SelectorRefContent>
}

export const TagSelector = observer(function _TagSelector(props: TagSelectorProps) {
  const t = useTranslation()

  return (
    <TagSelectorContainer {...props}>
      <Select
        mode="multiple"
        placeholder={t(messages.pickTags)}
        style={{ width: props.width || '100%' }}
        value={props.state.value}
        onChange={(val: string[]) => props.state.onChange(val)}
        dropdownRender={() => <span></span>}
      />
    </TagSelectorContainer>
  )
})

const tagListWidth = 260 // px

const TagSelectorContent = observer(function _TagSelectorContent({
  limit,
  state,
  selectorRef: innerRef
}: TagSelectorProps) {
  const { tags, isSuccess, isLoading, isIdle, call } = useTags()

  const first = useIsFirst()

  const [stale, setStale] = useState(false)
  const t = useTranslation()

  useImperativeHandle(innerRef, () => ({
    markStale: () => setStale(true)
  }), [])

  const [sortedTags, setSortedTags] = useState(() => sortTags(tags, state.value))

  useEffect(() => {
    if (isSuccess) {
      setSortedTags(sortTags(tags, state.value))
    }
  }, [isSuccess, tags, state])

  useEffect(() => {
    if (first.current) {
      return
    }
    if (stale) {
      call().then(() => setStale(false))
    }
  }, [first, stale, call])

  const handleTagCheck = useCallback((tag: string, checked: boolean) => {
    if (checked && limit && state.value.length >= limit) {
      state.setError(t(messages.selectLimitTip, limit))
      return
    }
    if (checked) {
      state.onChange([...state.value, tag])
    } else {
      state.onChange(state.value.filter(it => it !== tag))
    }
  }, [state, limit, t])

  const renderTagItem: ListRowRenderer = ({ key, index, style }) => (
    <Observer
      key={key}
      render={() => {
        const tag = sortedTags[index]
        return (
          <li
            style={{
              ...style,
              lineHeight: style.height + 'px'
            }}
          >
            <Checkbox
              checked={state.value.findIndex(it => it === tag) > -1}
              onChange={e => handleTagCheck(tag, e.target.checked)}
            >
              {tag}
            </Checkbox>
          </li>
        )
      }}
    />
  )

  const handleClear = useCallback(() => {
    state.onChange([])
  }, [state])

  if (isSuccess && !tags.length) {
    return (
      <div className="comp-tag-selector">
        <span className="empty-tags">{t(messages.noTag)}</span>
      </div>
    )
  }

  return (
    <div className="comp-tag-selector">
      <Spin spinning={isLoading || isIdle}>
        <VirtualizedList
          className="tag-list-content"
          width={tagListWidth}
          height={216}
          rowHeight={36}
          rowCount={sortedTags.length}
          rowRenderer={renderTagItem}
        />
        <div className="clear-tags">
          <Button
            type="link"
            className="clear-tags-btn"
            onClick={handleClear}
            disabled={state.value.length === 0}
          >
            {t(messages.clearSelected)}
          </Button>
        </div>
      </Spin>
    </div>
  )
})

function sortTags(tags: string[], selectedTags: string[]) {
  return selectedTags.concat(differenceBy(tags, selectedTags))
}

interface TagSelectorContainerProps extends TagSelectorProps {
  children: ReactNode
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

function TagSelectorContainer(props: TagSelectorContainerProps) {
  const {
    style,
    children,
    visible,
    onVisibleChange,
    ...restProps
  } = props

  const popoverProps: PopoverProps = {
    trigger: 'click',
    placement: 'bottomLeft',
    overlayClassName: 'tag-selector-overlay',
    onVisibleChange,
    content: (
      <TagSelectorContent {...restProps} />
    )
  }

  // https://github.com/react-component/trigger/blob/master/src/index.tsx#L185
  if (props.visible !== undefined) {
    popoverProps.visible = props.visible
  }

  return (
    <Popover {...popoverProps}>
      <div style={style}>
        {children}
      </div>
    </Popover>
  )
}
