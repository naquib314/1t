import * as React from "react";
import * as Plotly from "plotly.js";
import isEqual from "lodash.isequal";
import cx from "classnames";

import {
  buildPlot,
  calculateLabelPositions,
  getGroupByColorPalette,
  getSampleTypeTransform,
  sampleTypeToLabel,
  getDoubleClickResult,
} from "src/celligner/utilities/plot";
import { PlotHTMLElement } from "shared/plot/models/plotlyPlot";
import {
  Alignments,
  CellignerSampleType,
  GroupingCategory,
} from "src/celligner/models/types";

type Props = {
  alignments: Alignments;
  subtypes: ReadonlyMap<string, Array<string>>;
  colorByCategory: GroupingCategory;
  selectedPrimarySite: string;
  selectedPoints: Array<number>;
  subsetLegendBySelectedLineages: boolean;
};

type State = {
  pointSize: {
    CL: number;
    tumor: number;
  };
  siteVisibility: Record<string, boolean>;
  typeVisibility: Record<string, boolean>;
};

const CellLineTumorLegend = ({
  onClick,
  onDoubleClick,
  typeVisibility,
}: {
  onClick: (type: string) => void;
  onDoubleClick: (type: string) => void;
  typeVisibility: Record<string, boolean>;
}) => {
  return (
    <ul className="celligner_graph_plotly_legend">
      <li>
        <button
          type="button"
          onClick={() => onClick("depmap-model")}
          onDoubleClick={() => onDoubleClick("depmap-model")}
          className={cx("celligner_legend_item", {
            "celligner_legend_item--toggled_off": !typeVisibility[
              "depmap-model"
            ],
          })}
        >
          <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              transform="translate(10, 10)"
              d="M7.5,0A7.5,7.5 0 1,1 0,-7.5A7.5,7.5 0 0,1 7.5,0Z"
              style={{
                opacity: 1,
                strokeWidth: 1,
                fill: "#ccc",
                fillOpacity: 1,
                stroke: "black",
                strokeOpacity: 1,
              }}
            />
          </svg>
          <span>DepMap cell line</span>
        </button>
      </li>
      {enabledFeatures.celligner_app_v3 && (
        <>
          <li>
            <button
              type="button"
              onClick={() => onClick("met500-tumor")}
              onDoubleClick={() => onDoubleClick("met500-tumor")}
              className={cx("celligner_legend_item", {
                "celligner_legend_item--toggled_off": !typeVisibility[
                  "met500-tumor"
                ],
              })}
            >
              <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path
                  transform="translate(15, 15)"
                  d="M-8.66,3.75H8.66L0,-7.5Z"
                  style={{
                    opacity: 1,
                    fill: "#ccc",
                    fillOpacity: 1,
                  }}
                />
              </svg>
              <span>Met500 tumors</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onClick("novartisPDX-model")}
              onDoubleClick={() => onDoubleClick("novartisPDX-model")}
              className={cx("celligner_legend_item", {
                "celligner_legend_item--toggled_off": !typeVisibility[
                  "novartisPDX-model"
                ],
              })}
            >
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  transform="translate(10, 10)"
                  d="M9.75,0L0,9.75L-9.75,0L0,-9.75Z"
                  style={{
                    opacity: 1,
                    strokeWidth: 1,
                    fill: "#ccc",
                    fillOpacity: 1,
                    stroke: "black",
                    strokeOpacity: 1,
                  }}
                />
              </svg>
              <span>Novartis PDX</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onClick("pediatricPDX-model")}
              onDoubleClick={() => onDoubleClick("pediatricPDX-model")}
              className={cx("celligner_legend_item", {
                "celligner_legend_item--toggled_off": !typeVisibility[
                  "pediatricPDX-model"
                ],
              })}
            >
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  transform="translate(10, 10)"
                  d="M9.75,0L0,9.75L-9.75,0L0,-9.75Z"
                  style={{
                    opacity: 1,
                    strokeWidth: 1,
                    fill: "#ccc",
                    fillOpacity: 1,
                    stroke: "black",
                    strokeOpacity: 1,
                  }}
                />
              </svg>
              <span>Pediatric PDX</span>
            </button>
          </li>
        </>
      )}
      <li>
        <button
          type="button"
          onClick={() => onClick("tcgaplus-tumor")}
          onDoubleClick={() => onClick("tcgaplus-tumor")}
          className={cx("celligner_legend_item", {
            "celligner_legend_item--toggled_off": !typeVisibility[
              "tcgaplus-tumor"
            ],
          })}
        >
          <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path
              transform="translate(15, 15)"
              d="M9,3H3V9H-3V3H-9V-3H-3V-9H3V-3H9Z"
              style={{
                opacity: 1,
                fill: "#ccc",
                fillOpacity: 1,
              }}
            />
          </svg>
          <span>TCGA+ Tumors</span>
        </button>
      </li>
    </ul>
  );
};

export default class CellignerGraph extends React.Component<Props, State> {
  labelPositions: Array<Partial<Plotly.Annotations>>;

