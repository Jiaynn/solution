/*
 * @file Breadcrumb for app
 * @author nighca <nighca@live.cn>
 */

import React from 'react'

import BaseBreadCrumb from 'portal-base/common/components/Breadcrumb'

import './style.less'

interface IBreadcrumbProps {
  sideItems?: React.ReactNode
}

export default function Breadcrumb(props: IBreadcrumbProps) {
  const { sideItems } = props

  return (
    <div className="comp-breadcrumb-wrapper">
      <BaseBreadCrumb />
      { sideItems && <div className="breadcrumb-side-items">{sideItems}</div> }
    </div>
  )
}
