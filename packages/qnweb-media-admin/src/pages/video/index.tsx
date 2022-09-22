import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Form, message, Modal, Radio, Space, Spin, } from 'antd';
import moment from 'moment';
import { useAntdTable, useRequest } from 'ahooks';
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
  FaceResultProps, FaceResultTableDataType,
  TimelineResult,
  TimelineResultProps,
  UploadModal,
  UploadModalProps,
} from '@/components';
import { formatDuration, getVideoInfo } from '@/components/_utils';
import { GetMamAssetsListResult, GetMamUploadInfoResult, MamApi } from '@/api';

import styles from './index.module.scss';

type DataType = Required<Required<GetMamAssetsListResult>['data']>['list'][number];

const tabOpts = [
  { label: '人脸识别', value: 'face' },
  { label: '语音识别', value: 'asr' },
  { label: 'OCR', value: 'ocr' },
] as const;

type Tab = typeof tabOpts[number]['value'];

export const VideoPage: React.FC = () => {
  const [form] = Form.useForm<BasicSearchFormValues>();
  const playerRef = useRef<Player | null>();
  const playRangeTimeRef = useRef<FaceResultTableDataType | null>(null);

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [tab, setTab] = useState<Tab>('face');
  const [uploadConfig, setUploadConfig] = useState<GetMamUploadInfoResult['data']>();
  const [curRow, setCurRow] = useState<DataType>();
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentTimeOfMs, setCurrentTimeOfMs] = useState(0);
  const [tabLoading, setTabLoading] = useState(false);

  /**
   * 人脸识别
   */
  const { data: faceResult, runAsync: runFaceResultAsync } = useRequest(() => {
    return MamApi.getFace({
      _id: curRow?._id || '',
    }).then(result => {
      const politics = (result.data?.politics || []).map(item => {
        return {
          ...item,
          id: _.uniqueId(),
        };
      });
      const others = (result.data?.others || []).map(item => {
        return {
          ...item,
          id: _.uniqueId(),
        };
      });
      setCurrentUserId(politics.concat(others)[0]?.id || '');
      return {
        politics,
        others,
      };
    });
  }, {
    manual: true,
  });
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
   * OCR
   */
  const { data: ocrResultData, runAsync: runOcrResultAsync } = useRequest(() => {
    return MamApi.getOcr({
      _id: curRow?._id || '',
    }).then(result => result.data);
  }, {
    manual: true,
  });
  /**
   * 获取上传配置
   */
  const { runAsync: runUploadInfo, loading: uploadButtonLoading } = useRequest(MamApi.getUploadInfo, {
    manual: true
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
      filetype: 'video',
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
   * 实例化播放器
   */
  useEffect(() => {
    const url = curRow?.url || '';
    if (!url) return;
    if (!detailModalVisible) return;
    const handleTimeUpdate = (event: HTMLMediaElement) => {
      const currentTimeOfMs = event.currentTime * 1000;
      setCurrentTimeOfMs(currentTimeOfMs);

      const player = playerRef.current;
      if (!player) return;
      const endTime = playRangeTimeRef.current?.endTime;
      if (endTime && currentTimeOfMs >= endTime) {
        player.pause();
      }
    };
    const handleError = (error: Error) => {
      Modal.error({
        title: '播放出错',
        content: error.message
      });
    };
    const player = new Player({
      width: 592,
      id: 'player',
      url
    });
    playerRef.current = player;
    player.start(url);
    player.on('timeupdate', handleTimeUpdate);
    player.on('error', handleError);
    return () => {
      player.off('timeupdate', handleTimeUpdate);
      player.off('error', handleError);
      player.destroy();
      playerRef.current = null;
    };
  }, [curRow?.url, detailModalVisible]);

  /**
   * 人脸识别结果
   */
  useEffect(() => {
    if (tab !== 'face') return;
    if (!detailModalVisible) return;
    setTabLoading(true);
    runFaceResultAsync().finally(() => {
      setTabLoading(false);
    });
  }, [runFaceResultAsync, tab, detailModalVisible]);
  /**
   * 语音识别结果
   */
  useEffect(() => {
    if (tab !== 'asr') return;
    if (!detailModalVisible) return;
    setTabLoading(true);
    runAsrResultAsync().finally(() => {
      setTabLoading(false);
    });
  }, [runAsrResultAsync, tab, detailModalVisible]);
  /**
   * ocr识别结果
   */
  useEffect(() => {
    if (tab !== 'ocr') return;
    if (!detailModalVisible) return;
    setTabLoading(true);
    runOcrResultAsync().finally(() => {
      setTabLoading(false);
    });
  }, [runOcrResultAsync, tab, detailModalVisible]);

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
    return getVideoInfo(file).then(info => {
      return MamApi.uploadSync({
        bucket: uploadConfig?.bucket || '',
        key: data.key,
        algos: 'audio,politics,ocr',
        filename: info.filename,
        filetype: 'video',
        file_format: info.fileFormat,
        filesize: info.filesize,
        duration: info.duration,
        bit_rate: info.bitRate,
        aspect_ratio: info.aspectRatio,
        resolution: info.resolution,
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
   * 人脸识别table选择切换
   */
  const onFaceResultTableRowChange: FaceResultProps['onTableRowChange'] = (_, selectedRows) => {
    const playRangeTime = selectedRows[0];
    const player = playerRef.current;
    playRangeTimeRef.current = playRangeTime;
    if (!player) return;
    player.currentTime = playRangeTime.startTime / 1000;
    player.play().catch((error) => {
      console.error(error);
      Modal.confirm({
        content: '播放出错，是否重试？',
        onOk() {
          player.replay();
        }
      });
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
   * 敏感人物
   */
  const sensitiveList = (faceResult?.politics || []).map((item) => {
    return {
      id: item.id,
      username: item.name || '',
      avatar: item.avatar_url || '',
    };
  });
  /**
   * 未知人物
   */
  const unknownList = (faceResult?.others || []).map((item) => {
    return {
      id: item.id,
      username: item.name || '',
      avatar: item.avatar_url || '',
    };
  });

  /**
   * 人脸识别table数据
   */
  const faceResultTableList = useMemo<Required<FaceResultProps>['data']['tableList']>(() => {
    const { politics = [], others = [] } = faceResult || {};
    const list = [...politics, ...others];
    const user = (list || []).find(item => item.id === currentUserId);
    const timeRange = user?.duration_range_list || [];
    return timeRange.map(([startTime, endTime], index) => {
      return {
        id: `${index + 1}`,
        startTime,
        endTime
      };
    });
  }, [currentUserId, faceResult]);

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
   * ocr识别timeline
   */
  const ocrList: TimelineResultProps['list'] = (ocrResultData?.list || []).map(item => {
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
            setTab('face');
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
    if (tab === 'face') {
      return <FaceResult
        currentVisible={true}
        data={{
          currentUserId,
          sensitiveList,
          unknownList,
          duration: curRow?.duration,
          currentTime: currentTimeOfMs,
          tableList: faceResultTableList,
        }}
        onCurrentUserIdChange={setCurrentUserId}
        onTableRowChange={onFaceResultTableRowChange}
      />;
    }
    if (tab === 'asr') {
      return <TimelineResult
        list={asrList}
      />;
    }
    if (tab === 'ocr') {
      return <TimelineResult
        list={ocrList}
      />;
    }
  };

  /**
   * 点击上传文件按钮
   */
  const onUploadClick = async () => {
    if (!uploadConfig) {
      const result = await runUploadInfo();
      setUploadConfig(result.data);
    }
    setUploadModalVisible(true);
  };

  return <Space style={{ width: '100%' }} direction="vertical" size={[0, 40]}>
    <UploadModal
      config={{
        prefix: uploadConfig?.prefix || '',
        fileType: 'video',
        token: uploadConfig?.token || ''
      }}
      accept="video/*"
      visible={uploadModalVisible}
      onCancel={() => setUploadModalVisible(false)}
      onComplete={onUploadComplete}
    />

    <Drawer
      className={styles.detail}
      visible={detailModalVisible}
      width={1060}
      title="视频详情"
      footer={null}
      onClose={() => setDetailModalVisible(false)}
    >
      <Space className={styles.main} align="start" size={24}>
        <Space className={styles.left} direction="vertical" size={20}>
          {curRow?.url && <div id="player"/>}
          <BasicResult
            data={basicResultData}
            filters={['创建时间', '文件大小', '时长', '视频格式', '码率', '分辨率', '画幅比']}
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
      searchFormProps={{ form, onUploadClick, onOk: onSearch, okButtonLoading: loading, uploadButtonLoading }}
      tableProps={{ loading, dataSource: tableData?.list, pagination, columns }}
    />
  </Space>;
};
