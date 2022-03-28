#  1.0.2-beta 发布

## API 改动

* 全局对象 QnwebRtcAi => QNRTCAI
* QnwebRtcAi.default.init => QNRTCAI.init
* QnwebRtcAi.AudioToTextAnalyzer => QNRTCAI.AudioToTextAnalyzer
* QnwebRtcAi.IDCardDetector => QNRTCAI.IDCardDetector

## 功能

* 支持 import * as QNRTCAI 方式进行导入 js 文件

## 优化

* 去除 WebSocket 连接失败自动重连逻辑