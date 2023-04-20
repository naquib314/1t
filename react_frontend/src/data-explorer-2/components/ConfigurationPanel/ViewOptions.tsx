/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import {
  PartialDataExplorerPlotConfig,
  DataExplorerContext,
  ContextPath,
} from "src/data-explorer-2/types";
import { PlotConfigReducerAction } from "src/data-explorer-2/reducers/plotConfigReducer";
import Section from "src/data-explorer-2/components/Section";
import {
  ShowPointsCheckbox,
  UseClusteringCheckbox,
} from "src/data-explorer-2/components/ConfigurationPanel/selectors";
import FilterViewOptions from "src/data-explorer-2/components/ConfigurationPanel/FilterViewOptions";
import ColorByViewOptions from "src/data-explorer-2/components/ConfigurationPanel/ColorByViewOptions";

interface Props {
  plot: PartialDataExplorerPlotConfig;
  dispatch: (action: PlotConfigReducerAction) => void;
  onClickCreateContext: (pathToCreate: ContextPath) => void;
  onClickSaveAsContext: (
    contextToEdit: Partial<DataExplorerContext>,
    pathToSave: ContextPath
  ) => void;
}

function ViewOptions({
  plot,
  dispatch,
  onClickCreateContext,
  onClickSaveAsContext,
}: Props) {
  let filterKeys: string[] = [];

  if (plot.plot_type !== "correlation_heatmap" && plot.index_type !== "other") {
    filterKeys = ["visible"];
  }

  return (
    <Section title="View Options">
      <ShowPointsCheckbox
        show={plot.plot_type === "density_1d"}
        value={!plot.hide_points}
        onChange={(show_points: boolean) => {
          dispatch({
            type: "select_hide_points",
            payload: !show_points,
          });
        }}
      />
      <UseClusteringCheckbox
        show={plot.plot_type === "correlation_heatmap"}
        value={Boolean(plot.use_clustering)}
        onChange={(use_clustering: boolean) => {
          dispatch({
            type: "select_use_clustering",
            payload: use_clustering,
          });
        }}
      />
      <FilterViewOptions
        plot={plot}
        dispatch={dispatch}
        filterKeys={filterKeys}
        labels={["Filter"]}
        onClickCreateContext={onClickCreateContext}
        onClickSaveAsContext={onClickSaveAsContext}
      />
      <ColorByViewOptions
        show={plot.plot_type !== "correlation_heatmap"}
        plot={plot}
        dispatch={dispatch}
        onClickCreateContext={onClickCreateContext}
        onClickSaveAsContext={onClickSaveAsContext}
      />
    </Section>
  );
}

export default ViewOptions;
