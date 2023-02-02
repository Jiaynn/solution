/*
 * @file cases for domain create component
 * @author nighca <nighca@live.cn>
 */

import React from "react";

import {
  createRendererWithRouter,
  createDcdnRendererWithRouter,
} from "cdn/test";

import { DomainType } from "cdn/constants/domain";

import { DomainCreate } from "./index";

jest.mock("rc-tabs/lib/ScrollableInkTabBar", () => () => null);

const renderer = createRendererWithRouter();
const dcdnRenderer = createDcdnRendererWithRouter();

it("renders correctly", () => {
  const tree = renderer.create(<DomainCreate />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with type wildcard", () => {
  const tree = renderer
    .create(<DomainCreate type={DomainType.Wildcard} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with type pan", () => {
  const tree = renderer
    .create(<DomainCreate type={DomainType.Pan} pareDomain=".a.com" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with bucket", () => {
  const tree = renderer.create(<DomainCreate bucket="test" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with bucket & shouldFixBucket", () => {
  const tree = renderer
    .create(<DomainCreate bucket="test" shouldFixBucket />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders dcdn correctly", () => {
  const tree = dcdnRenderer.create(<DomainCreate />).toJSON();
  expect(tree).toMatchSnapshot();
});
