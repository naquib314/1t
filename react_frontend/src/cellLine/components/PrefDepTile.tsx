import React from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

import RectanglePlot from "src/cellLine/components/RectanglePlot";
import { DepmapApi } from "src/dAPI";
import { CellLinePrefDepData } from "../models/types";

export interface PrefDepProps {
  depmapId: string;
  crisprData: CellLinePrefDepData;
  rnaiData: CellLinePrefDepData;
  dapi: DepmapApi;
}

const PrefDepTile = ({
  depmapId,
  crisprData,
  rnaiData,
  dapi,
}: PrefDepProps) => {
  const prefDepTooltip = (
    <Tooltip>
      The below genes are ranked by z-score. The z-score is computed for each
      gene by taking the gene effect for this model, subtracting the mean across
      all models, and dividing by the standard deviation.
    </Tooltip>
  );

  if (crisprData.data || rnaiData.data) {
    return (
      <article className="card_wrapper pref-dep-tile">
        <div className="card_border container_fluid">
          <h2 className="no_margin cardtitle_text">
            Top 10 Preferentially Essential Genes
            <span className="pref-dep-tooltip">
              <OverlayTrigger placement="bottom" overlay={prefDepTooltip}>
                <img
                  src={dapi._getFileUrl("/static/img/predictability/info.svg")}
                  alt="info icon"
                />
              </OverlayTrigger>
            </span>
          </h2>
          <div className="card_padding pref-dep-graphs-padding">
            {crisprData.data && (
              <>
                <h3>CRISPR</h3>
                <RectanglePlot
                  svgName="pref-dep-react-svg-crispr"
                  scoresMatrix={crisprData.data}
                  labels={crisprData.gene_names}
                  cellLineColIndex={crisprData.cell_line_col_index}
                  xAxisLabel="Gene Effect"
                  yAxisLabel="All genes"
                  linkType="gene"
                />
              </>
            )}

            {rnaiData.data && (
              <>
                <h3>RNAi</h3>
                <h4>(Achilles + DRIVE + Marcotte, DEMETER)</h4>
                <RectanglePlot
                  svgName="pref-dep-react-svg-rnai"
                  scoresMatrix={rnaiData.data}
                  labels={rnaiData.gene_names}
                  cellLineColIndex={rnaiData.cell_line_col_index}
                  xAxisLabel="Gene Effect"
                  yAxisLabel="All genes"
                  linkType="gene"
                />
              </>
            )}
            <p className="pref-dep-download-container">
              Download gene effect z-scores for all genes:
              {crisprData.data && (
                <a
                  href={dapi._getFileUrl(
                    `/cell_line/gene_effects/download/crispr/${depmapId}`
                  )}
                >
                  {" "}
                  CRISPR
                </a>
              )}
              {crisprData.data && rnaiData.data && <span>,</span>}
              {rnaiData.data && (
                <a
                  href={dapi._getFileUrl(
                    `/cell_line/gene_effects/download/rnai/${depmapId}`
                  )}
                >
                  {" "}
                  RNAi
                </a>
              )}
            </p>
          </div>
        </div>
      </article>
    );
  }
  return null;
};

export default PrefDepTile;