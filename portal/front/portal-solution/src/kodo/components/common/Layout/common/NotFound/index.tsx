/**
 * @file 404
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Link } from 'portal-base/common/router'

import { GuestLayout } from '../../GuestLayout'
import style from './style.m.less'

export interface IProps {
  from?: string
}

export default observer(function NotFound({ from }: IProps) {
  const url = from && `${window.location.origin}${from}`

  return (
    <GuestLayout>
      <div className={style.main}>
        <h1 className={style.title}>404</h1>
        <h2 className={style.content}>该页面不存在。</h2>
        {url && (
          <p className={style.link}>
            来自: <Link to={from || ''} onClick={e => !from && e.preventDefault()}>{url}</Link>
          </p>
        )}
      </div>
    </GuestLayout>
  )
})
