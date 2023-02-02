import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { refererTypes } from "cdn/constants/domain";

jest.mock("rc-tabs/lib/ScrollableInkTabBar", () => () => null);

import DomainRefererConfigInput, { createState } from ".";

const renderer = new Renderer();

it("renders correctly with referer disabled", () => {
  const state = createState({
    refererType: refererTypes.empty,
    refererValues: [],
    nullReferer: false,
  });
  const tree = renderer
    .createWithAct(<DomainRefererConfigInput state={state} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with referer type white", () => {
  const state = createState({
    refererType: refererTypes.white,
    refererValues: ["a.com"],
    nullReferer: false,
  });
  const tree = renderer
    .createWithAct(<DomainRefererConfigInput state={state} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with empty referer values", () => {
  const state = createState({
    refererType: refererTypes.white,
    refererValues: [],
    nullReferer: false,
  });
  const tree = renderer
    .createWithAct(<DomainRefererConfigInput state={state} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with referer type black", () => {
  const state = createState({
    refererType: refererTypes.black,
    refererValues: ["b.com"],
    nullReferer: false,
  });
  const tree = renderer
    .createWithAct(<DomainRefererConfigInput state={state} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with nullReferer enabled", () => {
  const state = createState({
    refererType: refererTypes.white,
    refererValues: [],
    nullReferer: true,
  });
  const tree = renderer
    .createWithAct(<DomainRefererConfigInput state={state} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with error", () => {
  const state = createState({
    refererType: refererTypes.white,
    refererValues: [],
    nullReferer: false,
  });
  state.$.config.setError("test error");
  const tree = renderer
    .createWithAct(<DomainRefererConfigInput state={state} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
