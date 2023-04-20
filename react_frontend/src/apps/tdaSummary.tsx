import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import TDASummaryPage from "src/tda/components/TDASummaryPage";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "src/common/styles/typeahead_fix.scss";

const container = document.getElementById("react-tda-summary");

const App = hot(() => {
  return (
    <ErrorBoundary>
      <TDASummaryPage />
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
