/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useMemo } from "react";
import PrototypePlotControls from "src/data-explorer-2/components/plot/prototype/PrototypePlotsControls";
import downloadCsv from "src/common/utilities/downloadCsv";
import { getDimensionTypeLabel } from "src/data-explorer-2/utils";

function getAxisDimensions(plot: any) {
  const { dimensions } = plot;
  const { x, y } = dimensions || {};

  return [x, y].filter(Boolean);
}

function DataExplorerPlotControls({
  data,
  isLoading,
  plotElement,
  plotConfig,
  handleClickPoint,
  onClickUnselectAll,
  hideSelectionTools = false,
}: any) {
  const searchOptions = useMemo(
    () =>
      data
        ? data.index_labels.map((label: string, index: number) => ({
            label,
            value: index,
          }))
        : [],
    [data]
  );

  const filename = useMemo(() => {
    if (!data) {
      return null;
    }

    return [data.dimensions.x?.axis_label, data.dimensions.y?.axis_label]
      .filter(Boolean)
      .join(" vs ");
  }, [data]);

  // FIXME: Make sure this handles filtered data properly (don't show false
  // `null` values that are actually. from filtering).
  // FIXME: Add proper support for heatmaps (including distinguished heatmaps).
  const handleDownload = useCallback(() => {
    if (!data) {
      return;
    }

    const indexColumn = getDimensionTypeLabel(data.index_type);

    const formattedData: Record<string, any[]> = {
      [indexColumn]: data.index_labels,
    };

    getAxisDimensions(data).forEach((dimension: any) => {
      const label = `"${dimension.axis_label}\n${dimension.dataset_label}"`;
      formattedData[label] = dimension.values;
    });

    downloadCsv(formattedData, indexColumn, filename);
  }, [data, filename]);

  const handleSearch = useCallback(
    (selected: { value: number; label: string }) => {
      const pointIndex = selected.value;
      if (!plotElement.isPointInView(pointIndex)) {
        plotElement.resetZoom();
      }

      handleClickPoint(pointIndex, true);
    },
    [plotElement, handleClickPoint]
  );

  const searchPlaceholder = plotConfig.index_type
    ? `Search for ${getDimensionTypeLabel(plotConfig.index_type)} of interest`
    : "Search";

  return (
    <PrototypePlotControls
      plot={isLoading ? null : plotElement}
      searchOptions={
        plotConfig.plot_type !== "correlation_heatmap" && searchOptions
      }
      hideSelectionTools={hideSelectionTools}
      searchPlaceholder={searchPlaceholder}
      onSearch={handleSearch}
      onDownload={handleDownload}
      downloadImageOptions={{ filename, width: 1280, height: 1000 }}
      onClickUnselectAll={onClickUnselectAll}
    />
  );
}

export default DataExplorerPlotControls;
