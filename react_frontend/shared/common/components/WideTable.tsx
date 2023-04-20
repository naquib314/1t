import * as React from "react";
import ReactTableV6, { TableProps, Column, SortingRule } from "react-table";
import update from "immutability-helper";
import {
  DropdownButton,
  MenuItem,
  Popover,
  OverlayTrigger,
  Button,
} from "react-bootstrap";
import ReactTableV7 from "./ReactTableV7";

import * as ReactCSV from "react-csv";

// useage example:
//
// <WideTable
//     data={tableData}
//     columns={columns}
//     defaultColumnsToShow={defaultColumnsToShow}
//     additionalReactTableProps={
//         {
//             defaultPageSize: 20,
//             className: "-highlight",
//         }
//     }
// />

// a lighter version of react table Column props.  Only accessor is required (if no Header is supplied, the accessor will be used as the header in the display)
// this is mostly so that we can take in Data Tables from depmap and convert them into wide table format.
export interface WideTableColumns {
  accessor: string;

  Header?: any;
  Cell?: any;

  // Custom properties (not defined in ReactTable's Column)
  /**
   * used to render helper text popover in column header
   */
  helperText?: React.ReactNode;

  /**
   * used with the Data Tables in the depmap portal
   */
  renderFunction?: any;
  columnDropdownLabel?: React.ReactNode;
  /**
   * If you don't want a particular column to be filtered, you can set the this
   * to `false`.
   * @default true
   */
  filterable?: boolean;
  /**
   * If you don't want a particular column to be sorted, you can set the this
   * to `false`.
   * @default true
   */
  sortable?: boolean;
}

export interface WideTableProps {
  /**
   * Set this to `true` to render with an upgraded version of the react-table
   * library.
   */
  renderWithReactTableV7?: boolean;

  /**
   * array of objects, all data for the table (will be what ends up downloaded if
   * allowDownloadFromTableData is set to true and the user clicks "download table")
   */
  data: any[];
  columns: WideTableColumns[] | Partial<Column>[]; // refer to the react-table docs for structure
  invisibleColumns?: Array<number>;

  // optional parameters
  /**
   * array of column accessors (strings) for columns we want to show on render.  If null, we'll show all columns
   */
  defaultColumnsToShow?: string[];

  /**
   * Array of column accessors (strings) for all columns we want in the table (both shown and hidden).
   * Order here determines order that columns are shown in the table.
   */
  columnOrdering?: string[];

  // wrapHeader: boolean // allow wrapping on header

  additionalReactTableProps?: Partial<TableProps>;

  /**
   * for if we want to allow download of data from somewhere else (instead of pulling data from the table)
   */
  downloadURL?: string;

  /**
   * for if we want to allow download of data from the table itself (rather than from an external source)
   */
  allowDownloadFromTableData?: boolean;

  sorted?: Array<SortingRule>;
  renderExtraDownloads?: () => JSX.Element;

  /**
   *  Use this to enable selection on the table. It will be called whenever the
   *  selections change. If this is prop is used, `idProp` must also be defined.
   *  Only works when `renderWithReactTableV7` is enabled.
   */
  onChangeSelections?: (selections: any[]) => void;

  /**
   *  This determines what property of each row will be used to track
   *  selections. Must be defined to if `onChangeSelections` is.
   *  Only works when `renderWithReactTableV7` is enabled.
   */
  idProp?: string;

  /**
   *  @default 24
   *  Sets a static height for each row of the table.
   *  Only works when `renderWithReactTableV7` is enabled.
   *  This is necessary because the rows are virtualized.
   */
  rowHeight?: number;
}

interface WideTableState {
  /**
   * map showing whether or not a column is being shown.  string key = column accessor
   */
  columnsState: ReadonlyMap<string, boolean>;

  /**
   * columns stores all the visible columns in the table.  len(tableProps.columns) < len(allColumns)
   */
  columns: Partial<Column>[];

  /**
   * stores all of the column options for the dropdown menu
   */
  allColumns: Partial<Column & { hideFromColumnSelectionDropdown: boolean }>[];

  /**
   * whether the column selector dropdown is open
   */
  columnSelectorIsOpen: boolean;

