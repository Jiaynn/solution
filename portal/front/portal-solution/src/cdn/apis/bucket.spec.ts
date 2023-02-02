import { createContainer } from "cdn/test";

import CommonClient from "cdn/apis/clients/common";

import BucketApis from "./bucket";

it("getBucketsSimplified should work well", () => {
  const container = createContainer();
  const commonClient = container.get(CommonClient);
  commonClient.get = jest.fn(commonClient.get) as any;

  const bucketApis = container.get(BucketApis);
  bucketApis.getBucketsSimplified();

  expect(commonClient.get).toBeCalledWith("/api/fusion/buckets-simplified");
});
