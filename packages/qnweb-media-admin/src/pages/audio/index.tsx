import React, { useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Form, message, Modal, Space, Spin, } from 'antd';
import moment from 'moment';
import { useAntdTable, useMount, useRequest } from 'ahooks';
import { QiniuError, QiniuErrorName } from 'qiniu-js';

import {
  AudioPlayer,
  BasicResult,
  BasicResultProps,
  BasicSearchFormProps,
  BasicSearchFormValues,
  BasicTable,
  BasicTableProps,
  TimelineResult,
  TimelineResultProps,
  UploadModal,
  UploadModalProps,
} from '@/components';
import { formatDuration, getAudioInfo } from '@/components/_utils';
import { GetMamAssetsListResult, GetMamUploadInfoResult, MamApi } from '@/api';

import styles from './index.module.scss';

type DataType = Required<Required<GetMamAssetsListResult>['data']>['list'][number];

export const AudioPage: React.FC = () => {
  const [form] = Form.useForm<BasicSearchFormValues>();

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [uploadConfig, setUploadConfig] = useState<GetMamUploadInfoResult['data']>();
  const [curRow, setCurRow] = useState<DataType>();
  const [tabLoading, setTabLoading] = useState(false);
  /**
   * 语音识别
   */
  const { data: asrResultData, runAsync: runAsrResultAsync } = useRequest(() => {
    return MamApi.getAsr({
      _id: curRow?._id || '',
    }).then(result => result.data);
  }, {
    manual: true,
  });
  /**
   * 资源列表
   */
  const {
    loading,
    run: runAssetsList,
    refresh: refreshAssetsList,
    data: tableData,
    pagination
  } = useAntdTable((params) => {
    return MamApi.getAssetsList({
      page_num: `${params.current}`,
      page_size: `${params.pageSize}`,
      title: form.getFieldValue('title') || '',
      date_time_range: (form.getFieldValue('timeRange') || []).map((item: moment.MomentInput) => {
        return moment(item).valueOf();
      }),
      filetype: 'audio',
    }).then(result => {
      console.log('result', result);
      return {
        total: result.data?.total || 0,
        list: result.data?.list || [],
      };
    });
  }, {
    defaultPageSize: 10,
  });

  /**
   * 获取上传配置
   */
  useMount(() => {
    MamApi.getUploadInfo().then(result => {
      setUploadConfig(result.data);
    });
  });

  /**
   * 语音识别结果
   */
  useEffect(() => {
    if (!detailModalVisible) return;
    setTabLoading(true);
    runAsrResultAsync().finally(() => {
      setTabLoading(false);
    });
  }, [runAsrResultAsync, detailModalVisible]);

  /**
   * 点击操作列中的删除按钮
   * @param record
   */
  const onDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      onOk() {
        console.log('已删除', record);
        MamApi.deleteAssetsById({
          _id: record._id || '',
        }).then(() => {
          const filename = (tableData?.list || []).find(item => item._id === record._id)?.filename;
          refreshAssetsList();
          return message.success(`${filename}删除成功`);
        });
      }
    });
  };

  /**
   * 点击搜索按钮
   */
  const onSearch: BasicSearchFormProps['onOk'] = () => {
    runAssetsList({
      ...pagination,
      current: 1
    });
  };

  /**
   * 识别
   * @param row
   */
  const onDiscern = (row: DataType) => {
    return MamApi.aiRetry({
      _id: row._id || '',
    }).then(() => {
      return message.success('识别成功');
    });
  };

  /**
   * 上传完成回调
   * @param file
   * @param data
   * @param callbacks
   */
  const onUploadComplete: UploadModalProps['onComplete'] = ({ file, data, callbacks }) => {
    console.log('onUploadComplete', file, data);
    return getAudioInfo(file).then(info => {
      return MamApi.uploadSync({
        bucket: uploadConfig?.bucket || '',
        key: data.key,
        algos: 'audio',
        filename: info.filename,
        filetype: 'audio',
        file_format: info.fileFormat,
        filesize: info.filesize,
        duration: info.duration,
        bit_rate: info.bitRate,
      });
    }).then(() => {
      runAssetsList({
        ...pagination,
        current: 1
      });
      callbacks.onComplete();
    }).catch(err => {
      if (err instanceof Error) {
        return callbacks.onError(new QiniuError(QiniuErrorName.RequestError, err.message));
      }
      return callbacks.onError(new QiniuError(QiniuErrorName.RequestError, JSON.stringify(err)));
    });
  };

  /**
   * 基本信息
   */
  const basicResultData: BasicResultProps['data'] = useMemo(() => {
    if (!curRow) return;
    return {
      createTime: curRow.created_time || 0,
      fileSize: curRow.filesize || 0,
      duration: curRow.duration || 0,
      fileFormat: curRow.file_format || '',
      bitRate: curRow.bit_rate || 0,
      resolution: curRow.resolution || '',
      aspectRatio: curRow.aspect_ratio || '',
    };
  }, [curRow]);

  /**
   * 语音识别timeline
   */
  const asrList: TimelineResultProps['list'] = (asrResultData?.list || []).map(item => {
    const durationRange = item.duration_range || [];
    const title = durationRange.map((item) => {
      return formatDuration(item);
    }).join('-');
    return {
      title: title,
      content: item.text || '',
    };
  });

  /**
   * 操作列
   */
  const columns: Required<BasicTableProps>['tableProps']['columns'] = [{
    title: '操作',
    key: 'action',
    align: 'center',
    render: (_, row: DataType) => (
      <Space>
        <Button
          type="link"
          onClick={() => {
            setDetailModalVisible(true);
            setCurRow(row);
          }}
        >查看详情</Button>
        <Button
          type="link"
          onClick={() => onDiscern(row)}
        >识别</Button>
        <Button type="link" download href={row.url}>下载</Button>
        <Button type="link" onClick={() => onDelete(row)}>删除</Button>
      </Space>
    )
  }];

  /**
   * 渲染tab的result组件
   */
  const renderTabResult = () => {
    return <TimelineResult
      list={asrList}
    />;
  };

  return <Space style={{ width: '100%' }} direction="vertical" size={[0, 40]}>
    <UploadModal
      config={{
        prefix: uploadConfig?.prefix || '',
        fileType: 'audio',
        token: uploadConfig?.token || ''
      }}
      accept=".wav,.MP3,.wma,.flac,.amr,.opus,.m4a,.aac"
      visible={uploadModalVisible}
      onCancel={() => setUploadModalVisible(false)}
      onComplete={onUploadComplete}
    />

    <Drawer
      className={styles.detail}
      visible={detailModalVisible}
      width={1060}
      title="音频详情"
      footer={null}
      destroyOnClose={true}
      onClose={() => setDetailModalVisible(false)}
    >
      <Space className={styles.main} align="start" size={24}>
        <Space className={styles.left} direction="vertical" size={20}>
          {
            curRow && <AudioPlayer
              url={curRow.url}
            />
          }
          <BasicResult
            data={basicResultData}
            filters={['创建时间', '文件大小', '时长', '音频格式', '码率']}
          />
        </Space>
        <Spin spinning={tabLoading}>
          {renderTabResult()}
        </Spin>
      </Space>
    </Drawer>

    <BasicTable
      searchFormProps={{
        form,
        onUploadClick: () => setUploadModalVisible(true),
        onOk: onSearch,
      }}
      tableProps={{
        loading,
        dataSource: tableData?.list,
        pagination,
        columns
      }}
    />
  </Space>;
};
