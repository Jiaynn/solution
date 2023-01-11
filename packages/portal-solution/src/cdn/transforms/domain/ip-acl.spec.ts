import { validateHumanizeFN } from 'cdn/test/utils'

import { ipACLTypeTextMap } from 'cdn/constants/domain'
import { humanizeIpACLType } from './ip-acl'

it('humanizeIpACLType works correctly', () => {
  validateHumanizeFN(humanizeIpACLType, ipACLTypeTextMap)
  expect(humanizeIpACLType('other')).toBe('未知')
})
