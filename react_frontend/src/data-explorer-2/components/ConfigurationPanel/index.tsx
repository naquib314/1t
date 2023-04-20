import React from "react";
import {
  PartialDataExplorerPlotConfig,
  DataExplorerContext,
  ContextPath,
} from "src/data-explorer-2/types";
import { PlotConfigReducerAction } from "src/data-explorer-2/reducers/plotConfigReducer";
import { PlotTypeSelector } from "src/data-explorer-2/components/ConfigurationPanel/selectors";
import PlotConfiguration from "src/data-explorer-2/components/ConfigurationPanel/PlotConfiguration";
import ViewOptions from "src/data-explorer-2/components/ConfigurationPanel/ViewOptions";
import DistinguishOptions from "src/data-explorer-2/components/ConfigurationPanel/DistinguishOptions";
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

function ConfigurationPanel({
  plot,
  dispatch,
  onClickCreateContext,
  onClickSaveAsContext,
  onClickSwapAxisConfigs,
}: Props) {
  return (
    <div className={styles.ConfigurationPanel}>
      <PlotTypeSelector
        show
        enable
        value={plot.plot_type}
        dispatch={dispatch}
      />
      <PlotConfiguration
        plot={plot}
        dispatch={dispatch}
        onClickCreateContext={onClickCreateContext}
        onClickSaveAsContext={onClickSaveAsContext}
        onClickSwapAxisConfigs={onClickSwapAxisConfigs}
      />
      <ViewOptions
        plot={plot}
        dispatch={dispatch}
        onClickCreateContext={onClickCreateContext}
        onClickSaveAsContext={onClickSaveAsContext}
      />
      <DistinguishOptions
        plot={plot}
        dispatch={dispatch}
        onClickCreateContext={onClickCreateContext}
        onClickSaveAsContext={onClickSaveAsContext}
      />
    </div>
  );
}

export default ConfigurationPanel;
