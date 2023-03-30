import { observer } from 'mobx-react-lite'
import { withQueryParams } from 'qn-fe-core/utils'
import React from 'react'
import { Button } from 'react-icecream'

const BtnToBucketSetting: React.FC<{ bucketName: string }> = observer(props => {
  const { bucketName } = props

  const toBucketSetting = () => {
    window.open(
      withQueryParams('https://portal.qiniu.com/kodo/bucket/setting', {
        bucketName
      }),
      '_blank'
    )
  }

  return (
    <Button type="link" onClick={toBucketSetting}>
      空间设置
    </Button>
  )
})

export default BtnToBucketSetting
