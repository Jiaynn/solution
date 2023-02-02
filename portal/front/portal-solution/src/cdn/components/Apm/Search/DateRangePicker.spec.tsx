import React from "react";
import moment from "moment";

import { RendererUtils as Renderer } from "cdn/test";
import DateRangePicker from "./DateRangePicker";

const noop = () => null;

it("renders correctly", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <DateRangePicker
        value={[moment("2018-08-09"), moment("2018-08-10")]}
        onChange={noop}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
