/*
 * @file cases for domain http header config component
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import mockDomainDetail from "cdn/test/domain-detail-mock";

import HttpHeaderBlock from "./HttpHeaderBlock";

const domain = mockDomainDetail();

const doNothing = () => null;

it("renders correctly", () => {
  const renderer = new Renderer();

  const tree = renderer
    .createWithAct(
      <HttpHeaderBlock
        domain={domain}
        loading={false}
        handleConfigStart={doNothing}
        handleConfigCancel={doNothing}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with loading: true", () => {
  const renderer = new Renderer();

  const tree = renderer
    .createWithAct(
      <HttpHeaderBlock
        domain={domain}
        loading
        handleConfigStart={doNothing}
        handleConfigCancel={doNothing}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
