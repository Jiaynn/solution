/*
 * @file entry file
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'
import boot from './global/boot'

// 初始化行为
boot()

// 渲染 APP
const rootEl = document.getElementById('main-view-wrapper')
ReactDOM.render(
  <App />,
  rootEl
)
