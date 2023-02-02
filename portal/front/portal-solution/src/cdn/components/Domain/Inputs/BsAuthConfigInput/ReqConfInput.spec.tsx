import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { userAuthReqObjectKeyOfTypes } from "cdn/constants/domain";
import { ReqConfInput, IProps } from "./ReqConfInput";

const noop = () => null;

const testCase: IProps[] = [
  {
    value: [
      {
        key: "",
        value: "",
        type: "",
      },
    ],
    error: [],
    title: "",
    onChange: noop,
  },
  {
    value: [
      {
        key: "x-from-cdn",
        value: "qiniu",
        type: userAuthReqObjectKeyOfTypes.originIp,
      },
    ],
    error: [],
    title: "Header",
    onChange: noop,
  },
];

it("renders correctly", () => {
  for (const props of testCase) {
    const tree = new Renderer()
      .createWithAct(
        <ReqConfInput
          error={props.error}
          value={props.value}
          title={props.title}
          onChange={props.onChange}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  }
});
