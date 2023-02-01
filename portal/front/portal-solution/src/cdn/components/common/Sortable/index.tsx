/**
 * @file Sortable Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { SortableHandle } from 'react-sortable-hoc'

import MoveSvg from './images/move.svg'

import './style.less'

export { SortableElement, SortableContainer, arrayMove, SortEnd } from 'react-sortable-hoc'

export const SortDragHandle = SortableHandle(() => (
  <div className="comp-handle-move"><MoveSvg className="icon-move" /></div>
))
