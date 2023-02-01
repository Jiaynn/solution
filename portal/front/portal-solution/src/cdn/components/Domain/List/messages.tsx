/**
 * @file Domain List Messages
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'

import HelpLink from 'cdn/components/common/HelpLink'

export { ok } from 'cdn/locales/messages'

export const domain = {
  cn: '域名',
  en: 'Domain'
}

export const belong = {
  cn: '账号归属',
  en: 'Belong'
}

export const status = {
  cn: '状态',
  en: 'Status'
}

export const protocol = {
  cn: '协议',
  en: 'Protocol'
}

export const scenarios = {
  cn: '使用场景',
  en: 'Scenarios'
}

export const createdAt = {
  cn: '创建时间',
  en: 'Creation time'
}

export const tag = {
  cn: '标签',
  en: 'Tag'
}

export const operation = {
  cn: '操作',
  en: 'Operation'
}

export const configure = {
  cn: '配置',
  en: 'Configure'
}

export const statistics = {
  cn: '统计',
  en: 'Usage'
}

export const remove = {
  cn: '删除',
  en: 'Delete'
}

export const unfreeze = {
  cn: '解冻',
  en: 'Unfreeze'
}

export const confirmRemoveDomain = {
  cn: (name: string) => `确认要删除域名：${name}?`,
  en: (name: string) => `Are you sure you want to delete the domain ${name}?`
}

export const confirmToggleDomain = {
  cn: (toggle: string, name: string) => `确认要${toggle}域名: ${name}?`,
  en: (toggle: string, name: string) => `Are you sure you want to ${toggle.toLowerCase()} domain ${name}`
}

export const toggleSuccess = {
  cn: (toogle: string) => `${toogle}域名操作成功，请点击刷新列表查看最新状态。`,
  en: (toogle: string) => `The ${toogle.toLowerCase()} domain name operation is successful, please click refresh list to check the latest status.`
}

export const unfreezeSuccess = {
  cn: '域名解冻操作成功，请点击刷新列表查看最新状态。',
  en: 'The domain name unfreezing operation is successful, please click refresh list to check the latest status.'
}

export const removeSuccess = {
  cn: '删除域名操作成功，请点击刷新列表查看最新状态。',
  en: 'The operation of deleting the domain name is successful, please click refresh list to check the latest status.'
}

export const operationProcessing = {
  cn: (op: string) => `${op}处理中`,
  en: (op: string) => `${op} is processing`
}

export const notIcpFrozen = {
  cn: (
    <>
      域名因为未备案被冻结 <HelpLink href="https://developer.qiniu.com/fusion/kb/6292/common-problems-for-the-record-to-freeze-the-domain-name">点击查看详情</HelpLink>
    </>
  ),
  en: (
    <>
      The domain name was frozen because it was no icp <HelpLink href="https://developer.qiniu.com/fusion/kb/6292/common-problems-for-the-record-to-freeze-the-domain-name">Click to view details</HelpLink>
    </>
  )
}
