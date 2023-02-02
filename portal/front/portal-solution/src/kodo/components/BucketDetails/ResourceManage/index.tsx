/**
 * @file component ResourceManage 内容管理入口
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from "react";
import { observer } from "mobx-react";
import { useLocalStore } from "qn-fe-core/local-store";
import { Route, Switch } from "portal-base/common/router";
import { Identifier, useContainer } from "qn-fe-core/di";

import { IDetailsBaseOptions } from "kodo/routes/bucket";

import { NotFoundRedirect } from "kodo/components/common/NotFoundRedirect";
import { AuthRoute } from "kodo/components/common/Auth";
import Main from "./Main";
import Upload from "./UploadManage";
import Store from "./store";

export interface IProps extends IDetailsBaseOptions {}

interface DiDeps {
  store: Store;
}

@observer
class InternalResourceManage extends React.Component<IProps & DiDeps> {
  render() {
    return (
      <Switch>
        <Route relative exact path="/">
          <Main {...this.props} store={this.props.store} />
        </Route>
        <Route relative exact title="上传文件" path="/upload">
          <AuthRoute
            iamPermission={{
              actionName: "Upload",
              resource: this.props.bucketName,
            }}
          >
            <Upload {...this.props} store={this.props.store} />
          </AuthRoute>
        </Route>
        <Route relative path="*">
          <NotFoundRedirect />
        </Route>
      </Switch>
    );
  }
}

export default function ResourceManage(props: IProps) {
  const container = useContainer();
  const inject = React.useCallback(
    function inject<T>(identifier: Identifier<T>) {
      return container.get(identifier);
    },
    [container]
  );

  const store = useLocalStore(Store, {
    bucketName: props.bucketName,
    inject,
  });
  return <InternalResourceManage {...props} store={store} />;
}
