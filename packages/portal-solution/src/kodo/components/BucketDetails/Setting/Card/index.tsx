/**
 * @file Bucket setting card container component
 * @description Bucket 设置/通用卡片容器 TODO: 此组件应该存在于 icecream 之中，@huangbinjie
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { Card, Icon, Tooltip } from 'react-icecream/lib'

import styles from 'kodo/styles/card.m.less'

import { HelpDocumentKey } from 'kodo/stores/config/types'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

export interface IProps {
  title: string | React.ReactNode // 标题
  tooltip?: string | React.ReactNode // 右侧问号图标悬浮内容
  doc?: HelpDocumentKey // 文档地址
  className?: string
  children: React.ReactNode
}

export default observer(function SettingCard(props: IProps) {

  return (
    <Card
      title={<>
        {props.title}
        {props.tooltip && (
          <Tooltip
            title={<>
              {props.tooltip}
              <br />
              {props.doc && (
                <HelpDocLink doc={props.doc}>
                  了解详情
                </HelpDocLink>
              )}
            </>}
            placement="top"
          >
            <Icon type="question-circle" className={styles.question} />
          </Tooltip>
        )}
      </>}
      className={classNames(styles.card, props.className)}
    >
      {props.children}
    </Card>
  )
})
