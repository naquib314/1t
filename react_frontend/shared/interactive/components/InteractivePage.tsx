import * as React from "react";
import { ControlledPlot } from "shared/interactive/components/ControlledPlot";

type PlotlyType = typeof import("plotly.js");

interface InteractivePageProps {
  query: { [key: string]: string };
  showCustomAnalysis: boolean;
  updateReactLoadStatus: () => void;
  launchCellLineSelectorModal: () => void;
  Plotly: PlotlyType;
}

const InteractivePage = (props: InteractivePageProps) => {
  const defaultProps = {
    x: "",
    y: "",
    color: "",
    filter: "",
    regressionLine: "false",
    associationTable: "false",
    defaultCustomAnalysisToX: "false",
    colors: "",
  } as any;
  const validProps = Object.keys(defaultProps);

  const controlledPlotProps = { ...defaultProps };

  const { query } = props;
  for (const prop of validProps) {
    if (Object.prototype.hasOwnProperty.call(query, prop)) {
      controlledPlotProps[prop] = query[prop];
    } else {
      controlledPlotProps[prop] = defaultProps[prop];
    }
  }
  controlledPlotProps.updateReactLoadStatus = props.updateReactLoadStatus;

  return (
    <ControlledPlot
      Plotly={props.Plotly}
      showCustomAnalysis={props.showCustomAnalysis}
      launchCellLineSelectorModal={props.launchCellLineSelectorModal}
      {...controlledPlotProps}
    />
  );
};

export default InteractivePage;
