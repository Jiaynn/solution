/*
 * @file cases for prime item component
 * @author linchen <linchen@qiniu.com>
 */

import React from "react";

import { RendererUtils as Renderer } from "cdn/test";

import { PrimeLevel, PrimeStatus } from "cdn/constants/qas";

import { IPrimeItem, IQasPrimeStatus } from "cdn/apis/qas";

import PrimeItem from ".";

it("renders correctly", () => {
  const status: IQasPrimeStatus = {
    level: PrimeLevel.PrimeA,
    state: PrimeStatus.Actived,
  };
  const item: IPrimeItem = {
    level: PrimeLevel.PrimeA,
    sla: "100",
    ratio: 50,
    price: 1.3,
  };

  const tree = new Renderer()
    .createWithAct(
      <PrimeItem
        status={status}
        item={item}
        onClick={(it: IQasPrimeStatus) => console.log(it)}
      />
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
