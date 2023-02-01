import React from 'react'
import { Button } from 'react-icecream-2'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'

interface ImportConfigButtonProps {
  onUpdate: (data: any) => void
}

export function ImportConfigButton(props: ImportConfigButtonProps) {
  const toasterStore = useInjection(ToasterStore)

  const handleClick = React.useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'

    input.onchange = (event: any) => {
      const file = event.target?.files[0]
      if (file == null) return
      const fileReader = new FileReader()

      fileReader.onload = () => {
        const result = fileReader.result
        if (result == null) return
        let data = {}
        try {
          data = JSON.parse(result?.toString())
        } catch (error) {
          toasterStore.error('配置不是合法的 json 格式')
          return
        }

        props.onUpdate(data)
        toasterStore.success('导入完成，需要确定更新后才能生效')
      }

      fileReader.readAsText(file, 'UTF-8')
    }

    input.click()
  }, [props, toasterStore])

  return (
    <Button type="secondary" onClick={handleClick}>
      导入配置
    </Button>
  )
}
