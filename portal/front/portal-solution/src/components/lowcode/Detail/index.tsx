import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'
import React, { useState } from 'react'
import {
  Divider,
  ModalForm, FormItem, TextInput, RadioGroup, Radio, Button,
  Select, SelectOption as Option,
  CheckboxGroup, Checkbox, TextArea, Tooltip
} from 'react-icecream-2'
import { Tabs } from 'react-icecream/lib'

import { isElectron } from 'constants/is'

import './style.less'

const prefixCls = 'lowcode-detail'

export const LowCodeDetail = () => {
  const { query } = useInjection(RouterStore)
  const { scheme, list } = query
  const [visible, setVisible] = useState(false)

  const onSubmit = () => {
    const url = 'http://searchbox.bj.bcebos.com/miniapp/demo-1.0.1.zip'
    if (isElectron) {
      window.electronBridgeApi.download(url)
    }
    setVisible(false)
  }

  return (
    <div className={`${prefixCls}`}>
      <div className={`${prefixCls}-title`}>场景解决方案  /  {list}</div>
      <div className={`${prefixCls}-wrapper`}>
        <div className={`${prefixCls}-left`}>
          <img src="https://www-static.qbox.me/_next/static/media/image2.8841d7f6fb5683c2aca63fa52e899546.jpg" alt="" className={`${prefixCls}-left-top-image`} />
          <div className={`${prefixCls}-left-small-banner`}>
            <span> <svg width="1em" height="1em" viewBox="0 0 16 16" >
              <polygon fill="currentColor" points="5.655 3.471 5.655 10.47 12.655 10.471 12.655 12.471 3.655 12.471 3.655 3.471" transform="scale(1 -1) rotate(45 27.398 0)" />
            </svg></span>
            <img src="https://www-static.qbox.me/_next/static/media/image1.6eef8fb9e77a28332b3ebfe809fb1faa.jpg" alt="" />
            <img src="https://www-static.qbox.me/_next/static/media/image3.440c55b9a93263cd26d7213c9587fd01.jpg" alt="" />
            <img src="https://demo-qnrtc-files.qnsdk.com/lowcode/list3.png" alt="" />
            <span> <svg width="1em" height="1em" viewBox="0 0 16 16">
              <polygon fill="currentColor" points="5.657 3.657 5.656 10.656 12.657 10.657 12.657 12.657 3.657 12.657 3.657 3.657" transform="rotate(-135 8.157 8.157)" />
            </svg></span>
          </div>
        </div>
        <div className={`${prefixCls}-right`}>
          <div className={`${prefixCls}-right-title`}>{list}解决方案</div>
          <div className={`${prefixCls}-right-title1`}>{scheme}</div>
          <div className={`${prefixCls}-right-score`}>
            <span className={`${prefixCls}-right-score-start`}>★  ★  ★  ★  ☆</span>
            <span>4.0</span>
            <span>129 个评分</span></div>
          <div className={`${prefixCls}-right-download`}>
            <img src="https://demo-qnrtc-files.qnsdk.com/lowcode/down.svg" alt="" />
            <span>301次</span>
          </div>
          <Divider />
          <div className={`${prefixCls}-right-platform`}>
            <span className={`${prefixCls}-right-platform-support`}>支持平台</span>
            <span>Android | iOS</span>
          </div>
          <Button type="primary" className={`${prefixCls}-right-create-app`} onClick={() => setVisible(true)}>创建应用</Button>
        </div>
      </div>
      <Tabs size="large">
        <Tabs.TabPane tab="应用场景" key="app-scenarios" />
        <Tabs.TabPane tab="方案优势" key="scheme-advantage" />
        <Tabs.TabPane tab="方案架构" key="solution-architecture" />
      </Tabs>

      <ModalForm
        title="创建应用"
        visible={visible}
        labelWidth="4.5em"
        layout="horizontal"
        verticalGap="30px"
        labelColor="light"
        onSubmit={onSubmit}
        onCancel={() => setVisible(false)}
        maskClickable
        width={650}
      >
        <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>

          <FormItem label="应用名称" labelVerticalAlign="text" required>
            <TextInput placeholder="输入建议" />
            <p style={{ margin: '0', color: '#AEAEAE', fontSize: '13px' }}>支持中文、英文、数字或下划线组成，不支持特殊字符，字符长度1-32</p>
          </FormItem>
          <FormItem label="应用描述">
            <TextArea placeholder="请输入备注" />
          </FormItem>
          <FormItem label="应用场景">
            <Select placeholder="请选择 电商直播 互动直播">
              <Option value="commerce">电商直播</Option>
              <Option value="interactive">互动直播</Option>
            </Select>
          </FormItem>
          <FormItem label="集成方式" labelVerticalAlign="text">
            <RadioGroup defaultValue="pre-paid">
              <Radio value="ui">带UI集成</Radio>
              <Radio value="standard">标准集成（不带UI）</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="直播组件" labelVerticalAlign="text">
            <CheckboxGroup defaultValue={['micro']}>
              <Checkbox value="micro">连麦组件</Checkbox>
              <Checkbox value="live">直播美颜</Checkbox>
              <Tooltip placement="right" title="选择直播美颜组件需要先购买对应产品，请咨询您的销售确认，否则在实际应用中不会有相应功能效果">
                <svg width="1em" height="1em" viewBox="-2 -2 18 16">
                  <path fill="currentColor" d="M8,1 C11.8659932,1 15,4.13400675 15,8 C15,11.8659932 11.8659932,15 8,15 C4.13400675,15 1,11.8659932 1,8 C1,4.13400675 4.13400675,1 8,1 Z M8,2.5 C4.96243388,2.5 2.5,4.96243388 2.5,8 C2.5,11.0375661 4.96243388,13.5 8,13.5 C11.0375661,13.5 13.5,11.0375661 13.5,8 C13.5,4.96243388 11.0375661,2.5 8,2.5 Z M8.03571429,10.3406593 C8.27747253,10.3406593 8.48626374,10.4175824 8.6510989,10.5714286 C8.80494505,10.7252747 8.89285714,10.9230769 8.89285714,11.1648352 C8.89285714,11.4065934 8.80494505,11.6153846 8.6510989,11.7692308 C8.47527473,11.9230769 8.27747253,12 8.03571429,12 C7.79395604,12 7.59615385,11.9120879 7.44230769,11.7582418 C7.26648352,11.6043956 7.18956044,11.4065934 7.18956044,11.1648352 C7.18956044,10.9230769 7.26648352,10.7252747 7.44230769,10.5714286 C7.59615385,10.4175824 7.79395604,10.3406593 8.03571429,10.3406593 Z M8.23351648,4 C8.9478022,4 9.53021978,4.18681319 9.96978022,4.58241758 C10.4093407,4.96703297 10.6291209,5.49450549 10.6291209,6.16483516 C10.6291209,6.71428571 10.4862637,7.16483516 10.2225275,7.51648352 C10.1236264,7.62637363 9.80494505,7.92307692 9.27747253,8.38461538 C9.07967033,8.53846154 8.93681319,8.72527473 8.83791209,8.92307692 C8.72802198,9.14285714 8.67307692,9.38461538 8.67307692,9.64835165 L8.67307692,9.64835165 L8.67307692,9.8021978 L7.40934066,9.8021978 L7.40934066,9.64835165 C7.40934066,9.23076923 7.47527473,8.86813187 7.62912088,8.57142857 C7.77197802,8.27472527 8.20054945,7.81318681 8.91483516,7.17582418 L8.91483516,7.17582418 L9.0467033,7.02197802 C9.24450549,6.78021978 9.34340659,6.51648352 9.34340659,6.24175824 C9.34340659,5.87912088 9.23351648,5.59340659 9.03571429,5.38461538 C8.82692308,5.17582418 8.53021978,5.07692308 8.15659341,5.07692308 C7.68406593,5.07692308 7.34340659,5.21978022 7.12362637,5.51648352 C6.93681319,5.76923077 6.8489011,6.13186813 6.8489011,6.6043956 L6.8489011,6.6043956 L5.59615385,6.6043956 C5.59615385,5.79120879 5.82692308,5.15384615 6.31043956,4.69230769 C6.78296703,4.23076923 7.42032967,4 8.23351648,4 Z" />
                </svg>
              </Tooltip>

            </CheckboxGroup>
          </FormItem>
          <FormItem label="互动组件" labelVerticalAlign="text">
            <CheckboxGroup defaultValue={['pk']}>
              <Checkbox value="pk">PK组件</Checkbox>
              <Checkbox value="like">点赞组件</Checkbox>
              <Checkbox value="gift">礼物组件</Checkbox>
              <Checkbox value="danmu">弹幕组件</Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="通用组件" labelVerticalAlign="text">
            <CheckboxGroup defaultValue={['subscribe']}>
              <Checkbox value="subscribe">直播预约</Checkbox>
              <Checkbox value="announcement">直播公告</Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="电商组件" labelVerticalAlign="text">
            <CheckboxGroup defaultValue={['shopping']}>
              <Checkbox value="shopping">购物车</Checkbox>

            </CheckboxGroup>
          </FormItem>
          <FormItem label="安全组件" labelVerticalAlign="text">
            <CheckboxGroup defaultValue={['secure']}>
              <Checkbox value="secure">鉴黄暴恐</Checkbox>
            </CheckboxGroup>
          </FormItem>

          <FormItem label="直播空间" labelVerticalAlign="text" required>
            <RadioGroup defaultValue="2">
              <Radio value="1">SDK-LIVE1</Radio>
              <Radio value="2">SDK-LIVE2</Radio>
              <Radio value="3">SDK-LIVE3</Radio>
              <Radio value="4">SDK-LIVE4</Radio>
              {/* <Radio value="5">SDK-LIVE5</Radio> */}
            </RadioGroup>
          </FormItem>
          <FormItem label="直播域名" labelVerticalAlign="text">
            <RadioGroup defaultValue="ui">
              <p style={{ margin: '0', lineHeight: '23px' }}>RTMP/SRT推流：</p>
              <Radio value="ui" disabled>pili-publish.test.qnsdk.com</Radio>
              <p style={{ margin: '10px 0 0 0', lineHeight: '23px' }}>RTMP/SRT播放：</p>
              <Radio value="ui" disabled>pili-rtmp.qnsdk.com</Radio>
              <Radio value="ui" disabled>pili-rtmp.test.qnsdk.com</Radio>
              <p style={{ margin: '10px 0 0 0', lineHeight: '23px' }}>HLS播放：</p>
              <Radio value="ui" disabled>pili-hls.qnsdk.com</Radio>
              <Radio value="ui" disabled>pili-hls.test.qnsdk.com</Radio>
              <p style={{ margin: '10px 0 0 0', lineHeight: '23px' }}>HDL播放：</p>
              <Radio value="ui" disabled>pili-hdl.qnsdk.com</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="RTC应用" labelVerticalAlign="text" required>
            <RadioGroup defaultValue="d3x2ghs1p">
              <Radio value="d8dreaads1">d8dreaads1</Radio>
              <Radio value="d3x2ghs1p">d3x2ghs1p</Radio>
              <Radio value="d8w2jks1p">d8w2jks1p</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="通讯服务(IM)" labelVerticalAlign="text" required>
            <RadioGroup defaultValue="dkcresfjshjk">
              <Radio value="dkcresfjshjk" disabled>dkcresfjshjk</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="存储空间" labelVerticalAlign="text" required>
            <RadioGroup defaultValue="2">
              <Radio value="1">SDK-LIVE1</Radio>
              <Radio value="2">SDK-LIVE2</Radio>
              <Radio value="3">SDK-LIVE3</Radio>
              <Radio value="4">SDK-LIVE4</Radio>
              {/* <Radio value="5">SDK-LIVE5</Radio> */}
            </RadioGroup>
          </FormItem>
          <FormItem label="回调域名">
            <div style={{ display: 'flex' }}>
              <TextInput placeholder="请输入" />
              <Tooltip placement="right" title="为确保安全组件的运行需要填写回调域名，如果不填写也不影/pages/viewpage.action响直播应用，但安全服务将会失效">
                <div style={{ paddingTop: '6px', marginLeft: '3px', color: '#AEAEAE' }}>
                  <svg width="1em" height="1em" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M8,1 C11.8659932,1 15,4.13400675 15,8 C15,11.8659932 11.8659932,15 8,15 C4.13400675,15 1,11.8659932 1,8 C1,4.13400675 4.13400675,1 8,1 Z M8,2.5 C4.96243388,2.5 2.5,4.96243388 2.5,8 C2.5,11.0375661 4.96243388,13.5 8,13.5 C11.0375661,13.5 13.5,11.0375661 13.5,8 C13.5,4.96243388 11.0375661,2.5 8,2.5 Z M8.03571429,10.3406593 C8.27747253,10.3406593 8.48626374,10.4175824 8.6510989,10.5714286 C8.80494505,10.7252747 8.89285714,10.9230769 8.89285714,11.1648352 C8.89285714,11.4065934 8.80494505,11.6153846 8.6510989,11.7692308 C8.47527473,11.9230769 8.27747253,12 8.03571429,12 C7.79395604,12 7.59615385,11.9120879 7.44230769,11.7582418 C7.26648352,11.6043956 7.18956044,11.4065934 7.18956044,11.1648352 C7.18956044,10.9230769 7.26648352,10.7252747 7.44230769,10.5714286 C7.59615385,10.4175824 7.79395604,10.3406593 8.03571429,10.3406593 Z M8.23351648,4 C8.9478022,4 9.53021978,4.18681319 9.96978022,4.58241758 C10.4093407,4.96703297 10.6291209,5.49450549 10.6291209,6.16483516 C10.6291209,6.71428571 10.4862637,7.16483516 10.2225275,7.51648352 C10.1236264,7.62637363 9.80494505,7.92307692 9.27747253,8.38461538 C9.07967033,8.53846154 8.93681319,8.72527473 8.83791209,8.92307692 C8.72802198,9.14285714 8.67307692,9.38461538 8.67307692,9.64835165 L8.67307692,9.64835165 L8.67307692,9.8021978 L7.40934066,9.8021978 L7.40934066,9.64835165 C7.40934066,9.23076923 7.47527473,8.86813187 7.62912088,8.57142857 C7.77197802,8.27472527 8.20054945,7.81318681 8.91483516,7.17582418 L8.91483516,7.17582418 L9.0467033,7.02197802 C9.24450549,6.78021978 9.34340659,6.51648352 9.34340659,6.24175824 C9.34340659,5.87912088 9.23351648,5.59340659 9.03571429,5.38461538 C8.82692308,5.17582418 8.53021978,5.07692308 8.15659341,5.07692308 C7.68406593,5.07692308 7.34340659,5.21978022 7.12362637,5.51648352 C6.93681319,5.76923077 6.8489011,6.13186813 6.8489011,6.6043956 L6.8489011,6.6043956 L5.59615385,6.6043956 C5.59615385,5.79120879 5.82692308,5.15384615 6.31043956,4.69230769 C6.78296703,4.23076923 7.42032967,4 8.23351648,4 Z" />
                  </svg>
                </div>

              </Tooltip>
            </div>

          </FormItem>
        </div>
      </ModalForm>
    </div >
  )
}
