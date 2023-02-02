import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { isps } from "cdn/constants/isp";
import IspSelector from "./IspSelector";

const noop = () => null;

it("renders correctly with correct value", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(<IspSelector value={isps.telecom} onChange={noop} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with incorrect value", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(<IspSelector value="xxx" onChange={noop} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with empty value", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(<IspSelector value="" onChange={noop} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
