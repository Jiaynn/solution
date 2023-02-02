import React, { PropsWithChildren } from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { DateMocker } from "cdn/test/utils";

jest.mock("react-icecream/lib/spin", () => ({
  __esModule: true,
  default: (props: PropsWithChildren<{}>) => <div>{props.children}</div>,
}));

import LogManage from "./index";

it("renders correctly", () =>
  new DateMocker().mock(() => {
    const tree = new Renderer().createWithAct(<LogManage />).toJSON();
    expect(tree).toMatchSnapshot();
  }));
