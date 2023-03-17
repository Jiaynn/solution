/**
 * @file Verify domain ownership
 * @author linchen <gakiclin@gmail.com>
 */

import React, { ReactNode, useCallback } from 'react'
import { observer } from 'mobx-react'
import { saveAs } from 'file-saver'
import { Tabs, TabPane, Steps, Step, Button, Table, TableType, StepsProps } from 'react-icecream-2'
import Page from 'portal-base/common/components/Page'
import { useLocalStore } from 'portal-base/common/utils/store'

import { OwnershipVerifyType, ownershipVerifyTypeTextMap } from 'cdn/constants/domain'

import CoverLoading from 'cdn/components/common/CoverLoading'

import { OwnershipVerifyFileInfo, OwnershipVerifyDnsInfo } from 'cdn/apis/domain'

import LocalStore, { VerifyStatus } from './store'

import styles from './style.m.less'

export interface Props {}

export default observer(function VerifyOwnership(props: Props) {
  const store = useLocalStore(LocalStore, props)

  return (
    <Page hasSpace={false}>
      <Tabs<OwnershipVerifyType> value={store.verifyType} onChange={store.updateVerifyType}>
        <TabPane
          name={`方法 1：${ownershipVerifyTypeTextMap[OwnershipVerifyType.Dns]}`}
          value={OwnershipVerifyType.Dns}
          className={styles.verifyTabPane}
        >
          <CoverLoading loading={store.isVerifyInfoLoading}>
            {
              store.dnsVerifyInfo && (
                <DnsVerify
                  domain={store.firstLevelDomain!}
                  config={store.dnsVerifyInfo}
                  verifyStatus={store.verifyStatusMap.get(OwnershipVerifyType.Dns)!}
                  onVerify={store.verifyOwnership}
                />
              )
            }
          </CoverLoading>
        </TabPane>
        <TabPane
          name={`方法 2：${ownershipVerifyTypeTextMap[OwnershipVerifyType.File]}`}
          value={OwnershipVerifyType.File}
          className={styles.verifyTabPane}
        >
          <CoverLoading loading={store.isVerifyInfoLoading}>
            {
              store.fileVerifyInfo && (
                <FileVerify
                  domain={store.firstLevelDomain!}
                  config={store.fileVerifyInfo}
                  verifyStatus={store.verifyStatusMap.get(OwnershipVerifyType.File)!}
                  onVerify={store.verifyOwnership}
                />
              )
            }
          </CoverLoading>
        </TabPane>
      </Tabs>
    </Page>
  )
})

function VerifyFailureTitle() {
  return <span className={styles.failureTitle}>验证失败</span>
}

interface DnsVerifyProps {
  domain: string
  verifyStatus: VerifyStatus
  config: OwnershipVerifyDnsInfo
  onVerify: () => void
}

function DnsVerify({ domain, config, verifyStatus, onVerify }: DnsVerifyProps) {
  const VerifyConfigTable: TableType<OwnershipVerifyDnsInfo> = Table

  const verifyConfig = (
    <VerifyConfigTable records={[config]} size="small" style={{ width: '500px' }}>
      <VerifyConfigTable.Column title="记录类型" accessor="recordType" />
      <VerifyConfigTable.Column title="主机记录" accessor="host" />
      <VerifyConfigTable.Column title="记录值" accessor="recordValue" />
    </VerifyConfigTable>
  )

  let verifyResultTitle: ReactNode = null
  let verifyResultDesc: ReactNode = null

  switch (verifyStatus) {
    case VerifyStatus.Verifying:
    case VerifyStatus.Pending: {
      verifyResultTitle = '待验证'
      break
    }
    case VerifyStatus.Success: {
      verifyResultTitle = '验证成功'
      break
    }
    case VerifyStatus.VerifyError: {
      verifyResultTitle = <VerifyFailureTitle />
      verifyResultDesc = (
        <>
          <span>{domain} 的 {config.recordType} 不为 {config.recordValue}</span>
          <br />
          <span>请重新配置后，再次点击验证</span>
        </>
      )
      break
    }
    default: {
      verifyResultTitle = <VerifyFailureTitle />
      verifyResultDesc = <span>未知错误</span>
      break
    }
  }

  return (
    <Steps direction="vertical" className={styles.verifySteps} {...getDnsStepsProps(verifyStatus)}>
      <Step title="前往域名 DNS 服务商配置该 TXT 记录" description={<div className={styles.verifyDesc}>{verifyConfig}</div>} />
      <Step title="已配置" description={<Button type="primary" className={styles.verifyDesc} loading={verifyStatus === VerifyStatus.Verifying} onClick={onVerify}>点击验证</Button>} />
      <Step title={verifyResultTitle} description={<div className={styles.verifyResultDesc}>{verifyResultDesc}</div>} />
    </Steps>
  )
}

