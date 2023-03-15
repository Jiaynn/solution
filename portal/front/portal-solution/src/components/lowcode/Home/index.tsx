import React, { useRef } from 'react'
import { Button, TextInput, Tooltip } from 'react-icecream-2'
import { RouterStore } from 'qn-fe-core/router'
import { useInjection } from 'qn-fe-core/di'

import { lowcodePath } from 'utils/router'
import { lists, tabs } from 'components/lowcode/static/data'

import './style.less'

export const Home = () => {
  const routerStore = useInjection(RouterStore)
  const inputRef = useRef<HTMLInputElement>(null)
  function handleListClick(scheme, list) {
    routerStore.push(`${lowcodePath}/scene/detail?scheme=${scheme}&list=${list}`)
  }

  return (
    <div className="contain">
      <div className="header">
        <div className="lowcode">
          <div className="lowcode-title">低代码 + 智能 一站式音视频场景解决方案</div>
          <div className="lowcode-desc">沉淀七牛云近十年全面的音视频场景，结合七牛低代码平台和音视频智能，提供社交互娱、视频营销、视联网、智慧新媒体、元宇宙等对各领域的一站式解决方案</div>
          <div className="lowcode-btns">
            <Button type="primary" className="btn-consult">立即咨询</Button>
            <Button type="primary">下载桌面端</Button>
          </div>
        </div>

      </div>

      <div className="search">
        <TextInput
          placeholder="随便输入点什么"
          inputProps={{ ref: inputRef }}
        />
        <Button type="primary" className="search-btn">搜索</Button>
      </div>

      <div>
        {
          tabs.map(item => <div key={item.id} className="content">
            <div className="scheme-title">{item.title}</div>
            <div className="list-container">
              {
                lists.filter(card => card.type === item.id).map(list => <div key={list.id} className="list">
                  <img src={list.img} alt="" className="list-img" onClick={() => handleListClick(item.title.slice(0, item.title.length - 4), list.title)} />
                  <div className="list-title">{list.title}</div>
                  <Tooltip placement="bottom" title={list.desc}><div className="list-desc">{list.desc}</div></Tooltip>

                  <div className="bottom_link">
                    {
                      list.link_console === '' ? <a target="_blank" rel="noreferrer" className="no-console">控制台</a> : <a href={list.link_console} target="_blank" rel="noreferrer">控制台</a>
                    }

                    <a href={list.link_console} target="_blank" rel="noreferrer">了解更多</a>
                  </div>

                </div>)
              }
            </div>
          </div>)
        }
      </div>
    </div>
  )
}

