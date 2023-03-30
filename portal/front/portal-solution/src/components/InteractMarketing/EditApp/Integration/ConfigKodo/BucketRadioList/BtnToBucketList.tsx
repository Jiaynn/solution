import { observer } from 'mobx-react-lite'
import React from 'react'
import { Button } from 'react-icecream'

const BtnToBucketList: React.FC<{}> = observer(() => {
  const toBucketList = () => {
    window.open('https://portal.qiniu.com/kodo/bucket', '_blank')
  }
  return (
    <Button type="link" onClick={toBucketList}>
      查看空间列表
    </Button>
  )
})

export default BtnToBucketList
