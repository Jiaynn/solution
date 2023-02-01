/**
 * @description Output component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { Collapse, CollapsePanel } from 'react-icecream-2'
import { Radio, RadioGroup } from 'react-icecream-2/form-x'

import { outputFormats, rawFormat } from './constants'

export type Props = {
  output: FieldState<string>
}

export default observer(function Output({ output }: Props) {
  return (
    <div>
      <Collapse defaultValue={['default']}>
        <CollapsePanel title="输出格式" value="default">
          <RadioGroup state={output}>
            <Radio value={rawFormat}>与原图一致</Radio>
            {outputFormats.map(format => (
              <Radio key={format} value={format}>
                {format.toUpperCase()}
              </Radio>
            ))}
          </RadioGroup>
        </CollapsePanel>
      </Collapse>
    </div>
  )
})
