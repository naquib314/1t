import * as React from "react";
import { Link } from "shared/interactive/models/interactive";
import { VectorCatalog } from "shared/interactive/components/VectorCatalog";
import { Button } from "react-bootstrap";
import { CellData } from "shared/cellLineSelector/models/cellLines";
import update from "immutability-helper";
import { StackedBar, StackedBarBar } from "shared/common/components/StackedBar";
import { Histogram } from "shared/common/components/Histogram";
import {
  LongTableColors,
  inferColumnType,
} from "shared/common/models/longTable";
import {
  Vector,
  VectorResponse,
  LongTable,
  LongTableColumn,
} from "shared/common/components/LongTable";
import ApiContext from "shared/common/utilities/ApiContext";

export interface LongTableCellLineSelectorProps {
  idCol: string;
  frozenCols: string[];
  initialData: CellData[];
  onCheckboxClick: (cellLines: Set<string>) => void;
  defaultChecked: ReadonlySet<string>;
  cellLineUrlRoot: string;
  colorMaps?: Map<string, Map<string, string>>;
  onLongTableFilterChange: (visibleCellLines: string[]) => void;
}
export interface LongTableCellLineSelectorState {
  data: CellData[];
  addColIsOpen: boolean;
  vectorId?: string;
  vector?: Vector;
  newColLabel?: string;
  newColType?: "continuous" | "categorical";
  columns: LongTableColumn[];
}
export class LongTableCellLineSelector extends React.Component<
  LongTableCellLineSelectorProps,
  LongTableCellLineSelectorState
