/**
 * @file NoPermission
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'

import { observer } from 'mobx-react'

import style from './style.m.less'

export default observer(function NoPermission() {
  return (
    <div className={style.main}>
      <h1 className={style.title}>没有权限</h1>
    </div>
  )
})
