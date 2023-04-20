import * as React from "react";
import { Button, Checkbox, Radio, Modal } from "react-bootstrap";
import update from "immutability-helper";

import CellLineListsDropdown from "shared/cellLineSelector/components/CellLineListsDropdown";
import { CustomList } from "shared/cellLineSelector/components/ListStorage";
import {
  ValidationResult,
  ValidationTextbox,
} from "shared/common/components/ValidationTextbox";
import { launchCellLineSelectorModal } from "src/index";
import {
  DownloadTableData,
  ExportDataQuery,
  ExportMergedDataQuery,
  SummaryStat,
  FeatureValidationQuery,
} from "shared/dataSlicer/models/downloads";
import DatasetPicker from "shared/dataSlicer/components/DatasetPicker";
import DownloadTracker from "shared/dataSlicer/components/DownloadTracker";
import {
  DatasetOptionsWithLabels,
  DownloadMetadata,
  DatasetDownloadMetadata,
} from "shared/dataSlicer/models";
import InfoIcon from "src/common/components/InfoIcon";

interface DataSlicerProps {
  // NOTE: getMorpheusUrl is required when used in portal frontend
  getMorpheusUrl?: (downloadUrl: string) => Promise<string>;
  getCitationUrl: (datasetId: string) => Promise<string>;
  getDatasetsList: () => Promise<DatasetDownloadMetadata[]>;
  exportData: (query: ExportDataQuery) => Promise<any>;
  exportDataForMerge: (query: ExportMergedDataQuery) => Promise<any>;
  getTaskStatus: (taskId: string) => Promise<any>;
  validateFeatures: (
    query: FeatureValidationQuery
  ) => Promise<ValidationResult>;
  fileInformation?: DownloadTableData;
  dapi: any; // DepmapApi or BreadboxApi
}

interface DataSlicerState {
  selectedDatasets: ReadonlyMap<string, string>; // map dataset id to dataset label (for downloads)
  entityLabels: ReadonlySet<string>;

  datasetOptions: Map<string, DatasetOptionsWithLabels[]>;

  useAllCellLines: boolean;
  selectedCellLineList: CustomList;
  useAllGenesCompounds: boolean;

  downloads: any[];

  dropEmpty: boolean;
  downloadMetadata: boolean;
  mergeDatasets: boolean;

  datasetMetadata: Map<string, DownloadMetadata>;
  hoveredDataset: string;

  initialized: boolean;
}

export default class DataSlicer extends React.Component<
  DataSlicerProps,
  DataSlicerState
