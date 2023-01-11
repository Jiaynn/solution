/**
 * @desc dom utils
 * @author yaojingtian <yaojingtian@qiniu.com>
 * @author Surmon <i@surmon.me>
 *
 */

// reference to https://github.com/yiminghe/dom-align/blob/master/src/utils.js#L39
export function getClientPosition(elem: HTMLElement): { left: number, top: number, bottom: number, right: number } {
  const doc = elem.ownerDocument!
  const body = doc.body
  const docElem = doc.documentElement
  // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
  const box = elem.getBoundingClientRect()
  const x = box.left - (docElem.clientLeft || body.clientLeft || 0)
  const y = box.top - (docElem.clientTop || body.clientTop || 0)

  return {
    left: x,
    top: y,
    bottom: body.offsetHeight - y - box.height,
    right: body.offsetWidth - x - box.width
  }
}

// TODO Improve: 应支持偏移值的传入
export function isElementInViewport(elem: Element): boolean {
  const rect = elem.getBoundingClientRect()
  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export function isHtmlElement(element: any): element is HTMLElement {
  if (element) {
    if (element instanceof HTMLElement) {
      if (element.nodeType === 1) {
        return true
      }
    }
  }
  return false
}
