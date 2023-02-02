/*
 * @file cases for bs auth config input component
 * @author nighca <nighca@live.cn>
 */

import React from "react";
import { merge } from "lodash";

import { RendererUtils as Renderer } from "cdn/test";

import mockDomainDetail from "cdn/test/domain-detail-mock";

import { SourceURLScheme } from "cdn/constants/domain";

import DomainAdvancedSourcesInput, {
  createState as createInputState,
  getEmptySource,
} from ".";

const domain = mockDomainDetail();

function createState() {
  return createInputState([getEmptySource(false)], () => []);
}

it("renders correctly with http", () => {
  const state = createState();
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <DomainAdvancedSourcesInput
        domains={[
          merge({}, domain, {
            source: { sourceURLScheme: SourceURLScheme.Http },
          }),
        ]}
        state={state}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with https", () => {
  const state = createState();
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <DomainAdvancedSourcesInput
        domains={[
          merge({}, domain, {
            source: { sourceURLScheme: SourceURLScheme.Https },
          }),
        ]}
        state={state}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with follow", () => {
  const state = createState();
  const renderer = new Renderer();
  const tree = renderer
    .createWithAct(
      <DomainAdvancedSourcesInput
        domains={[
          merge({}, domain, {
            source: { sourceURLScheme: SourceURLScheme.Follow },
          }),
        ]}
        state={state}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
