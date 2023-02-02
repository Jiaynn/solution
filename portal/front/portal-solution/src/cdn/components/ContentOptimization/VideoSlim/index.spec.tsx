/**
 * @desc cases for video slim component
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from "react";
import { LocalStorageStore } from "portal-base/common/utils/storage";

import { createRendererWithRouter } from "cdn/test";

import { videoSlimGuidesName } from "cdn/constants/guide";

import { getLocalStorageKey } from "cdn/components/common/Guide/Group";

import VideoSlim from ".";

const renderer = createRendererWithRouter();

beforeAll(() => {
  const storageStore = renderer.inject(LocalStorageStore);
  storageStore.setItem(getLocalStorageKey(videoSlimGuidesName), true);
});

it("renders correctly", () => {
  const tree = renderer.createWithAct(<VideoSlim />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with domain", () => {
  const tree = renderer.createWithAct(<VideoSlim domain="foo.com" />).toJSON();
  expect(tree).toMatchSnapshot();
});
