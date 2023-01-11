import React from 'react'

// 给传入的列表，每两项间添加一个带 key 的 <hr />
export function addHr(items: JSX.Element[]) {
  return items.filter(
    item => item != null
  ).reduce((current, item, index) => {
    if (index > 0) {
      current.push(<hr className="sep-line" key={`hr-${index}`} />)
    }
    current.push(item)
    return current
  }, [] as JSX.Element[])
}
