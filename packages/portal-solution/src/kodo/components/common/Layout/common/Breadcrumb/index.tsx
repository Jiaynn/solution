/**
 * @file componnet Breadcrumb
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// TODO: merge; copy from:
// https://github.com/qbox/portal-base/blob/master/common/components/Breadcrumb/index.tsx

import * as React from 'react'
import { parse } from 'query-string'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Breadcrumb as IceBreadcrumb, BreadcrumbItem as IceBreadcrumbItem } from 'react-icecream-2'
import { Link, RouterStore } from 'portal-base/common/router'

import { getFirstQuery } from 'kodo/utils/url'

import { ConfigStore } from 'kodo/stores/config'
import styles from './style.m.less'

// TODO: 统一“返回”的语义（包括 BackButton 组件）
// TODO: hack 了一下空间设置页面的地址 https://github.com/qbox/portal-base/issues/371
function getHref(configStore: ConfigStore, routerStore: RouterStore, path?: string) {
  const appRootPath = configStore.rootPath
  const pattern = new RegExp(`^${appRootPath}/bucket/[^?#]`)
  if (path && pattern.test(path)) {
    const bucketName = parse(routerStore.location!.search).bucketName
    if (bucketName && getFirstQuery(bucketName)) {
      return `${path}?bucketName=${getFirstQuery(bucketName)}`
    }
  }

  return path
}

export interface Props {
  className?: string
}

function Breadcrumb({ className }: Props) {
  const configStore = useInjection(ConfigStore)
  const routerStore = useInjection(RouterStore)
  const items = routerStore.routes.filter(
    route => route.title
  ).map(
    ({ id, path, title }, index, array) => {
      const isLast = index === array.length - 1
      const linkProps = isLast
        ? {}
        : {
          href: getHref(configStore, routerStore, path),
          as: LinkAnchor
        }

      return (
        <IceBreadcrumbItem key={id} {...linkProps}>
          {title}
        </IceBreadcrumbItem>
      )
    }
  )

  return (
    <IceBreadcrumb className={[styles.compBreadcrumb, className].join(' ')}>{items}</IceBreadcrumb>
  )
}

function LinkAnchor({ href, ...restProps }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link to={href!} {...restProps} onClick={e => !href && e.preventDefault()} />
  )
}

export default observer(Breadcrumb)
