import { IContainer, mergeProvides, Provides } from 'qn-fe-core/di'
import { createContainer as createBaseContainer } from 'portal-base/common/utils/test'

import { cdnProvides, dcdnProvides, oemProvides } from 'cdn/components/App/BootProvider'

export function createContainer(provides?: Provides): IContainer {
  return createBaseContainer(mergeProvides(cdnProvides, provides))
}

export function createDcdnContainer(provides?: Provides): IContainer {
  return createBaseContainer(mergeProvides(dcdnProvides, provides))
}

export function createOemContainer(provides?: Provides): IContainer {
  return createBaseContainer(mergeProvides(oemProvides, provides))
}
