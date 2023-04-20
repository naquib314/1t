import * as React from "react";
import * as Plotly from "plotly.js";
import deepmerge from "deepmerge";

import { PlotHTMLElement } from "shared/plot/models/plotlyPlot";
import LongTableWithColumnDropdown, {
  LongTableWithColumnDropdownProps,
} from "./LongTableWithColumnDropdown";
import {
  onRowClickParam,
  isSelectedRowParam,
} from "shared/common/models/longTable";

declare const importanceNumToColor: (color_num: number) => string;

export type PlotConfiguration = {
  id: string;
  layout: Partial<Plotly.Layout>;
  config: Partial<Plotly.Config>;
  xVar: string;
  yVar: string;
  labelVar: string;
};

export type TableConfiguration = Partial<LongTableWithColumnDropdownProps> &
  Pick<LongTableWithColumnDropdownProps, "columnGroups">;

interface Props {
  data: { [key: string]: Array<any> };
  dataKey: string;
  plotProps: PlotConfiguration;
  tableProps: TableConfiguration;
  colorGroups?: Array<string>;
  selectedColor?: string;
  dropNARows?: boolean;

  // event handlers
  onGraphPointSelect?: (data: Plotly.PlotMouseEvent) => void;
  onTableRowSelect?: (e: {
    rowData: any;
    rowIndex: number;
    rowKey: string;
    event: any;
  }) => void;
}

type State = {
  selectedIndex: number;
  showPoints: Array<string>;
  convertedAndFilteredData: Array<any>;
};

export default class SyncedPlotAndTable extends React.Component<Props, State> {
  plotElement: PlotHTMLElement;

  convertedData: Array<any>;

  interactionType: "plot" | "table";

  dataKeyToIndex: Map<any, number>;

  tableComponent: React.RefObject<LongTableWithColumnDropdown>;

  static defaultProps: Partial<Props> = {
    selectedColor: importanceNumToColor(4),
    dropNARows: true,
  };

  constructor(props: Props) {
    super(props);

    this.tableComponent = React.createRef();

    this.convertedData = [];
    for (const [key, value] of Object.entries(props.data)) {
      value.forEach((v, i) => {
        if (this.convertedData.length <= i) {
          this.convertedData.push({});
        }
        this.convertedData[i][key] = v;
      });
    }

    this.dataKeyToIndex = new Map();
    props.data[props.dataKey].forEach((v, i) => this.dataKeyToIndex.set(v, i));

    this.state = {
      selectedIndex: null,
      showPoints: props.data[props.dataKey],
      convertedAndFilteredData: this.convertedData.filter(
        (d) => d[props.plotProps.xVar] && d[props.plotProps.yVar]
      ),
    };
  }

  componentDidMount() {
    this.buildPlot();

    this.plotElement.on("plotly_click", this.onPlotClick);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const restyles: Partial<Plotly.ScatterData> = {};
    if (prevState.selectedIndex != this.state.selectedIndex) {
      restyles.selectedpoints = [this.state.selectedIndex];
      this.interactionType = null;
    }

    if (prevState.showPoints != this.state.showPoints) {
      const prevShowPointsSet = new Set(prevState.showPoints);
      if (
        prevState.showPoints.length != this.state.showPoints.length ||
        !this.state.showPoints.every((p) => prevShowPointsSet.has(p))
      ) {
        const s = new Set(this.state.showPoints);
        restyles.x = [
          this.props.data[this.props.plotProps.xVar].map((x, i) =>
            s.has(this.props.data[this.props.dataKey][i]) ? x : null
          ),
        ];
      }
    }

    Plotly.restyle(this.plotElement, restyles, 0);

    if (prevProps.plotProps.id != this.props.plotProps.id) {
      if (this.props.dropNARows) {
        this.setState({
          convertedAndFilteredData: this.convertedData.filter(
            (d) => d[this.props.plotProps.xVar] && d[this.props.plotProps.yVar]
          ),
        });
      }

      Plotly.purge(this.plotElement);
      this.buildPlot();
      this.plotElement.on("plotly_click", this.onPlotClick);
    }
  }

