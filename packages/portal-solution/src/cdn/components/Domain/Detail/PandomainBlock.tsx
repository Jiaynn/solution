
import React, { ReactNode } from 'react'
import Icon from 'react-icecream/lib/icon'
import Table from 'react-icecream/lib/table'
import { useTranslation } from 'portal-base/common/i18n'

import { humanizeOperatingState, humanizeOperationType, isNotIcpFrozen } from 'cdn/transforms/domain/index'

import { OperatingState } from 'cdn/constants/domain'

import TipIcon from 'cdn/components/TipIcon'

import { IDomain } from 'cdn/apis/domain'

import BlockTitle from './BlockTitle'
import { NotIcpFrozenTipMessage } from '../List/State'

export default function PandomainBlock(props: {
  pandomainList: IDomain[]
  loading: boolean
  hasMore: boolean
  handleLoadMore: () => void
  handleRemovePandomain: (name: string) => void
  handleCreatePandomain: () => void
}) {
  const {
    pandomainList,
    loading,
    hasMore,
    handleLoadMore,
    handleRemovePandomain,
    handleCreatePandomain
  } = props

  const t = useTranslation()

  const renderOperations = (_: unknown, pandomain: IDomain) => (
    <span className="remove-btn" onClick={() => handleRemovePandomain(pandomain.name)}>
      <Icon
        className="icon-remove"
        type="minus-circle"
        title="删除"
      />
    </span>
  )

  const renderState = (_: unknown, item: IDomain) => {
    const state = item.operatingState
    let extra: ReactNode = null

    if (state === OperatingState.Processing) {
      extra = (
        <TipIcon
          className="tip-icon"
          size="12px"
          tip={humanizeOperationType(item.operationType) + '处理中'}
        />
      )
    } else {
      extra = isNotIcpFrozen(state, item.freezeType)
        ? (
          <TipIcon
            className="tip-icon"
            size="12px"
            tip={<NotIcpFrozenTipMessage />}
          />
        )
        : null
    }

    return (
      <span className={`text-${state}`}>
        {t(humanizeOperatingState(state, item.freezeType))}
        {extra}
      </span>
    )
  }

  const footer = (
    hasMore
    ? (
      <span
        className="load-more-pandomains"
        onClick={handleLoadMore}
      >加载更多</span>
    )
    : null
  )

  return (
    <section className="content-block pandomain-block">
      <BlockTitle>
        泛子域名
        <span
          className="add-pan"
          onClick={handleCreatePandomain}
        >+ 新增子域名</span>
      </BlockTitle>
      <Table
        dataSource={pandomainList}
        loading={loading}
        rowKey="name"
        scroll={{ y: 240 }}
        pagination={false}
        footer={footer ? () => footer : undefined}
      >
        <Table.Column title="域名" key="name" dataIndex="name" />
        <Table.Column title="源站空间" key="sourceQiniuBucket" dataIndex="source.sourceQiniuBucket" width="240px" />
        <Table.Column title="状态" key="state" render={renderState} width="100px" />
        <Table.Column title="操作" key="op" render={renderOperations} width="180px" />
      </Table>
    </section>
  )
}
