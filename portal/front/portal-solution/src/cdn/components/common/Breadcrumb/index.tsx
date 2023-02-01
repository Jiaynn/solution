/**
 * @file Breadcrumb for app
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import BaseBreadCrumb from 'portal-base/common/components/Breadcrumb'

import './style.less'

export default observer(function Breadcrumb() {
  return (
    <BaseBreadCrumb
      className="comp-cdn-breadcrumb"
    />
  )
})
