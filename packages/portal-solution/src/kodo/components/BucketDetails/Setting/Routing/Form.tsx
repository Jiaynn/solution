import * as React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { Button, DrawerForm, Select, SelectOption as Option, Divider, Alert, Form, FormFooter, Tooltip } from 'react-icecream-2'
import { TextInput, FormItem, Select as SelectX, Switch, Radio, RadioGroup, useFormstateX, NumberInput } from 'react-icecream-2/form-x'
import { FormState, FieldState } from 'formstate-x'
import { RemoveCircleThinIcon, AddThinIcon, FileIcon } from 'react-icecream-2/icons'

import { validateURL } from 'kodo/utils/url'

import docStyles from 'kodo/styles/card.m.less'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { KeyType, RoutingRule } from 'kodo/apis/bucket/setting/routing'
import styles from './style.m.less'

export enum ConditionType {
  Code = 'code',
  Prefix = 'prefix',
  Suffix = 'suffix'
}

const conditionTypesList = [ConditionType.Code, ConditionType.Prefix, ConditionType.Suffix]

enum SchemeType {
  Https = 'https',
  Http = 'http',
  Default = ''
}

const redirectCode = [301, 302, 307]

const TypePlaceholder = {
  [ConditionType.Code]: 'HTTP 状态码',
  [ConditionType.Prefix]: '文件名前缀',
  [ConditionType.Suffix]: '文件名后缀'
}
interface Props {
  visible: boolean
  onCancel: () => void
  onSubmit: (form: Form) => void
  isEdit: boolean
  existedData: RoutingRule
  loading: boolean
}

export type Form = FormState<{
  condition: FormState<{
    code: FieldState<number>,
    prefix: FieldState<string>,
    suffix: FieldState<string>,
    types: FieldState<ConditionType[]>
  }>,
  redirect: FormState<{
    host: FieldState<string>,
    code: FieldState<number>,
    scheme: FieldState<string>,
    retain_query: FieldState<boolean>,
    key_type: FieldState<KeyType>,
  }>,
  append: FormState<{
    prefix: FieldState<string>,
    suffix: FieldState<string>,
  }>,
  replace: FormState<{
    replace_blank_prefix: FieldState<boolean>,
    prefix: FieldState<string>,
    replace_blank_suffix: FieldState<boolean>,
    suffix: FieldState<string>
  }>,
  path: FormState<{
    fileName: FieldState<string>
  }>
}>

