/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SpinnerOverlay from "src/data-explorer-2/components/plot/SpinnerOverlay";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";
import {
  calcBins,
  calcVisibility,
  formatDataForScatterPlot,
  getColorMap,
  useLegendState,
  LEGEND_RANGE_10,
  LEGEND_OTHER,
} from "src/data-explorer-2/components/plot/prototype/plotUtils";

import PrototypeScatterPlot from "src/data-explorer-2/components/plot/prototype/PrototypeScatterPlot";
import DataExplorerPlotControls from "src/data-explorer-2/components/plot/DataExplorerPlotControls";
import PlotLegend from "src/data-explorer-2/components/plot/PlotLegend";
import PlotSelections from "src/data-explorer-2/components/plot/PlotSelections";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

function DataExplorerScatterPlot({
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

  const entity_type0 = plotConfig.dimensions.x.entity_type;
  const entity_type1 = plotConfig.dimensions.y.entity_type;

  useEffect(() => {
    setSelectedLabels(null);
  }, [entity_type0, entity_type1]);

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

  const legendKeysWithNoData = useMemo(() => {
    const catData = data?.metadata?.color_property;
    const visible = data?.filters?.visible;

    if (catData && visible) {
      const counts: Record<string, number> = {};
      const unusedKeys = new Set();

      for (let i = 0; i < catData.values.length; i += 1) {
        const category = catData.values[i];
        counts[category] = counts[category] || 0;
        counts[category] += visible.values[i] ? 1 : 0;
      }

      Object.keys(counts).forEach((category) => {
        if (counts[category] === 0) {
          unusedKeys.add(category);
        }
      });

      return unusedKeys;
    }

    const contData = data?.dimensions?.color;

    if (!contData) {
      return null;
    }

    const out: any = [];
    const len = contData.values.length;
    const keys = Reflect.ownKeys(continuousBins || {});
    const unusedKeys = new Set(keys);

    for (let i = 0; i < len; i += 1) {
      const value = contData.values[i];
      let found = false;

      if (value === null) {
        out[i] = LEGEND_OTHER;
        found = true;
        unusedKeys.delete(LEGEND_OTHER);
      }

      keys.forEach((key: any) => {
        const [binStart, binEnd] = (continuousBins as any)[key];

        if (
          !found &&
          ((value >= binStart && value < binEnd) ||
            (key === LEGEND_RANGE_10 && value >= binStart && value === binEnd))
        ) {
          found = true;
          out[i] = key;
          unusedKeys.delete(key);
        }
      });
    }

    return unusedKeys;
  }, [data, continuousBins]);

  const { hiddenLegendValues, onClickLegendItem } = useLegendState(
    plotConfig,
    legendKeysWithNoData
  );

  const colorMap = useMemo(() => getColorMap(data, plotConfig), [
    data,
    plotConfig,
  ]);

  const pointVisibility = useMemo(
    () => calcVisibility(data, hiddenLegendValues, continuousBins),
    [data, hiddenLegendValues, continuousBins]
  );

  const showYEqualXLine = Boolean(
    data?.dimensions?.x &&
      data?.dimensions?.y &&
      data.dimensions.x.dataset_id === data.dimensions.y.dataset_id
  );

  return (
    <div className={styles.DataExplorerScatterPlot}>
      <div className={styles.left}>
        <div className={styles.plotControls}>
          <DataExplorerPlotControls
            data={data}
            plotConfig={plotConfig}
            isLoading={showSpinner}
            plotElement={plotElement}
            handleClickPoint={handleClickPoint}
            onClickUnselectAll={() => setSelectedLabels(null)}
          />
        </div>
        <div className={styles.plot}>
          {showSpinner && <SpinnerOverlay />}
          {formattedData && (
            <PrototypeScatterPlot
              data={formattedData}
              xKey="x"
              yKey="y"
              pointVisibility={pointVisibility}
              colorKey1="color1"
              colorKey2="color2"
              categoricalColorKey="catColorData"
              continuousColorKey="contColorData"
              hoverTextKey="hoverText"
              height="auto"
              xLabel={formattedData?.xLabel}
              yLabel={formattedData?.yLabel}
              onLoad={setPlotElement}
              onClickPoint={handleClickPoint}
              onMultiselect={handleMultiselect}
              selectedPoints={selectedPoints}
              showYEqualXLine={showYEqualXLine}
              onClickResetSelection={() => setSelectedLabels(null)}
            />
          )}
        </div>
      </div>
      <div className={styles.right}>
        <PlotLegend
          data={data}
          plotConfig={plotConfig}
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

export default DataExplorerScatterPlot;
