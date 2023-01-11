import { createMemoryHistory } from 'history'
import { mergeProvides, Provides } from 'qn-fe-core/di'
import { RendererUtils as BaseRendererUtils } from 'portal-base/common/utils/test'
import { RouterStore } from 'portal-base/common/router'

import { cdnProvides, dcdnProvides, oemProvides } from 'cdn/components/App/BootProvider'

export * from 'portal-base/common/utils/test'

export class RendererUtils extends BaseRendererUtils {
  constructor(provides?: Provides) {
    super(mergeProvides(cdnProvides, provides))
  }
}

export class DcdnRendererUtils extends BaseRendererUtils {
  constructor(provides?: Provides) {
    super(mergeProvides(dcdnProvides, provides))
  }
}

export class OemRendererUtils extends BaseRendererUtils {
  constructor(provides?: Provides) {
    super(mergeProvides(oemProvides, provides))
  }
}

export function createRendererWithRouter(path = '/', ga: { disable?: boolean, trackingId?: string } = { disable: true }, sensor: { disable?: boolean } = { disable: true }) {
  const routerStore = new RouterStore(
    createMemoryHistory({
      initialEntries: [path]
    }),
    window,
    window.location,
    window.history,
    { document: window.document },
    undefined,
    ga,
    sensor
  )

  routerStore.init()

  return new RendererUtils(
    [
      { identifier: RouterStore, value: routerStore }
    ]
  )
}

export function createDcdnRendererWithRouter(path = '/', ga: { disable?: boolean, trackingId?: string } = { disable: true }, sensor: { disable?: boolean } = { disable: true }) {
  const routerStore = new RouterStore(
    createMemoryHistory({
      initialEntries: [path]
    }),
    window,
    window.location,
    window.history,
    { document: window.document },
    undefined,
    ga,
    sensor
  )

  routerStore.init()

  return new DcdnRendererUtils(
    [
      { identifier: RouterStore, value: routerStore }
    ]
  )
}

export function createOemRendererWithRouter() {
  const routerStore = new RouterStore(
    createMemoryHistory(),
    window,
    window.location,
    window.history,
    { document: window.document },
    undefined,
    { disable: true },
    { disable: true }
  )

  return new OemRendererUtils(
    mergeProvides(
      [
        { identifier: RouterStore, value: routerStore }
      ]
    )
  )
}
