import React, { ReactNode } from 'react'
import { Button } from 'react-icecream'

import styles from './style.m.less'

interface ConfigWithShowMoreProps {
  title: ReactNode
  onClickShowMore?: () => void
  width?: string
}

const WrapperWithShowMore: React.FC<ConfigWithShowMoreProps> = props => (
  <div className={styles.configWithShowMore}>
    <div className={styles.title} style={{ width: props.width }}>
      {props.title}
    </div>
    {props.children}
    {props.onClickShowMore && (
      <div className={styles.showMore}>
        <Button type="link" onClick={props.onClickShowMore}>
          展开更多
        </Button>
      </div>
    )}
  </div>
)

export default WrapperWithShowMore
