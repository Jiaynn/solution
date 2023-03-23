import React from 'react'
import { Button, Link } from 'react-icecream-2'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { lists, tabs } from 'components/lowcode/static/data'
import { lowcodePath } from 'utils/router'

import './style.less'

const prefixCls = 'lowcode-scheme-list'

export const LowcodeSchemeList = () => {
  const routerStore = useInjection(RouterStore)

  return (
    <div className={`${prefixCls}-container`}>
      <div className={`${prefixCls}-header`}>
        <div className={`${prefixCls}`}>
          <div className={`${prefixCls}-title`}>
            低代码 + 智能 一站式音视频场景解决方案
          </div>
          <div className={`${prefixCls}-desc`}>
            沉淀七牛云近十年全面的音视频场景，结合七牛低代码平台和音视频智能，提供社交互娱、视频营销、视联网、智慧新媒体、元宇宙等对各领域的一站式解决方案
          </div>
          <div className={`${prefixCls}-btns`}>
            <Button type="primary" className={`${prefixCls}-btn-consult`}>
              立即咨询
            </Button>
          </div>
        </div>
      </div>

      <div>
        {tabs.map(item => (
          <div key={item.id}>
            <div className={`${prefixCls}-scheme-title`}>{item.title}</div>
            <div className={`${prefixCls}-content`}>
              {lists
                .filter(card => card.type === item.id)
                .map(listItem => (
                  <div
                    key={listItem.id}
                    className={`${prefixCls}-content-list`}
                  >
                    <img
                      src={listItem.img}
                      alt=""
                      className={`${prefixCls}-content-list-img`}
                    />
                    <div className={`${prefixCls}-content-list-detail`}>
                      <div
                        className={`${prefixCls}-content-list-detail-title`}
                      >
                        {listItem.title}
                      </div>
                      <div
                        className={`${prefixCls}-content-list-detail-desc`}
                      >
                        {listItem.desc}
                      </div>
                      <div
                        className={`${prefixCls}-content-list-detail-link`}
                      >
                        {listItem.link_console && <Link onClick={() => routerStore.push(`${lowcodePath}/scene/iframe?url=${listItem.link_console}`)}>控制台</Link>}
                        {listItem.link_more && <Link onClick={() => routerStore.push(`${lowcodePath}/scene/detail?url=${listItem.link_more}`)}>了解更多</Link>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
