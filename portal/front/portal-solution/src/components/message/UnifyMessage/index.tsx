
import React from 'react'

import { Divider } from 'react-icecream'

import { Header } from '../Header'
import './style.less'
import { MessageList } from '../MessageList'

const prefixCls = 'unify-message'
export const UnifyMessage = () => <div>
  <Header />
  <div className={`${prefixCls}-path`}>
    <span className={`${prefixCls}-path-front`}>统一消息触达 / 通道管理 / </span>
    <span>通道列表</span>

  </div>
  <div className={`${prefixCls}-description`}>
    <div className={`${prefixCls}-description-title`}>
      通道列表
    </div>
    <Divider className={`${prefixCls}-description-divider`} />
  </div>
  <MessageList />
</div>
