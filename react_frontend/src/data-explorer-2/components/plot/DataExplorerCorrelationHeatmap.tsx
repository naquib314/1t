import React, { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import PlotSpinner from "src/plot/components/PlotSpinner";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";
import { pluralize, getDimensionTypeLabel } from "src/data-explorer-2/utils";
import PrototypeCorrelationHeatmap from "src/data-explorer-2/components/plot/prototype/PrototypeCorrelationHeatmap";
import DataExplorerPlotControls from "src/data-explorer-2/components/plot/DataExplorerPlotControls";
import PlotSelections from "src/data-explorer-2/components/plot/PlotSelections";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

const formatDimension = (zs: number[], i: number) =>
  zs
    .map((val, j) => (i > j ? undefined : val))
    .map((val, j) => {
      if (val !== null) {
        return val;
      }

      return i === j ? 1 : 0;
    })
    .reverse();

function TooManyEntitiesWarning({
  data,
  plotConfig,
  onClickShowDensityFallback,
}: any) {
  const entitiesLabel = pluralize(
    getDimensionTypeLabel(plotConfig.dimensions.x.entity_type)
  );

  return (
    <div style={{ maxWidth: 600, padding: 20 }}>
      <p style={{ fontSize: 20 }}>
        ⚠️ Sorry, the selected context consists of{" "}
        {data.dimensions.x.context_size.toLocaleString()} {entitiesLabel}. The
        correlation heatmap can show at most 100.
      </p>
      <p>
        <Button onClick={onClickShowDensityFallback}>
          OK, show me a Density plot instead
        </Button>
      </p>
    </div>
  );
}

function DataExplorerCorrelationHeatmap({
  data,
  plotConfig,
  isLoading,
  onClickVisualizeSelected,
  onClickShowDensityFallback,
}: any) {
  const [plotElement, setPlotElement] = useState<ExtendedPlotType | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<Set<string> | null>(
    null
  );

  const memoizedData = useMemo(
    () =>
      data && !isLoading
        ? {
            x: data.index_labels.slice().reverse(),
            y: data.index_labels,
            z: data.dimensions.x.values.map(formatDimension),
            z2: data.dimensions.x2?.values.map(formatDimension),
            zLabel: data.dimensions.x.axis_label,
            z2Label: data.dimensions.x2?.axis_label,
          }
        : null,
    [data, isLoading]
  );

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(new Set(labels));
  };

  const showWarning = data?.dimensions.x?.axis_label === "cannot plot";

  return (
    <div className={styles.DataExplorerScatterPlot}>
      <div className={styles.left}>
        <div className={styles.plotControls}>
          <DataExplorerPlotControls
            data={data}
            isLoading={isLoading}
            plotConfig={plotConfig}
            plotElement={plotElement}
            onClickUnselectAll={() => setSelectedLabels(null)}
            hideSelectionTools
          />
        </div>
        <div className={styles.plot}>
          {(!data || isLoading) && <PlotSpinner height="100%" />}
          {showWarning && (
            <TooManyEntitiesWarning
              data={data}
              plotConfig={plotConfig}
              onClickShowDensityFallback={onClickShowDensityFallback}
            />
          )}
          {data && !isLoading && !showWarning && (
            <PrototypeCorrelationHeatmap
              data={memoizedData}
              xKey="x"
              yKey="y"
              zKey="z"
              z2Key={memoizedData.z2 ? "z2" : null}
              zLabel={memoizedData.zLabel}
              z2Label={memoizedData.z2Label}
              height="auto"
              onLoad={setPlotElement}
              onSelectLabels={handleSelectLabels}
              selectedLabels={selectedLabels}
            />
          )}
        </div>
      </div>
      <div className={styles.right}>
        <PlotSelections
          data={data}
          plot_type={plotConfig?.plot_type}
          selectedLabels={selectedLabels}
          onClickVisualizeSelected={(e: any) =>
            onClickVisualizeSelected(e, selectedLabels)
          }
        />
      </div>
    </div>
  );
}

export default DataExplorerCorrelationHeatmap;
