/**
 * @file Tags Component
 * @author linchen <gakiclin@gmail.com>
 */

import React, { useEffect, useState, useCallback } from 'react'
import { observer } from 'mobx-react'
import cns from 'classnames'
import { FieldState, FormState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import Tooltip from 'react-icecream/lib/tooltip'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import Modal from 'react-icecream/lib/modal'
import Icon from 'react-icecream/lib/icon'
import { useFormstateX } from 'react-icecream-2/form-x'
import { Iamed } from 'portal-base/user/iam'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'
import { I18nStore, useTranslation } from 'portal-base/common/i18n'

import { IModalProps } from 'cdn/stores/modal'

import { useModal } from 'cdn/hooks/modal'
import { useCreateTag, useBindDomainTags } from 'cdn/hooks/tag'

import IamInfo from 'cdn/constants/iam-info'

import { TagSelector, SelectorRefContent } from 'cdn/components/common/TagSelector'
import Link from 'cdn/components/common/Link/LegacyLink'

import * as messages from './messages'
import TagSvg from './tag.svg'

import './style.less'

export interface Props {
  domain: string
  tagList: string[]
  loading: boolean
  onTagsChange: () => void
}

interface TagsTipProps {
  tagList: string[]
  onEdit: () => void
}

function TagsTip({
  tagList,
  onEdit
}: TagsTipProps) {
  const { iamActions } = useInjection(IamInfo)
  const t = useTranslation()

  return (
    <span>
      {tagList.slice(0, 2).join(' ')}
      {tagList.length > 2 ? ' ...' : ''}
      {tagList.length === 0 ? t(messages.noTag) : ''}
      <Iamed actions={[iamActions.EditDomainTag]}>
        &nbsp;<Link onClick={onEdit}>{t(messages.edit)}</Link>
      </Iamed>
    </span>
  )
}

const maxTagLength = 12

function createState(i18n: I18nStore, tagList: string[]) {
  return new FormState({
    selectedTags: new FieldState(tagList),
    newTag: new FieldState('').validators(
      v => !v && i18n.t(messages.inputTag),
      v => v && v.length > maxTagLength && i18n.t(messages.tagLengthLimit, maxTagLength)
    )
  })
}

const maxTagsPerDomain = 10

interface ModalProps extends IModalProps {
  tagList: string[]
}

const TagsEditModel = observer(function _TagsEditModel({
  tagList,
  visible,
  onCancel,
  onSubmit
}: ModalProps) {
  const i18n = useInjection(I18nStore)
  const state = useFormstateX(createState, [i18n, tagList])

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault()
    state.$.selectedTags.validate().then(({ hasError }) => {
      if (!hasError) {
        onSubmit(state.value.selectedTags)
      }
    })
  }, [onSubmit, state])

  const [newTagVisible, setNewTagVisible] = useState(false)
  const selectorRef = React.useRef<SelectorRefContent>(null)

  const { isCreating, call, isSuccess } = useCreateTag()
  const handleCreateTag = useCallback(async () => {
    const { hasError } = await state.$.newTag.validate()
    if (hasError) {
      return
    }
    call(state.value.newTag)
  }, [call, state])

  useEffect(() => {
    if (!isSuccess) {
      return
    }
    if (selectorRef.current != null) {
      selectorRef.current.markStale()
    }
    if (state.value.selectedTags.length < maxTagsPerDomain) {
      state.$.selectedTags.onChange([...state.value.selectedTags, state.value.newTag])
    }
    setNewTagVisible(false)
    state.$.newTag.reset()
  }, [isSuccess, state, selectorRef])

  const t = useTranslation()

  const createTagCnt = newTagVisible
  ? (
    <>
      <Form.Item
        {...bindFormItem(state.$.newTag)}
      >
        <Input style={{ width: '160px' }} placeholder={t(messages.inputTag)} {...bindTextInput(state.$.newTag)} />
      </Form.Item>
      <div className="operations">
        <Button loading={isCreating} onClick={handleCreateTag}>{t(messages.ok)}</Button>
        <Button onClick={() => setNewTagVisible(false)}>{t(messages.cancel)}</Button>
      </div>
    </>
  )
  : (
    <Button type="link" icon="plus" onClick={() => setNewTagVisible(true)}>
      {t(messages.addTag)}
    </Button>
  )

  return (
    <Modal
      title={t(messages.editTag)}
      onOk={handleSubmit}
      onCancel={onCancel}
      visible={visible}
    >
      <Form className="edit-tags" colon={false}>
        <Form.Item
          {...bindFormItem(state.$.selectedTags)}
        >
          <TagSelector
            limit={maxTagsPerDomain}
            state={state.$.selectedTags}
            selectorRef={selectorRef}
          />
        </Form.Item>
        <div className="create-tag">
          {createTagCnt}
        </div>
      </Form>
    </Modal>
  )
})

export default observer(function Tags({
  domain,
  tagList,
  loading,
  onTagsChange
}: Props) {
  const tagIconClassName = cns({
    'tag-icon': true,
    'tag-icon-empty': tagList.length === 0
  })

  const modalStore = useModal()

  const { call } = useBindDomainTags(domain)

  const toaster = useInjection(Toaster)
  const t = useTranslation()

  const handleEdit = useCallback(() => {
    toaster.promise(
      modalStore.open().then(call).then(onTagsChange)
    )
  }, [call, toaster, modalStore, onTagsChange])

  if (loading) {
    return (
      <div className="comp-tags">
        <Tooltip title={t(messages.searching)} overlayStyle={{ fontSize: '12px' }}>
          <Icon type="sync" spin className="tags-loading" />
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="comp-tags">
      <Tooltip
        placement="right"
        overlayStyle={{ fontSize: '12px' }}
        title={<TagsTip tagList={tagList} onEdit={handleEdit} />}
      >
        <TagSvg className={tagIconClassName} />
        {tagList.length > 0 && <span>{tagList.length}</span>}
      </Tooltip>
      <TagsEditModel
        tagList={tagList}
        {...modalStore.bind()}
      />
    </div>
  )
})
