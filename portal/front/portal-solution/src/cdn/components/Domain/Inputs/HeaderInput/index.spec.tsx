/*
 * @file cases for domain http header input form
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import mockDomainDetail from "cdn/test/domain-detail-mock";

import {
  ResponseHeaderControlKey,
  ResponseHeaderControlOp,
} from "cdn/constants/domain";

import HttpHeaderInput, {
  createState,
} from "cdn/components/Domain/Inputs/HeaderInput";

const domain = mockDomainDetail();

it("renders correctly", () => {
  const state = createState([
    {
      key: ResponseHeaderControlKey.ContentLanguage,
      value: "zh-CN",
      op: ResponseHeaderControlOp.Set,
    },
  ]);
  const tree = new Renderer()
    .createWithAct(<HttpHeaderInput domain={domain} state={state} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
