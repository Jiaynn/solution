import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';

import IRouter from './IRouter';
import './sdk/qnweb-rtc.umd';
import './sdk/qnweb-rtc-ai.umd';
import './style/common.scss';

ReactDOM.render(
  <IRouter />,
  document.getElementById('root')
);
