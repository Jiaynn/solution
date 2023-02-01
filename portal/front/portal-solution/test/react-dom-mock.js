module.exports = {
  findDOMNode() {
    return { className: '' }
  },
  createPortal: node => node,
  unstable_renderSubtreeIntoContainer: () => undefined, // eslint-disable-line @typescript-eslint/naming-convention
  unmountComponentAtNode: () => undefined
}
