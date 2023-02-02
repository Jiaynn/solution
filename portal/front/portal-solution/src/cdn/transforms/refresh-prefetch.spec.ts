import { I18nStore } from "portal-base/common/i18n";

import { createContainer } from "cdn/test";
import {
  transUrlsToArr,
  validateUrlSchemes,
  validateUrls,
  validateDirs,
} from "./refresh-prefetch";

describe("transUrlsToArr", () => {
  it("should work correctly", () => {
    expect(transUrlsToArr("aa\nbb")).toEqual(["aa", "bb"]);
    expect(transUrlsToArr("\n\naa\n\nbb\n")).toEqual(["aa", "bb"]);
    expect(transUrlsToArr(" \n\n  aa \n   \nbb\n ")).toEqual(["aa", "bb"]);
  });
});

describe("validateUrlSchemes", () => {
  const container = createContainer();
  const i18n = container.get(I18nStore);
  expect(
    validateUrlSchemes([
      "https://ask.qcloudimg.com/draft/1035570/e0hzzjofc8.png?imageView2/2/w/1620",
      "http://www.qiniu.com",
    ])
  ).toEqual(undefined);
  expect(
    i18n.t(
      validateUrlSchemes([
        "b.com",
        "ftp://list:list@foolish.6600.org:2003/soft/list.txt",
        "file:///jira.qiniu.io/browse/FUSION-8851",
      ])!
    )
  ).toEqual("每个 URL 应当以 http:// 或 https:// 开头");
});

describe("validateUrls", () => {
  const container = createContainer();
  const i18n = container.get(I18nStore);
  expect(
    validateUrls([
      "https://ask.qcloudimg.com/draft/1035570/e0hzzjofc8.png?imageView2/2/w/1620",
      "http://www.qiniu.com",
    ])
  ).toEqual(undefined);
  expect(
    i18n.t(
      validateUrls([
        "b.com",
        "ftp://list:list@foolish.6600.org:2003/soft/list.txt",
        "file:///jira.qiniu.io/browse/FUSION-8851",
      ])!
    )
  ).toEqual("每个 URL 应当以 http:// 或 https:// 开头");
  expect(
    i18n.t(
      validateUrls([
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
      ])!
    )
  ).toEqual("每次最多提交 20 个文件");
});

describe("validateDirs", () => {
  const container = createContainer();
  const i18n = container.get(I18nStore);
  expect(
    validateDirs([
      "https://ask.qcloudimg.com/draft/1035570/e0hzzjofc8.png?imageView2/2/w/1620/",
      "http://www.qiniu.com/123/",
    ])
  ).toEqual(undefined);
  expect(
    i18n.t(
      validateDirs([
        "b.com/",
        "ftp://list:list@foolish.6600.org:2003/soft/list/",
        "file:///jira.qiniu.io/browse/FUSION-8851/",
      ])!
    )
  ).toEqual("每个 URL 应当以 http:// 或 https:// 开头");
  expect(i18n.t(validateDirs(["b.com"])!)).toEqual("每个 URL 应当以 / 结尾");
  expect(
    i18n.t(
      validateDirs([
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
        "http://a.com",
      ])!
    )
  ).toEqual("每次最多提交 5 个目录");
});
