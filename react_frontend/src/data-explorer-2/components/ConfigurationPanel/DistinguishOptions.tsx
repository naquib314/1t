/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import {
  PartialDataExplorerPlotConfig,
  DataExplorerContext,
  ContextPath,
} from "src/data-explorer-2/types";
import { PlotConfigReducerAction } from "src/data-explorer-2/reducers/plotConfigReducer";
import Section from "src/data-explorer-2/components/Section";
import FilterViewOptions from "src/data-explorer-2/components/ConfigurationPanel/FilterViewOptions";
import styles from "src/data-explorer-2/styles/ConfigurationPanel.scss";

interface Props {
  plot: PartialDataExplorerPlotConfig;
  dispatch: (action: PlotConfigReducerAction) => void;
  onClickCreateContext: (pathToCreate: ContextPath) => void;
  onClickSaveAsContext: (
    contextToEdit: Partial<DataExplorerContext>,
    pathToSave: ContextPath
  ) => void;
}

function DistinguishOptions({
  plot,
  dispatch,
  onClickCreateContext,
  onClickSaveAsContext,
}: Props) {
  if (plot.plot_type !== "correlation_heatmap") {
    return null;
  }

  return (
    <Section title="Distinguish">
      <div className={styles.distinguishOptions}>
        <FilterViewOptions
          plot={plot}
          dispatch={dispatch}
          labels={[null, "from"]}
          includeAllInOptions
          filterKeys={["distinguish1", "distinguish2"]}
          onClickCreateContext={onClickCreateContext}
          onClickSaveAsContext={onClickSaveAsContext}
        />
      </div>
    </Section>
  );
}

export default DistinguishOptions;
