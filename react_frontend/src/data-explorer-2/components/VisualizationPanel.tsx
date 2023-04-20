/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import { DataExplorerPlotConfig } from "src/data-explorer-2/types";
import { usePlotData } from "src/data-explorer-2/hooks";
import DataExplorerScatterPlot from "src/data-explorer-2/components/plot/DataExplorerScatterPlot";
import DataExplorerDensity1DPlot from "src/data-explorer-2/components/plot/DataExplorerDensity1DPlot";
import DataExplorerCorrelationHeatmap from "src/data-explorer-2/components/plot/DataExplorerCorrelationHeatmap";
import DummyPlot from "src/data-explorer-2/components/plot/DummyPlot";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

interface Props {
  plotConfig?: DataExplorerPlotConfig;
  onClickVisualizeSelected: (e: any, selectedLabels: Set<string>) => void;
  onClickSaveSelectionAsContext: (plotConfig: any, selectedLabels: any) => void;
  onClickShowDensityFallback: () => void;
  feedbackUrl: string;
}

function VisualizationPanel({
  plotConfig,
  onClickVisualizeSelected,
  onClickSaveSelectionAsContext,
  onClickShowDensityFallback,
  feedbackUrl,
}: Props) {
  const { data, fetchedPlotConfig, hadError } = usePlotData(plotConfig);
  const isLoading = plotConfig !== fetchedPlotConfig;

  if (hadError) {
    return (
      <div className={styles.VisualizationPanel}>
        <DummyPlot hadError feedbackUrl={feedbackUrl} />
      </div>
    );
  }

  return (
    <div className={styles.VisualizationPanel}>
      {plotConfig?.plot_type === "density_1d" && (
        <DataExplorerDensity1DPlot
          data={data}
          isLoading={isLoading}
          plotConfig={plotConfig}
          onClickVisualizeSelected={onClickVisualizeSelected}
          onClickSaveSelectionAsContext={onClickSaveSelectionAsContext}
        />
      )}
      {plotConfig?.plot_type === "scatter" && (
        <DataExplorerScatterPlot
          data={data}
          isLoading={isLoading}
          plotConfig={plotConfig}
          onClickVisualizeSelected={onClickVisualizeSelected}
          onClickSaveSelectionAsContext={onClickSaveSelectionAsContext}
        />
      )}
      {plotConfig?.plot_type === "correlation_heatmap" && (
        <DataExplorerCorrelationHeatmap
          data={data}
          isLoading={isLoading}
          plotConfig={plotConfig}
          onClickVisualizeSelected={onClickVisualizeSelected}
          onClickShowDensityFallback={onClickShowDensityFallback}
        />
      )}
      {plotConfig?.plot_type === undefined && (
        <DummyPlot feedbackUrl={feedbackUrl} />
      )}
    </div>
  );
}

VisualizationPanel.defaultProps = {
  plotConfig: null,
};

export default VisualizationPanel;