  onPlotClick = (data: Plotly.PlotMouseEvent) => {
    this.interactionType = "plot";
    const selectedIndex = this.dataKeyToIndex.get(data.points[0].customdata);
    this.setState({
      selectedIndex,
    });
    if (this.props.onGraphPointSelect) {
      this.props.onGraphPointSelect(data);
    }

    // gross
    this.tableComponent.current.tableComponent.current.scrollToRow(
      this.state.convertedAndFilteredData.findIndex(
        (row) =>
          row[this.props.dataKey] ==
          this.props.data[this.props.dataKey][selectedIndex]
      )
    );
  };

  onTableClick = (e: onRowClickParam) => {
    if (e.rowIndex < 0) {
      return;
    }
    this.interactionType = "table";
    this.setState({
      selectedIndex: this.dataKeyToIndex.get(e.rowData[this.props.dataKey]),
    });
    if (this.props.onTableRowSelect) {
      this.props.onTableRowSelect(e);
    }
  };

  onTableFilter = (showPoints: Array<string>) => {
    this.setState({ showPoints });
  };

  createTransforms() {
    const transforms: Array<Partial<Plotly.Transform>> = [];

    if (this.props.colorGroups) {
      const groups = Array.from(new Set(this.props.colorGroups));
      const groupbyTransform: Partial<Plotly.Transform> = {
        type: "groupby",
        groups: this.props.colorGroups,
        styles: [],
      };
      groups.forEach((color) => {
        groupbyTransform.styles.push({
          target: color,
          value: { marker: { color } },
        });
      });
      transforms.push(groupbyTransform);
    }

    return transforms;
  }

  buildPlot() {
    const { data, dataKey, plotProps, selectedColor } = this.props;

    const transforms = this.createTransforms();
    const s = new Set(this.state.showPoints);
    const plotlyData: Array<Partial<Plotly.ScatterData>> = [
      {
        type: "scattergl",
        mode: "markers",
        x: data[plotProps.xVar].map((x, i) =>
          s.has(data[dataKey][i]) ? x : null
        ),
        y: data[plotProps.yVar],
        customdata: data[dataKey],
        text: data[plotProps.labelVar],
        selectedpoints: this.state.selectedIndex
          ? [this.state.selectedIndex]
          : [],
        // @ts-expect-error Plotly type definitions are wrong
        selected: {
          marker: {
            size: 12,
            color: selectedColor,
          },
        },
        transforms,
      },
    ];

    let layout: Partial<Plotly.Layout> = {
      hovermode: "closest",
      showlegend: false,
      margin: {
        r: 0,
        t: 20,
        l: 50,
      },
      height: 350,
    };
    layout = deepmerge(layout, plotProps.layout);

    Plotly.plot(this.plotElement, plotlyData, layout, {
      responsive: true,
      modeBarButtonsToRemove: [
        "select2d",
        "lasso2d",
        "toggleSpikelines",
        "hoverClosestCartesian",
        "hoverCompareCartesian",
      ],
    });
  }

  renderTable() {
    const selectedKey = this.props.data[this.props.dataKey][
      this.state.selectedIndex
    ];
    const isSelectedRow = (row: isSelectedRowParam) => {
      return (
        this.state.selectedIndex &&
        this.state.showPoints.length > 0 &&
        row.rowData[this.props.dataKey] == selectedKey
      );
    };

    return (
      <LongTableWithColumnDropdown
        dataFromProps={this.state.convertedAndFilteredData}
        onRowClick={this.onTableClick}
        onFilterChange={this.onTableFilter}
        isSelectedRow={isSelectedRow}
        {...this.props.tableProps}
        ref={this.tableComponent}
      />
    );
  }

  render() {
    return (
      <div>
        <div
          ref={(element: HTMLElement) =>
            (this.plotElement = element as PlotHTMLElement)
          }
          id={`plotly_plot_div-${this.props.plotProps.id}`}
        />
        <div style={{ height: 600 }}>{this.renderTable()}</div>
      </div>
    );
  }
}