const validateNotEmpty = (val: string) => val === '' && '不能为空'
const validateHost = (val: string) => {
  if (!val || !val.trim()) {
    return '不能为空'
  }

  if (/\s/.test(val)) {
    return '域名不能有空格等空白符'
  }

  if (/^https?:\/\//i.test(val)) {
    return '请勿输入 http(s) 协议头'
  }
  // eslint-disable-next-line no-useless-escape
  if (!/^[a-zA-z0-9\.\+\-:]+$/.test(val)) {
    return '请勿输入字母数字 + - . : 外的字符'
  }
  // eslint-disable-next-line no-useless-escape
  if (/[\/\\\^`]/g.test(val)) {
    return '请勿输入字母数字 + - . : 外的字符'
  }
  return validateURL(val, {
    allowPort: true,
    allowHash: false,
    allowSearch: false,
    ignoreProtocol: true
  })
}
const validateTooLong = (limit: number, ...vals: string[]) => {
  if (vals.some(val => new Blob([val]).size > limit)) {
    return '不能超过 ' + limit.toString() + ' 个字节'
  }
}
export const getValueFromForm = (form: Form): RoutingRule => {
  const { condition, redirect, append, replace, path } = form.$
  const conditionTypes = condition.$.types.value
  const value = {
    condition: {
      code: conditionTypes.includes(ConditionType.Code) ? condition.$.code.value : 0,
      prefix: conditionTypes.includes(ConditionType.Prefix) ? condition.$.prefix.value : '',
      suffix: conditionTypes.includes(ConditionType.Suffix) ? condition.$.suffix.value : ''
    },
    redirect: {
      host: redirect.$.host.value,
      scheme: redirect.$.scheme.value,
      code: redirect.$.code.value,
      key_type: redirect.$.key_type.value,
      retain_query: redirect.$.retain_query.value
    }
  }
  if (redirect.$.key_type.value === KeyType.Append) {
    Object.assign(value.redirect, {
      prefix: append.$.prefix.value,
      suffix: append.$.suffix.value
    })
  }
  if (redirect.$.key_type.value === KeyType.Replace && conditionTypes.includes(ConditionType.Prefix)) {
    Object.assign(value.redirect, {
      prefix: replace.$.prefix.value,
      replace_blank_prefix: replace.$.replace_blank_prefix.value
    })
  }
  if (redirect.$.key_type.value === KeyType.Replace && conditionTypes.includes(ConditionType.Suffix)) {
    Object.assign(value.redirect, {
      suffix: replace.$.suffix.value,
      replace_blank_suffix: replace.$.replace_blank_suffix.value
    })
  }
  if (redirect.$.key_type.value === KeyType.Fix) {
    Object.assign(value.redirect, {
      path: path.$.fileName.value
    })
  }
  return value
}
const createFormState = (isEdit: Boolean, rule: RoutingRule) => {
  const initialRule = {
    condition: {
      code: 404,
      prefix: '',
      suffix: '',
      types: [ConditionType.Code]
    },
    redirect: {
      host: '',
      code: 301,
      scheme: '',
      retain_query: false,
      key_type: KeyType.Default,
      path: '',
      prefix: '',
      suffix: '',
      replace_blank_prefix: false,
      replace_blank_suffix: false
    }
  }

  const condition = new FormState({
    code: new FieldState(initialRule.condition.code),
    prefix: new FieldState(initialRule.condition.prefix)
      .validators(validateNotEmpty, val => validateTooLong(250, val)),
    suffix: new FieldState(initialRule.condition.suffix)
      .validators(validateNotEmpty, val => validateTooLong(250, val)),
    types: new FieldState(initialRule.condition.types)
  })
  const redirect = new FormState({
    host: new FieldState(initialRule.redirect.host).validators(validateNotEmpty, validateHost),
    code: new FieldState(initialRule.redirect.code),
    scheme: new FieldState(initialRule.redirect.scheme),
    retain_query: new FieldState(initialRule.redirect.retain_query),
    key_type: new FieldState(initialRule.redirect.key_type)
  })
  const append = new FormState({
    prefix: new FieldState(initialRule.redirect.prefix),
    suffix: new FieldState(initialRule.redirect.suffix)
  })
  const replace = new FormState({
    prefix: new FieldState(initialRule.redirect.prefix),
    suffix: new FieldState(initialRule.redirect.suffix),
    replace_blank_prefix: new FieldState(initialRule.redirect.replace_blank_prefix),
    replace_blank_suffix: new FieldState(initialRule.redirect.replace_blank_suffix)
  })
  const path = new FormState({
    fileName: new FieldState(initialRule.redirect.path).validators(val => validateTooLong(750, val))
  })

  condition.$.code.validators(val => {
    if (val === null) {
      return '不能为空'
    }
    if (val < 400 || val > 499) {
      return '只允许设置 4xx'
    }
  })
  append.$.prefix.validators(val => {
    if (val === '' && append.$.suffix.value === '') {
      return '添加前缀、后缀，不能均为空'
    }
    return validateTooLong(250, val)
  })
  append.$.suffix.validators(val => {
    if (val === '' && append.$.prefix.value === '') {
      return '添加前缀、后缀，不能均为空'
    }
    return validateTooLong(250, val)
  })
  replace.$.prefix.validators(val => {
    if (condition.$.types.value.includes(ConditionType.Prefix)
    && condition.$.types.value.includes(ConditionType.Suffix)
    && !replace.$.replace_blank_prefix.value
    && !replace.$.replace_blank_suffix.value
    && val === ''
    && replace.$.suffix.value === '') {
      return '替换前缀、后缀，不能均为空'
    }
    if (condition.$.types.value.includes(ConditionType.Prefix)
    && !condition.$.types.value.includes(ConditionType.Suffix)
    && !replace.$.replace_blank_prefix.value
    && val === '') {
      return '不能为空'
    }
    return validateTooLong(250, val)
  })
  replace.$.suffix.validators(val => {
    if (condition.$.types.value.includes(ConditionType.Prefix)
    && condition.$.types.value.includes(ConditionType.Suffix)
    && !replace.$.replace_blank_prefix.value
    && !replace.$.replace_blank_suffix.value
    && val === ''
    && replace.$.prefix.value === '') {
      return '替换前缀、后缀，不能均为空'
    }
    if (!condition.$.types.value.includes(ConditionType.Prefix)
    && condition.$.types.value.includes(ConditionType.Suffix)
    && !replace.$.replace_blank_suffix.value
    && val === '') {
      return '不能为空'
    }
    return validateTooLong(250, val)
  })

  condition.$.code.disableValidationWhen(() => !condition.$.types.value.includes(ConditionType.Code))
  condition.$.prefix.disableValidationWhen(() => !condition.$.types.value.includes(ConditionType.Prefix))
  condition.$.suffix.disableValidationWhen(() => !condition.$.types.value.includes(ConditionType.Suffix))
  replace.disableValidationWhen(() => redirect.$.key_type.value !== KeyType.Replace)
  append.disableValidationWhen(() => redirect.$.key_type.value !== KeyType.Append)

  if (isEdit && rule) {
    condition.$.code.set(rule.condition.code || 404)
    condition.$.prefix.set(rule.condition.prefix || '')
    condition.$.suffix.set(rule.condition.suffix || '')
    const types = Array<ConditionType>()
    if (rule.condition.code !== 0) {
      types.push(ConditionType.Code)
    }
    if (rule.condition.prefix !== '') {
      types.push(ConditionType.Prefix)
    }
    if (rule.condition.suffix !== '') {
      types.push(ConditionType.Suffix)
    }
    condition.$.types.set(types)

    redirect.$.code.set(rule.redirect.code)
    redirect.$.host.set(rule.redirect.host)
    redirect.$.key_type.set(rule.redirect.key_type)
    redirect.$.retain_query.set(rule.redirect.retain_query)
    redirect.$.scheme.set(rule.redirect.scheme)

    if (rule.redirect.key_type === KeyType.Append) {
      append.$.prefix.set(rule.redirect.prefix!)
      append.$.suffix.set(rule.redirect.suffix!)
    }
    if (rule.redirect.key_type === KeyType.Fix) {
      path.$.fileName.set(rule.redirect.path!)
    }
    if (rule.redirect.key_type === KeyType.Replace) {
      replace.$.prefix.set(rule.redirect.prefix!)
      replace.$.suffix.set(rule.redirect.suffix!)
      replace.$.replace_blank_prefix.set(rule.redirect.replace_blank_prefix!)
      replace.$.replace_blank_suffix.set(rule.redirect.replace_blank_suffix!)
    }
  }

  const formState = new FormState({
    condition,
    redirect,
    append,
    replace,
    path
  })

  // 触发条件变化后，前后缀替换选项和表单跟随变化
  const reactionDispose1 = reaction(
    () => condition.$.types.value,
    types => {
      if (!types.includes(ConditionType.Prefix)
      && !types.includes(ConditionType.Suffix)
      && redirect.$.key_type.value === KeyType.Replace) {
        redirect.$.key_type.reset()
        replace.reset()
      }
    }
  )
  // 切换 KeyType 时重置部分表单
  const reactionDispose2 = reaction(
    () => redirect.$.key_type.value,
    (_, prevKeyType) => {
      if (prevKeyType === KeyType.Replace) replace.reset()
      if (prevKeyType === KeyType.Append) append.reset()
      if (prevKeyType === KeyType.Fix) path.reset()
    }
  )
  // 处理替换和截取删除的切换，切换到截取删除则清空替换内容
  const reactionDispose3 = reaction(
    () => [replace.$.replace_blank_prefix.value, replace.$.replace_blank_suffix.value],
    ([replaceBlankPrefix, replaceBlankSuffix]) => {
      if (replaceBlankPrefix) replace.$.prefix.reset()
      if (replaceBlankSuffix) replace.$.suffix.reset()
    }
  )
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reactionDispose1)
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reactionDispose2)
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reactionDispose3)
  return formState
}
const RoutingForm = observer(function _RoutingForm(props: Props) {
  const { isEdit, existedData, loading, visible, onCancel, onSubmit } = props

  const form = useFormstateX(createFormState, [isEdit, existedData])

  // 处理表单取消
  const handleCancel = () => {
    form.reset()
    form.$.condition.$.types.set([ConditionType.Code])
    onCancel()
  }
  // 处理触发条件变动
  const handleConditionTypeChange = (type: ConditionType, idx: number) => {
    const condition = form.$.condition
    const conditionTypes = condition.$.types.value

    condition.$[conditionTypes[idx]].reset()
    if (conditionTypes[idx] === ConditionType.Prefix) {
      form.$.replace.$.prefix.reset()
      form.$.replace.$.replace_blank_prefix.reset()
    }
    if (conditionTypes[idx] === ConditionType.Suffix) {
      form.$.replace.$.suffix.reset()
      form.$.replace.$.replace_blank_suffix.reset()
    }

    conditionTypes[idx] = type
    condition.$.types.onChange([...conditionTypes])
  }
  // 增加触发条件，保证唯一
  const handleAddCondition = () => {
    const typesField = form.$.condition.$.types
    for (const t of conditionTypesList) {
      if (!typesField.value.some(val => val === t)) {
        typesField.onChange([...typesField.value, t])
        break
      }
    }
  }
  // 删除触发条件
  const handleRemoveCondition = (idx: number) => {
    const condition = form.$.condition
    const conditionTypes = condition.$.types.value

    condition.$[conditionTypes[idx]].reset()
    if (conditionTypes[idx] === ConditionType.Prefix) {
      form.$.replace.$.prefix.reset()
      form.$.replace.$.replace_blank_prefix.reset()
    }
    if (conditionTypes[idx] === ConditionType.Suffix) {
      form.$.replace.$.suffix.reset()
      form.$.replace.$.replace_blank_suffix.reset()
    }
    conditionTypes.splice(idx, 1)
    condition.$.types.onChange([...conditionTypes])
  }

  // 触发条件输入框
  const conditionItem = (type:ConditionType, idx: number) => (
    <div className={styles.group} key={'condition_' + idx}>
      <Select
        className={styles.select}
        value={type}
        onChange={(val: ConditionType) => { handleConditionTypeChange(val, idx) }}
      >
        {conditionTypesList.map(val => {
          if (form.$.condition.$.types.value.includes(val) && val !== type) return
          return (
            <Option key={val} value={val}>{TypePlaceholder[val]}</Option>
          )
        })}
      </Select>

      <FormItem state={form.$.condition.$[type]}>
        {type !== ConditionType.Code
         && <TextInput
           className={styles.input}
           placeholder={'请输入' + TypePlaceholder[type]}
           state={form.$.condition.$[type]}
         />}
        {type === ConditionType.Code
        && <NumberInput
          className={styles.input}
          placeholder={'请输入 4xx ' + TypePlaceholder[type]}
          state={form.$.condition.$[type]}
        />}
      </FormItem>

      {form.$.condition.$.types.value.length > 1
        && <div className={styles.icon} onClick={() => { handleRemoveCondition(idx) }}><RemoveCircleThinIcon /></div>}
    </div>
  )
  // 指定地址模式输入框
  const keyTypeInput = () => {
    const { append, replace, path, redirect, condition } = form.$
    const keyType = redirect.$.key_type.value
    const conditionTypes = condition.$.types.value
    if (keyType === KeyType.Append) {
      return (
        <div className={styles.keyTypeInputGroup}>
          <FormItem state={append.$.prefix} label="添加前缀">
            <TextInput state={append.$.prefix} className={styles.appendInput} placeholder="请输入前缀（后缀不为空时，可选）" />
          </FormItem>
          <FormItem state={append.$.suffix} label="添加后缀">
            <TextInput state={append.$.suffix} className={styles.appendInput} placeholder="请输入后缀（前缀不为空时，可选）" />
          </FormItem>
        </div>
      )
    }

    if (keyType === KeyType.Fix) {
      return (
        <div className={styles.keyTypeInputGroup}>
          <FormItem state={path.$.fileName} label="文件名">
            <TextInput state={path.$.fileName} className={styles.fixInput} placeholder="请输入文件名（可选）" />
          </FormItem>
        </div>
      )
    }

    if (keyType === KeyType.Replace) {
      return (
        <div className={styles.keyTypeInputGroup}>
          <div className={styles.replaceGroup}>
            {conditionTypes.includes(ConditionType.Prefix) && <FormItem label="前缀" className={styles.radio}>
              <RadioGroup state={replace.$.replace_blank_prefix}>
                <Radio key="delete_prefix" value>截取删除</Radio>
                <Radio key="replace_prefix" value={false}>替换</Radio>
              </RadioGroup>
            </FormItem>}
            {conditionTypes.includes(ConditionType.Prefix)
            && !replace.$.replace_blank_prefix.value
            && <FormItem className={styles.replaceItem} state={replace.$.prefix}>
              <TextInput
                state={replace.$.prefix}
                placeholder="请输入替换前缀"
                className={styles.replaceInput}
              />
            </FormItem>}

            {conditionTypes.includes(ConditionType.Suffix) && <FormItem label="后缀" className={styles.radio}>
              <RadioGroup state={replace.$.replace_blank_suffix}>
                <Radio key="delete_suffix" value>截取删除</Radio>
                <Radio key="replace_suffix" value={false}>替换</Radio>
              </RadioGroup>
            </FormItem>}
            {conditionTypes.includes(ConditionType.Suffix)
            && !replace.$.replace_blank_suffix.value
            && <FormItem className={styles.replaceItem} state={replace.$.suffix}>
              <TextInput
                state={replace.$.suffix}
                placeholder="请输入替换后缀"
                className={styles.replaceInput}
              />
            </FormItem>}
          </div>
        </div>
      )
    }
  }
  // 提示文案
  const alertMsg = () => {
    const { condition, redirect, append, replace, path } = form.$
    const example = (
      <>
        http(s)://example.com/<span>{condition.$.prefix.value}</span>image.jpg<span>{condition.$.suffix.value}</span>
      </>
    )
    let result = (
      <>
        <span>{condition.$.prefix.value}</span>
        image.jpg<span>{condition.$.suffix.value}</span>
      </>
    )

    if (redirect.$.key_type.value === KeyType.Append) {
      result = (
        <>
          <span>{append.$.prefix.value + condition.$.prefix.value}</span>
          image.jpg<span>{condition.$.suffix.value + append.$.suffix.value}</span>
        </>
      )
    }
    if (redirect.$.key_type.value === KeyType.Replace) {
      const prefix = replace.$.prefix.value === '' ? condition.$.prefix.value : replace.$.prefix.value
      const suffix = replace.$.suffix.value === '' ? condition.$.suffix.value : replace.$.suffix.value
      result = (
        <>
          <span>
            {replace.$.replace_blank_prefix.value ? '' : prefix}
          </span>
          image.jpg
          <span>
            {replace.$.replace_blank_suffix.value ? '' : suffix}
          </span>
        </>
      )
    }
    if (redirect.$.key_type.value === KeyType.Fix) {
      result = (
        <>
          <span>{path.$.fileName.value}</span>
        </>
      )
    }

    return (
      <div>访问链接示例<br />
        访问地址：<br />
        {example}<br />
        重定向跳转至：<br />
        <span>{form.$.redirect.$.scheme.value || 'http(s)'}</span>
        ://<span>{redirect.$.host.value || '指定域名'}</span>/{result}
      </div>
    )
  }

  return (
    <DrawerForm
      title={
        <div>
          {props.isEdit ? '编辑重定向规则' : '新增重定向规则'}
          <Tooltip title="文档">
            <HelpDocLink doc="routingRuleSetting" className={docStyles.extraButton}>
              <span className={styles.fileIcon}>
                <FileIcon />
              </span>
            </HelpDocLink>
          </Tooltip>
        </div>
      }
      visible={visible}
      onCancel={handleCancel}
      onSubmit={() => { onSubmit(form) }}
      footer={
        <FormFooter
          submitButtonProps={{ loading }}
        />
      }
      width={594}
      layout="horizontal"
    >
      <div className={styles.formLabel}>触发条件</div>
      <FormItem
        className={styles.condition}
        state={form.$.condition}
      >
        {form.$.condition.$.types.value.map((type, idx) => conditionItem(type, idx))}
      </FormItem>
      <div className={form.$.condition.$.types.value.length > 1 ? styles.conditionFooter : ''}>
        <Button
          type="default"
          className={styles.addConditionBtn}
          icon={<AddThinIcon />}
          onClick={handleAddCondition}
          disabled={form.$.condition.$.types.value.length === 3}
        >
          添加条件
        </Button>
        <span>{form.$.condition.$.types.value.length}/3</span>
      </div>
      <Divider />
      <div className={styles.formLabel}>跳转规则</div>
      <FormItem className={styles.redirectLabel} label="指定域名" state={form.$.redirect.$.host} required>
        <TextInput className={styles.redirectInput} state={form.$.redirect.$.host} placeholder="请输入指定域名" />
      </FormItem>
      <FormItem state={form.$.redirect.$.key_type} className={styles.redirectLabel} label="指定地址">
        <SelectX
          state={form.$.redirect.$.key_type}
          className={styles.redirectInput}
        >
          <Option key="default" value={KeyType.Default}>使用原文件名</Option>
          <Option key="append" value={KeyType.Append}>添加文件名前后缀</Option>
          <Option key="fix" value={KeyType.Fix}>替换为固定文件名</Option>
          {/* 选项需要跟随触发条件 */}
          {form.$.condition.$.types.value.includes(ConditionType.Prefix)
          && form.$.condition.$.types.value.includes(ConditionType.Suffix)
          && <Option key="replace" value={KeyType.Replace}>替换文件名前后缀</Option>}
          {form.$.condition.$.types.value.includes(ConditionType.Prefix)
          && !form.$.condition.$.types.value.includes(ConditionType.Suffix)
          && <Option key="replace" value={KeyType.Replace}>替换文件名前缀</Option>}
          {!form.$.condition.$.types.value.includes(ConditionType.Prefix)
          && form.$.condition.$.types.value.includes(ConditionType.Suffix)
          && <Option key="replace" value={KeyType.Replace}>替换文件名后缀</Option>}
        </SelectX>
      </FormItem>
      {keyTypeInput()}
      <FormItem label="指定协议" className={styles.redirectLabel}>
        <div className={styles.radioGroup}>
          <RadioGroup state={form.$.redirect.$.scheme}>
            <Radio key="default" value={SchemeType.Default}>跟随请求协议</Radio>
            <Radio key="HTTP" value={SchemeType.Http}>强制 HTTP</Radio>
            <Radio key="HTTPS" value={SchemeType.Https}>强制 HTTPS</Radio>
          </RadioGroup>
        </div>
      </FormItem>
      <Alert className={styles.alert}
        message={alertMsg()}
      />
      <FormItem state={form.$.redirect.$.retain_query} label="URL 参数保留">
        <div className={styles.switch}>
          <Switch checkedChildren="开启" unCheckedChildren="关闭" state={form.$.redirect.$.retain_query} />
        </div>
      </FormItem>
      <FormItem state={form.$.redirect.$.code} label="响应状态码">
        <SelectX
          className={styles.redirectCode}
          state={form.$.redirect.$.code}
        >
          {redirectCode.map(code => <Option key={code} value={code}>{code}</Option>)}
        </SelectX>
      </FormItem>
    </DrawerForm>
  )
})

export default RoutingForm
