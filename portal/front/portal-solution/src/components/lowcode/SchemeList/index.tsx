import React from 'react'
import { Button } from 'react-icecream-2'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { lists, tabs } from 'components/lowcode/static/data'

import './style.less'

import { lowcodeBasename } from 'components/common/App/lowcode'
import { basename } from 'constants/routes'

const prefixCls = 'lowcode-scheme-list'

export const LowcodeSchemeList = () => {

  const routerStore = useInjection(RouterStore)

  const handleLearnMore = (url: string) => {
    routerStore.push(`${basename}${lowcodeBasename}/scene/detail?url=${url}`)
  }

  return (

    <div className={`${prefixCls}-contain`}>
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
                .map(list => (
                  <div
                    key={list.id}
                    className={`${prefixCls}-content-list`}
                  >
                    <img
                      src={list.img}
                      alt=""
                      className={`${prefixCls}-content-list-img`}
                    />
                    <div className={`${prefixCls}-content-list-detail`}>
                      <div
                        className={`${prefixCls}-content-list-detail-title`}
                      >
                        {list.title}
                      </div>
                      <div
                        className={`${prefixCls}-content-list-detail-desc`}
                      >
                        {list.desc}
                      </div>
                      <div
                        className={`${prefixCls}-content-list-detail-link`}
                      >
                        <a
                          href={list.link_console}
                          style={
                                list.link_console === ''
                                  ? { display: 'none' }
                                  : {}
                          }
                        >
                          控制台
                        </a>
                        <span
                          style={
                                list.link_more === '' ? { display: 'none' } : {}
                          }
                          onClick={() => handleLearnMore(list.link_more)}
                        >
                          了解更多
                        </span>
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
