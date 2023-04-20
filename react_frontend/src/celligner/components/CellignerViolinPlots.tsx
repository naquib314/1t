import * as React from "react";
import * as Plotly from "plotly.js";

import { PlotHTMLElement } from "shared/plot/models/plotlyPlot";
import { arraysShallowlyEqual } from "src/common/utilities/helper_functions";
import { Tumor } from "src/celligner/models/types";

type Props = {
  show: boolean;
  tumors: Array<Tumor>;
  tumorDistances: Array<number>;
  mostCommonLineage: string;
};

const COLOR_PALETTE: Map<string, string> = new Map<string, string>([
  ["central_nervous_system", "#f5899e"],
  ["engineered_central_nervous_system", "#f5899e"],
  ["teratoma", "#f5899e"],
  ["bone", "#9f55bb"],
  ["pancreas", "#b644dc"],
  ["soft_tissue", "#5fdb69"],
  ["skin", "#6c55e2"],
  ["liver", "#9c5e2b"],
  ["blood", "#da45bb"],
  ["lymphocyte", "#abd23f"],
  ["peripheral_nervous_system", "#73e03d"],
  ["ovary", "#56e79d"],
  ["engineered_ovary", "#56e79d"],
  ["adrenal", "#e13978"],
  ["adrenal_cortex", "#e13978"],
  ["upper_aerodigestive", "#5da134"],
  ["kidney", "#1f8fff"],
  ["engineered_kidney", "#1f8fff"],
  ["gastric", "#dfbc3a"],
  ["eye", "#349077"],
  ["nasopharynx", "#a9e082"],
  ["nerve", "#c44c90"],
  ["unknown", "#999999"],
  ["cervix", "#5ab172"],
  ["thyroid", "#d74829"],
  ["lung", "#51d5e0"],
  ["engineered_lung", "#51d5e0"],
  ["rhabdoid", "#d04850"],
  ["germ_cell", "#75dfbb"],
  ["embryo", "#75dfbb"],
  ["colorectal", "#96568e"],
  ["endocrine", "#d1d684"],
  ["bile_duct", "#c091e3"],
  ["pineal", "#949031"],
  ["thymus", "#659fd9"],
  ["mesothelioma", "#dc882d"],
  ["prostate", "#3870c9"],
  ["engineered_prostate", "#3870c9"],
  ["uterus", "#e491c1"],
  ["breast", "#45a132"],
  ["engineered_breast", "#45a132"],
  ["urinary_tract", "#e08571"],
  ["esophagus", "#6a6c2c"],
  ["fibroblast", "#d8ab6a"],
  ["plasma_cell", "#e6c241"],
]);

function buildPlot(
  plotElement: PlotHTMLElement,
  tumors: Array<any>,
  tumorDistances: Array<number>,
  mostCommonLineage: string
) {
  const lineages = tumors.map((tumor) =>
    tumor.lineage === mostCommonLineage ? mostCommonLineage : "other"
  );
  const data: Array<Partial<Plotly.PlotData>> = [
    {
      type: "violin",
      x: lineages,
      y: tumorDistances,
      // @ts-expect-error
      // what is this for? it doesn't look like a legit plotly spec
      points: false,
      box: {
        visible: true,
      },
      meanline: {
        visible: true,
      },
      transforms: [
        {
          type: "groupby",
          groups: lineages,
          styles: [
            {
              target: mostCommonLineage,
              value: { line: { color: COLOR_PALETTE.get(mostCommonLineage) } },
            },
            { target: "other", value: { line: { color: "gray" } } },
          ],
        },
      ],
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    yaxis: {
      title: "Distance",
    },
    margin: {
      t: 20,
    },
    showlegend: false,
  };

  Plotly.newPlot(plotElement, data, layout, { responsive: true });
}

export default class CellignerViolinPlots extends React.Component<Props> {
  plotElement: PlotHTMLElement;

  componentDidUpdate(prevProps: Props) {
    const { show, tumorDistances, mostCommonLineage, tumors } = this.props;
    if (
      show &&
      (!arraysShallowlyEqual(prevProps.tumorDistances, tumorDistances) ||
        prevProps.mostCommonLineage !== mostCommonLineage)
    ) {
      buildPlot(this.plotElement, tumors, tumorDistances, mostCommonLineage);
    } else if (prevProps.show && !show) {
      Plotly.purge(this.plotElement);
    }
  }

  render() {
    return (
      <div
        id="celligner-violin-plot"
        ref={(element: HTMLElement) => {
          this.plotElement = element as PlotHTMLElement;
        }}
      />
    );
  }
}
