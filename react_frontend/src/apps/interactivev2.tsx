import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import InteractivePage from "shared/interactive/components/InteractivePage";
import { getQueryParams } from "shared/common/utilities/route";
import { renderCellLineSelectorModalUsingBBApi } from "shared/cellLineSelector/utilities/renderCellLineSelectorModal";
import {
  getBreadboxApi,
  apiFunctions,
  bbGetVectorCatalogApi,
} from "src/common/utilities/context";
import PlotlyLoader from "src/plot/components/PlotlyLoader";
import ApiContext from "shared/common/utilities/ApiContext";

const container = document.getElementById("react-interactive-v2-root");
const dataElement = document.getElementById("react-interactive-v2-data");
const cellLineSelectorContainer = document.getElementById(
  "cell_line_selector_modal"
); // defined in layout.html
const data = JSON.parse(dataElement.textContent);
const { showCustomAnalysis } = data;

const App = hot(() => {
  const launchCellLineSelectorModal = () =>
    renderCellLineSelectorModalUsingBBApi(
      getBreadboxApi,
      bbGetVectorCatalogApi,
      cellLineSelectorContainer
    );

  return (
    <ErrorBoundary>
      <ApiContext.Provider value={apiFunctions.breadbox}>
        <PlotlyLoader version="global">
          {(Plotly) => (
            <InteractivePage
              Plotly={Plotly}
              launchCellLineSelectorModal={launchCellLineSelectorModal}
              query={getQueryParams() as { [key: string]: string }}
              showCustomAnalysis={showCustomAnalysis}
              updateReactLoadStatus={() =>
                container.setAttribute(
                  "data-react-component-loaded-for-selenium",
                  "true"
                )
              }
            />
          )}
        </PlotlyLoader>
      </ApiContext.Provider>
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
