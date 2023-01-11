import React from 'react'
import { FieldState } from 'formstate-x'
import { Button, InputGroup, InputGroupItem } from 'react-icecream-2'
import { useFormstateX, TextInput, FormItem } from 'react-icecream-2/form-x'

import { Paragraph } from 'kodo-base/lib/components/common/Paragraph'
import { EditButton } from 'kodo-base/lib/components/common/EditButton'
import { validateFolderName } from 'kodo-base/lib/validators/validateObjectName'

import styles from './style.m.less'

interface Props {
  value: string
  onChange: (value: string) => void
}

type Mode = 'edit' | 'view'

function useFormState(value: string) {
  const field = new FieldState(value)
  field.validators(v => validateFolderName(undefined, v, true))
  return field
}

function FolderNameInputRules() {
  return (
    <span className={styles.uploadPathDesc}>
      <span>/</span> 用于分割路径，可快速创建子目录；目录不能包含连续的 <span>/</span> 且不可仅由英文句号 <span>.</span> 命名。
    </span>
  )
}

export function PathInput(props: Props) {
  const [mode, setMode] = React.useState<Mode>('view')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const formState = useFormstateX(useFormState, [props.value])

  const contentView = React.useMemo(() => {
    if (mode === 'view') {
      return (
        <Paragraph
          maxRows={1}
          ellipsisPosition="middle"
          className={styles.paragraph}
          text={`根目录/${formState.value}`}
          title={`根目录/${formState.value}`}
          suffix={<EditButton onClick={() => setMode('edit')} />}
        />
      )
    }

    const handleBlur = async () => {
      const { hasError } = await formState.validate()
      if (hasError) return

      const withDelimiter = formState.$ && !formState.$.endsWith('/')
        ? formState.$ + '/'
        : formState.$

      props.onChange(withDelimiter)
      setMode('view')
    }

    return (
      <span className={styles.pathInputGroupWrap}>
        <InputGroup className={styles.pathInputGroup}>
          <InputGroupItem className={styles.prefix}>根目录/</InputGroupItem>
          <TextInput state={formState} inputRef={inputRef} inputProps={{ onBlur: () => handleBlur() }} />
        </InputGroup>
        <Button
          type="link"
          className={styles.button}
          onClick={() => { formState.reset() }}
          // preventDefault 避免让 Input 丢失焦点
          rootHtmlProps={{ onMouseDown: e => e.preventDefault() }}
        >
          重置
        </Button>
      </span>
    )
  }, [formState, mode, props])

  React.useLayoutEffect(() => {
    if (mode !== 'edit') return
    if (!inputRef.current) return
    inputRef.current.focus()
  }, [mode])

  return (
    <FormItem
      label="上传位置"
      state={formState}
      layout="horizontal"
      className={styles.formItem}
      tip={mode === 'edit' ? <FolderNameInputRules /> : null}
    >
      {contentView}
    </FormItem>
  )
}
