/**
 * @desc cases for video slim list component
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { useInjection } from "qn-fe-core/di";
import { useLocalStore } from "portal-base/common/utils/store";
import { ToasterStore } from "portal-base/common/toaster";

import { createRendererWithRouter } from "cdn/test";

import { validateHumanizeFN } from "cdn/test/utils";

import {
  taskStateTextMap,
  TaskState,
  VideoDef,
} from "cdn/constants/video-slim";
import Routes from "cdn/constants/routes";

import VideoSlimList, {
  VideoSlimListInner,
  LocalStore,
  humanizeTaskState,
  canChangeAutoEnable,
  canDelete,
  canPreview,
  canDisable,
  canEnable,
  getStateColor,
} from ".";

const renderer = createRendererWithRouter();

it("renders correctly", () => {
  const tree = renderer
    .createWithAct(<VideoSlimList domain="foo.com" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly with given store", () => {
  const mockedDomain = "foo.com";

  const mockedTaskInfo = {
    domain: mockedDomain,
    cdnAutoEnable: false,
    avType: "mp4",
    state: TaskState.SlimSuccess,
    originDef: VideoDef.HD,
    afterDef: VideoDef.HD,
    originDur: 3000,
    originSize: 12345,
    originBr: 1000,
    afterSize: 2345,
    afterDur: 3000,
    afterBr: 1000,
  };

  const TestVideoSlimList = observer(function _TestVideoSlimList() {
    const mockedStore = useLocalStore(LocalStore, { domain: mockedDomain });
    const toaster = useInjection(ToasterStore);
    const routes = useInjection(Routes);

    useEffect(() => {
      mockedStore.collectionStore.update(
        (Object.keys(TaskState) as Array<keyof typeof TaskState>).map(
          (state) =>
            ({
              ...mockedTaskInfo,
              state: TaskState[state],
              id: TaskState[state],
              resource: `/${TaskState[state]}`,
            } as any)
        )
      );
    }, [mockedStore]);

    return (
      <VideoSlimListInner
        toasterStore={toaster}
        store={mockedStore}
        domain={mockedDomain}
        routes={routes}
      />
    );
  });

  const tree = renderer.createWithAct(<TestVideoSlimList />).toJSON();
  expect(tree).toMatchSnapshot();
});

describe("transform functions works correctly", () => {
  it("humanizeTaskState", () => {
    validateHumanizeFN(humanizeTaskState, taskStateTextMap);
  });

  it("canChangeAutoEnable", () => {
    expect(canChangeAutoEnable(TaskState.SlimWaiting)).toBe(true);
    expect(canChangeAutoEnable(TaskState.SlimProcessing)).toBe(true);
    expect(canChangeAutoEnable(TaskState.SlimSuccess)).toBe(false);
  });

  it("canDelete", () => {
    expect(canDelete(TaskState.SlimFailed)).toBe(true);
    expect(canDelete(TaskState.SlimSuccess)).toBe(true);
    expect(canDelete(TaskState.SlimWaiting)).toBe(false);
  });

  it("canPreview", () => {
    expect(canPreview(TaskState.SlimSuccess)).toBe(true);
    expect(canPreview(TaskState.Enabled)).toBe(false);
    expect(canPreview(TaskState.Enabling)).toBe(false);
    expect(canPreview(TaskState.Stopping)).toBe(false);
  });

  it("canEnable", () => {
    expect(canEnable(TaskState.SlimSuccess)).toBe(true);
    expect(canEnable(TaskState.Enabled)).toBe(false);
    expect(canEnable(TaskState.Enabling)).toBe(false);
    expect(canEnable(TaskState.Stopping)).toBe(false);
  });

  it("canDisable", () => {
    expect(canDisable(TaskState.Enabled)).toBe(true);
    expect(canDisable(TaskState.SlimSuccess)).toBe(false);
    expect(canDisable(TaskState.Enabling)).toBe(false);
    expect(canDisable(TaskState.Stopping)).toBe(false);
  });

  it("getStateColor", () => {
    expect(getStateColor(TaskState.SlimSuccess)).toBe("status-color-success");
    expect(getStateColor(TaskState.Enabled)).toBe("status-color-success");
    expect(getStateColor(TaskState.SlimFailed)).toBe("status-color-failed");
    expect(getStateColor(TaskState.Stopping)).toBe("");
  });
});
