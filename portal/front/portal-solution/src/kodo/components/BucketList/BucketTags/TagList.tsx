/**
 * @desc Bucket tags list.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import { Spin, Tag } from 'react-icecream'
import { observer } from 'mobx-react'

import { Inject } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'

import { getSettingPath } from 'kodo/routes/bucket'

import { BucketSettingAnchor } from 'kodo/constants/bucket'

import { ITag } from 'kodo/apis/bucket/setting/tag'

import BucketTag from './BucketTag'
import EmptyTag from './EmptyTag'
import styles from './style.m.less'

interface BucketTagsProps {
  tags: ITag[]
  bucketName: string
  loading: boolean
}

const TagList = observer(
  ({ tags, bucketName, loading }: BucketTagsProps) => (
    <Inject render={({ inject }) => (
      <Spin spinning={loading}>
        <div className={styles.tagList}>
          {
            Array.isArray(tags) && tags.length > 0
              ? tags.map(tag => <BucketTag key={tag.Key} tag={tag} />)
              : <EmptyTag />
          }
          <Link to={getSettingPath(inject, { bucketName, anchor: BucketSettingAnchor.Tag })} rel="noopener noreferrer" target="_blank">
            <Tag color="blue6">
              设置
            </Tag>
          </Link>
        </div>
      </Spin>
    )} />
  )
)

export default TagList
