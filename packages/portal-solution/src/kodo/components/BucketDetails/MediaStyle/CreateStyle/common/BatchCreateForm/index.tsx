import React from 'react'
import { runInAction } from 'mobx'
import { Observer, observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { FormItem, Select, TextInput } from 'react-icecream-2/form-x'
import { AddThinIcon, RemoveCircleThinIcon } from 'react-icecream-2/icons'
import { Table, Button, InputGroup, InputGroupItem, SelectOption, Divider } from 'react-icecream-2'

import Prompt from 'kodo/components/common/Prompt'

import FormSection from '../FormSection'

import styles from './style.m.less'

type BatchCreateStateItem<SFT extends string, NT extends string> = FormState<{
  name: FieldState<string>,
  nameSuffix: FieldState<NT>,
  sourceFormat: FieldState<SFT>
}>

type BatchCreateState<SFT extends string, NT extends string> = FormState<Array<BatchCreateStateItem<SFT, NT>>>

type Props<SFT extends string, NT extends string> = {
  title: string
  disabled: boolean
  sourceFormat: string
  sourceFormatList: SFT[]
  state: BatchCreateState<SFT, NT>
  description: string
  onAddNew: () => void
}

export default observer(function BatchCreateForm<SFT extends string, NT extends string>(props: Props<SFT, NT>) {
  const { title, state, sourceFormat, sourceFormatList, disabled, description, onAddNew } = props

  const filteredSourceFormatList = React.useMemo(() => (
    sourceFormatList.filter(item => (
      item !== sourceFormat
      && state.value.every(i => i.sourceFormat !== item)
    ))
  ), [sourceFormatList, sourceFormat, state.value])

  function handleRemoveRow(index: number) {
    runInAction(() => {
      state.$[index].dispose()
      state.$.splice(index, 1)
    })
  }

  function renderFooter() {
    if (!onAddNew) return

    return (
      <Button
        icon={<AddThinIcon />}
        type="dashed"
        onClick={() => onAddNew()}
        className={styles.createButton}
        disabled={disabled || filteredSourceFormatList.length === 0 || state.$.length === sourceFormatList.length - 1}
      >
        添加
      </Button>
    )
  }

  const tableData = state.$.length > 0 ? state.$ : []

  return (
    <div className={styles.root}>
      <Divider />
      <FormSection title={title}>
        <Prompt type="assist" className={styles.prompt}>
          {description}
        </Prompt>
        <Table<BatchCreateStateItem<SFT, NT>>
          border="none"
          pagination={false}
          records={tableData}
          className={styles.table}
          empty={<div className={styles.empty}>空数据</div>}
        >
          <Table.Column<BatchCreateStateItem<SFT, NT>>
            width="20%"
            title="源文件格式"
            render={(_, record) => (
              <Observer render={() => (
                <FormItem state={record.$.sourceFormat}>
                  <Select state={record.$.sourceFormat} placeholder="选择一个格式" disabled={disabled} searchable>
                    {[record.$.sourceFormat.value, ...filteredSourceFormatList].map(format => (
                      <SelectOption
                        key={format}
                        value={format}
                      >
                        {format}
                      </SelectOption>
                    ))}
                  </Select>
                </FormItem>
              )} />
            )}
          />
          <Table.Column<BatchCreateStateItem<SFT, NT>>
            title="样式名称"
            render={(_, record) => (
              <Observer render={() => (
                <FormItem state={record.$.name}>
                  <InputGroup>
                    <TextInput
                      state={record.$.name}
                      placeholder="请输入样式名"
                      disabled={disabled}
                    />
                    <InputGroupItem className={styles.nameSuffix}>
                      {
                        record.$.nameSuffix.value !== ''
                          ? '.' + record.$.nameSuffix.value
                          : '无后缀'
                      }
                    </InputGroupItem>
                  </InputGroup>
                </FormItem>
              )} />
            )}
          />
          <Table.Column
            title=""
            width="0px"
            render={(_, __, idx) => (
              <RemoveCircleThinIcon
                className={styles.removeIcon}
                onClick={() => handleRemoveRow(idx)}
              />
            )}
          />
        </Table>
        {renderFooter()}
      </FormSection>
    </div>
  )
})
