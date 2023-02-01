/**
 * @file OEM env component wrapper
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

import { isOEM } from 'cdn/constants/env'

export default function OEMDisabled({ children }: React.PropsWithChildren<{}>) {
  if (isOEM) {
    return null
  }
  return <>{children}</>
}
