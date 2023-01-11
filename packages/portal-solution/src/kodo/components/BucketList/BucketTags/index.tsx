/**
 * @desc Bucket tags popover.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { useRef, useState } from 'react'
import { Icon, Popover } from 'react-icecream'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { valuesOf } from 'kodo/utils/ts'

import { isShared } from 'kodo/transforms/bucket/setting/authorization'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { TagApis, ITag } from 'kodo/apis/bucket/setting/tag'

import TagList from './TagList'

enum Loading {
  FetchTags = 'FetchTags'
}

interface BucketTagsProps {
  bucketName: string
  shareType: ShareType
}

const BucketTags = observer(
  ({ bucketName, shareType }: BucketTagsProps) => {
    const tagApis = useInjection(TagApis)
    const toasterStore = useInjection(Toaster)

    const [tags, setTags] = useState<ITag[]>([])
    const loadings = useRef(new Loadings(...valuesOf(Loading))).current
    const isSharedBucket = isShared(shareType)

    const handleVisibleChange = async visible => {
      if (visible && !isSharedBucket) {
        const req = tagApis.getTags(bucketName)
        toasterStore.promise(req)
        loadings.promise(Loading.FetchTags, req)
        const data = await req
        setTags(data)
      }
    }

    return (
      <Popover
        placement="right"
        content={
          isSharedBucket
            ? '授权空间，不支持查看空间的标签信息'
            : (
              <TagList
                tags={tags}
                bucketName={bucketName}
                loading={loadings.isLoading(Loading.FetchTags)}
              />
            )
        }
        onVisibleChange={handleVisibleChange}
      >
        <Icon type="tag" />
      </Popover>
    )
  }
)

export default BucketTags
