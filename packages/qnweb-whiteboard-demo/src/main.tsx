import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import 'antd/dist/antd.css';

import './styles/index.scss';

import { Router } from './router';

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Router/>
  </ConfigProvider>,
  document.getElementById('root')
);
