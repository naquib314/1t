import React, { useEffect, useState } from "react";
import AsyncTile from "src/common/components/AsyncTile";
import { CardContainer, CardColumn } from "src/common/components/Card";
import { getDapi } from "src/common/utilities/context";
import {
  CellLineDatasets,
  OncogenicAlteration,
  CellLinePrefDepData,
} from "src/cellLine/models/types";
import styles from "src/common/styles/async_tile.module.scss";

const DatasetsTile = React.lazy(
  () => import("src/cellLine/components/DatasetsTile")
);
const OncogenicAlterationsTile = React.lazy(
  () => import("src/cellLine/components/OncogenicAlterationsTile")
);
const PrefDepTile = React.lazy(
  () =>
    import(
      /* webpackChunkName: "PrefDepTile" */
      "src/cellLine/components/PrefDepTile"
    )
);

interface Props {
  depmapId: string;
  hasMetMapData: boolean;
}

const CellLineOverview = ({ depmapId, hasMetMapData }: Props) => {
  const dapi = getDapi();
  const [
    prefDepCrisprData,
    setPrefDepCrisprData,
  ] = useState<CellLinePrefDepData>(null);
  const [prefDepRnaiData, setPrefDepRnaiData] = useState<CellLinePrefDepData>(
    null
  );
  const [
    cellLineDatasets,
    setCellLineDatasets,
  ] = useState<CellLineDatasets | null>(null);
  const [oncoAlterations, setOncoAlterations] = useState<
    Array<OncogenicAlteration>
  >([]);

  useEffect(() => {
    // Don't try to update an unmounted component - could cause memory leaks
    let mounted = true;

    dapi.getCellLinePrefDepCrisprData(depmapId).then((data) => {
      if (mounted) {
        setPrefDepCrisprData(data);
      }
    });

    dapi.getCellLinePrefDepRnaiData(depmapId).then((data) => {
      if (mounted) {
        setPrefDepRnaiData(data);
      }
    });

    dapi.getCellLineDatasets(depmapId).then((data) => {
      if (mounted) {
        setCellLineDatasets(data);
      }
    });

    dapi.getOncogenicAlterations(depmapId).then((data) => {
      if (mounted) {
        setOncoAlterations(data.onco_alterations);
      }
    });

    return () => {
      mounted = false;
    };
  }, [depmapId, dapi]);

  return (
    <CardContainer>
      <CardColumn>
        <AsyncTile url={`/tile/cell_line/description/${depmapId}`} />
        {cellLineDatasets && (
          <React.Suspense
            fallback={<div className={styles.LoadingTile}>Loading...</div>}
          >
            <DatasetsTile cellLineDatasets={cellLineDatasets} />
          </React.Suspense>
        )}
      </CardColumn>
      <CardColumn>
        {prefDepCrisprData && prefDepRnaiData && (
          <React.Suspense
            fallback={<div className={styles.LoadingTile}>Loading...</div>}
          >
            <PrefDepTile
              depmapId={depmapId}
              crisprData={prefDepCrisprData}
              rnaiData={prefDepRnaiData}
              dapi={dapi}
            />
          </React.Suspense>
        )}
      </CardColumn>
      <CardColumn>
        {hasMetMapData && (
          <AsyncTile url={`/tile/cell_line/metmap/${depmapId}`} />
        )}
        {oncoAlterations.length > 0 && (
          <React.Suspense
            fallback={<div className={styles.LoadingTile}>Loading...</div>}
          >
            <OncogenicAlterationsTile oncogenicAlterations={oncoAlterations} />
          </React.Suspense>
        )}
      </CardColumn>
    </CardContainer>
  );
};

export default CellLineOverview;
