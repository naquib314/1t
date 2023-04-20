import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import GenePage from "src/genePage/components/GenePage";

const container = document.getElementById("react-gene-page-root");
const dataElement = document.getElementById("react-gene-page-data");
const data = JSON.parse(dataElement.textContent);

const {
  fullName,
  symbol,
  ensemblId,
  entrezId,
  hgncId,
  aka,
  showDependencyTab,
  showConfidenceTab,
  showCharacterizationTab,
  showPredictabilityTab,
  showCelfieTab,
  showCelfieTile,
  hasDatasets,
  order,
  isMobile,
  entityId,
  customDownloadsLink,
  methodologyLink,
  similarityOptions,
  colorOptions,
  connectivityOptions,
  targetFeatureLabel,
  datasets,
  dependencyProfileOptions,
  howToImg,
  sizeBiomEnumName,
  color,
  figure,
  showAUCMessage,
  summaryOptions,
  showMutationsTile,
  showOmicsExpressionTile,
  showTargetingCompoundsTile,
} = data;

const App = hot(() => {
  return (
    <ErrorBoundary>
      <GenePage
        fullName={fullName}
        symbol={symbol}
        ensemblId={ensemblId}
        entrezId={entrezId}
        hgncId={hgncId}
        aka={aka}
        showDependencyTab={showDependencyTab}
        showConfidenceTab={showConfidenceTab}
        showCharacterizationTab={showCharacterizationTab}
        showPredictabilityTab={showPredictabilityTab}
        showCelfieTab={showCelfieTab}
        showCelfieTile={showCelfieTile}
        hasDatasets={hasDatasets}
        order={order}
        isMobile={isMobile}
        entityId={entityId}
        customDownloadsLink={customDownloadsLink}
        methodologyLink={methodologyLink}
        similarityOptions={similarityOptions}
        colorOptions={colorOptions}
        connectivityOptions={connectivityOptions}
        targetFeatureLabel={targetFeatureLabel}
        datasets={datasets}
        dependencyProfileOptions={dependencyProfileOptions}
        howToImg={howToImg}
        sizeBiomEnumName={sizeBiomEnumName}
        color={color}
        figure={figure}
        showAUCMessage={showAUCMessage}
        summaryOptions={summaryOptions}
        showMutationsTile={showMutationsTile}
        showOmicsExpressionTile={showOmicsExpressionTile}
        showTargetingCompoundsTile={showTargetingCompoundsTile}
      />
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, container);