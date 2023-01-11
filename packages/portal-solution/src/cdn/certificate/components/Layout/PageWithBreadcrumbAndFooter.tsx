/*
 * @file component PageWithBreadcrumbAndFooter
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import Page from 'portal-base/common/components/Page'

import Breadcrumb from '../Breadcrumb'
import { IPageWithBreadcrumb } from './PageWithBreadcrumb'

export interface IPageWithBreadcrumbAndFooter extends IPageWithBreadcrumb {
  footer: React.ReactNode
}

export default function PageWithBreadcrumbAndFooter(props: React.PropsWithChildren<IPageWithBreadcrumbAndFooter>) {
  return (
    <Page className="comp-page-wrapper has-footer" header={<Breadcrumb {...props} />}>
      <div className="comp-page-content">
        {props.children}
      </div>
      <div className="comp-page-footer">
        {props.footer}
      </div>
    </Page>
  )
}
