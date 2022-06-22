import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import useInitIM from './hooks/useInitIM';
import Home from './pages/home';
import Login from './pages/login';
import Chatroom from './pages/chatroom';

function IRouter() {
  useInitIM();
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Login} />
        <Route path='/home' component={Home} />
        <Route path='/chatroom' component={Chatroom} />
      </Switch>
    </BrowserRouter>
  );
}

export default IRouter;
