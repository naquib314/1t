import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "src/common/components/ErrorBoundary";
import CellignerPage from "src/celligner/components/CellignerPage";
import {
  Alignments,
  CellignerSampleType,
  CellignerTumorTypes,
  CellignerModelTypes,
  Tumor as CellignerTumor,
  Model as CellignerModel,
} from "src/celligner/models/types";

const dataElement = document.getElementById("react-celligner-data");
const data = JSON.parse(dataElement.textContent);

const {
  alignments,
  subtypes,
  cellLineUrl,
  downloadUrl,
  methodologyUrl,
} = data as {
  alignments: Alignments;
  subtypes: { [primarySite: string]: Array<string> };
  cellLineUrl: string;
  downloadUrl: string;
  methodologyUrl: string;
};

const tumors: Array<CellignerTumor> = [];
const cellLines: Array<CellignerModel> = [];
alignments.type.forEach((t, i) => {
  if (
    t === CellignerSampleType.MET500_TUMOR ||
    t === CellignerSampleType.TCGA_TUMOR
  ) {
    tumors.push({
      displayName: alignments.displayName[i],
      sampleId: alignments.sampleId[i],
      type: alignments.type[i] as CellignerTumorTypes,
      umap1: alignments.umap1[i],
      umap2: alignments.umap2[i],
      lineage: alignments.primarySite[i],
      subtype: alignments.subtype[i],
      cluster: alignments.cluster[i],
    });
  } else {
    cellLines.push({
      displayName: alignments.displayName[i],
      sampleId: alignments.sampleId[i],
      type: alignments.type[i] as CellignerModelTypes,
      modelLoaded: alignments.modelLoaded[i],
      umap1: alignments.umap1[i],
      umap2: alignments.umap2[i],
      lineage: alignments.primarySite[i],
      subtype: alignments.subtype[i],
      cluster: alignments.cluster[i],
    });
  }
});

const App = hot(() => {
  return (
    <ErrorBoundary>
      <CellignerPage
        alignmentsArr={alignments}
        tumors={tumors}
        models={cellLines}
        subtypes={new Map(Object.entries(subtypes))}
        cellLineUrl={cellLineUrl}
        downloadUrl={downloadUrl}
        methodologyUrl={methodologyUrl}
      />
    </ErrorBoundary>
  );
});

ReactDOM.render(<App />, document.getElementById("react-celligner-root"));
