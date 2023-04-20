import React, { useCallback, useEffect, useState } from "react";
import { satisfiesFilters } from "src/common/models/discoveryAppFilters";
import downloadCsv from "src/common/utilities/downloadCsv";
import FilterControls from "src/common/components/FilterControls";
import useDiscoveryAppHandlers from "src/common/hooks/useDiscoveryAppHandlers";
import useDiscoveryAppFilters from "src/common/hooks/useDiscoveryAppFilters";
import useCompoundDashboardData from "../hooks/useCompoundDashboardData";
import { CompoundSummaryTable, DatasetId } from "../models/types";
import filterLayout from "../json/filterLayout.json";
import CompoundDashboardHeader from "./CompoundDashboardHeader";
import CompoundDashboardPlot from "./CompoundDashboardPlot";
import CompoundDashboardTiles from "./CompoundDashboardTiles";
import styles from "../styles/CompoundDashboard.scss";
import filterDefinitions from "../json/filters.json";

function CompoundDashboard() {
  const [datasetId, setDatasetId] = useState<DatasetId>("Rep_all_single_pt");
  const { data, error } = useCompoundDashboardData(datasetId);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const {
    filters,
    updateFilter,
    resetFilters,
    changedFilters,
  } = useDiscoveryAppFilters(data, filterDefinitions);

  useEffect(() => {
    setSelectedPoint(null);
  }, [datasetId]);

  const pointVisibility = filters ? satisfiesFilters(filters, data) : [];

  const { handleSearch } = useDiscoveryAppHandlers(
    data,
    pointVisibility,
    setSelectedPoint
  );

  const handleDownload = useCallback(
    (xKey: keyof CompoundSummaryTable, yKey: keyof CompoundSummaryTable) =>
      downloadCsv(
        data,
        "BroadID",
        "compounds-filitered.csv",
        pointVisibility.map(
          (visible, i) =>
            visible &&
            // filter out any rows that aren't currently visualized
            // because the data are missing for the plot's selected columns
            typeof data[xKey][i] === "number" &&
            typeof data[yKey][i] === "number"
        )
      ),
    [data, pointVisibility]
  );

  if (error) {
    throw new Error("Error fetching compound dashboard data.");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <CompoundDashboardHeader />
      </header>
      <main className={styles.main}>
        <section className={styles.filters}>
          <FilterControls
            data={data}
            filters={filters}
            changedFilters={changedFilters}
            layout={filterLayout}
            onChangeFilter={updateFilter}
            onClickReset={resetFilters}
          />
        </section>
        <section className={styles.plot}>
          <CompoundDashboardPlot
            datasetId={datasetId}
            onChangeDatasetId={setDatasetId}
            data={data}
            pointVisibility={pointVisibility}
            selectedPoint={selectedPoint}
            onClickPoint={setSelectedPoint}
            onSearch={handleSearch}
            onDownload={handleDownload}
          />
        </section>
        <section className={styles.tiles}>
          <CompoundDashboardTiles
            compound={data?.Name[selectedPoint]}
            datasetId={datasetId}
          />
        </section>
      </main>
    </div>
  );
}

export default CompoundDashboard;