  /**
   * array containing the accessors of the columns that the table is currently being sorted by
   */
  sorted?: SortingRule[];
}

class WideTable extends React.Component<WideTableProps, WideTableState> {
  private selectTable: any = null;

  private textCanvas: any = null; // this is so that we can measure the pixel length of a string in order to resize column width appropriately

  private columnJustSelected = false; // used to prevent the column selector from closing after a column is selected/deselected

  private ignoreUpdate = false; // Used to prevent infinite loop when resizing columns.

  static defaultProps: Partial<WideTableProps> = {
    sorted: [],
  };

  constructor(props: WideTableProps) {
    super(props);
    this.selectTable = React.createRef();
    this.textCanvas = React.createRef();

    // reorder columns based on columnOrdering prop, if it was passed in
    const orderedColumns: Partial<Column>[] = this.processColumns(
      this.props.columns
    );

    // determine which columns to show by default using defaultColumnsToShow when WideTable is first loaded
    const columnCheckStatus: Map<
      string,
      boolean
    > = this.initializeColumnCheckStatus(orderedColumns);

    this.state = {
      columnsState: columnCheckStatus,
      columns: orderedColumns,
      allColumns: orderedColumns,
      columnSelectorIsOpen: false,
      sorted: props.sorted,
    };
  }

  // force the columns to resize based on default columns being shown and hidden
  componentDidMount() {
    this.resizeColumns();
  }

  componentDidUpdate(prevProps: WideTableProps) {
    if (this.didColumnsChange(prevProps.columns)) {
      const columns = this.processColumns(this.props.columns);
      this.setState({ columns, allColumns: columns });
      return;
    }

    if (!this.ignoreUpdate) {
      this.resizeColumns();
    }
  }

  didColumnsChange(prevColumns: Column[]) {
    const xs = prevColumns;
    const ys = this.props.columns;

    return (
      xs.length !== ys.length ||
      xs.some((_: unknown, i: number) => xs[i] !== ys[i])
    );
  }

  initializeColumnCheckStatus(orderedColumns: Partial<Column>[]) {
    const columnCheckStatus: Map<string, boolean> = new Map<string, boolean>();
    orderedColumns.forEach((item) => {
      if (this.props.defaultColumnsToShow) {
        columnCheckStatus.set(
          item.accessor as string,
          this.props.defaultColumnsToShow.includes(item.accessor as string)
        );
      } else {
        columnCheckStatus.set(item.accessor as string, true);
      }
    });
    return columnCheckStatus;
  }

