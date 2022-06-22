import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import QNWhiteBoard from 'qnweb-whiteboard';

import { RouterLoading } from '../components/router-loading';

const Home = lazy(() => import('../pages/home'));
const Room = lazy(() => import('../pages/room'));

export const Router: React.FC = () => {
  const basename = process.env.NODE_ENV === 'development' ? '/' : `/${QNWhiteBoard.version}`;
  return <BrowserRouter basename={basename}>
    <Suspense fallback={<RouterLoading/>}>
      <Switch>
        <Route path="/" exact component={Home}/>
        <Route path="/room" component={Room}/>
        <Redirect to="/"/>
      </Switch>
    </Suspense>
  </BrowserRouter>;
};
