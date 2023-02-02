/**
 * @desc cases for guide step component
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import GuideStep from "./Step";

it("renders correctly", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <GuideStep
        activeIndex={1}
        total={4}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      >
        <div>foo</div>
      </GuideStep>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
