import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import { RouterLoading } from '@/components';
import { env } from '@/config';

const Home = lazy(() => import('../pages/home'));
const Room = lazy(() => import('../pages/room'));

const MAIN_VERSION = mainVersion;

export const Router: React.FC = () => {
  const basename = env === 'dev' ? '/' : MAIN_VERSION;
  return <BrowserRouter>
    <Suspense fallback={<RouterLoading/>}>
      <Switch>
        <Route path="/home" exact component={Home}/>
        <Route path="/room" component={Room}/>
        <Redirect to="/home"/>
      </Switch>
    </Suspense>
  </BrowserRouter>;
};
