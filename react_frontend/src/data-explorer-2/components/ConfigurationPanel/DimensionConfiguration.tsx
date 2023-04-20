import React from "react";
import cx from "classnames";
import {
  ContextPath,
  DataExplorerContext,
  PartialDataExplorerPlotConfig,
} from "src/data-explorer-2/types";
import { PlotConfigReducerAction } from "src/data-explorer-2/reducers/plotConfigReducer";
import {
  AxisSelector,
  DatasetSelector,
  EntitySelector,
  ContextSelector,
  AggregationSelector,
} from "src/data-explorer-2/components/ConfigurationPanel/selectors";

interface Props {
  plot: PartialDataExplorerPlotConfig;
  dimensionKey: "x" | "y" | "color";
  dispatch: (action: PlotConfigReducerAction) => void;
  onClickCreateContext: (pathToCreate: ContextPath) => void;
  onClickSaveAsContext: (
    contextToEdit: Partial<DataExplorerContext>,
    pathToReplace: ContextPath
  ) => void;
  className?: string;
}

function DimensionConfiguration({
  plot,
  dimensionKey,
  dispatch,
  onClickCreateContext,
  onClickSaveAsContext,
  className,
}: Props) {
  const dimension = plot.dimensions[dimensionKey];
  const path: ContextPath = ["dimensions", dimensionKey, "context"];

  if (!dimension) {
    return null;
  }

  return (
    <div className={cx(className)}>
      <AxisSelector
        show
        enable={plot.index_type}
        label="Type"
        value={dimension.axis_type}
        plot_type={plot.plot_type}
        index_type={plot.index_type}
        axis_type={dimension.axis_type}
        entity_type={dimension.entity_type}
        onChange={(axis_type: string, entity_type: string) => {
          dispatch({
            type: "select_axis_type",
            payload: {
              path,
              axis_type,
              entity_type,
            },
          });
        }}
      />
      <EntitySelector
        show={dimension.axis_type === "entity"}
        enable={dimension.axis_type === "entity"}
        value={dimension.context}
        entity_type={dimension.entity_type}
        dataset_id={dimension.dataset_id}
        onChange={(entity_label: string) => {
          dispatch({
            type: "select_entity_label",
            payload: {
              path,
              entity_type: dimension.entity_type,
              entity_label,
            },
          });
        }}
      />
      <ContextSelector
        show={dimension.axis_type === "context"}
        enable={dimension.entity_type && dimension.axis_type === "context"}
        value={dimension.context}
        context_type={dimension.entity_type}
        includeAllInOptions
        onClickCreateContext={() => onClickCreateContext(path)}
        onClickSaveAsContext={() =>
          onClickSaveAsContext(dimension.context, path)
        }
        onChange={(context: DataExplorerContext) => {
          dispatch({
            type: "select_context",
            payload: { path, context },
          });
        }}
      />
      <DatasetSelector
        show={dimension.axis_type}
        enable={dimension.axis_type && dimension.entity_type}
        value={dimension.dataset_id}
        dimensionKey={dimensionKey}
        index_type={plot.index_type}
        entity_type={dimension.entity_type}
        selectedContext={dimension.context}
        onChange={(dataset_id: string, entity_type: string) => {
          dispatch({
            type: "select_dataset_id",
            payload: {
              path,
              dataset_id,
              entity_type,
            },
          });
        }}
      />
      <AggregationSelector
        show={
          plot.plot_type !== "correlation_heatmap" &&
          dimension.axis_type === "context"
        }
        enable={dimension.axis_type === "context"}
        value={dimension.aggregation}
        dimensionKey={dimensionKey}
        onChange={(aggregation: string) => {
          dispatch({
            type: "select_aggregation",
            payload: { path, aggregation },
          });
        }}
      />
    </div>
  );
}

DimensionConfiguration.defaultProps = {
  className: null,
};

export default DimensionConfiguration;
