import React from 'react'
import { Link } from 'react-icecream-2'

import './style.less'

interface ListCardProps {
  img: string;
  title: string;
  describe: string;
  linkConsole?: string;
  linkMore?: string;
  onConsoleClick?: () => void;
  onMoreClick?: () => void;
}

const prefixCls = 'lowcode-scheme-list-card'

export const SchemeListCard: React.FC<ListCardProps> = props => {
  const { img, title, describe, linkConsole, linkMore, onConsoleClick, onMoreClick } = props

  return (
    <div
      className={`${prefixCls}-content-list`}
    >
      <img
        src={img}
        alt=""
        className={`${prefixCls}-content-list-img`}
      />
      <div className={`${prefixCls}-content-list-detail`}>
        <div
          className={`${prefixCls}-content-list-detail-title`}
        >
          {title}
        </div>
        <div
          className={`${prefixCls}-content-list-detail-desc`}
        >
          {describe}
        </div>
        <div
          className={`${prefixCls}-content-list-detail-link`}
        >
          {linkConsole && <Link onClick={onConsoleClick}>控制台</Link>}
          {linkMore && <Link onClick={onMoreClick}>了解更多</Link>}
        </div>
      </div>
    </div>
  )
}
