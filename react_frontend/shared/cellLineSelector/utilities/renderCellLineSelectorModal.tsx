import React from "react";
import ReactDOM from "react-dom";
import ApiContext, {
  ApiContextInterface,
} from "shared/common/utilities/ApiContext";

const CellLineSelectorModal = React.lazy(
  () =>
    import(
      /* webpackChunkName: "CellLineSelector" */
      "shared/cellLineSelector/components/CellLineSelector"
    )
);

export default function renderCellLineSelectorModal(
  getApi: ApiContextInterface["getApi"],
  getVectorCatalogApi: ApiContextInterface["getVectorCatalogApi"],
  container: HTMLElement | null
) {
  if (!container) {
    throw new Error(
      "Could not launch Cell Line Selector modal: " +
        'no element with id "cell_line_selector_modal"'
    );
  }

  const dapi = getApi();
  const apiFunctions = {
    depmap: {
      getApi,
      getVectorCatalogApi,
    },
  };

  // Unmount a previous instance if any (otherwise this is a no-op).
  ReactDOM.unmountComponentAtNode(container);

  ReactDOM.render(
    <ApiContext.Provider value={apiFunctions.depmap}>
      <React.Suspense fallback={null}>
        <CellLineSelectorModal
          getCellLineSelectorLines={() => dapi.getCellLineSelectorLines()}
          getCellLineUrlRoot={() => dapi.getCellLineUrlRoot()}
          getCellignerColors={() => dapi.getCellignerColorMap()}
          getFeedbackUrl={() => dapi.getFeedbackUrl()}
        />
      </React.Suspense>
    </ApiContext.Provider>,
    container
  );
}

export function renderCellLineSelectorModalUsingBBApi(
  getApi: ApiContextInterface["getApi"],
  getVectorCatalogApi: ApiContextInterface["getVectorCatalogApi"],
  container: HTMLElement | null
) {
  if (!container) {
    throw new Error(
      "Could not launch Cell Line Selector modal: " +
        'no element with id "cell_line_selector_modal"'
    );
  }

  const bbapi = getApi();
  const apiFunctions = {
    breadbox: {
      getApi,
      getVectorCatalogApi,
    },
  };
  // Unmount a previous instance if any (otherwise this is a no-op).
  ReactDOM.unmountComponentAtNode(container);

  ReactDOM.render(
    <ApiContext.Provider value={apiFunctions.breadbox}>
      <React.Suspense fallback={null}>
        <CellLineSelectorModal
          getCellLineSelectorLines={() => bbapi.getCellLineSelectorLines()}
          getCellLineUrlRoot={() => bbapi.getCellLineUrlRoot()}
          getCellignerColors={() => bbapi.getCellignerColorMap()}
          getFeedbackUrl={() => bbapi.getFeedbackUrl()}
        />
      </React.Suspense>
    </ApiContext.Provider>,
    container
  );
}