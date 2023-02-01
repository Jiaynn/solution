/**
 * @file Domain List Component
 * @author linchen <gakiclin@gmail.com>
 */

import React, { useCallback } from 'react'
import { observer, Observer } from 'mobx-react'
import Modal from 'react-icecream/lib/modal'
import Table, { TableProps, ColumnProps } from 'react-icecream/lib/table'
import { Link } from 'portal-base/common/router'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { IamPermissionStore } from 'portal-base/user/iam'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'portal-base/common/utils/store'
import { ToasterStore } from 'portal-base/common/toaster'
import { useTranslation, TranslateFn } from 'portal-base/common/i18n'

import { booleanPredicate } from 'cdn/utils'

import { humanizeTimeUTC } from 'cdn/transforms/datetime'
import {
  humanizePlatform, humanizeToggleType, humanizeType,
  shouldForbidDisable, shouldForbidEnable, shouldForbidOEMSubAccountOperation,
  shouldForbidRemove, shouldForbidUnfreeze, shouldForbidDomainTags
} from 'cdn/transforms/domain'

import IamInfo from 'cdn/constants/iam-info'
import AbilityConfig from 'cdn/constants/ability-config'
import { DomainType,
  OperatingState, operatingStateValues, operatingStateTextMap,
  platformTextMap, protocolValues,
  protocolTextMap, Platform
} from 'cdn/constants/domain'
import { isOEM, oemConfig } from 'cdn/constants/env'

import IamedLink from 'cdn/components/IamedLink'

import { IDomain, TOnOffLine } from 'cdn/apis/domain'
import Routes from 'cdn/constants/routes'

import CnameToolTip from '../common/CnameToolTip'
import PwdConfirm from '../PwdConfirm'
import DomainState from './State'
import DomainCname from './Cname'
import DomainProtocol from './Protocol'
import DomainTags from './Tags'
import * as messages from './messages'
import LocalStore from './store'

import './style.less'

export const getTypeFilterOptions = (t: TranslateFn) => (
  [
    DomainType.Normal,
    DomainType.Wildcard,
    DomainType.Test
  ].map(
    type => ({
      text: t(humanizeType(type)),
      value: type
    })
  )
)

const getOperatingStateFilterOptions = (t: TranslateFn) => (
  operatingStateValues.filter(
    it => it !== OperatingState.NotIcpFrozen && it !== OperatingState.Deleted
  ).map(
    type => ({
      text: t(operatingStateTextMap[type as keyof typeof operatingStateTextMap]),
      value: type
    })
  )
)

const protocolFilterOptions = protocolValues.map(
  type => ({
    text: protocolTextMap[type],
    value: type
  })
)

/**
 * 隐藏修改域名信息的入口
 *  1、域名列表-操作栏不展示配置入口
 *  2、域名列表-域栏不允许点击跳转
 */
export function shouldForbidConfig(domain: IDomain, userInfo: UserInfo) {
  if (isOEM && oemConfig.hideUpdateDomain) {
    return 'OEM 没有开启修改域名信息的权限'
  }
  const forbidSubAccount = shouldForbidOEMSubAccountOperation(userInfo)
  if (forbidSubAccount) {
    return forbidSubAccount
  }
  if (domain.operatingState === OperatingState.Offlined) {
    return '域名已被停用'
  }
  if (domain.operatingState === OperatingState.Frozen) {
    return '域名已被冻结'
  }
}

export interface IFilterOptions {
  type: string[]
  protocol: string[]
  platform?: Platform[]
  operatingState: OperatingState[]
}

export interface IProps extends TableProps<IDomain> {
  domainList: IDomain[]
  filterOptions: IFilterOptions
  onUpdate(): void
}

