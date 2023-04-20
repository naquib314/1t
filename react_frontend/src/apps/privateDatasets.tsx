import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import PrivateDatasetsPage from "src/privateDataset/components/PrivateDatasetsPage";

const container = document.getElementById("private-datasets-page-container");
const dataElement = document.getElementById("react-private-datasets-data");
const data = JSON.parse(dataElement.textContent);
const { datasets, groups, email } = data;

const App = hot(() => {
  return (
    <ErrorBoundary>
      <PrivateDatasetsPage datasets={datasets} groups={groups} email={email} />
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
