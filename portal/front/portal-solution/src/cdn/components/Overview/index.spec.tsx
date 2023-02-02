import React from "react";

import { RendererUtils as Renderer, DcdnRendererUtils } from "cdn/test";
import Overview from ".";

jest.mock("rc-tabs/lib/ScrollableTabBarNode", () => () => null);

it("renders correctly", () => {
  const tree = new Renderer().createWithAct(<Overview />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders dcdn correctly", () => {
  const tree = new DcdnRendererUtils().createWithAct(<Overview />).toJSON();
  expect(tree).toMatchSnapshot();
});
