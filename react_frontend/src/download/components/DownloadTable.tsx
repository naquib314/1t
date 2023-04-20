import * as React from "react";
import ReactTable, { Column } from "react-table";
import { getReleaseByReleaseName } from "src/common/utilities/helper_functions";
import {
  Release,
  DownloadTableData,
  DownloadFile,
} from "shared/dataSlicer/models/downloads";
import { DownloadGlyph } from "./DownloadGlyph";
import { Button, Modal } from "react-bootstrap";

export interface DownloadTableProps {
  onViewClick: (card: DownloadFile) => void;
  unfilteredData: DownloadTableData;
  fileType: Set<string>;
  releaseData: Array<Release>;
  releaseGroup: Set<string>;
  source: Set<string>;
  publishedReleases: Set<string>;
  showUnpublished: boolean;
  showOnlyMainFiles: boolean;
  card: DownloadFile;
  termsDefinitions: { [key: string]: string };
}

export interface TaigaLinkProps {
  taigaUrl: string;
}

// function booleanFilterMethod(filter: any, row: any): boolean {
//   return filter && filter.value ? row[filter.id] : true;
// }
//
// const booleanFilter = ({
//   column,
//   filter,
//   onFilterChange,
//   onChange,
// }: {
//   column: Column;
//   filter: any;
//   onFilterChange: any;
//   onChange: any;
// }) => {
//   return (
//     <div className="horizontal-center-container">
//       <input
//         type="checkbox"
//         onChange={() => onChange(filter ? !filter.value : true)}
//       />
//     </div>
//   );
// };

export class DownloadTable extends React.Component<DownloadTableProps, any> {
  constructor(props: any) {
    super(props);
  }

  ShowParagraphUnderPrimeTableHeader: boolean = false;

  getFilteredData = () => {
    const releaseMap: Map<string, Release> = new Map();
    let latestRelease: Release;
    this.props.releaseData.forEach((release) => {
      if (release.isLatest) latestRelease = release;

      return releaseMap.set(release.releaseName, release);
    });

    // split for debuggability
    const filteredType = this.props.unfilteredData.filter((download) =>
      this.props.fileType.has(download.fileType)
    );
    let filteredTypeRelease = filteredType.filter((download) => {
      // This gets the selected release options (top left dropdown selection)
      return this.props.releaseGroup.has(
        releaseMap.get(download.releaseName).releaseGroup
      );
    });

    let filteredData = filteredTypeRelease.filter((download) =>
      download.sources.some((source) => this.props.source.has(source))
    );

    if (!this.props.showUnpublished) {
      filteredData = filteredTypeRelease.filter((download) =>
        this.props.publishedReleases.has(
          releaseMap.get(download.releaseName).releaseGroup
        )
      );
    }

    filteredData = filteredTypeRelease.filter((download) =>
      this.props.showOnlyMainFiles ? download.isMainFile : true
    );

    let otherTableData = filteredTypeRelease.filter((download) =>
      this.props.showOnlyMainFiles ? !download.isMainFile : false
    );

    // We only want the release description to show up once, under the primary files table header. Sometimes, a release
    // has no primary files. In that case, we want to hide the primary file table and show the release description under
    // the All Files table header.
    this.ShowParagraphUnderPrimeTableHeader = otherTableData.length > 0;

    return filteredData;
  };

