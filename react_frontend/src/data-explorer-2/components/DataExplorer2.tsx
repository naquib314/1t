/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useReducer } from "react";
import {
  checkQueryStringLength,
  findPathsToContext,
  isCompletePlot,
  matchesCurrentQueryString,
  negateContext,
  plotToQueryString,
  readPlotFromQueryString,
} from "src/data-explorer-2/utils";
import { useClickHandlers } from "src/data-explorer-2/hooks";
import { ContextPath, DataExplorerPlotConfig } from "src/data-explorer-2/types";
import plotConfigReducer, {
  PlotConfigReducerAction,
} from "src/data-explorer-2/reducers/plotConfigReducer";
import FeedbackBanner from "src/data-explorer-2/components/FeedbackBanner";
import ConfigurationPanel from "src/data-explorer-2/components/ConfigurationPanel";
import VisualizationPanel from "src/data-explorer-2/components/VisualizationPanel";
import useContextBuilder from "src/data-explorer-2/components/ContextBuilder/useContextBuilder";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

const LOG_REDUCER_TO_CONSOLE = false;

function logReducerTransform(actionType: string, plot: any, nextPlot: any) {
  window.console.log("-".repeat(75));
  window.console.log(`action type:%c ${actionType}`, "color:green");

  window.console.log(
    `---%c before %c${"-".repeat(64)}`,
    "color:red",
    "color:black"
  );
  window.console.log(plot);

  window.console.log(
    `---%c after %c${"-".repeat(65)}`,
    "color:green",
    "color:black"
  );

  window.console.log(nextPlot);
}

interface Props {
  feedbackUrl: string;
}

function DataExplorer2({ feedbackUrl }: Props) {
  const [plot, dispatchPlotAction] = useReducer(
    plotConfigReducer,
    readPlotFromQueryString()
  );

  useEffect(() => {
    if (LOG_REDUCER_TO_CONSOLE) {
      window.console.log(
        `---%c initial plot %c${"-".repeat(65)}`,
        "color:green",
        "color:black"
      );

      window.console.log(plot);
      window.console.log("-".repeat(82));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPlot = (nextPlot: DataExplorerPlotConfig | Function) =>
    dispatchPlotAction({ type: "set_plot", payload: nextPlot });

  const dispatchPlotActionAndUpdateHistory = useCallback(
    (action: PlotConfigReducerAction) => {
      dispatchPlotAction(action);
      const nextPlot = plotConfigReducer(plot, action);

      if (LOG_REDUCER_TO_CONSOLE) {
        logReducerTransform(action.type, plot, nextPlot);
      }

      if (isCompletePlot(nextPlot)) {
        const queryString = plotToQueryString(nextPlot);

        if (matchesCurrentQueryString(queryString)) {
          return;
        }

        checkQueryStringLength(queryString);
        window.history.pushState(null, "", queryString);
      }
    },
    [plot]
  );

  useEffect(() => {
    const onPopState = () => {
      setPlot(readPlotFromQueryString());
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onContextEdited = (e: CustomEvent) => {
      const { prevContext, nextContext } = e.detail;
      let nextPlot = plot;

      const paths = findPathsToContext(plot, prevContext);
      const negatedPaths = findPathsToContext(plot, negateContext(prevContext));

      paths.forEach((path: ContextPath) => {
        nextPlot = plotConfigReducer(nextPlot, {
          type: "select_context",
          payload: {
            path,
            context: nextContext,
          },
        });
      });

      negatedPaths.forEach((path: ContextPath) => {
        nextPlot = plotConfigReducer(nextPlot, {
          type: "select_context",
          payload: {
            path,
            context: negateContext(nextContext),
          },
        });
      });

      if (nextPlot !== plot) {
        setPlot(nextPlot);
        const queryString = plotToQueryString(nextPlot);
        checkQueryStringLength(queryString);
        window.history.pushState(null, "", queryString);
      } else {
        window.dispatchEvent(new Event("dx2_contexts_updated"));
      }
    };

    window.addEventListener("dx2_context_edited", onContextEdited);

    return () =>
      window.removeEventListener("dx2_context_edited", onContextEdited);
  }, [plot]);

  const {
    ContextBuilder,
    onClickSaveAsContext,
    onClickCreateContext,
  } = useContextBuilder(plot, setPlot);

  const {
    handleClickSaveSelectionAsContext,
    handleClickVisualizeSelected,
    handleClickShowDensityFallback,
    handleClickSwapAxisConfigs,
  } = useClickHandlers(plot, setPlot, onClickSaveAsContext);

  return (
    <>
      <FeedbackBanner feedbackUrl={feedbackUrl} />
      <main className={styles.DataExplorer2}>
        <ConfigurationPanel
          plot={plot}
          dispatch={dispatchPlotActionAndUpdateHistory}
          onClickSaveAsContext={onClickSaveAsContext}
          onClickCreateContext={onClickCreateContext}
          onClickSwapAxisConfigs={handleClickSwapAxisConfigs}
        />
        <VisualizationPanel
          plotConfig={isCompletePlot(plot) ? plot : null}
          onClickVisualizeSelected={handleClickVisualizeSelected}
          onClickSaveSelectionAsContext={handleClickSaveSelectionAsContext}
          onClickShowDensityFallback={handleClickShowDensityFallback}
          feedbackUrl={feedbackUrl}
        />
      </main>
      {/* TODO: implement { "slice/mutation_details/all/label": "Mutation Details" }  */}
      <ContextBuilder />
    </>
  );
}

export default DataExplorer2;
