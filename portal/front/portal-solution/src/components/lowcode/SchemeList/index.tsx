import React, { useState } from 'react'
import { Button } from 'react-icecream-2'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { lists, tabs } from 'components/lowcode/static/data'

import './style.less'
import { LowcodeModal } from '../common/Modal'
import { SchemeListCard } from '../common/SchemeListCard'

import { lowcodePath } from 'utils/router'

const prefixCls = 'lowcode-scheme-list'

export const LowcodeSchemeList = () => {
  const routerStore = useInjection(RouterStore)
  const [visible, setVisible] = useState(false)

  function handleCancel() {
    setVisible(false)
  }

  function onConsoleClick(url:string) {
    routerStore.push(`${lowcodePath}/scene/iframe?url=${encodeURIComponent(url)}`)
  }

  function onMoreClick(url:string) {
    routerStore.push(`${lowcodePath}/scene/detail?url=${encodeURIComponent(url)}`)
  }

  return (
    <div className={`${prefixCls}-container`}>
      <div className={`${prefixCls}-header`}>
        <div className={`${prefixCls}`}>
          <div className={`${prefixCls}-title`}>
            低代码 + 智能 一站式音视频场景解决方案
          </div>
          <div className={`${prefixCls}-desc`}>
            沉淀七牛云近十年全面的音视频场景，结合七牛云低代码平台和音视频智能，提供社交互娱、视频营销、视联网、智慧新媒体、元宇宙等多个领域一站式解决方案。
          </div>
          <div className={`${prefixCls}-btns`}>
            <Button type="primary" className={`${prefixCls}-btn-consult`} onClick={() => setVisible(true)}>
              立即咨询
            </Button>
            <LowcodeModal visible={visible} handleCancel={() => handleCancel()} />
          </div>
        </div>
      </div>

      <div>
        {
          tabs.map(item => (
            <div key={item.id}>
              <div className={`${prefixCls}-scheme-title`}>{item.title}</div>
              <div className={`${prefixCls}-content`}>
                {
                  lists
                    .filter(card => card.type === item.id)
                    .map(listItem => (
                      <div key={listItem.id}>
                        <SchemeListCard
                          img={listItem.img}
                          title={listItem.title}
                          describe={listItem.desc}
                          linkConsole={listItem.link_console}
                          linkMore={listItem.link_more}
                          onConsoleClick={() => onConsoleClick(listItem.link_console)}
                          onMoreClick={() => onMoreClick(listItem.link_more)} />
                      </div>
                    ))
                }
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
