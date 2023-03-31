import React, { createContext, useContext, useState } from 'react'

import { Checkbox, Modal } from 'react-icecream'
import { ModalProps } from 'react-icecream/lib/modal'

import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'

import InputWrapper from '../InputWrapper'
import DownloadModalStore from './store'
import { isElectron } from 'constants/is'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'
import { DownloadFileResult } from 'utils/electron'
import { CodeUrl } from 'apis/_types/interactMarketingType'

const downloadOnElectron = (urls: string[]) => {
  const job = urls[0]
  if (job) {
    window.top?.electronBridgeApi.downloadFile(job).then(res => {
      console.log('res', res)
      downloadOnElectron(urls.slice(1))
    })
  }
}

/**
 * TODO: 自定义文件名
 */
// const filenameMap = {
//   android_url: 'android.zip',
//   ios_url: 'ios.zip',
//   server_fixed_url: 'server_livekit.yaml',
//   server_url: 'server_config.json'
// } as const

export const ModalContext = createContext<{
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean | undefined>>
}>({
  visible: false,
  setVisible(_value: React.SetStateAction<boolean | undefined>): void {
    throw new Error('Function not implemented.')
  }
})

export interface DownloadModalProps extends ModalProps {
  appId: string
}

export default observer(function DownloadModal(props: DownloadModalProps) {
  const { visible, setVisible } = useContext(ModalContext)

  const [loading, setLoading] = useState(false)
  const store = useLocalStore(DownloadModalStore, props)

  const { selectedUrlTypes } = store

  const hideModal = () => {
    setVisible(false)
  }

  const isInIframe = window.top !== window.self

  const createProject = (projectInfo: Partial<ProjectInfo>) => {
    if (isElectron) {
      window.postMessage(
        {
          type: 'createProject',
          data: {
            ...store.projectInfo,
            ...projectInfo
          }
        },
        window.location.origin
      )
    }
  }

  const downloadOnElectron = async (
    urls: Array<{
      platform: string
      url: string
    }>
  ) => {
    const result: Map<string, DownloadFileResult | undefined> = new Map()
    for (const item of urls) {
      try {
        const { platform, url } = item
        // eslint-disable-next-line no-await-in-loop
        const downloadResult = await window.top?.electronBridgeApi.downloadFile(
          url
        )
        result.set(platform, downloadResult)
      } catch (e) {
        console.error(e)
      }
    }
    return result
  }

  const onOk = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()

    if (!selectedUrlTypes.length) {
      Modal.confirm({ content: '没有选中任何文件' })
      return
    }

    if (isElectron && isInIframe) {
      const platformMap: Record<keyof CodeUrl, string> = {
        android_url: 'android',
        ios_url: 'ios',
        server_fixed_url: 'server_fixed',
        server_url: 'server'
      }

      const downloadUrls = store.selectedUrlTypes.map(urlType => ({
        platform: platformMap[urlType],
        url: store.urls[urlType]
      }))

      setLoading(true)
      downloadOnElectron(downloadUrls)
        .then(result => {
          if (
            store.selectedUrlTypes.some(
              type => type === 'android_url' || type === 'ios_url'
            )
          ) {
            createProject({
              package: {
                android: result.get('android'),
                ios: result.get('ios')
              }
            })
          }
        })
        .finally(() => {
          setLoading(false)
          store.clearSelectedUrls()
          hideModal()
        })

      return
    }

    store.download()
    store.clearSelectedUrls()
    hideModal()
  }

  return (
    <Modal
      title="下载应用源文件"
      okText="下载"
      visible={visible}
      onOk={onOk}
      onCancel={hideModal}
      confirmLoading={loading}
    >
      <Checkbox.Group
        value={selectedUrlTypes}
        onChange={store.updateSelectedUrls}
      >
        <br />
        <br />
        <InputWrapper title="客户端">
          <Checkbox value="ios_url">IOS端</Checkbox>
          <Checkbox value="android_url">Android端</Checkbox>
        </InputWrapper>
        <br />
        <br />
        <InputWrapper title="服务端">
          <Checkbox value="server_fixed_url">
            基本配置文件（mysql redis）
          </Checkbox>
          <br />
          <Checkbox value="server_url">
            定制化配置文件（pili rtc 相关）
          </Checkbox>
        </InputWrapper>
        <br />
        <br />
      </Checkbox.Group>
    </Modal>
  )
})
