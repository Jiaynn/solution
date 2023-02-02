import React from "react";

import { RendererUtils as Renderer } from "cdn/test";
import DomainSelector, { IProps, createState } from ".";

it("DomainSelector should renders correctly", () => {
  const props: IProps = {
    state: createState(),
  };
  const renderer = new Renderer();
  const tree = renderer.createWithAct(<DomainSelector {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("DomainSelector should renders correctly with showFullCheck", () => {
  const props: IProps = {
    state: createState(),
    showFullCheck: true,
  };
  const renderer = new Renderer();
  const tree = renderer.createWithAct(<DomainSelector {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
