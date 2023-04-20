import * as React from "react";
import update from "immutability-helper";
import { getDapi } from "src/common/utilities/context";
import assert from "shared/common/utilities/assert";
import {
  getReleaseByReleaseName,
  getReleaseDescriptionByName,
  getReleaseForFile,
  getReleaseGroupFromSelection,
} from "src/common/utilities/helper_functions";
import DataSlicer from "src/dataSlicer/components/DataSlicer";
import {
  ExportDataQuery,
  ExportMergedDataQuery,
  FeatureValidationQuery,
} from "shared/dataSlicer/models/downloads";
import { DownloadTable, DownloadTableProps } from "./DownloadTable";
import { TypeGroup } from "./CheckboxPanel";
import {
  DownloadTableData,
  Release,
  ReleaseType,
  DownloadFile,
  ViewMode,
} from "../../../shared/dataSlicer/models/downloads";
import { DropdownButton, MenuItem } from "react-bootstrap";
import { FileCardModal } from "./FileCardModal";
import { ReleaseCardModal } from "./ReleaseCardModal";
import qs from "qs";
import { deleteQueryParams } from "shared/common/utilities/url";
import { FileSearch, FileSearchOption } from "./FileSearch";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "src/common/styles/typeahead_fix.scss";

interface AllDownloadsState {
  stateInitialized?: boolean;
  searchOptions?: FileSearchOption[];
  dropdownSelector?: {
    fileType: {
      selected: Set<string>;
    };
    releaseGroup: {
      selected: Set<string>;
    };
    source: {
      selected: Set<string>;
    };
    showUnpublished: boolean;
    selection: string[];
  };
  releaseModalShown?: boolean;
  fileModalShown?: boolean;
  dropdownOpen?: boolean;
  card?: DownloadFile;
  view?: ViewMode;
}

export interface AllDownloadsProps {
  releases?: Set<string>;
  file?: string;
  modal?: boolean;
  bulkDownloadCsvUrl?: string;
  termsDefinitions: { [key: string]: string };
  mode?: ViewMode;
  updateReactLoadStatus: () => void;
}

export class AllDownloads extends React.Component<
  AllDownloadsProps,
  AllDownloadsState
