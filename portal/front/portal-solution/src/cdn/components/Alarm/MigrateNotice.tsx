import React from 'react'
import { Alert } from 'react-icecream-2'
import { Link } from 'qn-fe-core/router'
import Page from 'portal-base/common/components/Page'

export interface Props {
  title: string
  url: string
}

export default function MigrateNotice(props: Props) {
  const message = (
    <>
      原有{props.title}模块迁移到了消息中心模块，您可以前往&nbsp;
      <Link to={props.url} target="_blank" rel="noopener noreferrer">消息中心</Link>
      &nbsp;进行设置<br />
      也可以通过上方导航栏的“消息”按钮进入消息中心进行设置
    </>
  )

  return <Page><Alert icon type="warning" message={message} /></Page>
}
