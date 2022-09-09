import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Form, Image, message, Modal, Radio, Space, Spin, Table, } from 'antd';
import moment from 'moment';
import { useAntdTable, useMount, useRequest } from 'ahooks';
import Player from 'xgplayer';
import _ from 'lodash';
import { QiniuError, QiniuErrorName } from 'qiniu-js';

import {
  BasicResult,
  BasicResultProps,
  BasicSearchFormProps,
  BasicSearchFormValues,
  BasicTable,
  BasicTableProps,
  FaceResult,
  FaceResultProps,
  formatDuration,
  TimelineResultProps,
  UploadModal,
  UploadModalProps
} from '@/components';
import { GetMamAssetsListResult, GetMamUploadInfoResult, MockApi } from '@/api';
import { formatDatetime, getImgInfo } from '@/utils';

import styles from './index.module.scss';

type DataType = Required<Required<GetMamAssetsListResult>['data']>['list'][number];

const tabOpts = [
  { label: '人脸识别', value: 'face' },
  { label: 'OCR', value: 'ocr' },
] as const;

type Tab = typeof tabOpts[number]['value'];

export const PicturePage: React.FC = () => {
  const [form] = Form.useForm<BasicSearchFormValues>();

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [tab, setTab] = useState<Tab>('face');
  const [uploadConfig, setUploadConfig] = useState<GetMamUploadInfoResult['data']>();
  const [curRow, setCurRow] = useState<DataType>();
  const [currentUserId, setCurrentUserId] = useState('');
  const [tabLoading, setTabLoading] = useState(false);

  /**
   * 人脸识别
   */
  const { data: faceResultDataList, runAsync: runFaceResultAsync } = useRequest(() => {
    return MockApi.getFace({
      _id: curRow?._id || '',
    }).then(result => {
      return (result.data?.list || []).map(item => {
        return {
          ...item,
          id: _.uniqueId(),
        };
      });
    });
  }, {
    manual: true,
  });
  /**
   * OCR
   */
  const { data: ocrResultData, runAsync: runOcrResultAsync } = useRequest(() => {
    return MockApi.getOcr({
      _id: curRow?._id || '',
    }).then(result => result.data);
  }, {
    manual: true,
  });
  /**
   * 资源列表
   */
  const { loading, run, data: tableData, pagination } = useAntdTable((params) => {
    const reqParams = {
      page_num: `${params.current}`,
      page_size: `${params.pageSize}`,
      title: form.getFieldValue('title') || '',
      time_range: (form.getFieldValue('timeRange') || []).map((item: moment.MomentInput) => {
        return moment(item).valueOf();
      }),
      filetype: 'image',
    };
    return MockApi.getAssetsList(reqParams).then(result => {
      console.log('reqParams', reqParams);
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
    MockApi.getUploadInfo().then(result => {
      setUploadConfig(result.data);
    });
  });

  /**
   * 人脸识别结果
   */
  useEffect(() => {
    if (tab !== 'face') return;
    if (!detailVisible) return;
    setTabLoading(true);
    runFaceResultAsync().then((result) => {
      setCurrentUserId(result[0]?.id || '');
    }).finally(() => {
      setTabLoading(false);
    });
  }, [runFaceResultAsync, tab, detailVisible]);
  /**
   * ocr识别结果
   */
  useEffect(() => {
    if (tab !== 'ocr') return;
    if (!detailVisible) return;
    setTabLoading(true);
    runOcrResultAsync().finally(() => {
      setTabLoading(false);
    });
  }, [runOcrResultAsync, tab, detailVisible]);

  /**
   * 点击操作列中的删除按钮
   * @param record
   */
  const onDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      onOk() {
        console.log('已删除', record);
        MockApi.deleteAssetsById({
          _id: record._id || '',
        }).then(() => {
          const filename = (tableData?.list || []).find(item => item._id === record._id)?.filename;
          run(pagination);
          return message.success(`${filename}删除成功`);
        });
      }
    });
  };

  /**
   * 点击搜索按钮
   * @param values
   */
  const onSearch: BasicSearchFormProps['onOk'] = (values) => {
    const timeRange = (values.timeRange || []).map(item => {
      return formatDatetime(item);
    });
    run({
      ...pagination,
      current: 1,
      title: values.title,
      timeRange,
    });
  };

  /**
   * 识别
   * @param row
   */
  const onDiscern = (row: DataType) => {
    return MockApi.aiRetry({
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
    return getImgInfo(file).then(info => {
      return MockApi.uploadSync({
        bucket: uploadConfig?.bucket || '',
        key: data.key,
        algos: 'ocr,politics',
        filename: info.filename,
        filetype: 'image',
        file_format: info.fileFormat,
        filesize: info.filesize,
        aspect_ratio: info.aspectRatio,
        resolution: info.resolution,
      });
    }).then(() => {
      callbacks.onComplete();
    }).catch(err => {
      if (err instanceof Error) {
        return callbacks.onError(new QiniuError(QiniuErrorName.RequestError, err.message));
      }
      return callbacks.onError(new QiniuError(QiniuErrorName.RequestError, JSON.stringify(err)));
    });
  };

  /**
   * 人脸识别table选择切换
   */
  const onFaceResultTableRowChange: FaceResultProps['onTableRowChange'] = (selectedRowKeys, selectedRows, info) => {
    console.log('onFaceResultTableRowChange selectedRowKeys', selectedRowKeys);
    console.log('onFaceResultTableRowChange selectedRows', selectedRows);
    console.log('onFaceResultTableRowChange info', info);
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
   * 敏感人物
   */
  const sensitiveList = (faceResultDataList || []).map((item) => {
    return {
      id: item.id,
      username: item.name || '',
      avatar: item.avatar_url || '',
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
            setDetailVisible(true);
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
    if (tab === 'face') {
      return <FaceResult
        data={{
          currentUserId,
          sensitiveList,
        }}
        onCurrentUserIdChange={setCurrentUserId}
        onTableRowChange={onFaceResultTableRowChange}
      />;
    }
    if (tab === 'ocr') {
      return <Table
        columns={[
          { title: '识别内容', dataIndex: 'text', key: 'text' },
        ]}
        dataSource={ocrResultData?.list || []}
        scroll={{ y: 420 }}
        pagination={false}
      />;
    }
  };

  return <Space style={{ width: '100%' }} direction="vertical" size={[0, 40]}>
    <UploadModal
      config={{
        prefix: uploadConfig?.prefix || '',
        fileType: 'image',
        token: uploadConfig?.token || ''
      }}
      visible={uploadModalVisible}
      onCancel={() => setUploadModalVisible(false)}
      onComplete={onUploadComplete}
    />

    <Drawer
      className={styles.detail}
      visible={detailVisible}
      width={1060}
      title="图片详情"
      footer={null}
      onClose={() => setDetailVisible(false)}
    >
      <Space className={styles.main} align="start" size={24}>
        <Space className={styles.left} direction="vertical" size={20}>
          <Image
            style={{ maxWidth: '100%' }}
            src={curRow?.cover_url}
          />
          <BasicResult
            data={basicResultData}
          />
        </Space>
        <Spin spinning={tabLoading}>
          <Space className={styles.right} direction="vertical" size={20}>
            <Radio.Group
              className={styles.tab}
              value={tab}
              onChange={event => setTab(event.target.value)}
            >
              {
                tabOpts.map(tabOptItem => {
                  return <Radio.Button
                    className={styles.tabItem}
                    key={tabOptItem.value}
                    value={tabOptItem.value}
                  >{tabOptItem.label}</Radio.Button>;
                })
              }
            </Radio.Group>

            {renderTabResult()}
          </Space>
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