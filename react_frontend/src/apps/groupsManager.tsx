import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import { apiFunctions } from "src/common/utilities/context";
import ApiContext from "shared/common/utilities/ApiContext";
import { Spinner } from "shared/common/components/Spinner";

const GroupsManager = React.lazy(
  () => import("src/groupsManager/components/GroupsManager")
);

const container = document.getElementById("react-groups-manager-root");

const App = hot(() => {
  return (
    <ErrorBoundary>
      <ApiContext.Provider value={apiFunctions.breadbox}>
        <React.Suspense fallback={<Spinner />}>
          <GroupsManager />
        </React.Suspense>
      </ApiContext.Provider>
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
