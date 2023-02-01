/**
 * @file component Home
 * @author nighca <nighca@live.cn>
 */

import React from 'react'

import { Link } from 'portal-base/common/router'

export default function Home() {
  return (
    <div>
      <h3>Home</h3>
      <p><Link relative to="/hello">Hello Page</Link></p>
      <p><Link relative to="/user">user</Link></p>
    </div>
  )
}
