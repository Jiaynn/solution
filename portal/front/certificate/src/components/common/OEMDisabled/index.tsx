/**
 * @file OEM env component wrapper
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

import { isOEM } from '../../../constants/env'

export default function OEMDisabled(props: React.PropsWithChildren<{}>) {
  const { children } = props
  if (isOEM) {
    return null
  }
  return <>{children}</>
}
