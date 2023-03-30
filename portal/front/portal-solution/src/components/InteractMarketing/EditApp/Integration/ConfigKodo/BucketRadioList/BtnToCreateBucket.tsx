import { observer } from 'mobx-react'
import React from 'react'
import { Button } from 'react-icecream'

const toCreateBucket = () => {
  window.open(
    'https://portal.qiniu.com/kodo/bucket?shouldCreateBucket=true',
    '_blank'
  )
}

const BtnToCreateBucket: React.FC<{}> = observer(() => (
  <Button type="link" onClick={toCreateBucket}>
    创建新空间
  </Button>
))

export default BtnToCreateBucket
