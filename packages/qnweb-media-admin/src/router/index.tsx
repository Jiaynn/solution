import React from 'react';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation
} from 'react-router-dom';
import { useMount } from 'ahooks';

import { PageContainer, PageContainerProps } from '@/layouts';
import { menuConfig } from '@/config';
import { VideoPage } from '@/pages/video';
import { AudioPage } from '@/pages/audio';
import { PicturePage } from '@/pages/picture';
import { useStore } from '@/store';

type RoutePath = typeof menuConfig[number]['key'];

const mapPathToComponent: {
  [key in RoutePath]: React.FC;
} = {
  '/video': VideoPage,
  '/audio': AudioPage,
  '/picture': PicturePage,
};

const MAIN_VERSION = mainVersion;

const BaseRoute = () => {
  const history = useHistory();
  const location = useLocation();
  const store = useStore();

  const title = menuConfig.find(
    item => item.key === location.pathname
  )?.label;

  useMount(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token') || '';
    if (!token) return;
    store.dispatch({
      type: 'SET_TOKEN',
      payload: token
    });
  });

  /**
   * 菜单栏切换路由跳转
   * @param key
   */
  const onSelect: PageContainerProps['onSelect'] = ({ key }) => {
    history.push(key);
  };

  return <PageContainer
    version={<span style={{ fontSize: 12, marginLeft: 5 }}>{MAIN_VERSION}</span>}
    title={title}
    menuConfig={menuConfig}
    selectedKeys={[location.pathname]}
    onSelect={onSelect}
  >
    <Switch>
      {
        Object.entries(mapPathToComponent).map(([path, Component]) => {
          return <Route key={path} path={path}>
            <Component/>
          </Route>;
        })
      }
      <Redirect path="*" to="/video"/>
    </Switch>
  </PageContainer>;
};

export const Router = () => {
  return <BrowserRouter>
    <BaseRoute/>
  </BrowserRouter>;
};
