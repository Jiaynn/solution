import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { Snapshot, SnapshotThumb, SnapshotType } from ".";
import { IPicture } from "../VideoPlayer";

const picture: IPicture = {
  time: 120.1234,
  content: "",
};

describe("renders Snapshot correctly", () => {
  it("for before", () => {
    const renderer = new Renderer();
    const tree = renderer
      .createWithAct(<Snapshot picture={picture} type={SnapshotType.Before} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("for after", () => {
    const renderer = new Renderer();
    const tree = renderer
      .createWithAct(<Snapshot picture={picture} type={SnapshotType.After} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("renders SnapshotThumb correctly", () => {
  it("for before", () => {
    const renderer = new Renderer();
    const tree = renderer
      .createWithAct(
        <SnapshotThumb picture={picture} type={SnapshotType.Before} />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("for after", () => {
    const renderer = new Renderer();
    const tree = renderer
      .createWithAct(
        <SnapshotThumb picture={picture} type={SnapshotType.After} />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
