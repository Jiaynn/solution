import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { SourceURLScheme } from "cdn/constants/domain";
import DomainSourceURLSchemeInput, {
  createState,
} from "./SourceURLSchemeInput";

const renderer = new Renderer();

describe("DomainSourceURLSchemeInput", () => {
  it("renders correctly with value follow", () => {
    const tree = renderer
      .createWithAct(
        <DomainSourceURLSchemeInput
          state={createState(SourceURLScheme.Follow)}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with value follow", () => {
    const tree = renderer
      .createWithAct(
        <DomainSourceURLSchemeInput state={createState(SourceURLScheme.Http)} />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with value follow", () => {
    const tree = renderer
      .createWithAct(
        <DomainSourceURLSchemeInput
          state={createState(SourceURLScheme.Https)}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
