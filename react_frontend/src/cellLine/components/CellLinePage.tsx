import React from "react";
import CellLinePageHeader from "./CellLinePageHeader";
import CellLinePageTabs from "./CellLinePageTabs";
import styles from "../styles/CellLinePage.scss";

interface Props {
  aliases?: string[];
  ccleName?: string;
  cellLineDisplayName?: string;
  cellLinePassportId?: string;
  cosmicId?: number;
  depmapId: string;
  rrid?: string;
  sangerId?: number;
  catalogNumber: string | null;
  sourceDetail: string | null;
  growthPattern: string | null;
  hasMetMapData: boolean;
}

const CellLinePage = ({
  cellLineDisplayName,
  aliases,
  ccleName,
  cellLinePassportId,
  cosmicId,
  depmapId,
  rrid,
  sangerId,
  catalogNumber,
  sourceDetail,
  growthPattern,
  hasMetMapData,
}: Props) => {
  return (
    <div className={styles.CellLinePage}>
      <CellLinePageHeader
        cellLineDisplayName={cellLineDisplayName}
        aliases={aliases}
        ccleName={ccleName}
        cellLinePassportId={cellLinePassportId}
        cosmicId={cosmicId}
        depmapId={depmapId}
        rrid={rrid}
        sangerId={sangerId}
        catalogNumber={catalogNumber}
        sourceDetail={sourceDetail}
        growthPattern={growthPattern}
      />
      <CellLinePageTabs depmapId={depmapId} hasMetMapData={hasMetMapData} />
    </div>
  );
};

CellLinePage.defaultProps = {
  aliases: null,
  ccleName: null,
  cellLineDisplayName: null,
  cellLinePassportId: null,
  cosmicId: null,
  rrid: null,
  sangerId: null,
};

export default CellLinePage;
