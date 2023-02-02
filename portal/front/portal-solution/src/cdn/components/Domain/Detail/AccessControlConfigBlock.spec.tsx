/**
 * @desc cases for access control config component
 * @email yaojingtian@qiniu.com
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import mockDomainDetail from "cdn/test/domain-detail-mock";

import AccessControlConfigBlock from "./AccessControlConfigBlock";

const domain = mockDomainDetail();

const mockHandle = jest.fn();

it("renders correctly", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <AccessControlConfigBlock
        domain={domain}
        loading={false}
        handleConfigureReferer={mockHandle}
        handleConfigureTimeReferer={mockHandle}
        handleConfigureBsAuth={mockHandle}
        handleConfigureIpACL={mockHandle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with loading: true", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <AccessControlConfigBlock
        domain={domain}
        loading
        handleConfigureReferer={mockHandle}
        handleConfigureTimeReferer={mockHandle}
        handleConfigureBsAuth={mockHandle}
        handleConfigureIpACL={mockHandle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
