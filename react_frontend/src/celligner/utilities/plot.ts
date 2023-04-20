import Plotly from "plotly.js";

import { PlotHTMLElement } from "shared/plot/models/plotlyPlot";
import {
  CellignerSampleType,
  Alignments,
  Point,
} from "src/celligner/models/types";
import {
  PRIMARY_SITE_COLORS,
  PRIMARY_MET_COLORS,
  ALL_COLORS,
} from "src/celligner/utilities/colors";

const SKIP_LINEAGE_LABELS = new Set([
  "adrenal_cortex",
  "small_intestine",
  "embryo",
  "engineered_kidney",
  "engineered_lung",
  "engineered_prostate",
  "engineered_ovary",
  "engineered_breast",
  "engineered_central_nervous_system",
  "teratoma",
  "unknown",
  "pineal",
  "nasopharynx",
  "endocrine",
]);

export function calculateLabelPositions(
  alignments: Alignments
): Array<Partial<Plotly.Annotations>> {
  const umapPositionsByPrimarySite = new Map<string, Array<Point>>();

  alignments.primarySite.forEach((primarySite, i) => {
    if (
      !primarySite ||
      SKIP_LINEAGE_LABELS.has(primarySite) ||
      alignments.subtype[i] === "osteosarcoma"
    ) {
      return;
    }
    if (!umapPositionsByPrimarySite.has(primarySite)) {
      umapPositionsByPrimarySite.set(primarySite, []);
    }
    umapPositionsByPrimarySite.get(primarySite).push({
      x: alignments.umap1[i],
      y: alignments.umap2[i],
    });
  });

  const labelPositions: Array<Partial<Plotly.Annotations>> = [];
  umapPositionsByPrimarySite.forEach((coordinates, primarySite) => {
    const medianIndex = Math.floor(coordinates.length / 2);
    labelPositions.push({
      x: coordinates.sort((a, b) => a.x - b.x)[medianIndex].x,
      y: coordinates.sort((a, b) => a.y - b.y)[medianIndex].y,
      text: primarySite,
      showarrow: false,
    });
  });
  return labelPositions;
}

export function getGroupByColorPalette(
  alignments: Alignments
): Map<string, Array<Plotly.TransformStyle>> {
  const colorPalette = new Map<string, Array<Plotly.TransformStyle>>();
  colorPalette.set("primarySite", PRIMARY_SITE_COLORS);
  colorPalette.set("primaryMet", PRIMARY_MET_COLORS);
  colorPalette.set("type", [
    { target: "depmap-model", value: { marker: { color: "#009acd" } } },
    { target: "met500-tumor", value: { marker: { color: "#f08080" } } },
    { target: "novartisPDX-model", value: { marker: { color: "#66cd00" } } },
    { target: "pediatricPDX-model", value: { marker: { color: "#ffd738" } } },
    { target: "tcgaplus-tumor", value: { marker: { color: "#9370db" } } },
  ]);

  const subtypeColors: Array<Plotly.TransformStyle> = [];
  Array.from(new Set(alignments.subtype))
    .sort()
    .forEach((subtype, i) => {
      subtypeColors.push({
        target: subtype,
        value: { marker: { color: ALL_COLORS[i % ALL_COLORS.length] } },
      });
    });
  colorPalette.set("subtype", subtypeColors);

  const clusterColors: Array<Plotly.TransformStyle> = [];
  Array.from(new Set(alignments.cluster))
    .sort()
    .forEach((cluster, i) => {
      clusterColors.push({
        target: cluster,
        value: { marker: { color: ALL_COLORS[i % ALL_COLORS.length] } },
      });
    });
  colorPalette.set("cluster", clusterColors);
  return colorPalette;
}

function formatHoverTexts(alignments: Alignments): Array<string> {
  const {
    sampleId,
    type,
    primarySite,
    subtype,
    primaryMet,
    // tcga_type,
    cluster,
  } = alignments;
  return sampleId.map((id, i: number) =>
    [
      `${
        type[i] === CellignerSampleType.DEPMAP_MODEL
          ? "Cell Line Name"
          : "Sample ID"
      }: ${sampleId[i]}`,
      `Type: ${type[i]}`,
      `Lineage: ${primarySite[i] || "N/A"}`,
      `Subtype: ${subtype[i] || "N/A"}`,
      `Origin: ${primaryMet[i] || "N/A"}`,
      // `TCGA Type: ${tcga_type[i] || "N/A"}`,
      `Cluster: ${cluster[i]}`,
    ].join("<br>")
  );
}

