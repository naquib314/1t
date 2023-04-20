import React, { useState } from "react";
import { satisfiesFilters } from "src/common/models/discoveryAppFilters";
import FilterControls from "src/common/components/FilterControls";
import Glossary from "src/common/components/Glossary";
import useDiscoveryAppFilters from "src/common/hooks/useDiscoveryAppFilters";
import useTargetDiscoveryHandlers from "../hooks/useTargetDiscoveryHandlers";
import useTargetDiscoveryData from "../hooks/useTargetDiscoveryData";
import filterDefinitions from "../json/filters.json";
import filterLayout from "../json/filterLayout.json";
import glossary from "../json/glossary.json";
import TargetDiscoveryHeader from "./TargetDiscoveryHeader";
import TargetDiscoveryPlot from "./TargetDiscoveryPlot";
import TargetDiscoveryTiles from "./TargetDiscoveryTiles";
import styles from "../styles/TDASummaryPage.scss";

function TDASummaryPage() {
  const { data, error } = useTargetDiscoveryData();
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const {
    filters,
    updateFilter,
    resetFilters,
    changedFilters,
  } = useDiscoveryAppFilters(data, filterDefinitions);

  const pointVisibility = filters ? satisfiesFilters(filters, data) : [];

  const { handleSearch, handleDownload } = useTargetDiscoveryHandlers(
    data,
    pointVisibility,
    setSelectedPoint
  );

  if (error) {
    throw new Error("Error fetching TDA data.");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <TargetDiscoveryHeader />
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
          <TargetDiscoveryPlot
            data={data}
            pointVisibility={pointVisibility}
            selectedPoint={selectedPoint}
            onClickPoint={setSelectedPoint}
            onSearch={handleSearch}
            onDownload={handleDownload}
          />
        </section>
        <section className={styles.tiles}>
          <TargetDiscoveryTiles symbol={data?.symbol[selectedPoint]} />
        </section>
        <Glossary data={glossary} />
      </main>
    </div>
  );
}

export default TDASummaryPage;
