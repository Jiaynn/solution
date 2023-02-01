import { IContainer, mergeProvides, Provides } from 'qn-fe-core/di'
import { createContainer as createBaseContainer, RendererUtils as BaseRendererUtils } from 'portal-base/common/utils/test'

import { defaultProvides } from 'components/App/BootProvider'

export * from 'portal-base/common/utils/test'

const defaultProvidesForTest: Provides = [
  ...defaultProvides
]

export function createContainer(provides?: Provides): IContainer {
  return createBaseContainer(mergeProvides(defaultProvidesForTest, provides))
}

export class RendererUtils extends BaseRendererUtils {
  constructor() {
    super(defaultProvidesForTest)
  }
}
