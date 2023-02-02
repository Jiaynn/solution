/*
 * @file cases for domain create component
 * @author nighca <nighca@live.cn>
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import TestDomain from ".";

it("renders correctly", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(<TestDomain name="pc1xib4ss.test.bkt.clouddn.com" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
