/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useEffect, useState } from "react";
import { fetchPlotDimensions, fetchCorrelation } from "src/data-explorer-2/api";
import {
  defaultContextName,
  isCompletePlot,
  lookUpContextName,
  toRelatedPlot,
  heatmapToDensityPlot,
  plotToQueryString,
  swapAxisConfigs,
} from "src/data-explorer-2/utils";
import {
  DataExplorerContext,
  DataExplorerPlotConfig,
  DataExplorerPlotResponse,
} from "src/data-explorer-2/types";

export function usePlotData(plotConfig: DataExplorerPlotConfig) {
  const [data, setData] = useState<DataExplorerPlotResponse | null>(null);
  const [
    // HACK: The distinction between `plotConfig` and `fetchedPlotConfig`
    // exists so stale content can be shown while new content is being fetched.
    // However, this is an admittedly confusing way to achieve that. React 18
    // has a pattern for this called `useDeferredValue`.
    fetchedPlotConfig,
    setFetchedPlotConfig,
  ] = useState<DataExplorerPlotConfig | null>(null);
  const [hadError, setHadError] = useState(false);

  useEffect(() => {
    (async () => {
      if (!plotConfig) {
        setData(null);
        setFetchedPlotConfig(null);
        setHadError(false);
        return;
      }

      if (
        fetchedPlotConfig &&
        fetchedPlotConfig.plot_type !== plotConfig.plot_type
      ) {
        // Clear out the data whenever the plot type is changed. We do this
        // because we try to keep the plot rendered in the background (even
        // while loading new data). However, that makes no sense to do with
        // incompatible plots.
        setData(null);
      }

      if (plotConfig.plot_type === "correlation_heatmap") {
        try {
          setHadError(false);
          const fetchedData = await fetchCorrelation(
            plotConfig.index_type,
            plotConfig.dimensions,
            plotConfig.filters,
            plotConfig.use_clustering
          );
          setData(fetchedData);
          setFetchedPlotConfig(plotConfig);
        } catch (e) {
          setHadError(true);
        }
        return;
      }

      try {
        setHadError(false);
        const fetchedData = await fetchPlotDimensions(
          plotConfig.index_type,
          plotConfig.color_by,
          plotConfig.dimensions,
          plotConfig.filters,
          plotConfig.metadata
        );
        setData(fetchedData);
        setFetchedPlotConfig(plotConfig);
      } catch (e) {
        setHadError(true);
      }
    })();
  }, [plotConfig, fetchedPlotConfig]);

  return { data, fetchedPlotConfig, hadError };
}

export function useClickHandlers(
  plot: DataExplorerPlotConfig,
  setPlot: Function,
  onClickSaveAsContext: Function
) {
  const handleClickSaveSelectionAsContext = (
    plotConfig: DataExplorerPlotConfig,
    selectedLabels: Set<string>
  ) => {
    if (selectedLabels.size > 100) {
      // eslint-disable-next-line no-alert
      window.alert(
        [
          "Sorry, can't create a context from a selection of more than 100 ",
          "points.",
        ].join("")
      );
      return;
    }

    const labels = [...selectedLabels];

    const context: DataExplorerContext = {
      name: "",
      context_type: plotConfig.index_type,
      expr: { in: [{ var: "entity_label" }, labels] },
    };

    context.name =
      lookUpContextName(context) || defaultContextName(selectedLabels.size);

    onClickSaveAsContext(context, null);
  };

  const handleClickVisualizeSelected = useCallback(
    (e: any, selectedLabels: Set<string>) => {
      if (!isCompletePlot(plot)) {
        throw new Error("Cannot visualize an incomplete plot!");
      }

      if (selectedLabels.size > 100) {
        // eslint-disable-next-line no-alert
        window.alert(
          "Sorry, can't visualize a selection of more than 100 points."
        );
        return;
      }

      const nextPlot = toRelatedPlot(plot, selectedLabels);
      const queryString = plotToQueryString(nextPlot);
      const isModifierPressed = e.shiftKey || e.ctrlKey || e.metaKey;

      if (isModifierPressed) {
        setPlot(nextPlot);
        window.history.pushState(null, "", queryString);
      } else {
        const url = `${window.location.href.split("?")[0]}${queryString}`;
        window.open(url, "_blank");
      }
    },
    [plot, setPlot]
  );

  const handleClickShowDensityFallback = useCallback(() => {
    const nextPlot = heatmapToDensityPlot(plot);
    const queryString = plotToQueryString(nextPlot);

    setPlot(nextPlot);
    window.history.pushState(null, "", queryString);
  }, [plot, setPlot]);

  const handleClickSwapAxisConfigs = useCallback(() => {
    const nextPlot = swapAxisConfigs(plot);
    setPlot(nextPlot);

    if (isCompletePlot(plot)) {
      const queryString = plotToQueryString(nextPlot);
      window.history.pushState(null, "", queryString);
    }
  }, [plot, setPlot]);

  return {
    handleClickSaveSelectionAsContext,
    handleClickVisualizeSelected,
    handleClickShowDensityFallback,
    handleClickSwapAxisConfigs,
  };
}
