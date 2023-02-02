/*
 * @file cases for domain create component
 * @author nighca <nighca@live.cn>
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import SideModal from ".";

it("renders correctly", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <SideModal visible>
        <div>foo</div>
      </SideModal>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with visible: false", () => {
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <SideModal visible={false}>
        <div>foo</div>
      </SideModal>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
