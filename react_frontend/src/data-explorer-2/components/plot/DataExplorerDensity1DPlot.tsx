/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SpinnerOverlay from "src/data-explorer-2/components/plot/SpinnerOverlay";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";
import {
  calcBins,
  calcDensityStats,
  calcVisibility,
  categoryToDisplayName,
  formatDataForScatterPlot,
  getColorMap,
  useLegendState,
} from "src/data-explorer-2/components/plot/prototype/plotUtils";
import PrototypeDensity1D from "src/data-explorer-2/components/plot/prototype/PrototypeDensity1D";
import DataExplorerPlotControls from "src/data-explorer-2/components/plot/DataExplorerPlotControls";
import PlotLegend from "src/data-explorer-2/components/plot/PlotLegend";
import PlotSelections from "src/data-explorer-2/components/plot/PlotSelections";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

function DataExplorerDensity1DPlot({
  data,
  isLoading,
  plotConfig,
  onClickVisualizeSelected,
  onClickSaveSelectionAsContext,
}: any) {
  const [plotElement, setPlotElement] = useState<ExtendedPlotType | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<Set<string> | null>(
    null
  );
  const [showSpinner, setShowSpinner] = useState(isLoading);

  useEffect(() => {
    let timeout: number | undefined;

    if (!isLoading) {
      setShowSpinner(false);
    } else {
      timeout = window.setTimeout(() => setShowSpinner(true), 0);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const { entity_type } = plotConfig.dimensions.x;

  useEffect(() => {
    setSelectedLabels(null);
  }, [entity_type]);

  useEffect(() => {
    if (!data?.index_labels) {
      return;
    }

    const validSelections = new Set(data.index_labels || []);

    setSelectedLabels((xs) => {
      if (!xs) {
        return null;
      }

      const ys = new Set<string>();
      const labels = [...xs];

      for (let i = 0; i < labels.length; i += 1) {
        const label = labels[i];
        if (validSelections.has(label)) {
          ys.add(label);
        }
      }

      return ys;
    });
  }, [data]);

  const selectedPoints = useMemo(() => {
    const out: Set<number> = new Set();

    if (!data?.index_labels) {
      return out;
    }

    for (let i = 0; i < data.index_labels.length; i += 1) {
      if (selectedLabels?.has(data.index_labels[i])) {
        out.add(i);
      }
    }

    return out;
  }, [data, selectedLabels]);

  const handleMultiselect = useCallback(
    (pointIndices: number[]) => {
      if (pointIndices.length > 0) {
        const s = new Set<string>();
        pointIndices.forEach((i: number) => {
          s.add(data.index_labels[i]);
        });
        setSelectedLabels(s);
      }
    },
    [data]
  );

  const handleClickPoint = useCallback(
    (pointIndex: number, ctrlKey: boolean) => {
      const label = data.index_labels[pointIndex];

      if (ctrlKey) {
        setSelectedLabels((xs) => {
          const ys = new Set(xs);

          if (xs?.has(label)) {
            ys.delete(label);
          } else {
            ys.add(label);
          }

          return ys;
        });
      } else {
        setSelectedLabels(new Set([label]));
      }
    },
    [data, setSelectedLabels]
  );

  const formattedData: any = useMemo(() => formatDataForScatterPlot(data), [
    data,
  ]);

  const continuousBins = useMemo(
    () =>
      formattedData?.contColorData
        ? calcBins(formattedData.contColorData)
        : null,
    [formattedData]
  );

  const { sort_by } = plotConfig;

  const [colorData, legendKeysWithNoData, sortedLegendKeys] = useMemo(
    () => calcDensityStats(data, continuousBins, sort_by),
    [data, continuousBins, sort_by]
  );

  const { hiddenLegendValues, onClickLegendItem } = useLegendState(
    plotConfig,
    legendKeysWithNoData
  );

  const colorMap = useMemo(
    () => getColorMap(data, plotConfig, sortedLegendKeys),
    [data, plotConfig, sortedLegendKeys]
  );

  const legendDisplayNames = useMemo(() => {
    const out: any = {};

    Reflect.ownKeys(colorMap || {}).forEach((key: any) => {
      const name = categoryToDisplayName(key, data, continuousBins);
      out[key] = typeof name === "string" ? name : `${name[0]} – ${name[1]}`;
    });

    return out;
  }, [colorMap, data, continuousBins]);

  const pointVisibility = useMemo(
    () =>
      calcVisibility(
        data,
        hiddenLegendValues,
        continuousBins,
        plotConfig.hide_points
      ),
    [data, hiddenLegendValues, continuousBins, plotConfig.hide_points]
  );

  return (
    <div className={styles.DataExplorerDensity1DPlot}>
      <div className={styles.left}>
        <div className={styles.plotControls}>
          <DataExplorerPlotControls
            data={data}
            isLoading={showSpinner}
            plotConfig={plotConfig}
            plotElement={plotElement}
            handleClickPoint={handleClickPoint}
            onClickUnselectAll={() => {
              setSelectedLabels(null);
            }}
          />
        </div>
        <div className={styles.plot}>
          {showSpinner && <SpinnerOverlay />}
          {formattedData && (
            <PrototypeDensity1D
              data={formattedData}
              xKey="x"
              xLabel={formattedData?.xLabel}
              colorMap={colorMap}
              colorData={colorData}
              continuousColorKey="contColorData"
              legendDisplayNames={legendDisplayNames}
              pointVisibility={pointVisibility}
              hoverTextKey="hoverText"
              height="auto"
              onLoad={setPlotElement}
              onClickPoint={handleClickPoint}
              onMultiselect={handleMultiselect}
              selectedPoints={selectedPoints}
              onClickResetSelection={() => {
                setSelectedLabels(null);
              }}
              hiddenLegendValues={hiddenLegendValues}
            />
          )}
        </div>
      </div>
      <div className={styles.right}>
        <PlotLegend
          data={data}
          colorMap={colorMap}
          continuousBins={continuousBins}
          hiddenLegendValues={hiddenLegendValues}
          legendKeysWithNoData={legendKeysWithNoData}
          onClickLegendItem={onClickLegendItem}
        />
        <PlotSelections
          data={data}
          plot_type={plotConfig?.plot_type}
          selectedLabels={selectedLabels}
          onClickVisualizeSelected={(e: any) =>
            onClickVisualizeSelected(e, selectedLabels)
          }
          onClickSaveSelectionAsContext={() =>
            onClickSaveSelectionAsContext(plotConfig, selectedLabels)
          }
        />
      </div>
    </div>
  );
}

export default DataExplorerDensity1DPlot;
