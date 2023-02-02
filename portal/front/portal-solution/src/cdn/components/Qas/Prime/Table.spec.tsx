/*
 * @file cases for prime desc table component
 * @author linchen <linchen@qiniu.com>
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";
import PrimeTable from "./Table";

it.only("renders correctly", () => {
  const tree = new Renderer().createWithAct(<PrimeTable />).toJSON();
  expect(tree).toMatchSnapshot();
});
