import React from "react";

import { OemRendererUtils as Renderer } from "cdn/test";
import UserFinancial from ".";

it("renders correctly", () => {
  const tree = new Renderer().createWithAct(<UserFinancial />).toJSON();
  expect(tree).toMatchSnapshot();
});