function getDnsStepsProps(verifyStatus: VerifyStatus): StepsProps | undefined {
  switch (verifyStatus) {
    case VerifyStatus.Pending: {
      return undefined
    }
    case VerifyStatus.Verifying: {
      return {
        current: 1,
        status: 'process'
      }
    }
    case VerifyStatus.Success: {
      return {
        current: 2,
        status: 'finish'
      }
    }
    default: {
      return {
        current: 2,
        status: 'error'
      }
    }
  }
}

interface FileVerifyProps {
  domain: string
  config: OwnershipVerifyFileInfo
  verifyStatus: VerifyStatus
  onVerify: () => void
}

function FileVerify({ domain, config, verifyStatus, onVerify }: FileVerifyProps) {
  const { fileName, fileContent: verifyContent } = config
  const contentUrl = `http://${domain}/${fileName}`

  const handleSaveVerifyContent = useCallback(() => {
    const blob = new Blob([verifyContent], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, fileName)
  }, [verifyContent, fileName])

  let verifyResultTitle:string|ReactNode = null
  let verifyResultDesc:ReactNode = null

  switch (verifyStatus) {
    case VerifyStatus.Verifying:
    case VerifyStatus.Pending: {
      verifyResultTitle = '待验证'
      break
    }
    case VerifyStatus.Success: {
      verifyResultTitle = '验证成功'
      break
    }
    case VerifyStatus.VerifyError: {
      verifyResultTitle = <VerifyFailureTitle />
      verifyResultDesc = (
        <>
          <span>无法访问 {contentUrl}</span>
          <br />
          <span>请重新检查文件，上传无误后重新点击验证</span>
        </>
      )
      break
    }
    default: {
      verifyResultTitle = <VerifyFailureTitle />
      verifyResultDesc = <span>未知错误</span>
      break
    }
  }

  return (
    <Steps direction="vertical" className={styles.verifySteps} {...getFileStepsProps(verifyStatus)}>
      <Step title={<>下载验证文件 <Button type="link" onClick={handleSaveVerifyContent}>{fileName}</Button> </>} />
      <Step title={`上传文件至 ${domain} 根目录`} description={<div className={styles.verifyDesc}>上传后需能通过 {contentUrl} 访问到该文件</div>} />
      <Step title="已上传" description={<Button className={styles.verifyDesc} type="primary" loading={verifyStatus === VerifyStatus.Verifying} onClick={onVerify}>点击验证</Button>} />
      <Step title={verifyResultTitle} description={<div className={styles.verifyResultDesc}>{verifyResultDesc}</div>} />
    </Steps>
  )
}

function getFileStepsProps(verifyStatus: VerifyStatus): StepsProps | undefined {
  switch (verifyStatus) {
    case VerifyStatus.Pending: {
      return
    }
    case VerifyStatus.Verifying: {
      return {
        current: 2,
        status: 'process'
      }
    }
    case VerifyStatus.Success: {
      return {
        current: 3,
        status: 'finish'
      }
    }
    default: {
      return {
        current: 3,
        status: 'error'
      }
    }
  }
}
