import { observer } from 'mobx-react'
import React from 'react'
import { Breadcrumb, Divider } from 'react-icecream'

import styles from './style.m.less'

import Header from '../Header'

const InnerBreadcrumb: React.FC<{ title: string }> = props => (
  <Breadcrumb className={styles.breadcrumb}>
    <Breadcrumb.Item>低代码电商直播</Breadcrumb.Item>
    <Breadcrumb.Item>应用管理</Breadcrumb.Item>
    <Breadcrumb.Item>{props.title}</Breadcrumb.Item>
  </Breadcrumb>
)

const PageTitle: React.FC<{ title: string }> = props => (
  <div className={styles.title}>{props.title}</div>
)

interface LowcodePageContainerProps {
  title?: string
}

const PageContainer: React.FC<LowcodePageContainerProps> = observer(
  props => (
    <div className={styles.wrapper}>
      <Header />
      {props.title && (
        <>
          <InnerBreadcrumb title={props.title} />
          <PageTitle title={props.title} />
          <Divider className={styles.divider} />
        </>
      )}
      {props.children}
    </div>
  )
)

export default PageContainer
