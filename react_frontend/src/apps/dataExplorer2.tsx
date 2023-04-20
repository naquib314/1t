import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import DataExplorer2 from "src/data-explorer-2/components/DataExplorer2";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "src/common/styles/typeahead_fix.scss";

const container = document.getElementById("data-explorer-2");
const dataElement = document.getElementById("data-explorer-2-data");
const { feedbackUrl } = JSON.parse(dataElement.textContent);

const App = hot(() => {
  return (
    <ErrorBoundary>
      <DataExplorer2 feedbackUrl={feedbackUrl} />
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
