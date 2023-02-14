import React from "react";
import { observer } from "mobx-react";
import Dashboard from "kodo/components/Dashboard";
import { Redirect, Route, Switch } from "qn-fe-core/router";
import { kodoOverviewBasename } from "../overviewRouterConfig";

export default observer(function KodoOverview() {
    return (
        <Switch>
            <Route relative path="/" exact >
                <Redirect relative to={'/storage'} />
            </Route>
            <Route relative path="/:type" component={({ match }) => {
                const type = match.params.type
                return <Dashboard type={type} />
            }} />
        </Switch>
    )
});