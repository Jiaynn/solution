/**
 * @file entry file
 * @author nighca <nighca@live.cn>
 */

import 'kodo/polyfills/fetch'
import 'kodo/global'

import 'react-icecream/style/index.less' // antd css inside
import 'portal-base/common/utils/style/global.less'
import './style.less'

import React from 'react'
import ReactDOM from 'react-dom'

import App from 'components/App'

// 渲染 APP
const rootEl = document.getElementById('main-view-wrapper')
ReactDOM.render(
  <App />,
  rootEl
)
