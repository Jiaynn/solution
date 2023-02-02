import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import AlarmCallback from ".";

it("renders correctly", () => {
  const renderer = new Renderer();
  const tree = renderer.createWithAct(<AlarmCallback />).toJSON();
  expect(tree).toMatchSnapshot();
});
