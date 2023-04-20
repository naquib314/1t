import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import CellLinePage from "src/cellLine/components/CellLinePage";

const container = document.getElementById("react-cell-line-page-root");
const dataElement = document.getElementById("react-cell-line-page-data");
const data = JSON.parse(dataElement.textContent);

const {
  cellLineDisplayName,
  aliases,
  cellLinePassportId,
  ccleName,
  cosmicId,
  depmapId,
  rrid,
  sangerId,
  catalogNumber,
  sourceDetail,
  growthPattern,
  hasMetMapData,
} = data;

const App = hot(() => {
  return (
    <ErrorBoundary>
      <CellLinePage
        cellLineDisplayName={cellLineDisplayName}
        aliases={aliases}
        cellLinePassportId={cellLinePassportId}
        ccleName={ccleName}
        cosmicId={cosmicId}
        depmapId={depmapId}
        rrid={rrid}
        sangerId={sangerId}
        catalogNumber={catalogNumber}
        sourceDetail={sourceDetail}
        growthPattern={growthPattern}
        hasMetMapData={hasMetMapData}
      />
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);