  groupbyColorPalette: Map<string, Array<Plotly.TransformStyle>>;

  sitesByType: Record<string, Set<string>>;

  plotElement: PlotHTMLElement;

  plotLayout: Plotly.PlotRelayoutEvent = {
    dragmode: "zoom",
    "xaxis.autorange": true,
    "xaxis.range[0]": 0,
    "xaxis.range[1]": 0,
    "yaxis.autorange": true,
    "yaxis.range[0]": 0,
    "yaxis.range[1]": 0,
  };

  constructor(props: Props) {
    super(props);

    const { alignments } = this.props;
    const siteVisibility: Record<string, boolean> = {};
    const typeVisibility: Record<string, boolean> = {};

    alignments.primarySite.forEach((site) => {
      siteVisibility[site] = true;
    });

    alignments.type.forEach((type) => {
      typeVisibility[type] = true;
    });

    this.state = {
      pointSize: {
        CL: 8,
        tumor: 4,
      },
      siteVisibility,
      typeVisibility,
    };

    this.onPlotRelayout = this.onPlotRelayout.bind(this);

    this.labelPositions = calculateLabelPositions(props.alignments);
    this.groupbyColorPalette = getGroupByColorPalette(props.alignments);
    this.sitesByType = {};

    alignments.primarySite.forEach((site: string, i: number) => {
      const type = alignments.type[i];
      this.sitesByType[type] ||= new Set();
      this.sitesByType[type].add(site);
    });
  }

  componentDidMount() {
    const { alignments, selectedPoints, colorByCategory } = this.props;
    const { pointSize } = this.state;
    buildPlot(
      this.plotElement,
      alignments,
      selectedPoints,
      this.labelPositions,
      alignments[colorByCategory],
      this.groupbyColorPalette.get(colorByCategory),
      pointSize.CL,
      pointSize.tumor
    );

    this.plotElement.on("plotly_relayout", this.onPlotRelayout);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { alignments, selectedPoints, colorByCategory } = this.props;
    const { pointSize, siteVisibility, typeVisibility } = this.state;

    const restyles: Partial<Plotly.Data> = {};

    if (
      prevProps.colorByCategory !== colorByCategory ||
      prevState.pointSize !== pointSize ||
      prevState.siteVisibility !== siteVisibility ||
      prevState.typeVisibility !== typeVisibility
    ) {
      // @ts-expect-error
      const groups = alignments[colorByCategory].map((c: any) => c ?? "N/A");

      const pointVisibility = alignments.primarySite.map(
        (site, i) => siteVisibility[site] && typeVisibility[alignments.type[i]]
      );

      // @ts-expect-error
      restyles.transforms = [
        [
          getSampleTypeTransform(alignments, pointSize.CL, pointSize.tumor),
          {
            type: "groupby",
            groups,
            styles: this.groupbyColorPalette.get(colorByCategory),
          },
          {
            type: "filter",
            target: pointVisibility,
            operation: "=",
            value: true,
          },
        ],
      ];
    }
    if (!isEqual(prevProps.selectedPoints, selectedPoints)) {
      // @ts-expect-error
      restyles.selectedpoints = [selectedPoints];
    }
    Plotly.restyle(this.plotElement, restyles);
    if (
      prevState.siteVisibility !== siteVisibility ||
      prevState.typeVisibility !== typeVisibility
    ) {
      const siteHasVisibleType = (site: string) =>
        Object.keys(typeVisibility).some(
          (type) => typeVisibility[type] && this.sitesByType[type]?.has(site)
        );

      const relayouts = {
        annotations: this.labelPositions.map((annotation) => ({
          ...annotation,
          visible:
            siteVisibility[annotation.text] &&
            siteHasVisibleType(annotation.text),
        })),
      };

      Plotly.relayout(this.plotElement, relayouts);
    }
  }

  onPlotRelayout(e: Partial<Plotly.PlotRelayoutEvent>) {
    const { pointSize } = this.state;

    const newPlotlyLayout: Plotly.PlotRelayoutEvent = {
      ...this.plotLayout,
      ...e,
    };
    let newPointSize = pointSize;
    if (newPlotlyLayout.dragmode !== this.plotLayout.dragmode) {
      // do nothing
    } else if (
      (newPlotlyLayout["xaxis.autorange"] === true &&
        this.plotLayout["xaxis.autorange"] === false) ||
      (newPlotlyLayout["yaxis.autorange"] === true &&
        this.plotLayout["yaxis.autorange"] === false)
    ) {
      newPointSize = { CL: 8, tumor: 4 };
    } else if (
      newPlotlyLayout["xaxis.range[0]"] !== this.plotLayout["xaxis.range[0]"] ||
      newPlotlyLayout["xaxis.range[1]"] !== this.plotLayout["xaxis.range[1]"] ||
      newPlotlyLayout["yaxis.range[0]"] !== this.plotLayout["yaxis.range[0]"] ||
      newPlotlyLayout["yaxis.range[1]"] !== this.plotLayout["yaxis.range[1]"]
    ) {
      if (
        newPlotlyLayout["xaxis.range[0]"] !==
          this.plotLayout["xaxis.range[0]"] ||
        newPlotlyLayout["xaxis.range[1]"] !== this.plotLayout["xaxis.range[1]"]
      ) {
        newPlotlyLayout["xaxis.autorange"] = false;
      }
      if (
        newPlotlyLayout["yaxis.range[0]"] !==
          this.plotLayout["yaxis.range[0]"] ||
        newPlotlyLayout["yaxis.range[1]"] !== this.plotLayout["yaxis.range[1]"]
      ) {
        newPlotlyLayout["yaxis.autorange"] = false;
      }

      const plotWidth =
        newPlotlyLayout["xaxis.range[1]"] - newPlotlyLayout["xaxis.range[0]"];
      const plotHeight =
        newPlotlyLayout["yaxis.range[1]"] - newPlotlyLayout["yaxis.range[0]"];

      if (plotWidth < 10 && plotHeight < 10) {
        newPointSize = { CL: 16, tumor: 10 };
      }
    }

    this.plotLayout = newPlotlyLayout;
    this.setState({ pointSize: newPointSize });
  }

