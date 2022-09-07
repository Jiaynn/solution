import React from 'react';
import { Image, Layout, Menu, MenuProps, Space } from 'antd';

import logo from './logo.png';
import logoText from './logo-text.png';

import './index.scss';

export type PageContainerProps = {
  title?: string;
  menuConfig?: MenuProps['items'];
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: MenuProps['onSelect'];
};

const { Header, Content, Sider } = Layout;

export const PageContainer: React.FC<PageContainerProps> = (props) => {
  const { title, children, menuConfig, selectedKeys, defaultSelectedKeys, onSelect } = props;

  return (
    <Layout className="page-container">
      <Header className="page-container-header">
        <Space className="logo">
          <Image
            preview={false}
            src={logo}
            alt="logo"
            width={30}
          />
          <Image
            preview={false}
            src={logoText}
            alt="logo-text"
            width={45}
          />
        </Space>
      </Header>

      <Layout>
        <Sider className="page-container-sider" trigger={null} collapsible>
          <div className="title">媒资系统</div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedKeys}
            defaultSelectedKeys={defaultSelectedKeys}
            items={menuConfig}
            onSelect={onSelect}
          />
        </Sider>

        <Layout className="page-container-main">
          {title && <h3 className="title">{title}</h3>}
          <Content className="content">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