> {
  private validationTextbox: any = null;

  constructor(props: DataSlicerProps) {
    super(props);
    this.validationTextbox = React.createRef();
    this.state = {
      selectedDatasets: new Map<string, string>(),
      entityLabels: new Set<string>(),

      datasetOptions: new Map<string, DatasetOptionsWithLabels[]>(),

      useAllCellLines: true,
      selectedCellLineList: null,
      useAllGenesCompounds: true,

      downloads: [],

      dropEmpty: true,
      downloadMetadata: false,
      mergeDatasets: false,

      datasetMetadata: new Map<string, DownloadMetadata>(),
      hoveredDataset: null,

      initialized: false,
    };
  }

  componentDidMount = () => {
    const datasetOptions: Map<string, DatasetOptionsWithLabels[]> = new Map();
    const datasetMetadata: Map<string, DownloadMetadata> = new Map();
    const selectedDatasets = new Map<string, string>();

    const urlParams = new URLSearchParams(window.location.search);
    const defaultSelectedStr = urlParams.get("default_selected") ?? "";
    const defaultSelectedSet = new Set(defaultSelectedStr.split(","));

    this.props.getDatasetsList().then((response) => {
      response.forEach((dataset) => {
        // for each dataset, sort each dataset into groups based on the category field returned
        const splitCategory = dataset.category.split("/");
        const isStandard = splitCategory[0] == "standard";
        const option: DatasetOptionsWithLabels = {
          id: dataset.id,
          label: dataset.display_name,
        };
        const category = isStandard ? splitCategory[1] : "other";
        if (category != "") {
          if (!datasetOptions.has(category)) {
            datasetOptions.set(category, [option]);
          } else {
            const newArray = datasetOptions.get(category);
            newArray.push(option);
            datasetOptions.set(category, newArray);
          }
        }
        // for each dataset, map dataset id to dataset information
        // "/download/all/?release=TEST+DATA&file=fusion.csv"
        const url = dataset.download_entry_url;
        if (url && url.endsWith(".csv")) {
          const fileInfo = this.getDatasetFileInfo(url);
          const metadata = {
            downloadInfo: fileInfo,
            url,
            label: dataset.display_name,
          };
          datasetMetadata.set(dataset.id, metadata);
        }
        // TODO:  make sure this works for retracted files?

        if (defaultSelectedSet.has(dataset.id)) {
          selectedDatasets.set(dataset.id, dataset.display_name);
        }
      });

      this.setState({
        selectedDatasets,
        datasetOptions,
        datasetMetadata,
        initialized: true,
      });
    });
  };

  getDatasetFileInfo = (url: string) => {
    const params: { [key: string]: string } = {};
    const pairs = url.split("?").pop().split("&");

    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i].split("=");
      params[this.decodeUrl(p[0])] = this.decodeUrl(p[1]);
    }

    let fileInfo = null;

    if (params && params.file && params.release) {
      const filename = params.file;
      const { release } = params;

      fileInfo = this.props.fileInformation.find((entry) => {
        return entry.fileName == filename && entry.releaseName == release;
      });
    }
    return fileInfo;
  };

  decodeUrl = (x: string) => {
    return decodeURIComponent(x).replace(/\+/g, " ");
  };

  sendQuery = () => {
    const downloadTrackers: any[] = [];
    const entityLabels = this.state.useAllGenesCompounds
      ? null
      : Array.from(this.state.entityLabels);
    const cellLineIds = this.state.useAllCellLines
      ? null
      : Array.from(this.state.selectedCellLineList.lines);

    if (this.state.mergeDatasets && this.state.selectedDatasets.size > 1) {
      let ids: string[] = [];
      let displayNames: string[] = [];
      let datasetUrlList: (string | null)[] = [];

      this.state.selectedDatasets.forEach((displayName, id) => {
        ids.push(id);

        let metadata = this.state.datasetMetadata.get(id);
        let url = metadata ? metadata.url : null;
        datasetUrlList.push(url);
        displayNames.push(displayName);
      });

      const query: ExportMergedDataQuery = {
        datasetIds: ids,
        featureLabels: entityLabels,
        cellLineIds,
        dropEmpty: this.state.dropEmpty,
        addCellLineMetadata: this.state.downloadMetadata,
      };

      const submissionResponse = this.props.exportDataForMerge(query);

      downloadTrackers.push(
        <div key={`download-${ids[0]}`}>
          <DownloadTracker
            submissionResponse={submissionResponse}
            citationUrls={datasetUrlList}
            getMorpheusUrl={this.props.getMorpheusUrl}
            datasetIds={ids}
            datasetDisplayNames={displayNames}
            getTaskStatus={this.props.getTaskStatus}
          />
        </div>
      );
    } else {
      this.state.selectedDatasets.forEach((displayName, id) => {
        const query: ExportDataQuery = {
          datasetId: id,
          featureLabels: entityLabels,
          cellLineIds,
          dropEmpty: this.state.dropEmpty,
          addCellLineMetadata: this.state.downloadMetadata,
        };
        const submissionResponse = this.props.exportData(query);
        const datasetMetadata = this.state.datasetMetadata.get(id);
        downloadTrackers.push(
          <div key={`download-${id}`}>
            <DownloadTracker
              submissionResponse={submissionResponse}
              citationUrls={datasetMetadata ? [datasetMetadata.url] : [null]}
              getMorpheusUrl={this.props.getMorpheusUrl}
              datasetIds={[id]}
              datasetDisplayNames={[displayName]}
              getTaskStatus={this.props.getTaskStatus}
            />
          </div>
        );
      });
    }

    this.setState({
      downloads: downloadTrackers,
    });
  };

  updateDatasetSelection = (justClickedDataset: DatasetOptionsWithLabels) => {
    let newSelectedDatasets;
    if (this.state.selectedDatasets.has(justClickedDataset.id)) {
      newSelectedDatasets = update(this.state.selectedDatasets, {
        $remove: [justClickedDataset.id],
      });
    } else {
      newSelectedDatasets = update(this.state.selectedDatasets, {
        $add: [[justClickedDataset.id, justClickedDataset.label]],
      });
    }

    this.setState(
      {
        selectedDatasets: newSelectedDatasets,
      },
      () => {
        // TODO:  fix this hack (put in place to get a demo out for design review)
        if (
          this.validationTextbox != null &&
          !(
            Object.prototype.hasOwnProperty.call(
              this.validationTextbox,
              "current"
            ) && this.validationTextbox.current == null
          )
        ) {
          this.validationTextbox.validateTextFieldTriggeredByParent();
        }
      }
    );
  };

  areAllOptionsOfADatasetGroupChecked = (
    datasetGroup: DatasetOptionsWithLabels[]
  ) => {
    return (
      datasetGroup.length ==
      datasetGroup.filter((option) =>
        this.state.selectedDatasets.has(option.id)
      ).length
    );
  };

  selectUnselectAllDatasets = (datasetList: DatasetOptionsWithLabels[]) => {
    let newDatasetIds;
    if (this.areAllOptionsOfADatasetGroupChecked(datasetList)) {
      newDatasetIds = update(this.state.selectedDatasets, {
        $remove: datasetList.map(
          (option: DatasetOptionsWithLabels) => option.id
        ),
      });
    } else {
      newDatasetIds = update(this.state.selectedDatasets, {
        $add: datasetList.map((option: DatasetOptionsWithLabels) => [
          option.id,
          option.label,
        ]) as any,
      });
    }

    this.setState({
      selectedDatasets: newDatasetIds,
    });
  };

  validateQuery = (): boolean => {
    // at least one dataset selected
    if (this.state.selectedDatasets.size < 1) {
      return false;
    }
    // either all cell lines selected, or if custom cell line list option is selected, a valid list is selected
    if (
      !this.state.useAllCellLines &&
      this.state.selectedCellLineList == null
    ) {
      return false;
    }
    // either all entities selected, or if custom entitiy list option is selected, all inputs are valid
    if (!this.state.useAllGenesCompounds && this.state.entityLabels.size < 1) {
      return false;
    }
    return true;
  };

  renderDatasetCheckboxGroup = (datasets: DatasetOptionsWithLabels[]) => {
    const sortedDatasets = datasets;
    sortedDatasets.sort((a, b) => (a.label > b.label ? 1 : -1));
    return (
      <DatasetPicker
        datasets={sortedDatasets}
        highlightedDataset={this.state.hoveredDataset}
        checked={new Set(this.state.selectedDatasets.keys())}
        onClick={(clicked: DatasetOptionsWithLabels) => {
          this.updateDatasetSelection(clicked);
        }}
        onMouseOver={(datasetId: string) => {
          this.setState({ hoveredDataset: datasetId });
        }}
      />
    );
  };

  renderDatasetSelection = (): any => {
    const numCols = 2;
    let categoryCounts: { category: string; numElements: number }[] = [];
    Array.from(this.state.datasetOptions.keys()).forEach((category: string) => {
      categoryCounts.push({
        category,
        numElements: this.state.datasetOptions.get(category).length,
      });
    });

    categoryCounts.sort((a, b) => (a.numElements < b.numElements ? 1 : -1));

    const columns: string[][] = [];
    const runningCounts: number[] = [];
    for (let i = 0; i < numCols; i++) {
      columns.push([]);
      runningCounts.push(0);
    }

    // hack to always make "gene" the first category
    if (this.state.datasetOptions.has("gene")) {
      categoryCounts = categoryCounts.filter((categoryCount) => {
        return categoryCount.category !== "gene";
      });
      columns[0].push("gene");
      runningCounts[0] = this.state.datasetOptions.get("gene").length + 1;
    }

    // hack to always ensure that "other" (nonstandard) is the last category. (continued further down)
    if (this.state.datasetOptions.has("other")) {
      categoryCounts = categoryCounts.filter((categoryCount) => {
        return categoryCount.category !== "other";
      });
      runningCounts[numCols - 1] =
        this.state.datasetOptions.get("other").length + 1;
    }

    categoryCounts.forEach(
      (categoryAndCounts: { category: string; numElements: number }) => {
        const indexOfMinRunningCounts = runningCounts.indexOf(
          Math.min(...runningCounts)
        );
        columns[indexOfMinRunningCounts].push(categoryAndCounts.category);
        runningCounts[indexOfMinRunningCounts] +=
          categoryAndCounts.numElements + 1;
      }
    );

    // hack to always ensure that "other" (nonstandard) is the last category. (continued from above)
    if (this.state.datasetOptions.has("other")) {
      columns[numCols - 1].push("other");
    }

    const cols: any[] = [];

    columns.forEach((column: string[], index: number) => {
      const colElements: any[] = [];
      column.forEach((category: string) => {
        colElements.push(
          <div key={`select-${category}`} className="categoryGroup">
            <strong>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </strong>
            {" | "}
            <a
              onClick={() => {
                this.selectUnselectAllDatasets(
                  this.state.datasetOptions.get(category)
                );
              }}
            >
              {this.areAllOptionsOfADatasetGroupChecked(
                this.state.datasetOptions.get(category)
              )
                ? "Deselect all"
                : "Select All"}
            </a>
            {this.renderDatasetCheckboxGroup(
              this.state.datasetOptions.get(category)
            )}
          </div>
        );
      });
      cols.push(
        <div
          key={`datasets-col-${index}`}
          className={index != numCols - 1 ? "notLastCol" : ""}
          style={{}}
        >
          {colElements}
        </div>
      );
    });

    const display = this.state.initialized ? cols : "Loading...";

    return (
      <div>
        <h4>DATASETS</h4>
        <div className="datasetGroupContainer">{display}</div>
      </div>
    );
  };

  renderCellLineSelection = (customInfoImg: JSX.Element): any => {
    const onCellLineLinkClick = () => {
      launchCellLineSelectorModal();
      // Need this click so that the tooltip doesn't stay open in front of the cell line modal
      document.body.click();
    };

    return (
      <div>
        <h4>{"CELL LINES "}</h4>
        <div>
          <Radio
            inline
            id="cellLinesAll"
            checked={this.state.useAllCellLines}
            onChange={() =>
              this.setState({
                useAllCellLines: true,
              })
            }
          >
            <label htmlFor="cellLinesAll" style={{ cursor: "pointer" }}>
              {" "}
              Use all cell lines
            </label>
          </Radio>
          <Radio
            inline
            id="cellLinesCustom"
            checked={!this.state.useAllCellLines}
            onChange={() =>
              this.setState({
                useAllCellLines: false,
              })
            }
          >
            <label htmlFor="cellLinesCustom" style={{ cursor: "pointer" }}>
              {" "}
              Use custom cell line list
            </label>
          </Radio>
          <InfoIcon
            target={customInfoImg}
            popoverContent={
              <p>
                Use the{" "}
                <a style={{ cursor: "pointer" }} onClick={onCellLineLinkClick}>
                  Cell Line Selector
                </a>{" "}
                to sort and filter cell lines to create and save custom
                collections that can be applied across tools and plots
                throughout the portal.
              </p>
            }
            popoverId={`custom-cell-lines-popover`}
            trigger="click"
          />
        </div>
        {!this.state.useAllCellLines && (
          <CellLineListsDropdown
            launchCellLineSelectorModal={launchCellLineSelectorModal}
            id="cellLineDropdown"
            defaultNone
            onListSelect={(e: CustomList) => {
              this.setState({
                selectedCellLineList: e,
              });
            }}
          />
        )}
      </div>
    );
  };

  validateFeatures = (inputs: string[]): Promise<ValidationResult> => {
    const datasetIds = Array.from(this.state.selectedDatasets.keys());

    if (inputs.length > 0) {
      const query: FeatureValidationQuery = {
        featureLabels: inputs,
      };
      return this.props.validateFeatures(query);
    }
    return Promise.resolve({
      valid: new Set([""]),
      invalid: new Set(inputs),
    });
  };

  renderFeatureSelection = (customInfoImg: JSX.Element): any => {
    const genesCompoundsToolTipContent =
      "Enter a space separated list of genes or compounds into the textbox that appears when option is selected.";

    return (
      <div>
        <h4>GENES/COMPOUNDS</h4>
        <Radio
          inline
          id="geneCompoundAll"
          checked={this.state.useAllGenesCompounds}
          onChange={() =>
            this.setState({
              useAllGenesCompounds: true,
            })
          }
        >
          <label htmlFor="geneCompoundAll" style={{ cursor: "pointer" }}>
            {" "}
            Use all genes/compounds
          </label>
        </Radio>

        <Radio
          inline
          id="geneCompoundCustom"
          checked={!this.state.useAllGenesCompounds}
          onChange={() =>
            this.setState({
              useAllGenesCompounds: false,
            })
          }
        >
          <label htmlFor="geneCompoundCustom" style={{ cursor: "pointer" }}>
            {" "}
            Use custom gene/compound list
          </label>
        </Radio>
        <InfoIcon
          target={customInfoImg}
          popoverContent={genesCompoundsToolTipContent}
          popoverId={`gene-compounds-popover`}
          trigger="click"
        />
        {!this.state.useAllGenesCompounds && (
          <div>
            <ValidationTextbox
              ref={(el) => (this.validationTextbox = el)}
              placeholderText="Type your space-separated list here"
              validationFunction={this.validateFeatures}
              separator={" "}
              onAllInputsValidated={(validInputs: Set<string>) => {
                this.setState({
                  entityLabels: validInputs,
                });
              }}
              onInvalidInputsExist={(invalidInputs: Set<string>) => {
                this.setState({
                  entityLabels: new Set<string>(),
                });
              }}
              textboxSizeRows={4}
            />
          </div>
        )}
      </div>
    );
  };

  renderDatasetInfo = (): any => {
    const metadata = this.state.datasetMetadata.get(this.state.hoveredDataset);
    if (metadata) {
      const info = metadata.downloadInfo;
      const { label } = metadata;
      let fileName: any = null;
      let description: string = null;
      if (info) {
        fileName = info.fileName;
        if (metadata.url) {
          fileName = (
            <a href={metadata.url} target="_blank">
              {fileName}
            </a>
          );
        }
        description = info.fileDescription;
      }
      let summaryStatDisplay: any = null;

      if (info && info.summaryStats) {
        const summaryStats: any[] = [];
        info.summaryStats.forEach((summaryStat: SummaryStat) => {
          summaryStats.push(
            <span className="summaryStatElement" key={summaryStat.label}>
              <span>{summaryStat.label}:</span>
              <span>{summaryStat.value}</span>
            </span>
          );
        });
        summaryStatDisplay = (
          <div className="summaryStatsContainer">{summaryStats}</div>
        );
      }
      return (
        <div className="datasetDescription">
          <h3>{label}</h3>
          <h5>{fileName}</h5>
          {summaryStatDisplay}
          <div
            className="fileDescription"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      );
    }
  };

  renderDownloadModal = (): any => {
    return (
      <Modal
        backdrop="static"
        show
        onHide={() => {
          this.setState({
            downloads: [],
          });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>File Downloads</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            If the file(s) do not download automatically, click the links below.
          </div>
          <hr />
          {this.state.downloads}
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    const { dapi } = this.props;
    const customInfoImg = (
      <img
        style={{
          height: "13px",
          margin: "2px 7px 7px",
          cursor: "pointer",
        }}
        src={dapi._getFileUrl("/static/img/gene_overview/info_purple.svg")}
        alt="description of term"
        className="icon"
      />
    );

    return (
      <div id="DataSlicer">
        <div className="parameters">
          <div>
            <strong>Create your own dataset downloads</strong>
            <p>
              This tool will subset datasets by your selection of cell lines and
              genes/compounds
            </p>
            <hr />
            <div className="datasetGroupContainer">
              <div>
                <Checkbox
                  checked={this.state.dropEmpty}
                  onChange={() => {}}
                  onClick={() => {
                    this.setState({ dropEmpty: !this.state.dropEmpty });
                  }}
                >
                  <span>
                    Exclude columns and rows of NA's from download files.
                  </span>
                </Checkbox>
                <Checkbox
                  checked={this.state.downloadMetadata}
                  onChange={() => {}}
                  onClick={() => {
                    this.setState({
                      downloadMetadata: !this.state.downloadMetadata,
                    });
                  }}
                >
                  <span>Add cell line metadata to download</span>
                </Checkbox>
                <Checkbox
                  checked={this.state.mergeDatasets}
                  onChange={() => {}}
                  onClick={() => {
                    this.setState({
                      mergeDatasets: !this.state.mergeDatasets,
                    });
                  }}
                >
                  <span>Merge into a single file</span>
                </Checkbox>
              </div>
              <div className="downloadButtonContainer">
                <Button
                  bsStyle="primary"
                  style={{ width: "100%", height: "60%" }}
                  disabled={!this.validateQuery()}
                  onClick={() => {
                    this.sendQuery();
                  }}
                >
                  {this.state.selectedDatasets &&
                  this.state.selectedDatasets.size > 1
                    ? "Download Files"
                    : "Download File"}
                </Button>
              </div>
            </div>
            <hr />
            {this.renderCellLineSelection(customInfoImg)}
            <hr />
            {this.renderFeatureSelection(customInfoImg)}
            <hr />
            {this.renderDatasetSelection()}
          </div>
        </div>

        <div className="otherParametersWrapper">
          <div className="otherParameters">
            <div className="datasetDescriptionContainer">
              {this.state.hoveredDataset && this.renderDatasetInfo()}
            </div>
          </div>
          {this.state.downloads.length > 0 && this.renderDownloadModal()}
        </div>
      </div>
    );
  }
}