> {
  static defaultProps = {
    releases: new Set() as Set<string>,
    file: "",
    modal: false,
  };

  constructor(props: AllDownloadsProps) {
    super(props);
    this.state = {
      stateInitialized: false,
      dropdownSelector: {
        fileType: {
          selected: new Set([]),
        },
        releaseGroup: {
          selected: new Set([]),
        },
        source: {
          selected: new Set([]),
        },
        showUnpublished: false,
        selection: [],
      },
      releaseModalShown: false,
      fileModalShown: false,
      dropdownOpen: false,
      card: {
        releaseName: null,
        fileName: null,
        fileDescription: null,
        isMainFile: false,
        retractionOverride: null,
        downloadUrl: null,
        sources: null,
        taigaUrl: null,
        terms: null,
        fileType: null,
        size: null,
      },
      view: this.props.mode ? this.props.mode : ViewMode.topDownloads,
    };

    this.handleToggleFileModal = this.handleToggleFileModal.bind(this);
    this.handleToggleReleaseModal = this.handleToggleReleaseModal.bind(this);
  }

  table: DownloadTableData;

  dropdownSelectorOptions: {
    fileType: Array<string>;
    releaseGroupByType: Array<TypeGroup>;
    source: Array<string>;
  };

  releaseData: Array<Release>;

  publishedReleases: Set<string>;

  dataUsageUrl: string;

  componentDidMount() {
    this.initDownloads();
  }

  componentDidUpdate(_: AllDownloadsProps, prevState: AllDownloadsState) {
    if (!prevState.stateInitialized && this.state.stateInitialized) {
      this.props.updateReactLoadStatus();
    }
  }

  initDownloads = () => {
    Promise.resolve().then(() => {
      return getDapi()
        .getDownloads()
        .then((downloads) => {
          const releaseGroups = downloads.releaseData.map(
            (release: any) => release.releaseGroup
          );

          const topReleaseGroup = releaseGroups.slice(0, 1);
          let releaseGroupByType = this.formatReleaseGroupByType(
            downloads.releaseData,
            downloads.releaseType
          );

          const { fileType } = downloads;
          const { source } = downloads;

          this.table = downloads.table;
          this.releaseData = downloads.releaseData;
          this.dataUsageUrl = downloads.dataUsageUrl;
          this.dropdownSelectorOptions = {
            releaseGroupByType,
            fileType,
            source,
          };
          this.publishedReleases = new Set(
            downloads.releaseData
              .filter((release: any) => release.citation)
              .map((release: any) => release.releaseName)
          );

          const newState: AllDownloadsState = {
            stateInitialized: true,
            searchOptions: [],
            dropdownSelector: {
              fileType: {
                selected: new Set(fileType),
              },
              releaseGroup: {
                selected: new Set(topReleaseGroup),
              },
              source: {
                selected: new Set([]),
              },
              showUnpublished: false,
              selection: topReleaseGroup,
            },
            releaseModalShown: false,
            fileModalShown: false,
          };

          const fileSearchOptions: FileSearchOption[] = [];
          downloads.table.map((row: any) => {
            fileSearchOptions.push({
              releasename: row.releaseName,
              filename: row.fileName,
              description: row.fileDescription,
            });
          });
          newState.searchOptions =
            fileSearchOptions.length > 0 ? fileSearchOptions : null;

          if (this.props.releases.size > 0 && this.props.file) {
            newState.view = ViewMode.allDownloads;

            if (this.props.file) {
              const row = this.table.find(
                (row) =>
                  row.fileName == this.props.file &&
                  this.props.releases.has(row.releaseName)
              );
              assert(row);
              newState.card = row;
            }

            // file must be specified with a release
            const selectedReleaseGroups = this.releaseData
              .filter((r) => this.props.releases.has(r.releaseName))
              .map((r) => r.releaseGroup);
            let newSelection: string[] = [];
            newSelection.push(selectedReleaseGroups[0]);
            newState.dropdownSelector.releaseGroup.selected = new Set(
              newSelection
            );
            newState.dropdownSelector.selection = newSelection;
          }

          this.setState(newState);

          // Gets hit if the URL has a release name at the end - user wants to be linked directly to that release modal
          this.handleReleaseFileNameUrls();
        });
    });
  };

  handleReleaseFileNameUrls() {
    const params = qs.parse(window.location.search.substr(1));

    if (params["releasename"] || params["release"]) {
      const releaseNameParam = params["releasename"]
        ? params["releasename"]
        : params["release"];
      let releaseName: string = releaseNameParam.toString();

      if (params["filename"] || params["file"]) {
        const fileNameParam = params["filename"]
          ? params["filename"]
          : params["file"];
        let fileName: string = fileNameParam.toString();
        this.loadToSpecificFileModal(releaseName, fileName);
      } else {
        this.loadToReleaseModalFromUrl(releaseName);
      }
    }
  }

  loadToSpecificFileModal = (releaseName: string, fileName: string) => {
    this.onDropdownSelectionChange(releaseName);

    const row = this.table.find((row) => row.fileName == fileName);
    if (!row) {
      alert("The specified release or file does not exist. Please try again.");
      return;
    }
    this.onTableRowClick(row);
  };

  loadToReleaseModalFromUrl = (releaseName: string) => {
    this.onDropdownSelectionChange(releaseName);
    this.handleToggleReleaseModal();
  };

  formatReleaseGroupByType = (
    releaseData: Array<Release>,
    releaseTypes: Array<ReleaseType>
  ) => {
    const unordered: { [key: string]: Array<string> } = {};
    releaseData.forEach((release: Release) => {
      const type = release.releaseType;
      if (type in unordered) {
        if (!unordered[type].includes(release.releaseGroup)) {
          unordered[type].push(release.releaseGroup);
        }
      } else {
        unordered[type] = [release.releaseGroup];
      }
    });

    const ordered = releaseTypes.map((releaseType) => {
      return {
        name: releaseType,
        options: releaseType in unordered ? unordered[releaseType] : [],
      };
    });
    return ordered;
  };

  onTableRowClick = (row: DownloadFile) => {
    const newState: AllDownloadsState = {
      card: row,
      view: ViewMode.allDownloads,
      releaseModalShown: false,
      fileModalShown: true,
    };
    this.setState(newState);
  };

  // react bootstrap dropdown wouldn't close on selection so we handle the state here.
  onDropdownToggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  onDropdownSelectionChange = (selectedOption: string) => {
    // Selected Option might come from a url query param. Url query params use release name, which might
    // not match a release group in the top left dropdown of the File Downloads page. The following
    // method matches the release name to the appropriate release group.
    let validatedSelection = getReleaseGroupFromSelection(
      this.releaseData,
      selectedOption
    );
    if (validatedSelection == "") {
      return;
    }

    let selected: Set<string> = new Set([]);
    if (selected != undefined) selected.add(validatedSelection);

    let selection: string[] = [];
    selection.push(validatedSelection);

    const newState: AllDownloadsState = {};
    newState.dropdownSelector = update(this.state.dropdownSelector, {
      releaseGroup: {
        selected: { $set: selected },
      },
      selection: { $set: selection },
    });
    newState.releaseModalShown = false;
    this.setState(newState);
  };

  handleSelectDropdown = (eventKey: any) => {
    this.onDropdownSelectionChange(eventKey.option);
  };

  handleFileSearch = (selected: FileSearchOption) => {
    const fileName = selected.filename;
    const releaseName = selected.releasename;
    this.loadToSpecificFileModal(releaseName, fileName);
  };

  handleToggleReleaseModal = () => {
    this.setState({
      releaseModalShown: !this.state.releaseModalShown,
    });

    if (this.state.releaseModalShown) {
      // Remove release name param from url (were added on open of the modal)
      deleteQueryParams();
    }
  };

  handleToggleFileModal = () => {
    this.setState({
      fileModalShown: !this.state.fileModalShown,
    });

    // Remove release and file name params from url (were added on open of the modal)
    if (this.state.fileModalShown) {
      deleteQueryParams();
    }
  };

  renderOptions = (group: TypeGroup) => {
    return (
      <React.Fragment key={group.options.toString()}>
        {group.options.length > 0 ? (
          <>
            <MenuItem
              header
              className="downloads-dropdown-menu"
              eventKey={group.name}
              key={group.name}
              disabled
            >
              {group.name}
            </MenuItem>
            {group.options.map((option) =>
              getReleaseByReleaseName(option, this.releaseData) ? (
                <MenuItem
                  eventKey={{ option, group }}
                  key={option}
                  onSelect={this.handleSelectDropdown}
                  onClick={this.onDropdownToggle}
                  active={option === this.state.dropdownSelector.selection[0]}
                >
                  {option}
                </MenuItem>
              ) : null
            )}
            <MenuItem divider />
          </>
        ) : null}
      </React.Fragment>
    );
  };

  render() {
    const { termsDefinitions } = this.props;
    let titleLabel: string = "File Downloads";
    if (this.state.view === ViewMode.customDownloads) {
      titleLabel = "Custom Downloads";
    }

    // Get the release description for display under the dropdown
    const description = getReleaseDescriptionByName(
      this.state.dropdownSelector.selection[0],
      this.releaseData
    );

    // Put description into html element so we don't have messy looking html tags in our desscription string
    const descriptionElement: JSX.Element = (
      <div>
        {
          <div
            style={{ maxWidth: "75ch" }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        }
      </div>
    );

    var headerStyle = {
      paddingBottom: "20px",
      margin: "0px",
    };

    const title = (
      <div className="title_div">
        <h1 className="inline-block" style={headerStyle}>
          {titleLabel}
        </h1>
        {this.state.view == ViewMode.allDownloads && (
          <>
            <div>
              <FileSearch
                searchOptions={this.state.searchOptions}
                onSearch={this.handleFileSearch}
                searchPlaceholder="Search for a download file..."
              />
            </div>
            <p style={{ maxWidth: "75ch", marginTop: "10px" }}>
              File Downloads allows you to browse and access the complete
              collection of datasets available in the DepMap portal. By default
              the latest DepMap data release of CRISPR and genomics data  is
              shown, but you can select other datasets and data types using the
              drop downs, and can search for specific files by name.
            </p>
            <br />
            <h3>Select a dataset to view:</h3>
            {this.dropdownSelectorOptions && (
              <DropdownButton
                bsStyle="default"
                title={this.state.dropdownSelector.selection}
                id="all-downloads"
                onToggle={this.onDropdownToggle}
                open={this.state.dropdownOpen}
              >
                {this.dropdownSelectorOptions.releaseGroupByType.map((group) =>
                  this.renderOptions(group)
                )}
              </DropdownButton>
            )}
            <div
              className="iconContainer"
              style={{ marginRight: "auto", float: "right" }}
            >
              <p style={{ color: "#337ab7" }}>
                <span
                  style={{
                    fontSize: 14,
                    paddingRight: 8,
                    cursor: "pointer",
                  }}
                  onClick={(event) => {
                    this.handleToggleReleaseModal();
                    event.preventDefault();
                  }}
                >
                  View full release details
                </span>
                <span
                  className="glyphicon glyphicon-resize-full"
                  style={{ color: "#337ab7", fontSize: 14 }}
                  onClick={(event) => {
                    this.handleToggleReleaseModal();
                    event.preventDefault();
                  }}
                />
              </p>
            </div>
            <div>
              <br />
              {descriptionElement}
            </div>
            {this.state.releaseModalShown && (
              <ReleaseCardModal
                termsDefinitions={termsDefinitions}
                dataUsageUrl={this.dataUsageUrl}
                file={this.state.card}
                release={getReleaseByReleaseName(
                  this.state.dropdownSelector.selection[0],
                  this.releaseData
                )}
                show={this.state.releaseModalShown}
                toggleShowReleaseModalHandler={this.handleToggleReleaseModal}
              ></ReleaseCardModal>
            )}
          </>
        )}
        {this.state.view == ViewMode.customDownloads && (
          <p style={{ maxWidth: "75ch" }}>
            Only download what you need! Custom Downloads lets you create data
            files that subsets any of the available dataset in the DepMap portal
            using your list of cell lines, genes, and/or compounds of interest.
          </p>
        )}
      </div>
    );

    if (!this.state.stateInitialized) {
      return (
        <div>
          {title}
          <p>Loading...</p>
        </div>
      );
    }

    const downloadTableProps: DownloadTableProps = {
      onViewClick: this.onTableRowClick,
      unfilteredData: this.table,
      fileType: this.state.dropdownSelector.fileType.selected,
      releaseData: this.releaseData,
      releaseGroup: this.state.dropdownSelector.releaseGroup.selected,
      source: this.state.dropdownSelector.source.selected,
      publishedReleases: this.publishedReleases,
      showUnpublished: this.state.dropdownSelector.showUnpublished,
      showOnlyMainFiles: false,
      card: this.state.card,
      termsDefinitions: this.props.termsDefinitions,
    };

    const mainFilesDownloadTableProps: DownloadTableProps = {
      onViewClick: this.onTableRowClick,
      unfilteredData: this.table,
      fileType: this.state.dropdownSelector.fileType.selected,
      releaseData: this.releaseData,
      releaseGroup: this.state.dropdownSelector.releaseGroup.selected,
      source: this.state.dropdownSelector.source.selected,
      publishedReleases: this.publishedReleases,
      showUnpublished: this.state.dropdownSelector.showUnpublished,
      showOnlyMainFiles: true,
      card: this.state.card,
      termsDefinitions: this.props.termsDefinitions,
    };

    let mainDivContents;
    if (this.state.view == ViewMode.customDownloads && this.table) {
      mainDivContents = (
        <div>
          <DataSlicer
            getMorpheusUrl={(csvUrl: string) =>
              getDapi().getMorpheusUrl(csvUrl)
            }
            getCitationUrl={(datasetId: string) => {
              return getDapi().getCitationUrl(datasetId);
            }}
            getDatasetsList={() => getDapi().getDatasetsList()}
            exportData={(query: ExportDataQuery) => getDapi().exportData(query)}
            exportDataForMerge={(query: ExportMergedDataQuery) =>
              getDapi().exportDataForMerge(query)
            }
            getTaskStatus={(taskId: string) => getDapi().getTaskStatus(taskId)}
            validateFeatures={(query: FeatureValidationQuery) =>
              getDapi().validateFeaturesInDataset(query)
            }
            fileInformation={this.table}
            dapi={getDapi()}
          />
        </div>
      );
    } else {
      mainDivContents = (
        <div>
          <div>
            <DownloadTable {...mainFilesDownloadTableProps} />
          </div>
          <br />
          <div>
            <DownloadTable {...downloadTableProps} />
          </div>
          {this.state.card.releaseName &&
            this.state.view == ViewMode.allDownloads &&
            this.state.fileModalShown && (
              <div>
                <FileCardModal
                  dataUsageUrl={this.dataUsageUrl}
                  file={this.state.card}
                  release={getReleaseForFile(this.releaseData, this.state.card)}
                  defaultModalState={this.state.card !== undefined}
                  show={this.state.fileModalShown}
                  toggleShowFileModalHandler={this.handleToggleFileModal}
                  termsDefinitions={this.props.termsDefinitions}
                />
              </div>
            )}
        </div>
      );
    }

    return (
      <div className="all-downloads">
        <div id="selenium-ready">
          <div>
            <br />
            {title}

            <br />
            <div>{mainDivContents}</div>
            <br />
          </div>
        </div>
      </div>
    );
  }
}
