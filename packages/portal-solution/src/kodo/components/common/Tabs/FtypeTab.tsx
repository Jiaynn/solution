/**
 * @file component FtypeTab 存储类型切换 Tab
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Radio } from 'react-icecream/lib'
import { useInjection } from 'qn-fe-core/di'
import { RadioChangeEvent } from 'react-icecream/lib/radio'
import { storageTypeNameMap } from 'kodo-base/lib/constants'

import { ConfigStore } from 'kodo/stores/config'

import { StorageType } from 'kodo/constants/statistics'

export interface IProps {
  onChange(value: StorageType): void
  value: StorageType
}

export default observer(
  function FtypeTab(props: IProps): React.ReactElement<IProps> {
    const configStore = useInjection(ConfigStore)

    return (
      <Radio.Group
        buttonStyle="solid"
        onChange={(e: RadioChangeEvent) => props.onChange(e.target.value)}
        value={props.value}
      >
        {configStore.supportedStorageTypes.map(type => (
          <Radio.Button key={type} value={type}>
            {storageTypeNameMap[type]}
          </Radio.Button>
        ))}
      </Radio.Group>
    )
  }
)
