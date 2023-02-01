/**
 * @description hand mode editor component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { TextArea, Card, CardTitle } from 'react-icecream-2'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import styles from './style.m.less'

interface Props {
  value?: string
  onChange: (code: string) => void
}

export default function HandModeEditor(props: Props) {
  const titleView = (
    <CardTitle
      title="编辑处理接口"
      style={{ background: '#FAFAFA' }}
      extra={(
        <HelpDocLink className={styles.link} doc="imageStyle">
          查看图片处理使用说明
        </HelpDocLink>
      )}
    />
  )
  return (
    <Card type="bordered" title={titleView} className={styles.card}>
      <TextArea
        textareaProps={{ rows: 15 }}
        placeholder="请输入编辑处理接口"
        value={props.value}
        onChange={value => props.onChange(value)}
      />
    </Card>
  )
}
