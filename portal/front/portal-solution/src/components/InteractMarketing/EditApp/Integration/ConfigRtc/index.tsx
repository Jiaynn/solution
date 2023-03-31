import { observer } from 'mobx-react'
import React from 'react'
import { Alert } from 'react-icecream'

import ImRadioList from './ImRadioList'
import RtcRadioList from './RtcRadioList'

const ConfigRtc: React.FC<{}> = observer(() => (
  <>
    <Alert message="RTC服务相关配置" showIcon />
    <RtcRadioList />
    <ImRadioList />
  </>
))

export default ConfigRtc
