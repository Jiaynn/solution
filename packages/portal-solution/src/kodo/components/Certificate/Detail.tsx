/**
 * @file Certificate Detail
 * @description 证书详情
 * @author hovenjay <hovenjay@outlook.com>
 */

import * as React from 'react'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import { ICertificate } from 'kodo/apis/certificate'
import styles from './style.m.less'

export default function Detail(props: ICertificate) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { certid, name, not_after, not_before, common_name, dnsnames, create_time } = props

  const [
    beforeDateTime,
    afterDateTime,
    createDateTime
  ] = [not_before, not_after, create_time].map(val => humanizeTimestamp(val * 1000))

  return (
    <ul className={styles.dnsNames}>
      <li>证书 ID：{certid}</li>
      <li>证书名称：{name}</li>
      <li>通用名称：{common_name || '未指定'}</li>
      <li>上传时间：{createDateTime}</li>
      <li>生效时间：{beforeDateTime} ~ {afterDateTime}</li>
      <li>
        多域名（DNS Names）：{
          Array.isArray(dnsnames) && dnsnames.length > 0
            ? (<ul>{dnsnames.map((item, idx) => <li key={idx}>{item}</li>)}</ul>)
            : '未指定'
        }
      </li>
    </ul>
  )
}
