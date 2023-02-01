/**
 * @file Domain card container component
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Icon } from 'react-icecream/lib'

import cardStyles from 'kodo/styles/card.m.less'

import { HelpDocumentKey } from 'kodo/stores/config/types'

import HelpDocLink from 'kodo/components/common/HelpDocLink'
import { Description } from 'kodo/components/common/Description'
import Prompt from 'kodo/components/common/Prompt'
import styles from './style.m.less'

export interface IProps {
  title: string | React.ReactNode // 标题
  doc: HelpDocumentKey // 文档地址
  description?: string | null
  className?: string
  children?: React.ReactNode
}

export default observer(function DomainCard(props: IProps) {

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {props.title}
        <HelpDocLink className={cardStyles.extraButton} doc={props.doc}>
          <Icon type="file-text" />
        </HelpDocLink>
      </div>
      {props.description && (
        <Prompt
          type="assist"
          className={styles.prompt}
        >
          <Description dangerouslyText={props.description} />
        </Prompt>
      )}
      {props.children}
    </div>
  )
})