  getColumns = () => {
    const columns: Array<Column> = [
      {
        Header: "File",
        id: "file",
        accessor: "fileName",
        Filter: this.renderFilterPlaceholder("File"),
      },
      {
        Header: "Date",
        id: "date",
        accessor: "date",

        filterable: false,
        maxWidth: 100,
        sortMethod: (a: string, b: string) => {
          if (a === b) {
            return 0;
          }
          const aReverse = a.split("/").reverse().join("");
          const bReverse = b.split("/").reverse().join("");
          return aReverse > bReverse ? 1 : -1;
        },
      },
      {
        Header: "Size",
        id: "size",
        accessor: "size",
        filterable: false,
        maxWidth: 100,
      },
      {
        accessor: "downloadUrl",
        filterable: false,
        Cell: (
          // FIXME: Be careful when upgrading to react-table v7. It passed a
          // wrapper object with separate `value` and `row` properties (`value`
          // is no longer part of `row`).
          row: { value: string; original: { terms: string } } // RowRenderProps
        ) =>
          row.value && (
            <DownloadGlyph
              terms={row.original.terms}
              downloadUrl={row.value}
              termsDefinitions={this.props.termsDefinitions}
              isDownloadModal={false}
            />
          ),
        maxWidth: 40,
      },
    ];

    if (enabledFeatures.use_taiga_urls) {
      columns.push({
        accessor: "taigaUrl",
        filterable: false,
        Cell: (
          row: { value: string } // RowRenderProps
        ) => <TaigaLink taigaUrl={row.value} />,
        maxWidth: 40,
      });
    }
    return columns;
  };

  renderFilterPlaceholder(field: string) {
    return ({
      column,
      filter,
      onFilterChange,
      onChange,
    }: {
      column: Column;
      filter: any;
      onFilterChange: any;
      onChange: any;
    }) => (
      <input
        type="text"
        placeholder={`Search by file name...`}
        value={filter ? filter.value : ""}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: "80%" }}
      />
    );
  }

  settings = {
    columns: this.getColumns(),
    getTrProps: (state: any, rowInfo: any, column: any) => {
      let className = null;
      if (
        rowInfo &&
        rowInfo.original.releaseName == this.props.card.releaseName &&
        rowInfo.original.fileName == this.props.card.fileName
      ) {
        // if row is non-blank, and things match
        className = "selected-row";
      }
      return {
        onClick: (e: any, handleOriginal: any) => {
          const card = rowInfo.original;
          console.log("onclick", card);
          this.props.onViewClick(card);
          // this overrides things like expanding SubComponents and pivots
          // see https://github.com/react-tools/react-table#custom-props for not doing so
          // did not implement ^, stopped at error handleOriginal was an Event object and not a function
        },
        className,
      };
    },
    filterable: true,
    defaultFilterMethod: (filter: any, row: any) => {
      const id = filter.pivotId || filter.id;
      return row[id] !== undefined
        ? String(row[id]).toLowerCase().includes(filter.value.toLowerCase())
        : true;
    },
    pageSizeOptions: this.props.showOnlyMainFiles
      ? [5, 10, 20]
      : [5, 10, 20, 30, 40, 50, 100],
    defaultPageSize: this.props.showOnlyMainFiles ? 10 : 40,
    // defaultSorted : [{
    // 	id: "correlation",
    // 	desc: true
    // }],
  };

  //  style={{height: "300px"}}
  render() {
    const downloadFiles = this.getFilteredData();

    let release = getReleaseByReleaseName(
      this.props.releaseGroup.values().next().value,
      this.props.releaseData
    );

    const title = release ? release.releaseName : "";

    return (
      <>
        {(downloadFiles.length > 0 || !this.props.showOnlyMainFiles) && (
          <>
            <h2>
              {title}{" "}
              {this.props.showOnlyMainFiles ? "Primary Files" : "All Files"}
            </h2>
            <br />
            <div className="download-table">
              <ReactTable
                data={downloadFiles}
                className="-striped -highlight"
                {...this.settings}
              />
            </div>
          </>
        )}
      </>
    );
  }
}

class TaigaLink extends React.Component<TaigaLinkProps, any> {
  render() {
    return (
      // <i className="glyphicon glyphicon-new-window dataset-link-icon"></i>
      <span>
        {this.props.taigaUrl && (
          <a
            href={this.props.taigaUrl}
            target="_blank"
            style={{ fontSize: "11px" }}
          >
            Taiga
          </a>
        )}
      </span>
    );
  }
}
