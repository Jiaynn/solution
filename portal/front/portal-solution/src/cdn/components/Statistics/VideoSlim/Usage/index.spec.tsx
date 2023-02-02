import React from "react";
import moment from "moment";

import { RendererUtils as Renderer } from "cdn/test";

jest.mock("react-icecream-charts/lib/area", () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AreaChart: (props: React.PropsWithChildren<{}>) => (
    <p>{JSON.stringify(props, null, 2)}</p>
  ),
}));

jest.mock("antd/lib/spin", () => ({
  __esModule: true,
  default: (props: React.PropsWithChildren<{}>) => (
    <div className="mock-antd-spin">{props.children || null}</div>
  ),
}));
import VideoSlimUsage from ".";

it("renders correctly", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <VideoSlimUsage
        options={{
          domains: ["foo.com"],
          startDate: moment("2018-12-01"),
          endDate: moment("2018-12-04"),
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
