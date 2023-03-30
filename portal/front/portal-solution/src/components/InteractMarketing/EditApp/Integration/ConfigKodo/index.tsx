import { observer } from 'mobx-react'
import React from 'react'
import { Alert } from 'react-icecream'

import BucketRadioList from './BucketRadioList'
import AddrRadioList from './AddrRadioList'
import CallbackInput from './CallbackInput'

const ConfigKodo: React.FC<{}> = observer(() => (
  <>
    <Alert message="安全审核服务配置" showIcon />
    <BucketRadioList />
    <AddrRadioList />
    <CallbackInput />
  </>
))

export default ConfigKodo
