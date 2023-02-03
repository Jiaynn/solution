/*
 * @file component PageWithBreadcrumb
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import Page from 'portal-base/common/components/Page'

import Breadcrumb from '../Breadcrumb'

export interface IPageWithBreadcrumb {
  sideItems?: React.ReactNode
}

export default function PageWithBreadcrumb({ children, ...restProps }: React.PropsWithChildren<IPageWithBreadcrumb>) {
  return (
    <Page className="comp-page-wrapper" header={<Breadcrumb {...restProps} />}>
      <div className="comp-page-content">
        {children}
      </div>
    </Page>
  )
}
