import * as React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

import {
  LongTable,
  LongTableProps,
  LongTableColumn,
} from "shared/common/components/LongTable";

export interface ColumnGroup {
  // Must be specified if columns.length > 1
  name?: string;
  columns: Array<LongTableColumn>;
}

// NOTE: Should not have the "columns" prop.
export type LongTableWithColumnDropdownProps = LongTableProps & {
  columnGroups: Array<ColumnGroup>;
  initialHiddenColumns?: Array<string>;
};

interface LongTableWithColumnDropdownState {
  // data: Array<LongTableData>;
  // Indexes of selected column groups
  filteredColumnGroups: Array<ColumnGroup>;
  selectedColumns: Array<LongTableColumn>;
  dropdownIsOpen: boolean;
}

export default class LongTableWithColumnDropdown extends React.Component<
  LongTableWithColumnDropdownProps,
  LongTableWithColumnDropdownState
> {
  tableComponent: React.RefObject<LongTable>;

  constructor(props: LongTableWithColumnDropdownProps) {
    super(props);
    this.tableComponent = React.createRef();

    const filteredColumnGroups = this.filterColumnGroups(props.columnGroups);
    let selectedColumns = filteredColumnGroups
      .map((columnGroup) => columnGroup.columns)
      .reduce(
        (previousValue, currentValue) => previousValue.concat(currentValue),
        []
      );
    if (props.initialHiddenColumns) {
      selectedColumns = selectedColumns.filter(
        (col) => !props.initialHiddenColumns.includes(col.key)
      );
    }
    this.state = {
      // data: props.dataFromProps,
      filteredColumnGroups,
      selectedColumns,
      dropdownIsOpen: false,
    };
  }

  componentDidUpdate(
    prevProps: LongTableWithColumnDropdownProps,
    prevState: LongTableWithColumnDropdownState
  ) {
    if (this.props.hiddenCols != prevProps.hiddenCols) {
      const prevSelectedColumnKeys = new Set(
        prevState.selectedColumns.map((col) => col.key)
      );
      const filteredColumnGroups = this.filterColumnGroups(
        this.props.columnGroups
      );
      let selectedColumns = filteredColumnGroups
        .map((columnGroup) => columnGroup.columns)
        .reduce(
          (previousValue, currentValue) => previousValue.concat(currentValue),
          []
        );
      selectedColumns = selectedColumns.filter(
        (col) =>
          prevSelectedColumnKeys.has(col.key) ||
          (prevProps.hiddenCols && prevProps.hiddenCols.includes(col.key))
      );

      this.setState({
        filteredColumnGroups,
        selectedColumns,
      });
    }
  }

  filterColumnGroups(columnGroups: Array<ColumnGroup>): Array<ColumnGroup> {
    return columnGroups
      .map((columnGroup) => {
        const frozenCols = this.props.frozenCols || [];
        const hiddenCols = this.props.hiddenCols || [];
        return {
          name: columnGroup.name,
          columns: columnGroup.columns.filter(
            (column) =>
              !frozenCols.includes(column.key) &&
              !hiddenCols.includes(column.key)
          ),
        };
      })
      .filter(
        (columnGroup) =>
          columnGroup.columns.length > 0 ||
          (columnGroup.columns.length > 1 && !columnGroup.name)
      );
  }

  toggleAllColumns(
    allSelected: boolean,
    selectableColumns: Array<LongTableColumn>
  ) {
    if (allSelected) {
      this.setState({ selectedColumns: [] });
    } else {
      this.setState({ selectedColumns: selectableColumns });
    }
  }

  toggleColumnGroupSelection(
    columnGroup: ColumnGroup,
    columnGroupSelected: boolean
  ) {
    if (columnGroupSelected) {
      const selectedColumns = this.state.selectedColumns.filter(
        (col) => !columnGroup.columns.includes(col)
      );
      this.setState({ selectedColumns });
      return;
    }
    let selectedColumns = this.state.filteredColumnGroups
      .map((columnGroup) => columnGroup.columns)
      .reduce(
        (previousValue, currentValue) => previousValue.concat(currentValue),
        []
      );
    selectedColumns = selectedColumns.filter(
      (col) =>
        this.state.selectedColumns.includes(col) ||
        columnGroup.columns.includes(col)
    );
    this.setState({ selectedColumns });
  }

  toggleColumnSelection(column: LongTableColumn, columnSelected: boolean) {
    if (columnSelected) {
      const selectedColumns = this.state.selectedColumns.filter(
        (col) => column != col
      );
      this.setState({ selectedColumns });
      return;
    }
    let selectedColumns = this.state.filteredColumnGroups
      .map((columnGroup) => columnGroup.columns)
      .reduce(
        (previousValue, currentValue) => previousValue.concat(currentValue),
        []
      );
    selectedColumns = selectedColumns.filter(
      (col) => this.state.selectedColumns.includes(col) || column == col
    );
    this.setState({ selectedColumns });
  }

  renderFakeCheckbox(checked: boolean) {
    return checked ? (
      <i className="fas fa-check-square fake-checkbox" />
    ) : (
      <i className="far fa-square fake-checkbox" />
    );
  }

  renderButtonToolbar() {
    const selectableColumns = this.state.filteredColumnGroups
      .map((columnGroup) => columnGroup.columns)
      .reduce(
        (previousValue, currentValue) => previousValue.concat(currentValue),
        []
      );
    if (selectableColumns.length == 0) {
      return null;
    }

    const allSelected =
      this.state.selectedColumns.length == selectableColumns.length;

    return (
      <div className="button-toolbar">
        <DropdownButton
          open={this.state.dropdownIsOpen}
          onToggle={(
            isOpen: boolean,
            _: unknown,
            { source }: { source: "click" | "keydown" | "rootClose" | "select" }
          ) => {
            if (source != "select") {
              this.setState({ dropdownIsOpen: isOpen });
            }
          }}
          bsSize="small"
          title="Select columns"
          id="long-table-with-defined-columns-dropdown-button"
          pullRight
        >
          {selectableColumns.length > 1 && (
            <>
              <MenuItem
                onClick={() =>
                  this.toggleAllColumns(allSelected, selectableColumns)
                }
              >
                {this.renderFakeCheckbox(allSelected)}Select/deselect all
              </MenuItem>
              <MenuItem divider />
            </>
          )}

          {this.state.filteredColumnGroups.map((columnGroup, i) => {
            if (columnGroup.columns.length == 1) {
              const column = columnGroup.columns[0];
              const columnSelected = this.state.selectedColumns.includes(
                column
              );
              return (
                <MenuItem
                  key={i}
                  onClick={() =>
                    this.toggleColumnSelection(column, columnSelected)
                  }
                >
                  {this.renderFakeCheckbox(columnSelected)}
                  {column.displayName || column.key}
                </MenuItem>
              );
            }

            const groupSelected = columnGroup.columns.every((col) =>
              this.state.selectedColumns.includes(col)
            );
            return (
              <React.Fragment key={i}>
                <MenuItem
                  key={`${i}--1`}
                  onClick={() =>
                    this.toggleColumnGroupSelection(columnGroup, groupSelected)
                  }
                >
                  {this.renderFakeCheckbox(groupSelected)}
                  {columnGroup.name}
                </MenuItem>

                {columnGroup.columns.map((column, j) => {
                  const columnSelected = this.state.selectedColumns.includes(
                    column
                  );
                  return (
                    <MenuItem
                      key={`${i}-${j}`}
                      onClick={() =>
                        this.toggleColumnSelection(column, columnSelected)
                      }
                    >
                      <div style={{ marginInlineStart: 20 }}>
                        {this.renderFakeCheckbox(columnSelected)}
                        {column.displayName || column.key}
                      </div>
                    </MenuItem>
                  );
                })}
              </React.Fragment>
            );
          })}
        </DropdownButton>
      </div>
    );
  }

  render() {
    const {
      columnGroups,
      dataFromProps,
      hiddenCols,
      ...longTableProps
    } = this.props;
    return (
      <div className="long-table-with-column-dropdown">
        {this.renderButtonToolbar()}
        <div className="long-table-container">
          <LongTable
            dataFromProps={dataFromProps}
            columns={columnGroups.reduce(
              (prev: Array<LongTableColumn>, cur: ColumnGroup) =>
                prev.concat(cur.columns),
              [] as Array<LongTableColumn>
            )}
            hiddenCols={(hiddenCols || []).concat(
              this.state.filteredColumnGroups
                .map((columnGroup) => columnGroup.columns)
                .reduce(
                  (previousValue, currentValue) =>
                    previousValue.concat(currentValue),
                  []
                )
                .filter((col) => !this.state.selectedColumns.includes(col))
                .map((col) => col.key)
            )}
            {...longTableProps}
            ref={this.tableComponent}
          />
        </div>
      </div>
    );
  }
}