export default observer(function DomainList(props: IProps) {
  const userInfo = useInjection(UserInfo)
  const iamPermissionStore = useInjection(IamPermissionStore)
  const routes = useInjection(Routes)
  const abilityConfig = useInjection(AbilityConfig)
  const iamInfo = useInjection(IamInfo)
  const t = useTranslation()

  const store = useLocalStore(LocalStore, props)
  const {
    domainList,
    filterOptions,
    ...tableProps
  } = props

  const platformFilterOptions = abilityConfig.domainPlatforms.map(
    type => ({
      text: t(platformTextMap[type]),
      value: type
    })
  )

  const columns: Array<ColumnProps<IDomain> | false> = [
    {
      title: t(messages.domain),
      className: 'domain-name-col',
      key: 'type', // 这里 key 使用 type 是为了给 filter 用
      filters: getTypeFilterOptions(t),
      filteredValue: filterOptions.type,
      filterMultiple: false,
      render: function renderName(_: unknown, domain) {
        return (
          <Link
            disabled={!!shouldForbidConfig(domain, userInfo)}
            className="domain-name"
            to={routes.domainDetail(domain.name)}
          >
            {domain.name}
          </Link>
        )
      }
    },
    isOEM && userInfo.parent_uid === 0 && (
      {
        title: t(messages.belong),
        dataIndex: 'oemMail',
        render: function renderOemUser(oemMail: string) {
          return <span className="domain-oem-user">{oemMail}</span>
        }
      }
    ),
    !(isOEM && userInfo.parent_uid !== 0 && oemConfig.hideSubAccountDomainListCname) && (
      {
        title: <CnameToolTip />,
        dataIndex: 'cname',
        width: '100px',
        render: function renderCname(cname: string, domain) {
          return (
            <Observer>
              {
                () => (
                  <DomainCname
                    cname={cname}
                    type={domain.type}
                    loading={store.isLoadingCnameState}
                    checked={store.domainCnameStateMap.get(domain.name) ?? false}
                  />
                )
              }
            </Observer>
          )
        }
      }
    ),
    {
      title: t(messages.status),
      width: '120px',
      dataIndex: 'operatingState',
      filters: getOperatingStateFilterOptions(t),
      filteredValue: filterOptions.operatingState,
      filterMultiple: false,
      render: function renderState(state, domain) {
        return (
          <DomainState
            state={state}
            operationType={domain.operationType}
            freezeType={domain.freezeType}
          />
        )
      }
    },
    {
      title: t(messages.protocol),
      dataIndex: 'protocol',
      filters: protocolFilterOptions,
      filteredValue: filterOptions.protocol,
      filterMultiple: false,
      width: '100px',
      render: function renderProtocol(_: unknown, domain) {
        return (
          <Observer render={() => (
            <DomainProtocol
              domain={domain}
              certInfo={store.domainCertsMap.get(domain.name)}
            />
          )} />
        )
      }
    },
    !abilityConfig.hideDomainPlatform && {
      title: t(messages.scenarios),
      dataIndex: 'platform',
      filters: platformFilterOptions,
      filteredValue: filterOptions.platform,
      filterMultiple: false,
      width: '120px',
      render: (platform: Platform) => t(humanizePlatform(platform))
    },
    {
      title: t(messages.createdAt),
      width: isOEM ? '120px' : '200px',
      dataIndex: 'createAt',
      render: function renderCreatedAt(createAt: string) {
        return (
          <span className="domain-createdAt">
            {humanizeTimeUTC(createAt)}
          </span>
        )
      }
    },
    !shouldForbidDomainTags(userInfo, iamPermissionStore, iamInfo) && (
      {
        title: t(messages.tag),
        dataIndex: 'tagList',
        width: '80px',
        render: function renderTags(_: unknown, domain) {
          if (isOEM && domain.oemMail !== userInfo.email) {
            return '--'
          }
          return (
            <Observer render={() => (
              <DomainTags
                domain={domain.name}
                loading={store.isLoadingTags}
                tagList={(store.domainTagsMap.get(domain.name) || []).slice()}
                onTagsChange={store.getTags}
              />
            )} />
          )
        }
      }
    ),
    {
      title: t(messages.operation),
      width: '140px',
      render: function renderOperation(_: unknown, domain) {
        return (
          <DomainOperation domain={domain} store={store} />
        )
      }
    }
  ]

  return (
    <>
      <Table
        className="comp-domain-list"
        dataSource={domainList}
        columns={columns.filter(booleanPredicate)}
        rowKey="name"
        {...tableProps}
        loading={props.loading}
      />
      <PwdConfirm {...store.pwdConfirmStore.bind()} />
    </>
  )
})

