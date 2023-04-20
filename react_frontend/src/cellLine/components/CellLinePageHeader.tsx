import React from "react";
import styles from "../styles/CellLinePage.scss";

interface Props {
  aliases: string[] | null;
  ccleName: string | null;
  cellLineDisplayName: string | null;
  cellLinePassportId: string | null;
  cosmicId: number | null;
  depmapId: string | null;
  rrid: string | null;
  sangerId: number | null;
  catalogNumber: string | null;
  sourceDetail: string | null;
  growthPattern: string | null;
}

const CellLinePageHeader = ({
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
}: Props): JSX.Element => {
  return (
    <div className={styles.header}>
      <div className={styles.displayName}>{cellLineDisplayName}</div>
      <div className={styles.identifiers}>
        {depmapId && (
          <span>
            DepMap ID: <strong>{depmapId}</strong>
          </span>
        )}
        {ccleName && (
          <span>
            CCLE Name: <strong>{ccleName}</strong>
          </span>
        )}
        {typeof cosmicId === "number" && (
          <span>
            COSMIC ID:{" "}
            <a
              href={`https://cancer.sanger.ac.uk/cell_lines/sample/overview?id=${cosmicId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cosmicId}
            </a>
          </span>
        )}
        {sangerId && (
          <span>
            Sanger ID: <strong>{sangerId}</strong>
          </span>
        )}
        {cellLinePassportId && (
          <span>
            Cell Line Passport:{" "}
            <a
              href={`https://cellmodelpassports.sanger.ac.uk/passports/${cellLinePassportId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cellLinePassportId}
            </a>
          </span>
        )}
        {rrid && (
          <span>
            Cellosaurus RRID:{" "}
            <a
              href={`http://web.expasy.org/cellosaurus/${rrid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {rrid}
            </a>
          </span>
        )}
        {catalogNumber && (
          <span>
            Catalog Number: <strong>{catalogNumber}</strong>
          </span>
        )}
        {growthPattern && (
          <span>
            Growth Pattern: <strong>{growthPattern}</strong>
          </span>
        )}
        {sourceDetail && (
          <span>
            Source Detail: <strong>{sourceDetail}</strong>
          </span>
        )}
        {aliases.length > 0 && (
          <span>
            <span>Aliases: </span>
            {aliases.map((alias, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={index}>
                <strong>{alias}</strong>
                {index < aliases.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
};

export default CellLinePageHeader;
