/**
 * @file cover loading
 * @author linchen <gakiclin@gmail.com>
 * @description 撑满父容器并居中
 */

import React from 'react'
import { Loading, LoadingProps } from 'react-icecream-2'

export default function CoverLoading(props: LoadingProps) {
  return (
    <Loading {...props} style={{ height: '100%', flex: 1, ...props.style }} />
  )
}
