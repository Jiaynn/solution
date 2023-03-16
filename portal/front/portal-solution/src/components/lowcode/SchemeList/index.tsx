import React, { useRef } from 'react'
import { Button, TextInput, Tooltip } from 'react-icecream-2'
import { RouterStore } from 'qn-fe-core/router'
import { useInjection } from 'qn-fe-core/di'

import { lowcodePath } from 'utils/router'
import { lists, tabs } from 'components/lowcode/static/data'

import './style.less'

export const LowCodeSchemeList = () => {
  const prefixCls = 'lowcode-scheme-list'
  const routerStore = useInjection(RouterStore)
  const inputRef = useRef<HTMLInputElement>(null)
  function handleListClick(scheme, list) {
    routerStore.push(`${lowcodePath}/scene/detail?scheme=${scheme}&list=${list}`)
  }

  return (
    <div className={`${prefixCls}-contain`}>
      <div className={`${prefixCls}-header`}>
        <div className={`${prefixCls}`}>
          <div className={`${prefixCls}-title`}>低代码 + 智能 一站式音视频场景解决方案</div>
          <div className={`${prefixCls}-desc`}>沉淀七牛云近十年全面的音视频场景，结合七牛低代码平台和音视频智能，提供社交互娱、视频营销、视联网、智慧新媒体、元宇宙等对各领域的一站式解决方案</div>
          <div className={`${prefixCls}-btns`}>
            <Button type="primary" className={`${prefixCls}-btn-consult`}>立即咨询</Button>
          </div>
        </div>

      </div>

      <div className={`${prefixCls}-search`}>
        <TextInput
          placeholder="随便输入点什么"
          inputProps={{ ref: inputRef }}
        />
        <Button type="primary" className={`${prefixCls}-search-btn`}>搜索</Button>
      </div>

      <div>
        {
          tabs.map(item => <div key={item.id} className={`${prefixCls}-content`}>
            <div className={`${prefixCls}-scheme-title`}>{item.title}</div>
            <div className={`${prefixCls}-container`}>
              {
                lists.filter(card => card.type === item.id).map(list => <div key={list.id} className={`${prefixCls}-list`} onClick={() => handleListClick(item.title.slice(0, item.title.length - 4), list.title)}>
                  <img src={list.img} alt="" className={`${prefixCls}-list-img`} />
                  <div className={`${prefixCls}-list-title`}>{list.title}</div>
                  <Tooltip placement="bottom" title={list.desc}><div className={`${prefixCls}-list-desc`}>{list.desc}</div></Tooltip>

                </div>)
              }
            </div>
          </div>)
        }
      </div>
    </div>
  )
}

