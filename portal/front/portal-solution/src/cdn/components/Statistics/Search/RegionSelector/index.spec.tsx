import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { IRegionSelectorProps } from "./store";
import RegionSelector from ".";

const noop = () => null;

it("renders correctly", () => {
  const props: IRegionSelectorProps = {
    value: [],
    onChange: noop,
  };
  const renderer = new Renderer();
  const tree = renderer.createWithAct(<RegionSelector {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
