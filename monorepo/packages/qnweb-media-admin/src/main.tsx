import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import 'react-icecream/dist/icecream.min.css';
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import 'moment/dist/locale/zh-cn';

import { Store } from '@/store';
import { Router } from './router';

import './styles/index.scss';

moment.locale('zh-cn');

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Store>
      <Router/>
    </Store>
  </ConfigProvider>,
  document.getElementById('root')
);
