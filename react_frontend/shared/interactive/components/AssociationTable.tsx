import * as React from "react";
import ReactTable, { SortingRule } from "react-table";

import {
  Checkbox,
  CheckboxProps,
  AssociationsCsvButton,
} from "shared/common/components/Buttons";
import { PlotResizer, Bounds } from "shared/interactive/components/Plot";
import { Association } from "shared/interactive/models/interactive";

import "shared/interactive/styles/AssociationTable.scss";

interface AssociationTableProps {
  onViewClick: (y: string) => void;
  data: Array<Association>;
  resizer: PlotResizer;
}

interface DatasetCheckboxesProps {
  datasetCheckboxes: Array<CheckboxProps>;
}

export interface ControlledAssociationTableProps {
  data: Array<Association>;
  associatedDatasets: Array<string>;
  onViewClick: (y: string) => void;
  exportAssociations: () => void;
  xDatasetLabel: string;
  xFeatureLabel: string;
  resizer: PlotResizer;
}

interface ControlledAssociationTableState {
  selectedDatasets: Set<string>;
  data?: Array<Association>;
}

export class ControlledAssociationTable extends React.Component<
  ControlledAssociationTableProps,
  ControlledAssociationTableState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedDatasets: new Set(this.props.associatedDatasets),
    };
  }

  onChange = (event: any) => {
    const { target } = event;
    const newState: ControlledAssociationTableState = {
      selectedDatasets: new Set(this.state.selectedDatasets),
    };

    if (target.checked) {
      newState.selectedDatasets.add(target.name);
    } else {
      newState.selectedDatasets.delete(target.name);
    }
    this.setState(newState);
  };

  render() {
    const datasetCheckboxes = this.props.associatedDatasets.map(
      (dataset: string) => {
        const checkbox = {
          label: dataset,
          name: dataset,
          checked: this.state.selectedDatasets.has(dataset),
          handleChange: this.onChange,
        };
        return checkbox;
      }
    );
    const filteredData = this.props.data.filter((association) =>
      this.state.selectedDatasets.has(association.other_dataset)
    );

    return (
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, overflow: "auto", height: "300px" }}>
          {" "}
          {/* height is set to same as tableHeight */}
          <b>
            Top 100 correlates per dataset for {this.props.xFeatureLabel} in{" "}
            {this.props.xDatasetLabel}{" "}
            <i> ({datasetCheckboxes.length} datasets)</i>
          </b>
          <DatasetCheckboxes datasetCheckboxes={datasetCheckboxes} />
          <AssociationsCsvButton onClick={this.props.exportAssociations} />
        </div>
        <div style={{ flex: 4 }}>
          {" "}
          {/* flex is a better idea than bootstrap, because the second element will fill the remaining space but will not squeeze the first. therefore the checkbox div above should never overflow */}
          <AssociationTable
            data={filteredData}
            onViewClick={this.props.onViewClick}
            resizer={this.props.resizer}
          />
        </div>
      </div>
    );
  }
}

class DatasetCheckboxes extends React.Component<DatasetCheckboxesProps, any> {
  render() {
    const checkboxes = this.props.datasetCheckboxes.map((datasetCheckbox) => (
      <Checkbox key={datasetCheckbox.name} {...datasetCheckbox} />
    ));
    return <div>{checkboxes}</div>;
  }
}

class AssociationTable extends React.Component<AssociationTableProps, any> {
  constructor(props: any) {
    super(props);
    this.state = { tableHeight: 300 };
    this.containingDiv = React.createRef();
  }

  containingDiv: React.Ref<HTMLDivElement>;

  settings = {
    columns: [
      {
        Header: "Gene/Compound",
        id: "other_entity_label", // this id is needed for sorting
        accessor: "other_entity_label",
      },
      {
        Header: "Dataset",
        id: "other_dataset",
        accessor: "other_dataset",
      },
      {
        Header: "Correlation",
        id: "correlation",
        accessor: "correlation",
        defaultSortDesc: true,
        sortMethod: (a: any, b: any) => {
          a = Math.abs(a);
          b = Math.abs(b);
          if (a > b) return 1;
          if (a < b) return -1;
          return 0; // use any subsequent column sorting methods or the row index as a tiebreaker
        },
      },
    ],
    defaultFilterMethod: (filter: any, row: any) => {
      const id = filter.pivotId || filter.id;
      return row[id] !== undefined
        ? String(row[id]).toLowerCase().includes(filter.value.toLowerCase())
        : true;
    },
    getTrProps: (state: any, rowInfo: any) => {
      return {
        onClick: () => {
          this.props.onViewClick(rowInfo.original.other_slice_id);
          // this overrides things like expanding SubComponents and pivots
          // see https://github.com/react-tools/react-table#custom-props for not doing so
          // did not implement ^, stopped at error handleOriginal was an Event object and not a function
        },
      };
    },
    defaultSorted: [
      {
        id: "correlation",
        desc: true,
      } as SortingRule,
    ],
    defaultPageSize: 50,
    filterable: true,
  };

  componentDidMount() {
    const e = (this.containingDiv as React.RefObject<HTMLElement>)
      .current as any;
    this.props.resizer.addListener("origAssocTable", e, (bounds: Bounds) => {
      this.setState({ tableHeight: bounds.height });
    });
  }

  componentWillUnmount() {
    this.props.resizer.removeListener("origAssocTable");
  }

  render() {
    return (
      <div ref={this.containingDiv} className="association-table-container">
        <ReactTable
          data={this.props.data}
          className="-striped -highlight"
          style={{ height: `${this.state.tableHeight}px` }}
          {...this.settings}
        />
      </div>
    );
  }
}
