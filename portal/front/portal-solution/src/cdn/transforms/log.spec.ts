import { I18nStore } from "portal-base/common/i18n";

import { createContainer } from "cdn/test";

import { validateHumanizeMessageFN } from "cdn/test/utils";

import * as messages from "cdn/locales/messages";

import { logStatus } from "cdn/constants/log";

import { humanizeLogStatus } from "./log";

describe("humanizeLogStatus works correctly", () => {
  it("with existent status", () => {
    const container = createContainer();
    const i18n = container.get(I18nStore);
    validateHumanizeMessageFN(i18n.t, humanizeLogStatus, logStatus);
  });

  it("with inexistent status", () => {
    const container = createContainer();
    const i18n = container.get(I18nStore);
    const result = i18n.t(humanizeLogStatus("other"));
    expect(result).toBe(i18n.t(messages.unknownState));
  });
});
