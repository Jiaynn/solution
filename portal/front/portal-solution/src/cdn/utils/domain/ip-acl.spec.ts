/**
 * @file local ip address test case
 */

import { isLocalIp } from './ip-acl'

describe('isLocalIp', () => {
  it('should work correctly', () => {
    expect(isLocalIp('127.0.0.1')).toBeTruthy()
    expect(isLocalIp('127.0.0.1/24')).toBeTruthy()
    expect(isLocalIp('0.0.0.0')).toBeTruthy()

    expect(isLocalIp('89.129.74.80')).toBeFalsy()

    expect(isLocalIp('fc00::1')).toBeTruthy()
    expect(isLocalIp('fe80::1')).toBeTruthy()
  })
})
