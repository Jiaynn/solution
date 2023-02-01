/**
 * @file component FileList 文件列表
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import classNames from 'classnames'
import autobind from 'autobind-decorator'
import { observer, Observer } from 'mobx-react'
import { Table, Tag, Tooltip } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Inject, InjectFunc } from 'qn-fe-core/di'

import { humanizeStorageSize } from 'kodo/transforms/unit'
import { extractTimeStamp, humanizeTimestamp } from 'kodo/transforms/date-time'
import { decorateKey, getInterceptionValue, getTargetKey } from 'kodo/transforms/bucket/resource'

import { KodoIamStore } from 'kodo/stores/iam'

import { storageTypeTextMap } from 'kodo/constants/statistics'
import { filesStateTextMap } from 'kodo/constants/bucket/resource'

import { ResourceApis } from 'kodo/apis/bucket/resource'

import EditableCell from './EditTableCell'
import Operation from './Operation'
import Store, { IFile, IFileInfo } from './store'
import styles from './style.m.less'

export interface IProps {
  store: Store
  bucketName: string
  onDelete: (decoratedKeys: string) => void
}

@observer
class InternalFileList extends React.Component<IProps & {
  inject: InjectFunc
}> {
  toasterStore = this.props.inject(Toaster)

  constructor(
    props: IProps & {
      inject: InjectFunc
    }
  ) {
    super(props)
    makeObservable(this)
  }

  @autobind
  handleMimeTypeCellChange(key: string, isNewFile: boolean, version: string | undefined) {
    const resourceApis = this.props.inject(ResourceApis)
    return (value: string) => {
      const req = resourceApis.renameFileMimeType(this.props.bucketName, value, { key, version }).then(() => {
        this.props.store.fetchFileState(key, isNewFile, version)
      })
      return this.toasterStore.promise(req, '修改文件类型成功')
    }
  }

  @autobind
  handleKeyCellChange(oldKey: string, isNewFile: boolean, version: string | undefined) {
    const resourceApis = this.props.inject(ResourceApis)

    return (newKey: string) => this.toasterStore.promise((async () => {
      const result = await resourceApis.hasSensitiveWord(newKey)

      if (result.has_sensitive_word) {
        // 如果含有敏感词则 reject 通知 cell 恢复原始值
        throw new Error('修改失败，文件名含有敏感词')
      }

      return resourceApis.renameFileKey(this.props.bucketName, newKey, oldKey).then(() => {
        this.props.store.fetchFileState(oldKey, isNewFile, version, newKey)
      })
    })(), '修改文件名成功')
  }

  @autobind
  renderKeyEdit(record: IFileInfo) {
    return (
      <EditableCell
        title="文件名"
        target="filename"
        originValue={record.key}
        ftype={record.type}
        fname={record.key}
        version={record.version}
        isNewFile={!!record.isNewFile}
        bucketName={this.props.bucketName}
        onChange={this.handleKeyCellChange(record.key, !!record.isNewFile, record.version)}
      />
    )
  }

  @autobind
  renderMimeTypeEdit(record: IFileInfo) {
    return (
      <EditableCell
        title="文件类型"
        target="mimeType"
        originValue={record.mimeType}
        ftype={record.type}
        fname={record.key}
        version={record.version}
        isNewFile={!!record.isNewFile}
        bucketName={this.props.bucketName}
        onChange={this.handleMimeTypeCellChange(record.key, !!record.isNewFile, record.version)}
      />
    )
  }

  @autobind
  renderDisabledTag({ status }: IFileInfo) {
    return status ? (<Tag color="yellow2" small>{filesStateTextMap[status]}</Tag>) : null
  }

  @autobind
  getRowClassName(record: IFileInfo): string {
    if (record.isNewFile) {
      return styles.newFile
    }

    const rowKey = this.getRowKey(record)
    const { store: { isShowingVersion, expandedRowKeys } } = this.props

    if (isShowingVersion && expandedRowKeys.includes(rowKey)) {
      return styles.expandedRow
    }

    return ''
  }

  @autobind
  renderKeyVersionText(record: IFileInfo) {
    // 有版本情况下只需要显示版本号或者类似 DM 的特征标记
    const { version, deleteMarker, latest, children } = record

    if (record.isNewFile) {
      return this.renderPreformattedValue(record.key)
    }

    // 如果带有 children， 则这一行为展开行的标记
    if (children) {
      return this.renderPreformattedValue(record.key)
    }

    // 下面两个 if 是对是否是 DM 或者最新版本 latest 做判断
    if (version && deleteMarker) {
      return this.renderPreformattedValue(version + '（Delete Marker）') // 目前还不知道这个中文应该叫什么...
    }

    if (latest) {
      return this.renderPreformattedValue(version + '（最新版本）')
    }

    return this.renderPreformattedValue(version!)
  }

  @autobind
  renderPreformattedValue(value: string, notAvailable?: boolean) {
    // 失败的文件文件名颜色调整并且 tooltip 提示
    const title = notAvailable ? '获取文件信息失败' : value
    return (
      <Tooltip title={title} placement="top">
        <span className={classNames(styles.formatted, notAvailable && styles.notAvailableFile)}>
          {getInterceptionValue(value)}
        </span>
      </Tooltip>
    )
  }

  @autobind
  renderKeyValue(record: IFileInfo) {
    const { bucketName } = this.props
    const iamStore = this.props.inject(KodoIamStore)
    const { isShowingVersion, isReadonlyShareBucket } = this.props.store

    // 检查 IAM 是否有编辑的权限（isActionDeny 在非 iam 用户时直接返回 false）
    const isIamDeny = iamStore.isActionDeny({ actionName: 'Delete', resource: bucketName })
      || iamStore.isActionDeny({ actionName: 'Get', resource: bucketName })
      || iamStore.isActionDeny({ actionName: 'Upload', resource: bucketName })

    // 如果当前用户无权限或者是只读的分享空间则显示不可编辑的文件名
    if (isReadonlyShareBucket || isIamDeny) {
      return this.renderPreformattedValue(record.key, record.notAvailable)
    }

    // 开启版本则显示带版本的文件名
    if (isShowingVersion) {
      return this.renderKeyVersionText(record)
    }

    // 显示允许用户编辑的文件名
    return this.renderKeyEdit(record)
  }

  @autobind
  getRowKey(record: IFileInfo) {
    const key = record.version && this.props.store.isShowingVersion
      ? getTargetKey({
        key: record.key,
        version: record.version
      })
      : record.key

    return decorateKey(key, !!record.isNewFile)
  }

  @computed
  get rowSelection() {
    return {
      selectedRowKeys: this.props.store.selectedRowKeys,
      onChange: this.props.store.updateSelectedRowKeys,
      getCheckboxProps: (value: IFileInfo) => (
        value.children || value.notAvailable // 版本的第一行只是展示信息，无法选中
          ? {
            className: styles.hide,
            disabled: true
          }
          : {}
      )
    }
  }

  render() {
    const {
      isShowingVersion, expandedRowKeys,
      updateExpandedRowKeys, isReadonlyShareBucket,
      fileList, versionFileList
    } = this.props.store

    return (
      <Table<IFile>
        rowKey={this.getRowKey}
        dataSource={isShowingVersion ? versionFileList.slice() : fileList.slice()}
        rowSelection={this.rowSelection}
        rowClassName={this.getRowClassName}
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={(expandedRows: string[]) => (
          isShowingVersion ? updateExpandedRowKeys(expandedRows) : null
        )}
        loading={this.props.store.isListLoading}
        pagination={false}
      >
        <Table.Column
          title="文件名"
          key="key"
          width="30%"
          render={(_, record: IFileInfo) => (
            <Observer render={() => (<>
              {this.renderDisabledTag(record)}
              {this.renderKeyValue(record)}
            </>)} />
          )}
        />
        <Table.Column<IFileInfo>
          title="文件类型"
          width="20%"
          key="mimeType"
          render={(_, record) => (
            (isReadonlyShareBucket || record.mimeType == null)
              ? record.mimeType
              : this.renderMimeTypeEdit(record)
          )}
        />
        <Table.Column
          title="存储类型"
          width="10%"
          key="ftype"
          dataIndex="ftype"
          render={(_, { type }) => storageTypeTextMap[type]}
        />
        <Table.Column
          title="文件大小"
          width="10%"
          key="fsize"
          render={(_, { fsize }) => (fsize == null ? '' : humanizeStorageSize(fsize))}
        />
        <Table.Column
          title="最后更新"
          width="15%"
          key="putTime"
          render={(_, { putTime }) => (putTime == null ? '' : humanizeTimestamp(extractTimeStamp(putTime)))}
        />
        <Table.Column<IFileInfo>
          title="操作"
          render={(_, record, index) => {
            if (record.notAvailable) {
              return null
            }

            if (!isShowingVersion || !record.children) {
              return (
                <Operation
                  bucketName={this.props.bucketName}
                  store={this.props.store}
                  onDelete={() => {
                    const targetKey = getTargetKey({
                      key: record.key,
                      ...(isShowingVersion && { version: record.version })
                    })
                    this.props.onDelete(decorateKey(targetKey, !!record.isNewFile))
                  }}
                  data={record}
                  index={index}
                />
              )
            }
          }}
        />
      </Table>
    )
  }
}

export default function FileList(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalFileList {...props} inject={inject} />
    )} />
  )
}
