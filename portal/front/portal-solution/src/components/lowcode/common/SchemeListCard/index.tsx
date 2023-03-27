import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'
import { Link } from 'react-icecream-2'

import { lowcodePath } from 'utils/router'
import './style.less'

interface ListCardProps{
  schemeImg:string
  schemeTitle:string
  schemeDesc:string
  schemeLinkConsole?:string
  schemeLinkMore?:string
}

const prefixCls = 'lowcode-scheme-list-card'
export const SchemeListCard: React.FC<ListCardProps> = props => {
  const { schemeImg, schemeTitle, schemeDesc, schemeLinkConsole, schemeLinkMore } = props
  const routerStore = useInjection(RouterStore)
  return (
    <div
      className={`${prefixCls}-content-list`}
    >
      <img
        src={schemeImg}
        alt=""
        className={`${prefixCls}-content-list-img`}
      />
      <div className={`${prefixCls}-content-list-detail`}>
        <div
          className={`${prefixCls}-content-list-detail-title`}
        >
          {schemeTitle}
        </div>
        <div
          className={`${prefixCls}-content-list-detail-desc`}
        >
          {schemeDesc}
        </div>
        <div
          className={`${prefixCls}-content-list-detail-link`}
        >
          {schemeLinkConsole && <Link onClick={() => routerStore.push(`${lowcodePath}/scene/iframe?url=${schemeLinkConsole}`)}>控制台</Link>}
          {schemeLinkMore && <Link onClick={() => routerStore.push(`${lowcodePath}/scene/detail?url=${schemeLinkMore}`)}>了解更多</Link>}
        </div>
      </div>
    </div>
  )
}
