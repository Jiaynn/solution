/**
 * @file DomainCreateResult List Component
 * @author linchen gakiclin@gmail.com
 */

import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import Table from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'
import { Link } from 'portal-base/common/router'

import { CreateDomainSummary } from 'cdn/constants/domain'

import CopyContent from 'cdn/components/common/CopyContent'
import CnameToolTip from 'cdn/components/Domain/common/CnameToolTip'
import Routes from 'cdn/constants/routes'

export type ResultListItem = {
  isSuccess: false
  name: string
  errorMsg: string
} | {
  isSuccess: true
  name: string
  cname: string
}

interface IProps {
  loading: boolean
  status: CreateDomainSummary
  items: ResultListItem[]
  onRetry: () => void
}

export default function ResultList(props: IProps) {
  const routes = useInjection(Routes)
  const retryCnt = (
    <div className="result-list-retry">
      {props.status === CreateDomainSummary.PartialFailure ? '部分域名创建失败' : '域名创建失败'}，点击
      <Button type="link" onClick={props.onRetry}>重试</Button>
    </div>
  )

  return (
    <Table
      className="result-list"
      dataSource={props.items}
      rowKey="name"
      size="middle"
      pagination={false}
      loading={props.loading}
      footer={() => props.status !== CreateDomainSummary.Success && retryCnt}
    >
      <Table.Column<ResultListItem>
        title="域名"
        dataIndex="name"
        render={(name: string, item) => (
          item.isSuccess
            ? <Link to={routes.domainDetail(name)}>{name}</Link>
            : name
        )}
      />
      <Table.Column<ResultListItem>
        title={<CnameToolTip />}
        dataIndex="cname"
        render={(cname: string, item) => (
          item.isSuccess
            ? (
              <>
                <span className="cname">{cname}</span>
                <CopyContent className="copy-cname" title="复制CNAME" content={cname} />
              </>
            )
            : '--'
        )}
      />
      <Table.Column<ResultListItem>
        title="状态"
        key="status"
        render={(_: unknown, item) => (
          <span className={item.isSuccess ? 'status-success' : 'status-error'}>
            {item.isSuccess === true ? '添加成功' : item.errorMsg}
          </span>
        )}
      />
    </Table>
  )
}
