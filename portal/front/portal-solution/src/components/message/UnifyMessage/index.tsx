
import React from 'react'

import { Divider } from 'react-icecream'

import { Header } from '../Header'
import './style.less'
import { MessageList } from '../MessageList'

export const UnifyMessage = () => <div>
  <Header />
  <div className="path">
    <span className="front-path">统一消息触达 / 通道管理 / </span>
    <span>通道列表</span>

  </div>
  <div className="description">
    <div className="description-title">
      通道列表
    </div>
    <Divider className="description-divider" />
  </div>
  <MessageList />
</div>
