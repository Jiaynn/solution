import React from 'react';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation
} from 'react-router-dom';

import { PageContainer, PageContainerProps } from '@/layouts';
import { menuConfig } from '@/config';
import { VideoPage } from '@/pages/video';
import { AudioPage } from '@/pages/audio';
import { PicturePage } from '@/pages/picture';

type RoutePath = typeof menuConfig[number]['key'];

const mapPathToComponent: {
  [key in RoutePath]: React.FC;
} = {
  '/video': VideoPage,
  '/audio': AudioPage,
  '/picture': PicturePage,
};

const BaseRoute = () => {
  const history = useHistory();
  const location = useLocation();

  const title = menuConfig.find(
    item => item.key === location.pathname
  )?.label;

  /**
   * 菜单栏切换路由跳转
   * @param key
   */
  const onSelect: PageContainerProps['onSelect'] = ({ key }) => {
    history.push(key);
  };

  return <PageContainer
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