> {
  static contextType = ApiContext;

  private displayNameDepmapIdMap = new Map<string, string>();

  constructor(props: LongTableCellLineSelectorProps) {
    super(props);
    this.state = {
      data: this.props.initialData,
      addColIsOpen: true,
      vectorId: undefined,
      vector: undefined,
      newColLabel: undefined,
      newColType: undefined,
      columns: [
        {
          key: "displayName",
          type: "character",
          displayName: "Cell Line",
        },
        {
          key: "lineage1",
          type: "categorical",
          displayName: "Lineage",
          colorMap: this.props.colorMaps
            ? this.props.colorMaps.get("lineage")
            : undefined,
        },
        {
          key: "lineage2",
          type: "categorical",
          displayName: "Lineage Subtype",
          colorMap: this.props.colorMaps
            ? this.props.colorMaps.get("lineage")
            : undefined,
        },
        {
          key: "lineage3",
          type: "categorical",
          displayName: "Lineage Sub-subtype",
          colorMap: this.props.colorMaps
            ? this.props.colorMaps.get("lineage")
            : undefined,
        },
      ],
    };

    this.props.initialData.forEach((cellLine: CellData) => {
      this.displayNameDepmapIdMap.set(cellLine.displayName, cellLine.depmapId);
    });
  }

  deleteColumn = (keyOfColToDelete: string) => {
    const updatedData = this.state.data.map((row) => {
      const copy = { ...row, [keyOfColToDelete]: null } as CellData;
      delete copy[keyOfColToDelete];
      return copy;
    });

    const updatedCols = this.state.columns.filter((column) => {
      return column.key != keyOfColToDelete;
    });

    this.setState({
      data: updatedData,
      columns: updatedCols,
    });
  };

  appendData = (newData?: Vector, colName?: string) => {
    if (!newData || !colName) {
      return;
    }

    const updatedData = this.state.data.map((el) => {
      const index = newData.cellLines.indexOf(el.depmapId);
      const val = index >= 0 && newData.values ? newData.values[index] : null;
      const newEl = { ...el };
      return Object.assign(newEl, { [colName]: val });
    });

    const updatedCols = update(this.state.columns, {
      $push: [
        {
          key: colName,
          type: this.state.newColType,
          displayName: colName,
        },
      ],
    });

    this.setState({
      data: updatedData,
      columns: updatedCols as Array<LongTableColumn>,
    });
  };

  getVis = (data: number[] | string[] | undefined) => {
    if (!data) {
      return null;
    }
    const colType = this.state.newColType;
    if (colType == "categorical") {
      const valuesAndCounts: Record<string, number> = {};
      for (let i = 0; i < data.length; i++) {
        valuesAndCounts[data[i]] = 1 + (valuesAndCounts[data[i]] || 0);
      }
      const counts = Object.values(valuesAndCounts) as number[];
      const labels = Object.keys(valuesAndCounts);
      const barProps: StackedBarBar[] = [];
      for (let i = 0; i < labels.length; i++) {
        barProps.push({
          count: counts[i],
          label: labels[i],
          color: LongTableColors[i % LongTableColors.length],
        });
      }
      return <StackedBar bars={barProps} />;
    }
    if (colType == "continuous") {
      return <Histogram data={data as number[]} />;
    }
    return null;
  };

  renderAddCol = () => {
    if (!this.state.addColIsOpen) {
      return (
        <div>
          <Button
            bsClass="custom-button"
            onClick={() => {
              this.setState({
                addColIsOpen: true,
                vector: undefined,
                vectorId: undefined,
              });
            }}
            className="btn btn-default btn-sm"
          >
            Add Column
          </Button>
        </div>
      );
    }
    return (
      <div className="add-col-panel">
        <button
          type="button"
          onClick={() => {
            this.setState({
              addColIsOpen: false,
            });
          }}
          className="btn btn-default btn-sm"
        >
          <span className="glyphicon glyphicon-remove" />
        </button>
        <div style={{ padding: "10px" }}>
          <strong>Add a data column</strong>
          <br />
          <VectorCatalog
            catalog="continuous_and_categorical"
            onSelection={(id: string, labels: Array<Link>) => {
              let colLabel = "";
              for (let i = 1; i < labels.length; i++) {
                colLabel = colLabel.concat(" ").concat(labels[i].label);
              }

              this.context
                .getApi()
                .getVector(id)
                .then((response: VectorResponse) => {
                  let newVector: Vector;
                  let newColType: "continuous" | "categorical" | null = null;
                  try {
                    if (response.values) {
                      newVector = {
                        cellLines: response.cellLines,
                        values: response.values,
                      };
                      newColType = "continuous";
                    } else if (response.categoricalValues) {
                      newVector = {
                        cellLines: response.cellLines,
                        values: response.categoricalValues,
                      };
                      newColType = "categorical";
                    } else {
                      throw "ERROR! neither continuous nor categorical values were returned";
                    }
                    this.setState({
                      vector: newVector,
                      vectorId: id,
                      newColLabel: colLabel,
                      newColType,
                    });
                  } catch (err) {
                    console.log(err);
                  }
                });
            }}
          />
        </div>
        <div className="preview-vis-container">
          {this.state.vector && this.getVis(this.state.vector.values)}
        </div>
        {this.state.vectorId && (
          <Button
            bsClass="custom-button"
            onClick={() => {
              this.appendData(this.state.vector, this.state.newColLabel);
              this.setState({
                addColIsOpen: false,
              });
            }}
            disabled={this.state.vectorId == null}
          >
            Add Column
          </Button>
        )}
      </div>
    );
  };

  addLinksToCellLines = ({ cellData }: { cellData: unknown }) => {
    if (
      typeof cellData === "string" &&
      this.displayNameDepmapIdMap.has(cellData)
    ) {
      return (
        <div>
          <a
            href={`${
              this.props.cellLineUrlRoot
            }${this.displayNameDepmapIdMap.get(cellData)}`}
            target="_blank"
            rel="noreferrer"
          >
            {cellData}
          </a>
        </div>
      );
    }
    return cellData;
  };

  render() {
    const tableCell = this.addLinksToCellLines;
    return (
      <div className="long-table-cell-line-selector-container">
        <div style={{ display: "flex" }}>
          <div className="long-table-container">
            <LongTable
              addCheckboxes
              idCol="depmapId"
              frozenCols={["displayName"]}
              undeleteableCols={["displayName"]}
              hiddenCols={["depmapId", "lineName", "primaryDisease"]}
              dataFromProps={this.state.data}
              onCheckboxClick={this.props.onCheckboxClick}
              onFilterChange={this.props.onLongTableFilterChange}
              defaultChecked={new Set(this.props.defaultChecked)}
              defaultSort={{ col: "checkbox", order: "DESC" }}
              onColumnDelete={this.deleteColumn}
              additionalComponents={{ TableCell: tableCell }}
              columns={this.state.columns}
              downloadCsvName="cell-line-selector.csv"
            />
          </div>
          {this.renderAddCol()}
        </div>
      </div>
    );
  }
}