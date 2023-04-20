import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";

import {
  DropdownState,
  OptionsInfoSelected,
} from "shared/interactive/models/interactive";
import { formatPathToDropdown } from "shared/interactive/utilities/interactiveUtils";
import ApiContext from "shared/common/utilities/ApiContext";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import { getQueryParams } from "shared/common/utilities/route";
import * as context from "src/common/utilities/context";
import PrepopulatedInteractiveTable from "src/interactiveTable/components/PrepopulatedInteractiveTable";
import styles from "src/common/styles/async_tile.module.scss";

const container = document.getElementById("react-interactive-table-root");
const dataElement = document.getElementById("react-interactive-table-data");
const { feedbackUrl } = JSON.parse(dataElement.textContent);

const App = hot(() => {
  const [selectedFeatures] = useState<Array<string>>(() => {
    const queryParams = getQueryParams(new Set(["features"]));
    const features = Array.from(queryParams.features || []);
    return features;
  });
  const [initialDropdowns, setInitialDropdowns] = useState<
    Array<Array<DropdownState>>
  >([]);

  useEffect(() => {
    const promises = selectedFeatures.map((featureId: string) =>
      context
        .getVectorCatalogApi()
        .getVectorCatalogPath("continuous_and_categorical", featureId)
        .then((path: Array<OptionsInfoSelected>) => {
          const dropdownsAndSectionUpdates = formatPathToDropdown(path);
          const dropdownValues = dropdownsAndSectionUpdates[0] as Array<DropdownState>;
          return dropdownValues;
        })
    );
    Promise.all(promises).then(
      (allInitialDropdownValues: Array<Array<DropdownState>>) => {
        setInitialDropdowns(allInitialDropdownValues);
      }
    );
  }, [selectedFeatures]);

  return (
    <ErrorBoundary>
      <ApiContext.Provider value={context.apiFunctions.depmap}>
        {initialDropdowns.length === selectedFeatures.length && (
          <React.Suspense
            fallback={<div className={styles.LoadingTile}>Loading...</div>}
          >
            <PrepopulatedInteractiveTable
              initialfeatures={selectedFeatures}
              initialDropdownStates={initialDropdowns}
              feedbackUrl={feedbackUrl}
            />
          </React.Suspense>
        )}
      </ApiContext.Provider>
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
