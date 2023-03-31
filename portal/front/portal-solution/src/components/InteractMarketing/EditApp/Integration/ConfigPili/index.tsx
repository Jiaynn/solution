import { observer } from 'mobx-react'
import React from 'react'
import { Alert } from 'react-icecream'

import HubRadioList from './HubRadioList'
import PiliDomainRadioList from './PiliDomainRadioList'

const ConfigPili: React.FC<{}> = observer(() => (
  <>
    <Alert message="直播服务相关配置" showIcon />
    <HubRadioList />
    <PiliDomainRadioList />
  </>
))

export default ConfigPili
