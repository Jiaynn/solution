import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Form, message, Modal, Radio, Space, Spin, } from 'antd';
import moment from 'moment';
import { useAntdTable, useMount, useRequest } from 'ahooks';
import Player from 'xgplayer';
import _ from 'lodash';

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
  TimelineResult,
  TimelineResultProps,
  UploadModal,
  UploadModalProps
} from '@/components';
import { GetMamAssetsListResult, GetMamUploadInfoResult, MockApi } from '@/api';
import { formatDatetime, getVideoFileBase64, getVideoInfo } from '@/utils';

import styles from './index.module.scss';
import { QiniuError, QiniuErrorName } from 'qiniu-js';

type DataType = Required<Required<GetMamAssetsListResult>['data']>['list'][number];

const tabOpts = [
  { label: '人脸识别', value: 'face' },
  { label: '语音识别', value: 'asr' },
  { label: 'OCR', value: 'ocr' },
] as const;

type Tab = typeof tabOpts[number]['value'];

export const VideoPage: React.FC = () => {
    const [form] = Form.useForm<BasicSearchFormValues>();

    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [videoDetailVisible, setVideoDetailModalVisible] = useState(false);
    const [tab, setTab] = useState<Tab>('face');
    const [uploadConfig, setUploadConfig] = useState<GetMamUploadInfoResult['data']>();
    const [curRow, setCurRow] = useState<DataType>();
    const [currentUserId, setCurrentUserId] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
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
     * 语音识别
     */
    const { data: asrResultData, runAsync: runAsrResultAsync } = useRequest(() => {
      return MockApi.getAsr({
        _id: curRow?._id || '',
      }).then(result => result.data);
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
        filetype: 'video',
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

    const playerRef = useRef<Player>();

    /**
     * 实例化播放器
     */
    useEffect(() => {
      if (!videoDetailVisible) return;
      playerRef.current = new Player({
        width: 500,
        id: 'player',
        url: 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4'
      });
    }, [videoDetailVisible]);

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
      if (!videoDetailVisible) return;
      const hide = message.loading('正在获取人脸识别结果...', 0);
      setTabLoading(true);
      runFaceResultAsync().then((result) => {
        setCurrentUserId(result[0]?.id || '');
        message.success('获取人脸识别结果成功');
      }).finally(() => {
        setTabLoading(false);
        hide();
      });
      return () => {
        hide();
      };
    }, [runFaceResultAsync, tab, videoDetailVisible]);
    /**
     * 语音识别结果
     */
    useEffect(() => {
      if (tab !== 'asr') return;
      if (!videoDetailVisible) return;
      const hide = message.loading('正在获取语音识别结果...', 0);
      setTabLoading(true);
      runAsrResultAsync().then(() => {
        message.success('获取语音识别结果成功');
      }).finally(() => {
        setTabLoading(false);
        hide();
      });
      return () => {
        hide();
      };
    }, [runAsrResultAsync, tab, videoDetailVisible]);
    /**
     * ocr识别结果
     */
    useEffect(() => {
      if (tab !== 'ocr') return;
      if (!videoDetailVisible) return;
      const hide = message.loading('正在获ocr识别结果...', 0);
      setTabLoading(true);
      runOcrResultAsync().then(() => {
        message.success('获取ocr识别结果成功');
      }).finally(() => {
        setTabLoading(false);
        hide();
      });
      return () => {
        hide();
      };
    }, [runOcrResultAsync, tab, videoDetailVisible]);

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
      return Promise.all([
        getVideoFileBase64(file),
        getVideoInfo(file),
      ]).then(([base64, videoInfo]) => {
        return MockApi.uploadSync({
          bucket: uploadConfig?.bucket || '',
          key: data.key,
          algos: 'audio,politics,ocr',
          filename: videoInfo.filename,
          filetype: 'video',
          file_format: videoInfo.fileFormat,
          filesize: videoInfo.filesize,
          duration: videoInfo.duration,
          bit_rate: videoInfo.bitRate,
          aspect_ratio: videoInfo.aspectRatio,
          resolution: videoInfo.resolution,
          cover_url: base64 || ''
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
     * 人脸识别table数据
     */
    const faceResultTableList = useMemo<Required<FaceResultProps>['data']['tableList']>(() => {
      const user = (faceResultDataList || []).find(item => item.id === currentUserId);
      const timeRange = user?.duration_range_list || [];
      return timeRange.map(([startTime, endTime], index) => {
        return {
          id: `${index + 1}`,
          startTime,
          endTime
        };
      });
    }, [currentUserId, faceResultDataList]);

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
              setVideoDetailModalVisible(true);
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
          className={styles.result}
          data={{
            currentUserId,
            sensitiveList,
            duration: curRow?.duration,
            currentTime,
            tableList: faceResultTableList,
          }}
          onCurrentUserIdChange={setCurrentUserId}
          onTableRowChange={onFaceResultTableRowChange}
        />;
      }
      if (tab === 'asr') {
        return <TimelineResult
          className={styles.result}
          list={asrList}
        />;
      }
      if (tab === 'ocr') {
        return <TimelineResult
          className={styles.result}
          list={ocrList}
        />;
      }
    };

    return <Space style={{ width: '100%' }} direction="vertical" size={[0, 40]}>
      <UploadModal
        config={{
          prefix: uploadConfig?.prefix || '',
          fileType: 'video',
          token: uploadConfig?.token || ''
        }}
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onComplete={onUploadComplete}
      />

      <Drawer
        className={styles.videoDetail}
        visible={videoDetailVisible}
        width={900}
        title={`视频详情/${curRow?.filename || '未知'}`}
        footer={null}
        onClose={() => setVideoDetailModalVisible(false)}
      >
        <div className={styles.main}>
          <Space className={styles.left} direction="vertical" size={20}>
            <div id="player"/>
            <BasicResult data={basicResultData}/>
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
        </div>
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
  }
;