  handleClickType = (site: string) => {
    this.setState((prevState) => ({
      typeVisibility: {
        ...prevState.typeVisibility,
        [site]: !prevState.typeVisibility[site],
      },
    }));
  };

  handleDoubleClickType = (typeClicked: string) => {
    const { alignments } = this.props;
    const { typeVisibility } = this.state;

    const nextTypeVisibility = getDoubleClickResult(
      typeVisibility,
      alignments.type,
      typeClicked
    );

    this.setState({ typeVisibility: nextTypeVisibility });
  };

  handleClickSite = (site: string) => {
    this.setState((prevState) => ({
      siteVisibility: {
        ...prevState.siteVisibility,
        [site]: !prevState.siteVisibility[site],
      },
    }));
  };

  handleDoubleClickSite = (siteClicked: string) => {
    const { alignments } = this.props;
    const { siteVisibility } = this.state;

    const nextSiteVisibility = getDoubleClickResult(
      siteVisibility,
      alignments.primarySite,
      siteClicked
    );

    this.setState({ siteVisibility: nextSiteVisibility });
  };

  renderColorLegend() {
    const {
      alignments,
      selectedPoints,
      colorByCategory,
      selectedPrimarySite,
      subsetLegendBySelectedLineages,
    } = this.props;

    const { siteVisibility } = this.state;

    const categoryArr = alignments[colorByCategory];
    let legendKeys: Array<any>;
    if (selectedPrimarySite) {
      legendKeys = [
        ...new Set(
          // @ts-expect-error https://github.com/microsoft/TypeScript/issues/36390
          categoryArr.filter(
            (category: any, i: number) =>
              alignments.primarySite[i] === selectedPrimarySite
          )
        ),
      ].sort();
    } else {
      // @ts-expect-error https://github.com/microsoft/TypeScript/issues/36390
      legendKeys = [...new Set(categoryArr.filter(Boolean))].sort();
    }
    if (colorByCategory === "cluster") {
      legendKeys.sort((a: number, b: number) => a - b);
    }

    if (subsetLegendBySelectedLineages) {
      const selectedLineages = new Set(
        alignments.primarySite.filter((primarySite, i) =>
          selectedPoints.includes(i)
        )
      );
      legendKeys = legendKeys.filter((k) => selectedLineages.has(k));
    }
    const colors = new Map(
      this.groupbyColorPalette
        .get(colorByCategory)
        // @ts-expect-error
        .map((v): [string | number, string] => [v.target, v.value.marker.color])
    );
    return (
      <div className="celligner_graph_plotly_legend">
        {legendKeys.map((k: string | number) => (
          <button
            key={k}
            className={cx("celligner_legend_item", {
              "celligner_legend_item--toggled_off": !siteVisibility[k],
            })}
            type="button"
            onClick={() => this.handleClickSite(k as string)}
            onDoubleClick={() => this.handleDoubleClickSite(k as string)}
          >
            <i className="fas fa-circle" style={{ color: colors.get(k) }} />
            <span className="celligner_graph_plotly_legend_label">
              {colorByCategory === "type"
                ? sampleTypeToLabel.get(k as CellignerSampleType)
                : k ?? "N/A"}
            </span>
          </button>
        ))}
      </div>
    );
  }

  render() {
    const { typeVisibility } = this.state;

    return (
      <div className="graph_container">
        <div className="celligner_graph_container">
          <div
            id="celligner_plotly_plot"
            ref={(element: HTMLElement) => {
              this.plotElement = element as PlotHTMLElement;
            }}
          />
          <div className="celligner_graph_plotly_legend_container">
            <CellLineTumorLegend
              onClick={this.handleClickType}
              onDoubleClick={this.handleDoubleClickType}
              typeVisibility={typeVisibility}
            />
            {this.renderColorLegend()}
          </div>
        </div>
      </div>
    );
  }
}
