import { HttpClient } from "qn-fe-core/client";

import { createContainer } from "cdn/test";

import DomainApis from "cdn/apis/domain";
import DomainProxyClient from "cdn/apis/clients/domain-proxy";

import { checkDomainExistence, ValidateError } from ".";

const domainName = "test.qiniu.com";

async function makeFetchRet({
  status,
  payload,
}: {
  status: number;
  payload: any;
}) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=UTF-8",
  });
  return new Response(JSON.stringify(payload), { status, headers });
}

describe("checkDomainExistence", () => {
  it("should work well with existed domain", async () => {
    const container = createContainer();
    const domainApis = container.get(DomainApis);
    const client = container.get(DomainProxyClient);

    client.fetch = jest.fn(client.fetch).mockResolvedValue({
      name: domainName,
    }) as any;

    const checked = await checkDomainExistence(domainApis, domainName);
    expect(checked).toBe(ValidateError.IsAlreadyExisted);
  });

  it("should work well with non-existed domain", async () => {
    const mockFetch = jest.fn(window.fetch);
    mockFetch.mockReturnValue(
      makeFetchRet({
        status: 400,
        payload: {
          code: 404001,
          message: "无此域名",
        },
      })
    );
    const container = createContainer([
      { identifier: HttpClient, factory: () => new HttpClient(mockFetch) },
    ]);

    const domainApis = container.get(DomainApis);

    const checked = await checkDomainExistence(domainApis, domainName);
    expect(checked).toBe(null);
  });

  it("should work well with exception", async () => {
    const mockFetch = jest.fn(window.fetch);
    mockFetch.mockReturnValue(
      makeFetchRet({
        status: 500,
        payload: {
          code: 500000,
          message: "内部错误",
        },
      })
    );
    const container = createContainer([
      { identifier: HttpClient, factory: () => new HttpClient(mockFetch) },
    ]);

    const domainApis = container.get(DomainApis);

    const checked = await checkDomainExistence(domainApis, domainName);
    expect(checked).toBe("无法检查域名是否已经存在");
  });
});
