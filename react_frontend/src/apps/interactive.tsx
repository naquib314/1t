import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import InteractivePage from "shared/interactive/components/InteractivePage";
import { getQueryParams } from "shared/common/utilities/route";
import renderCellLineSelectorModal from "shared/cellLineSelector/utilities/renderCellLineSelectorModal";
import {
  getVectorCatalogApi,
  getDapi,
  apiFunctions,
} from "src/common/utilities/context";
import ApiContext from "shared/common/utilities/ApiContext";
import PlotlyLoader from "src/plot/components/PlotlyLoader";

const container = document.getElementById("react-interactive-root");
const dataElement = document.getElementById("react-interactive-data");
const cellLineSelectorContainer = document.getElementById(
  "cell_line_selector_modal"
); // defined in layout.html
const data = JSON.parse(dataElement.textContent);
const { showCustomAnalysis } = data;

const App = hot(() => {
  const launchCellLineSelectorModal = () =>
    renderCellLineSelectorModal(
      getDapi,
      getVectorCatalogApi,
      cellLineSelectorContainer
    );

  return (
    <ErrorBoundary>
      <ApiContext.Provider value={apiFunctions.depmap}>
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