interface IOperationProps {
  domain: IDomain
  store: LocalStore
}

function DomainOperation({ domain, store }: IOperationProps) {
  const userInfo = useInjection(UserInfo)
  const toaster = useInjection(ToasterStore)
  const { iamActions } = useInjection(IamInfo)
  const t = useTranslation()
  const statisticLink = <a onClick={() => store.redirectStatistic(domain.name)}>{t(messages.statistics)}</a>

  const handleToggle = (type: TOnOffLine) => {
    const typeDesc = t(humanizeToggleType(type))
    toaster.promise(
      store.pwdConfirmStore
        .open(t(messages.confirmToggleDomain, typeDesc, domain.name))
        .then(() => {
          store.toggleDomain(type, domain.name)
        })
    )
  }
  const disableLink = <IamedLink actions={[iamActions.OfflineDomain]} resources={[domain.name]} onClick={() => handleToggle('offline')}>{t(humanizeToggleType('offline'))}</IamedLink>
  const enableLink = <IamedLink actions={[iamActions.OnlineDomain]} resources={[domain.name]} onClick={() => handleToggle('online')}>{t(humanizeToggleType('online'))}</IamedLink>

  const handleUnfreeze = () => {
    store.getDomainIcp(domain.name).then(res => {
      if (res && res.regno) {
        Modal.confirm({
          title: '您的域名已经恢复备案，点击“确认”执行解冻操作',
          okText: t(messages.ok),
          onOk: () => store.unfreezeDomain(domain.name)
        })
      } else {
        Modal.error({
          title: <div>如您确认备案已恢复，可以拨打 4008089176-2 或<a href="https://support.qiniu.com/tickets/new/form?category=%E5%85%B6%E4%BB%96%E7%B1%BB%E5%92%A8%E8%AF%A2&space=%E8%9E%8D%E5%90%88%20CDN&title=%E5%9F%9F%E5%90%8D%E8%A7%A3%E5%86%BB&description=%E5%9F%9F%E5%90%8D%E5%B7%B2%E7%BB%8F%E6%81%A2%E5%A4%8D%E5%A4%87%E6%A1%88" target="_blank" rel="noopener noreferrer">提交工单</a>由人工处理。谢谢！</div>
        })
      }
    })
  }

  const unfreezeLink = <a onClick={handleUnfreeze}>{t(messages.unfreeze)}</a>
  const configLink = (
    <IamedLink
      actions={[iamActions.GetDomainInfo]}
      resources={[domain.name]}
      onClick={() => store.redirectConfig(domain.name)}
    >{t(messages.configure)}</IamedLink>
  )

  const handleDelete = useCallback(() => {
    store.pwdConfirmStore
      .open(t(messages.confirmRemoveDomain, domain.name))
      .then(() => {
        store.deleteDomain(domain.name)
      })
  }, [store, domain, t])

  const deleteLink = (
    <IamedLink
      actions={[iamActions.DeleteDomain]}
      resources={[domain.name]}
      onClick={handleDelete}
    >{t(messages.remove)}</IamedLink>
  )

  const operations = shouldForbidOEMSubAccountOperation(userInfo)
  ? [statisticLink]
  : [
    !shouldForbidConfig(domain, userInfo) && configLink,
    !shouldForbidEnable(domain) && enableLink,
    !shouldForbidRemove(domain) && deleteLink,
    statisticLink,
    !shouldForbidDisable(domain) && disableLink,
    !shouldForbidUnfreeze(domain) && unfreezeLink
  ].filter(Boolean)

  return (
    <span className="domain-operations">
      {
        operations.map<React.ReactNode>(
          (it, index) => (
            <span className="operation-item" key={index}>{it}</span>
          )
        ).reduce(
          (acc, cur) => [acc, cur]
        )
      }
    </span>
  )
}
