import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { Protocol } from "cdn/constants/domain";
import { ProtocolInput, CertTypeInput } from "./index";

const protocolInputProps = {
  value: Protocol.Https,
  onChange: jest.fn(),
};

const certTypeInputProps = {
  value: "true",
  display: false,
  onChange: jest.fn(),
};

const renderer = new Renderer();

it("protocol input renders correctly", () => {
  const tree = renderer
    .createWithAct(<ProtocolInput {...protocolInputProps} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("cert type input renders correctly", () => {
  const tree = renderer
    .createWithAct(<CertTypeInput {...certTypeInputProps} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
