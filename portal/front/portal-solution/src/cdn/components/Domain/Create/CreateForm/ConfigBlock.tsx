/**
 * @file CreateForm Config Block
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'

import './style.less'

export interface Props {
  title: React.ReactNode
  children: React.ReactNode
}

export default function CreateFormConfigBlock({ title, children }: Props) {
  if (children == null) {
    return null
  }

  return (
    <section className="comp-create-domain-config-block">
      <p className="title">{title}</p>
      <div className="content">
        {children}
      </div>
    </section>
  )
}