export function getSampleTypeTransform(
  alignments: Alignments,
  cellLinePointSize: number,
  tumorPointSize: number
): Partial<Plotly.Transform> {
  return {
    type: "groupby",
    groups: alignments.type,
    styles: [
      {
        target: CellignerSampleType.DEPMAP_MODEL,
        value: {
          marker: {
            size: cellLinePointSize,
            line: {
              width: 1,
            },
          },
        },
      },
      {
        target: CellignerSampleType.NOVARTIS_PDX_MODEL,
        value: {
          marker: {
            size: cellLinePointSize,
            line: {
              width: 1,
            },
            symbol: "diamond",
          },
        },
      },
      {
        target: CellignerSampleType.PEDIATRIC_PDX_MODEL,
        value: {
          marker: {
            size: cellLinePointSize,
            line: {
              width: 1,
            },
            symbol: "diamond",
          },
        },
      },
      {
        target: CellignerSampleType.MET500_TUMOR,
        value: {
          marker: {
            size: cellLinePointSize,
            symbol: "triangle-up",
          },
        },
      },
      {
        target: CellignerSampleType.TCGA_TUMOR,
        value: {
          marker: {
            size: tumorPointSize,
            symbol: "cross",
          },
        },
      },
    ],
  };
}

export function buildPlot(
  plotElement: PlotHTMLElement,
  alignments: Alignments,
  selectedPoints: Array<number>,
  labelPositions: Array<Partial<Plotly.Annotations>>,
  categoryArr: Array<string> | Array<number>,
  colors: Array<Plotly.TransformStyle>,
  cellLinePointSize: number,
  tumorPointSize: number
) {
  const plotlyData: Array<Partial<Plotly.ScatterData>> = [
    {
      type: "scattergl",
      mode: "markers",
      x: alignments.umap1,
      y: alignments.umap2,
      selectedpoints: selectedPoints,
      // @ts-expect-error
      selected: {
        marker: {
          opacity: 0.7,
        },
      },
      unselected: {
        marker: {
          opacity: 0.2,
          color: "#ccc",
        },
      },
      text: formatHoverTexts(alignments),
      hoverinfo: "text",
      transforms: [
        getSampleTypeTransform(alignments, cellLinePointSize, tumorPointSize),
        {
          type: "groupby",
          groups: categoryArr,
          styles: colors,
        },
      ],
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    xaxis: {
      showgrid: false,
      showline: false,
      showticklabels: false,
      zeroline: false,
    },
    yaxis: {
      showgrid: false,
      showline: false,
      showticklabels: false,
      zeroline: false,
    },
    hovermode: "closest",
    showlegend: false,
    annotations: labelPositions,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 20,
    },
    colorway: ALL_COLORS,
  };
  Plotly.plot(plotElement, plotlyData, layout, { responsive: true });
}

export const sampleTypeToLabel: Map<CellignerSampleType, string> = new Map([
  [CellignerSampleType.DEPMAP_MODEL, "DepMap cell line"],
  [CellignerSampleType.MET500_TUMOR, "Met500 tumors"],
  [CellignerSampleType.NOVARTIS_PDX_MODEL, "Novartis PDX"],
  [CellignerSampleType.PEDIATRIC_PDX_MODEL, "Pediatric PDX"],
  [CellignerSampleType.TCGA_TUMOR, "TCGA+ Tumors"],
]);

// When the plot legend is double-clicked, we want to either show or hide all
// of the items to mimic the behavior of Plotly's built-in legends. Here,
// `currentVisibility` is a map that tracks whether each item in the legend is
// toggled on on off. This function returns a new version of that map with the
// selections modified as such:
// - If less than half the options were previously visible, show everything.
// - Otherwise, hide everything except for the specific item that was clicked.
//   This effectively "solos" it. Then it can be easily compared to a few
//   others by toggling them on individually.
export function getDoubleClickResult(
  currentVisibility: Record<string, boolean>,
  dataValues: string[],
  valueClicked: string
) {
  const nextVisibility: Record<string, boolean> = {};

  const keys = Object.keys(currentVisibility);
  const numVisible = keys.reduce(
    (sum, key) => sum + (currentVisibility[key] ? 1 : 0),
    0
  );

  const show = numVisible <= Math.floor(keys.length / 2);

  dataValues.forEach((value) => {
    nextVisibility[value] = show || value === valueClicked;
  });

  return nextVisibility;
}
