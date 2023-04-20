import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { getQueryParams } from "shared/common/utilities/route";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import { AllDownloads } from "src/download/components/AllDownloads";

const container = document.getElementById("react-all-downloads-root");
const dataElement = document.getElementById("react-download-data");
const data = JSON.parse(dataElement.textContent);
const { bulkDownloadCsvUrl, mode, termsDefinitions } = data;
const { release, file, modal } = getQueryParams(new Set(["releasename"]));

const App = hot(() => {
  return (
    <ErrorBoundary>
      <AllDownloads
        releases={release as Set<string>}
        file={file as string}
        modal={Boolean(modal)}
        bulkDownloadCsvUrl={bulkDownloadCsvUrl}
        termsDefinitions={termsDefinitions}
        mode={mode}
        updateReactLoadStatus={() =>
          container.setAttribute(
            "data-react-component-loaded-for-selenium",
            "true"
          )
        }
      />
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
