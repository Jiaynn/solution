import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import AutoEnableSwitch from "./AutoEnableSwitch";

it("renders correctly", () => {
  const renderer = new Renderer();

  const tree = renderer
    .createWithAct(<AutoEnableSwitch value onChange={() => null} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
