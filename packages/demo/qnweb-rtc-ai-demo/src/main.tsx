import React from 'react';
import ReactDOM from 'react-dom';
import IRouter from './IRouter';
import './sdk/qnweb-rtc.umd';
import './sdk/qnweb-rtc-ai.umd';
import 'antd/dist/antd.css';
import './style/common.scss';

ReactDOM.render(
  <IRouter />,
  document.getElementById('root')
);
