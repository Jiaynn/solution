import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './pages/home';
import Room from './pages/room';

const IRouter = () => {
  return <BrowserRouter>
    <Switch>
      <Route path='/' exact component={Home} />
      <Route path='/room' component={Room} />
    </Switch>
  </BrowserRouter>;
};

export default IRouter;