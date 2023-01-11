/**
 * @file component LoadMore for ResourceManage TODO：@huangbingjie
 * @author zhangheng <zhangheng01@qiniu.com>
 */

// 通过 button 和 spin 结合实现点击后 loading 的效果
import * as React from 'react'
import { Icon, Button, Spin } from 'react-icecream/lib'
import { SVGIcon } from 'portal-base/common/utils/svg'
import { observer } from 'mobx-react'

import DownCircle from 'kodo/styles/icons/down-circle.svg'
import styles from './style.m.less'

interface ILoadMoreProps {
  hasMore?: boolean // 控制加载更多按钮是否显示
  visible?: boolean // 是否可见
  isLoading?: boolean // 当前是否正在加载
  onClick(): void // 触发相关加载动作
}

export default observer(function LoadMore(
  { isLoading = false, onClick, hasMore, visible }: ILoadMoreProps
) {
  if (!visible) {
    return null
  }

  return (
    <div className={styles.loadBox}>
      {
        hasMore
          ? (
            <Button onClick={onClick} type="link">
              <Spin spinning={isLoading}>
                <div className={styles.direction}>
                  <Icon component={() => <SVGIcon src={DownCircle} className={styles.svgSize} />} />
                  <span>{ isLoading ? '加载中' : '加载更多' }</span>
                </div>
              </Spin>
            </Button>
          )
          : <span className={styles.end}>到底了</span>
      }
    </div>
  )
})
