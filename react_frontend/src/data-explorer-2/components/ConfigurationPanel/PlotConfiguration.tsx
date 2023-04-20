import React from "react";
import { Button } from "react-bootstrap";
import {
  PartialDataExplorerPlotConfig,
  DataExplorerContext,
  ContextPath,
} from "src/data-explorer-2/types";
import { PlotConfigReducerAction } from "src/data-explorer-2/reducers/plotConfigReducer";
import Section from "src/data-explorer-2/components/Section";
import { PointsSelector } from "src/data-explorer-2/components/ConfigurationPanel/selectors";
import DimensionConfiguration from "src/data-explorer-2/components/ConfigurationPanel/DimensionConfiguration";
import styles from "src/data-explorer-2/styles/ConfigurationPanel.scss";

interface Props {
  plot: PartialDataExplorerPlotConfig;
  dispatch: (action: PlotConfigReducerAction) => void;
  onClickCreateContext: (path: ContextPath) => void;
  onClickSaveAsContext: (
    contextToEdit: DataExplorerContext,
    pathToSave: ContextPath
  ) => void;
  onClickSwapAxisConfigs: () => void;
}

const getAxisLabel = (plot_type: string, axis: string) => {
  if (plot_type === "scatter") {
    if (axis === "x") {
      return "X Axis";
    }

    if (axis === "y") {
      return "Y Axis";
    }
  }

  return "Axis";
};

function PlotConfiguration({
  plot,
  dispatch,
  onClickCreateContext,
  onClickSaveAsContext,
  onClickSwapAxisConfigs,
}: Props) {
  const showSwapButton = plot.plot_type === "scatter";

  return (
    <Section title="Plot Configuration" className={styles.PlotConfiguration}>
      <PointsSelector
        show
        enable={plot.plot_type}
        value={plot.index_type}
        plot_type={plot.plot_type}
        dispatch={dispatch}
      />
      <div className={styles.dimensions}>
        {["x", "y"]
          .filter((axis) => plot.dimensions[axis])
          .map((axis: "x" | "y") => (
            <div key={axis}>
              <label style={{ marginBottom: 3 }}>
                {getAxisLabel(plot.plot_type, axis)}
              </label>
              {axis === "x" && showSwapButton && (
                <Button
                  id="swap-axis-configs"
                  className={styles.swapAxesButton}
                  onClick={onClickSwapAxisConfigs}
                >
                  <span>swap</span>
                  <i className="glyphicon glyphicon-transfer" />
                </Button>
              )}
              <DimensionConfiguration
                plot={plot}
                dimensionKey={axis}
                dispatch={dispatch}
                onClickCreateContext={onClickCreateContext}
                onClickSaveAsContext={onClickSaveAsContext}
              />
            </div>
          ))}
      </div>
    </Section>
  );
}

export default PlotConfiguration;
