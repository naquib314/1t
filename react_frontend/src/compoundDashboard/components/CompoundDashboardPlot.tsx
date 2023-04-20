import React, { useState } from "react";
import {
  CompoundSummaryTable,
  DatasetId,
} from "src/compoundDashboard/models/types";
import ScatterPlot from "src/plot/components/ScatterPlot";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";
import PlotControls from "src/plot/components/PlotControls";
import PlotSpinner from "src/plot/components/PlotSpinner";
import CompoundDashboardColumnControls from "./CompoundDashboardColumnControls";
import columns from "../json/columns.json";

interface Props {
  datasetId: DatasetId;
  onChangeDatasetId: (id: DatasetId) => void;
  data: CompoundSummaryTable | null;
  pointVisibility: boolean[];
  selectedPoint: number;
  onClickPoint: (pointIndex: number) => void;
  onSearch: (
    selected: { value: number; label: string },
    plot: ExtendedPlotType
  ) => void;
  onDownload: (xKey: string, kKey: string) => void;
}

type ColumnKey = typeof columns[number]["value"];

function TargetDiscoveryPlot({
  datasetId,
  onChangeDatasetId,
  data,
  pointVisibility,
  selectedPoint,
  onClickPoint,
  onSearch,
  onDownload,
}: Props) {
  const [xKey, setXKey] = useState<ColumnKey>("BimodalityCoefficient");
  const [yKey, setYKey] = useState<ColumnKey>("PearsonScore");
  const [plot, setPlot] = useState<ExtendedPlotType | null>(null);

  const xLabel = columns.find((c) => c.value === xKey).label;
  const yLabel = columns.find((c) => c.value === yKey).label;

  const searchOptions = data
    ? data.Name.map((compoundName: string, index: number) => ({
        label: compoundName || "",
        value: index,
      }))
    : null;

  return (
    <>
      <div>
        <CompoundDashboardColumnControls
          datasetId={datasetId}
          onChangeDatasetId={onChangeDatasetId}
          xValue={xKey}
          yValue={yKey}
          onChangeX={setXKey}
          onChangeY={setYKey}
        />
      </div>
      <div>
        <PlotControls
          plot={plot}
          searchOptions={searchOptions}
          searchPlaceholder="Search for a compound by name"
          onSearch={(selected: { label: string; value: number }) =>
            onSearch(selected, plot)
          }
          onDownload={() => onDownload(xKey, yKey)}
          downloadImageOptions={{
            filename: "compounds-filtered",
            width: 800,
            height: 600,
          }}
        />
      </div>
      <div>
        <ScatterPlot
          data={data}
          xKey={xKey}
          yKey={yKey}
          xLabel={xLabel}
          yLabel={yLabel}
          hoverTextKey="hoverText"
          annotationKey="Name"
          highlightPoint={selectedPoint}
          onClickPoint={onClickPoint}
          pointVisibility={pointVisibility}
          height="auto"
          onLoad={setPlot}
        />
        {(!data || !plot) && <PlotSpinner />}
      </div>
    </>
  );
}

export default TargetDiscoveryPlot;
