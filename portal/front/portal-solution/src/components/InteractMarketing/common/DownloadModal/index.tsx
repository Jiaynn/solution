import React, { createContext, useContext, useState } from 'react'

import { Checkbox, Modal } from 'react-icecream'
import { ModalProps } from 'react-icecream/lib/modal'

import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'

import InputWrapper from '../InputWrapper'
import DownloadModalStore from './store'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'

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

  const store = useLocalStore(DownloadModalStore, props)

  const { selectedUrlTypes } = store

  const hideModal = () => {
    setVisible(false)
  }

  const [loading1, setLoading1] = useState(false)
  // const [loading2, setLoading2] = useState(false)
  const pName = 'droid_qlive_demo'

  const onCreateProject = () => {
    const projectInfo: ProjectInfo = {
      name: pName,
      description: '双十一大促_电商直播_tracecode1',
      sceneType: 1,
      appId: 'tracecode1',
      createTime: Date.now(),
      platform: ['Android', 'iOS']
    }
    console.log('createProject', projectInfo)
    console.log('window.location.origin', window.location.origin)
    window.postMessage(
      {
        type: 'createProject',
        data: projectInfo
      },
      window.location.origin
    )
  }

  const onDownload = () => {
    // window.top?.electronBridgeApi.getDownloadStatus((_, result) => {
    //   if (result.code === 0) {
    //     setLoading1(true)
    //   }
    //   if (result.code === 1) {
    //     setLoading1(false)
    //   }
    // })
    //
    // const a = document.createElement('a')
    // a.href =
    //   'https://demo-qnrtc-files.qnsdk.com/solutions/portal/temp/1c90840b9344484c8c1e1398724f67efc281772a5fd62171b86795532289fc89/1680005098/droid_qlive_demo.zip'
    // a.download = 'droid_qlive_demo'
    // a.click()

    onCreateProject()
  }

  // const onOk = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
  //   if (!selectedUrlTypes.length) {
  //     Modal.confirm({ content: '没有选中任何文件' })
  //     return
  //   }
  //   store.download()
  //   store.clearSelectedUrls()
  //   hideModal()
  // }

  return (
    <Modal
      title="下载应用源文件"
      okText="下载"
      visible={visible}
      onOk={onDownload}
      onCancel={hideModal}
      confirmLoading={loading1}
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
