/**
 * @file mock cert info
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { ICertInfo } from 'portal-base/certificate'

export default function mockCertInfo(): ICertInfo {
  return {
    certid: '5a950896f2c5932aaf00142c',
    name: '*.qiniu.com-20180227',
    common_name: '*.qiniu.com',
    dnsnames: ['*.qiniu.com', 'qiniu.com'],
    pri: '',
    ca: '',
    create_time: 1519716502,
    not_before: 1517529600,
    not_after: 1595246400,
    orderid: '',
    product_short_name: '',
    product_type: '',
    encrypt: 'RSA',
    enable: true
  }
}
