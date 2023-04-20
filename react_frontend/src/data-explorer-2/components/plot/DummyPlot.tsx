import React from "react";
import {
  readPlotFromQueryString,
  DEFAULT_EMPTY_PLOT,
} from "src/data-explorer-2/utils";

import PrototypeScatterPlot from "src/data-explorer-2/components/plot/prototype/PrototypeScatterPlot";
import DataExplorerPlotControls from "src/data-explorer-2/components/plot/DataExplorerPlotControls";
import { useLegendState } from "src/data-explorer-2/components/plot/prototype/plotUtils";
import PlotLegend from "src/data-explorer-2/components/plot/PlotLegend";
import PlotSelections from "src/data-explorer-2/components/plot/PlotSelections";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

interface Props {
  feedbackUrl: string;
  hadError?: boolean;
}

function DataExplorerWelcome({ feedbackUrl }: { feedbackUrl: string }) {
  return (
    <div className={styles.plotEmptyState}>
      <h2>Welcome to Data Explorer 2.0</h2>
      <p>
        Data Explorer 2.0 is a new app that expands on the capabilities of the
        existing Data Explorer. It’s focused on providing greater power in terms
        of what you can plot and how you can visualize relationships.
      </p>
      <h3>Early Access</h3>
      <p>
        Data Explorer 2.0 is in Early Access, which means{" "}
        <b>there are features missing</b> that we are actively building while
        Skyros users get to try things out.
      </p>
      <h3>Current Roadmap</h3>
      <p>
        Here is a partial list of what you can expect us to focus on in the near
        future.
      </p>
      <ul>
        <li className={styles.completedItem}>
          Separate distributions for each “Color by” category
        </li>
        <li className={styles.completedItem}>
          Toggle to hide points on 1D Density plot
        </li>
        <li className={styles.completedItem}>
          Add “Growth Pattern” as an option in Color By options and Context
          Builder
        </li>
        <li className={styles.completedItem}>
          A “Filter by” option under View Options
        </li>
        <li>
          Streamlined selection of datasets (categorized by type/release date)
        </li>
        <li>A new waterfall plot type</li>
      </ul>
      <h3>Help Us Improve This Tool</h3>
      <p>
        Does something seem broken, confusing or frustrating to use? Is there
        anything you miss from the original Data Explorer? Are there things we
        could add or change to enhance your workflow or allow you to ask deeper
        questions of Portal data? Your feedback is greatly appreciated! Please
        take a moment to fill out{" "}
        <a href={feedbackUrl} target="_blank" rel="noopener noreferrer">
          this form
        </a>
        .
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className={styles.plotEmptyState}>
      <h2>Sorry, an error occurred 😭</h2>
    </div>
  );
}

function EmptyScatter() {
  const data = {
    x: [],
    y: [],
    xLabel: "",
    yLabel: "",
    hoverText: [],
  } as any;

  return (
    <PrototypeScatterPlot
      data={data}
      xKey="x"
      yKey="y"
      colorKey1="color1"
      colorKey2="color2"
      categoricalColorKey="catColorData"
      continuousColorKey="contColorData"
      hoverTextKey="hoverText"
      height="auto"
      xLabel=""
      yLabel=""
    />
  );
}

function DummyPlot({ feedbackUrl, hadError }: Props) {
  const showWelcome = readPlotFromQueryString() === DEFAULT_EMPTY_PLOT;

  const { hiddenLegendValues, onClickLegendItem } = useLegendState({
    plot_type: "scatter",
    index_type: "depmap_model",
    dimensions: {},
  });

  return (
    <div className={styles.DataExplorerScatterPlot}>
      <div className={styles.left}>
        <div className={styles.plotControls}>
          <DataExplorerPlotControls plotConfig={{}} isLoading />
        </div>
        <div className={styles.plot}>
          {showWelcome && <DataExplorerWelcome feedbackUrl={feedbackUrl} />}
          {!showWelcome && !hadError && <EmptyScatter />}
          {!showWelcome && hadError && <ErrorState />}
        </div>
      </div>
      <div className={styles.right}>
        <PlotLegend
          data={null}
          plotConfig={null}
          continuousBins={null}
          hiddenLegendValues={hiddenLegendValues}
          onClickLegendItem={onClickLegendItem}
        />
        <PlotSelections data={null} plot_type={null} />
      </div>
    </div>
  );
}

DummyPlot.defaultProps = {
  hadError: false,
};

export default DummyPlot;
