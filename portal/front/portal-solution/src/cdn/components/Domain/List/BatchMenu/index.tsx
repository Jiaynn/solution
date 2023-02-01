/**
 * @file component BatchMenu
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import Tooltip from 'react-icecream/lib/tooltip'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import Dropdown from 'react-icecream/lib/dropdown'
import Menu, { ClickParam } from 'react-icecream/lib/menu'
import { useInjection } from 'qn-fe-core/di'
import { I18nStore } from 'portal-base/common/i18n'

import { batchOperationTypes, batchOperationTypeTextMap, OperationType } from 'cdn/constants/domain'

import { IDomain } from 'cdn/apis/domain'

import openConfirmModal from './Modal'
import PwdConfirm from '../../PwdConfirm'
import LocalStore from './store'
import * as messages from './messages'

import './style.less'

export interface IProps {
  domains: IDomain[]
  onRefresh: (selectedDomainNames?: string[]) => void
}

export default observer(function BatchMenu(props: IProps) {
  const { domains } = props
  const store = useLocalStore(LocalStore, props)
  const i18n = useInjection(I18nStore)

  const handleMenuClick = useCallback((e: ClickParam) => {
    const type = e.key as OperationType

    openConfirmModal({
      i18n,
      type,
      domains,
      onSubmit: operableDomains => store.pwdConfirmStore
        .open()
        .then(() => store.onSubmit(type, operableDomains))
    })
  }, [store, domains, i18n])

  const overlay = (
    <Menu className="comp-domain-dropdown-menu" onClick={handleMenuClick}>
      {batchOperationTypes.map(operationType => {
        const disabled = domains.length <= 0
        const operationItem = (
          <span className="operation-item">
            {i18n.t(batchOperationTypeTextMap[operationType])}
          </span>
        )

        return (
          <Menu.Item disabled={disabled} key={operationType}>
            {
              disabled
              ? (
                <Tooltip placement="right" title={i18n.t(messages.checkDomains)}>
                  {operationItem}
                </Tooltip>
              )
              : operationItem
            }
          </Menu.Item>
        )
      })}
    </Menu>
  )

  return (
    <>
      <Dropdown trigger={['click']} overlay={overlay} className="comp-domain-dropdown">
        <Button>
          {i18n.t(messages.moreActions)}<Icon type="down" className="trigger-icon" />
        </Button>
      </Dropdown>
      <PwdConfirm {...store.pwdConfirmStore.bind()} zIndex={2000} />
    </>
  )
})