  addHeaderArrows(header: string, data: any) {
    let sortIcon = null;
    const sorted = data.state?.sortBy ? data.state.sortBy : this.state.sorted;
    const sortInfo = sorted.filter((item: any) => item.id === header);
    if (sortInfo.length) {
      if (sortInfo[0].desc === true) {
        sortIcon = (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              minHeight: 20,
            }}
          >
            <span className="glyphicon glyphicon-triangle-bottom" />
          </div>
        );
      } else {
        sortIcon = (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              minHeight: 20,
            }}
          >
            <span className="glyphicon glyphicon-triangle-top" />
          </div>
        );
      }
    } else {
      sortIcon = (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "LightGray",
            fontSize: 10,
          }}
        >
          <span className="glyphicon glyphicon-triangle-top" />
          <span className="glyphicon glyphicon-triangle-bottom" />
        </div>
      );
    }
    return sortIcon;
  }

  addHelperText(col: WideTableColumns) {
    const helpPopover = (
      <Popover
        id={`popover-col-helper-text-${col.accessor as string}`}
        title={col.Header || (col.accessor as string)}
      >
        {col.helperText}
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="top"
        overlay={helpPopover}
      >
        <span
          className="glyphicon glyphicon-question-sign"
          style={{ marginInlineStart: 8 }}
        />
      </OverlayTrigger>
    );
  }

  isColsCustomType(cols: Array<any>): cols is WideTableColumns[] {
    return cols.some(this.isColCustomType);
  }

  isColCustomType(
    col: WideTableColumns | Partial<Column>
  ): col is WideTableColumns {
    return (
      (col as WideTableColumns).renderFunction != undefined ||
      (col as WideTableColumns).helperText != undefined ||
      (col as WideTableColumns).columnDropdownLabel != undefined
    );
  }

  isColumnNumeric(accessor?: string): boolean {
    if (!accessor) {
      return false;
    }

    let isNumeric = true;
    const colValues = this.props.data.map((row) => {
      return row[accessor];
    });
    colValues.forEach((val) => {
      if (isNaN(val)) {
        isNumeric = false;
        return false;
      }
    });
    return isNumeric;
  }

  processColumns(
    cols: WideTableColumns[] | Partial<Column>[]
  ): Partial<Column>[] {
    let processedColumns: Partial<Column>[] = [];
    const cellStyles: any = { textAlign: "left", overflowWrap: "break-word" };

    // add column headers/styling
    for (let i = 0; i < cols.length; i++) {
      let transformedColumn: Partial<Column>;
      let header: any;
      if (cols[i].Header == null) {
        header = cols[i].accessor;
      } else {
        header = cols[i].Header;
      }
      const sortable = cols[i].sortable !== false;

      transformedColumn = {
        Header: (data) => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {header}
              {this.isColsCustomType(cols) &&
                cols[i].helperText &&
                this.addHelperText(cols[i])}
            </div>
            <div
              style={{
                marginInlineEnd: 10,
              }}
            >
              {sortable
                ? this.addHeaderArrows(cols[i].accessor as string, data)
                : null}
            </div>
          </div>
        ),
        headerStyle: { boxShadow: "none" },
        accessor: cols[i].accessor,
        filterable: cols[i].filterable,
        sortable,
      };

      // These are to support ReactTable V7. They changed some property names.
      (transformedColumn as any).disableFilters = cols[i].filterable === false;
      (transformedColumn as any).disableSortBy = sortable === false;

      if (this.isColumnNumeric(cols[i]?.accessor?.toString())) {
        transformedColumn.sortMethod = (a, b) => {
          if (Number(a) - Number(b) > 0) {
            return 1;
          }
          if (Number(a) - Number(b) < 0) {
            return -1;
          }
          return 0;
        };
      }
      if (cols[i].Cell != null) {
        transformedColumn.Cell = cols[i].Cell;
      } else {
        transformedColumn.Cell = (row) => (
          <div style={cellStyles}>{row.value}</div>
        );
      }

      // if type is of WideTableColumns...
      if (this.isColsCustomType(cols) && cols[i].renderFunction != null) {
        transformedColumn.Cell = (row) => (
          <div
            style={cellStyles}
            dangerouslySetInnerHTML={{ __html: cols[i].renderFunction(row) }}
          />
        );
      } else if (!this.isColsCustomType(cols)) {
        transformedColumn = { ...cols[i], ...transformedColumn };
      }
      processedColumns.push(transformedColumn);
    }

    if (this.props.invisibleColumns) {
      processedColumns = processedColumns.filter(
        (col, i) => !this.props.invisibleColumns!.includes(i)
      );
    }

    // sort the columns
    if (this.props.columnOrdering) {
      return this.props.columnOrdering
        .map((accessor) =>
          processedColumns.find((col) => col.accessor == accessor)
        )
        .filter((column: unknown) => column !== undefined) as Partial<Column>[];
    }
    return processedColumns;
  }

  get_text_width(str: string): number {
    const font = "'Lato', sans-serif 14px";
    const canvas = this.textCanvas;
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(str);
    return metrics.width;
  }

  // scales column width in table proportionally depending on contents
  getColumnWidth(
    accessor: string,
    headerText: string,
    subsettedData: [] | ReadonlyArray<any>
  ): number {
    let max = this.get_text_width(headerText);
    // Get max length using size of string in pixels
    for (let i = 0; i < subsettedData.length; i++) {
      if (subsettedData[i] != undefined && subsettedData[i][accessor] != null) {
        const str = subsettedData[i][accessor];
        const stringPixelLength = this.get_text_width(str);
        if (stringPixelLength > max) {
          max = stringPixelLength;
        }
      }
    }
    return max;
  }

  updateShownColumns(column: string) {
    // get updated map with T/F values for each column
    const updatedMap: ReadonlyMap<string, boolean> = update(
      this.state.columnsState,
      { $add: [[column, !this.state.columnsState.get(column)]] }
    );
    this.setState({
      columnsState: updatedMap,
    });
  }

  updateShownColumnsAll() {
    const newColumnsState = new Map();
    this.state.columnsState.forEach((v, k) => newColumnsState.set(k, true));
    this.setState({
      columnsState: new Map(newColumnsState as ReadonlyMap<string, boolean>),
    });
  }

  updateShownColumnsNone() {
    const newColumnsState = new Map();
    this.state.columnsState.forEach((v, k) => newColumnsState.set(k, false));
    this.setState({
      columnsState: new Map(newColumnsState as ReadonlyMap<string, boolean>),
    });
  }

  resizeColumns() {
    // get names of columns we want to show
    const columnsToShowAccessors = new Set(
      Array.from(this.state.columnsState.keys()).filter((key) =>
        this.state.columnsState.get(key)
      )
    );

    // update columns array by having only the columns we want to show
    const colsP = this.state.allColumns;
    const newColumns = update(this.state.allColumns, {
      $apply: (cols: typeof colsP) => {
        return cols.filter((item) =>
          columnsToShowAccessors.has(item.accessor as string)
        );
      },
    });
    const visibleData = this.getVisibleData();

    // now update shown columns with appropriate min widths
    const newCols: Partial<Column>[] = [];
    newColumns.forEach((item: Partial<Column>, i: number) => {
      newCols.push(
        update(newColumns[i], {
          [this.props.renderWithReactTableV7 ? "width" : "minWidth"]: {
            $set: this.getColumnWidth(
              item.accessor as string,
              item.accessor as string,
              visibleData
            ),
          },
        })
      );
    });

    this.ignoreUpdate = true;
    this.setState({ columns: newCols }, () => {
      this.ignoreUpdate = false;
    });
  }

  getVisibleData() {
    const resolvedState = this.selectTable.getResolvedState();
    const { pageSize } = resolvedState;
    const { page } = resolvedState;
    const { sortedData } = resolvedState;

    const visibleMinIndex = page * pageSize;
    const visibleMaxIndex = (page + 1) * pageSize;

    return sortedData.slice(
      visibleMinIndex,
      Math.min(visibleMaxIndex, sortedData.length)
    );
  }

  getResolvedState() {
    return this.selectTable.getResolvedState();
  }

  onColumnSelectorToggle(isOpen: boolean) {
    if (!this.columnJustSelected) {
      this.setState({ columnSelectorIsOpen: isOpen });
    }

    this.columnJustSelected = false;
  }

  renderShowHideMenu() {
    const options: any = [];
    let cols: Array<WideTableColumns | Column> = this.props.columns;
    if (this.props.invisibleColumns) {
      cols = cols.filter((_, i) => !this.props.invisibleColumns?.includes(i));
    }
    if (this.props.columnOrdering) {
      cols = this.props.columnOrdering
        .map((accessor) =>
          cols.find(
            (col: WideTableColumns | Column) => col.accessor == accessor
          )
        )
        .filter((column: unknown) => column !== undefined) as (
        | WideTableColumns
        | Column
      )[];
    }

    cols.forEach((item: WideTableColumns | Column) => {
      const title =
        (item as WideTableColumns).columnDropdownLabel ||
        (item.accessor as string);
      const columnSelected = this.state.columnsState.get(
        item.accessor as string
      );
      options.push(
        <MenuItem
          onClick={() => this.updateShownColumns(item.accessor as string)}
          name={item.accessor as string}
          key={item.accessor as string}
        >
          {columnSelected && (
            <span style={{ position: "absolute" }} aria-label="Selected, ">
              &#x2714;
            </span>
          )}
          <span style={{ marginLeft: "16px" }}>{title}</span>
        </MenuItem>
      );
    });

    const columnStatuses = Array.from(this.state.columnsState.values());
    options.push(<MenuItem divider key="separator" />);
    options.push(
      <MenuItem
        onClick={this.updateShownColumnsAll.bind(this)}
        key="select-all"
      >
        {columnStatuses.every(Boolean) && (
          <span style={{ position: "absolute" }} aria-label="Selected, ">
            &#x2714;
          </span>
        )}
        <span style={{ marginLeft: "16px" }}>Select all</span>
      </MenuItem>
    );
    options.push(
      <MenuItem
        onClick={this.updateShownColumnsNone.bind(this)}
        key="deselect-all"
      >
        {columnStatuses.every((x) => !x) && (
          <span style={{ position: "absolute" }} aria-label="Selected, ">
            &#x2714;
          </span>
        )}
        <span style={{ marginLeft: "16px" }}>Deselect all</span>
      </MenuItem>
    );

    return (
      <DropdownButton
        title="Show/Hide Columns or disappear"
        pullRight
        id="dropup-size-medium"
        bsSize="xsmall"
        onToggle={(isOpen) => this.onColumnSelectorToggle(isOpen)}
        open={this.state.columnSelectorIsOpen}
        onSelect={() => (this.columnJustSelected = true)}
      >
        {options}
      </DropdownButton>
    );
  }

  // TODO:  make the tables widths update on filtered change and sorted change
  render() {
    const dropdownColumnHideShowMenu = this.renderShowHideMenu();
    let downloadButton = null;
    if (this.props.downloadURL) {
      downloadButton = (
        <Button
          href={this.props.downloadURL}
          className="glyphicon glyphicon-download-alt"
          target="_blank"
          bsStyle="link"
          style={{ paddingRight: 10 }}
        />
      );
    } else if (this.props.allowDownloadFromTableData) {
      const dataToDownload = this.props.data;
      downloadButton = (
        <ReactCSV.CSVLink
          data={dataToDownload}
          filename="my-file.csv"
          className="glyphicon glyphicon-download-alt"
          target="_blank"
          style={{ paddingRight: 10 }}
        />
      );
    }

    const helpPopover = (
      <Popover id="popover-trigger-hover-focus" title="Tips">
        Click column headers to sort.
        <br />
        Use textboxes below the headers to filter values in a column.{" "}
      </Popover>
    );
    return (
      <div className="wide-table">
        <canvas
          style={{ position: "absolute", visibility: "hidden" }}
          ref={(r) => {
            this.textCanvas = r;
          }}
        />
        <div>
          <div style={{ display: "flex", alignItems: "center", float: "left" }}>
            {this.props.renderExtraDownloads &&
              this.props.renderExtraDownloads()}
          </div>
          <div
            id="thing"
            style={{ display: "flex", alignItems: "center", float: "right" }}
          >
            {downloadButton}
            <OverlayTrigger
              trigger={["hover", "focus"]}
              placement="top"
              overlay={helpPopover}
            >
              <span
                className="glyphicon glyphicon-question-sign"
                style={{ marginInlineEnd: 10 }}
              />
            </OverlayTrigger>
            {dropdownColumnHideShowMenu}
          </div>
        </div>

        {this.props.renderWithReactTableV7 ? (
          <ReactTableV7
            ref={(r) => {
              this.selectTable = r;
            }}
            columns={this.state.columns as any}
            data={this.props.data}
            onChangeSelections={this.props.onChangeSelections}
            idProp={this.props.idProp}
            rowHeight={this.props.rowHeight}
          />
        ) : (
          <ReactTableV6
            ref={(r) => {
              this.selectTable = r;
            }}
            {...this.props.additionalReactTableProps}
            columns={this.state.columns}
            data={this.props.data}
            style={{
              fontFamily: "'Lato', sans-serif",
              display: "inline-block",
              width: "100%",
            }}
            filterable
            defaultFilterMethod={(filter: any, row: any) => {
              const id = filter.pivotId || filter.id;
              return row[id] !== undefined
                ? String(row[id])
                    .toLowerCase()
                    .includes(filter.value.toLowerCase())
                : true;
            }}
            onFilteredChange={(filtered: any, column: any) => {
              console.log("filtered change");
            }}
            sorted={this.state.sorted}
            onSortedChange={(sorted) => this.setState({ sorted })}
            getTheadThProps={() => {
              return { style: { outline: 0 } };
            }}
          />
        )}
      </div>
    );
  }
}
export default WideTable;
