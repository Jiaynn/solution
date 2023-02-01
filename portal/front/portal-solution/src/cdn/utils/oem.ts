import { InternalOptions, withHeader } from 'qn-fe-core/client'

import { isOEM, oemVendor } from 'cdn/constants/env'

export function withOemVendor(options: InternalOptions) {
  if (isOEM) {
    return {
      ...options,
      headers: withHeader(options.headers, 'X-Fusion-Vendor', String(oemVendor), true)
    }
  }

  return options
}
