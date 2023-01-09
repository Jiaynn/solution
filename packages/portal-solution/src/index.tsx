/**
 * @file entry file
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import ReactDOM from 'react-dom'

import './style.less'

import App from 'components/App'

// 渲染 APP
const rootEl = document.getElementById('main-view-wrapper')
ReactDOM.render(
  <App />,
  rootEl
)
