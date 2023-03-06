/**
 * @file Domain Manager ConfigurationHeader Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { Featured } from 'portal-base/user/feature-config'
import { RouterStore } from 'portal-base/common/router'
import { Iamed, IamPermissionStore } from 'portal-base/user/iam'
import { bindTextInput, bindFormItem } from 'portal-base/common/form'
import Form from 'react-icecream/lib/form'
import Icon from 'react-icecream/lib/icon'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import { useTranslation } from 'portal-base/common/i18n'

import { shouldForbidCreateDomain, shouldForbidDomainTags } from 'cdn/transforms/domain'

import IamInfo from 'cdn/constants/iam-info'

import { SimpleTagSelector } from 'cdn/components/common/TagSelector'

import { IDomain } from 'cdn/apis/domain'
import Routes from 'cdn/constants/routes'

import BatchMenu from './List/BatchMenu'
import * as messages from './messages'

import './style.less'

export type State = FormState<{
  tagList: FieldState<string[]>
  keyword: FieldState<string>
}>

export function createState(): State {
  return new FormState({
    tagList: new FieldState([]),
    keyword: new FieldState('')
  })
}

export interface IProps {
  state: State
  onRefresh: (selectedDomainNames?: string[]) => void
  batchUpdateVisible: boolean
  selectedDomains: IDomain[]
}

export default observer(function Header({
  state,
  onRefresh,
  batchUpdateVisible,
  selectedDomains
}: IProps) {
  const userInfo = useInjection(UserInfo)
  const routerStore = useInjection(RouterStore)
  const iamPermissionStore = useInjection(IamPermissionStore)
  const routes = useInjection(Routes)
  const iamInfo = useInjection(IamInfo)
  const t = useTranslation()

  const showCreateDomain = !shouldForbidCreateDomain(userInfo)

  const create = showCreateDomain && (
    <Iamed
      actions={[iamInfo.iamActions.CreateDomain]}
      component={({ shouldDeny }) => (
        <Featured feature="FUSION.FUSION_CREATE">
          <Button
            type="primary"
            onClick={() => routerStore.push(routes.domainCreate())}
            disabled={shouldDeny}
          >
            {t(messages.addDomain)}
          </Button>
        </Featured>
      )}
    />
  )

  const handleSubmit = React.useCallback((e: React.FormEvent<HTMLElement>) => {
    e.preventDefault()
    onRefresh()
  }, [onRefresh])

  const search = (
    <Iamed actions={[iamInfo.iamActions.GetDomainList]}>
      <Form layout="inline" onSubmit={handleSubmit}>
        {
          !shouldForbidDomainTags(userInfo, iamPermissionStore, iamInfo) && (
            <Form.Item {...bindFormItem(state.$.tagList)}>
              <SimpleTagSelector state={state.$.tagList} />
            </Form.Item>
          )
        }
        <Form.Item {...bindFormItem(state.$.keyword)}>
          <div className="domain-nav-search">
            <div className="search-input-wrapper">
              <Input
                allowClear
                placeholder={t(messages.searchDomainPlaceholder)}
                suffix={<Icon type="search" className="search-icon" />}
                {...bindTextInput(state.$.keyword)}
              />
            </div>
            <Icon className="refresh" type="sync" onClick={() => onRefresh()} />
          </div>
        </Form.Item>
      </Form>
    </Iamed>
  )

  return (
    <header className="comp-domain-nav">
      <div>
        {create}
        {batchUpdateVisible && (
          <BatchMenu
            domains={selectedDomains}
            onRefresh={onRefresh}
          />
        )}
      </div>
      {search}
    </header>
  )
})
