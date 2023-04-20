import { hot } from "react-hot-loader/root";
import * as React from "react";

import {
  Row,
  Col,
  MenuItem,
  Button,
  OverlayTrigger,
  Popover,
  ControlLabel,
} from "react-bootstrap";
import { Checkbox } from "shared/common/components/Buttons";
import DropdownButton from "src/common/components/DropdownButton";
import CellLineListsDropdown from "shared/cellLineSelector/components/CellLineListsDropdown";
import { launchCellLineSelectorModal } from "src/index";
import { getDapi } from "src/common/utilities/context";
import { DepmapApi, EntitySummaryResponse } from "src/dAPI";
import { CustomList } from "shared/cellLineSelector/components/ListStorage";
import { PlotHTMLElement } from "shared/plot/models/plotlyPlot";
import SublineagePlot from "./SublineagePlot";
import {
  getDefaultColor,
  mutationNumToColor,
} from "shared/common/utilities/colorAndHighlights";
import { setQueryStringWithoutPageReload } from "shared/common/utilities/url";

export type DatasetOption = {
  dataset: string;
  entity: number;
  id: string;
  label: string;
};

type Props = {
  initialSelectedDataset: DatasetOption;
  size_biom_enum_name: string;
  color: string;
  figure: { name: number };
  show_auc_message: boolean;
  summary_options: Array<DatasetOption>;
};

type State = {
  selectedDataset: DatasetOption;
  datasetEntitySummary: EntitySummaryResponse;
  cellLineList: CustomList;
  showSublineage: boolean;
};

class EntitySummary extends React.Component<Props, State> {
  dapi: DepmapApi;

  plotElement: PlotHTMLElement;

  eventKeyTitleMap: Map<string, React.ReactNode>;

  constructor(props: Props) {
    super(props);
    this.dapi = getDapi();
    this.eventKeyTitleMap = new Map(
      props.summary_options.map((summaryOption, i) => [
        summaryOption.dataset,
        <span className="wrap-text" key={i}>
          {summaryOption.label}
        </span>,
      ])
    );
    this.state = {
      selectedDataset: props.initialSelectedDataset,
      datasetEntitySummary: null,
      cellLineList: null,
      showSublineage: false,
    };
  }

  componentDidMount() {
    this.fetchEntitySummary(this.state.selectedDataset);
  }

  fetchEntitySummary(selectedDataset: DatasetOption) {
    this.dapi
      .getEntitySummary(
        selectedDataset.entity,
        selectedDataset.dataset,
        this.props.size_biom_enum_name,
        this.props.color
      )
      .then((datasetEntitySummary: EntitySummaryResponse) => {
        this.setState({
          datasetEntitySummary,
        });
      });
  }

  handleDatasetSelection = (datasetId: string) => {
    const selectedDataset = this.props.summary_options.find(
      (o) => o.id == datasetId
    );
    setQueryStringWithoutPageReload(
      "dependency",
      selectedDataset.dataset,
      true
    );
    this.setState(
      {
        selectedDataset,
        datasetEntitySummary: null,
      },
      () => this.fetchEntitySummary(selectedDataset)
    );
  };

  renderControls() {
    return (
      <>
        <ControlLabel htmlFor="entity-summary-dataset-dropdown">
          Choose a dataset
        </ControlLabel>
        <DropdownButton
          selectedEventKey={this.state.selectedDataset.id}
          onSelect={this.handleDatasetSelection}
          id="entity-summary-dataset-dropdown"
        >
          {this.props.summary_options.map((summaryOption) => (
            <MenuItem key={summaryOption.id} eventKey={summaryOption.id}>
              {summaryOption.label}
            </MenuItem>
          ))}
        </DropdownButton>
      </>
    );
  }

  renderLegends() {
    const legend = this.state.datasetEntitySummary
      ? this.state.datasetEntitySummary.legend
      : null;
    let mutationsLegend = null;
    if (!!legend && !!legend.mutation) {
      const mutationPopover = (
        <Popover id="mutation-info-popover">
          &quot;Hotspot&quot; refers to mutations that are hotspots in TCGA
          and/or COSMIC, and are not silent. &quot;Damaging&quot; refers to
          mutations in the start codon or splice sites, and mutations that cause
          a frame shift, premature stop codon, or de novo out of frame start
          codon. &quot;Other non-conserving&quot; refers to missense mutations,
          in-frame indels, and mutations in the stop codon. &quot;Other
          conserving&quot; refers to mutations in non-coding regions.
        </Popover>
      );
      mutationsLegend = (
        <div>
          <div>
            Mutations{" "}
            <OverlayTrigger
              overlay={mutationPopover}
              rootClose
              trigger={["click", "focus"]}
            >
              <i className="fa fa-info-circle" style={{ cursor: "pointer" }} />
            </OverlayTrigger>
          </div>
          <ul style={{ listStyle: "none" }}>
            {legend.mutation.map((m) => (
              <li key={m.label}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    marginInlineEnd: 8,
                    display: "inline-block",
                    backgroundColor: mutationNumToColor(
                      m.color,
                      this.state.datasetEntitySummary.entity_type
                    ),
                  }}
                />
                <span>{m.label}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    let expressionLegend = null;
    if (!!legend && !!legend.expression) {
      expressionLegend = (
        <div>
          <div>Expression {legend.expression.units}</div>
          <ul style={{ listStyle: "none", paddingLeft: "0.8em" }}>
            {legend.expression.entries.map((e) => {
              return (
                <li key={e.label}>
                  <div style={{ display: "flex" }}>
                    <svg viewBox="0 0 20 20" width="20px" height="20px">
                      <circle
                        r={`${e.diameter / 2}px`}
                        cx={10}
                        cy={10}
                        fill={
                          e.label == "N/A"
                            ? "none"
                            : getDefaultColor(
                                this.state.datasetEntitySummary.entity_type
                              )
                        }
                        stroke={getDefaultColor(
                          this.state.datasetEntitySummary.entity_type
                        )}
                        strokeWidth={e.label == "N/A" ? 1 : 0}
                      />
                    </svg>
                    <span>{e.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    let aucBlurb = null;
    if (this.props.show_auc_message) {
      aucBlurb = (
        <p>
          Please note that AUC values depend on the dose range of the screen and
          are not comparable across different assays. Additionally, CTRP AUCs
          are not normalized by the dose range and thus have values greater than
          1.
        </p>
      );
    }
    return (
      <>
        {mutationsLegend}
        {expressionLegend}
        <div>Find cell lines:</div>
        <CellLineListsDropdown
          launchCellLineSelectorModal={launchCellLineSelectorModal}
          onListSelect={(cellLineList) => {
            this.setState({ cellLineList });
          }}
        />
        <div style={{ margin: "10px 0" }}>
          <Checkbox
            checked={this.state.showSublineage}
            handleChange={() => {
              this.setState({
                showSublineage: !this.state.showSublineage,
              });
            }}
            label="Show lineage subtypes"
            name="showSublineage"
          />
        </div>
        {aucBlurb}
      </>
    );
  }

  renderHeader() {
    const { selectedDataset, datasetEntitySummary } = this.state;
    if (selectedDataset === null) {
      return null;
    }
    const downloadLink = this.dapi.getEntitySummaryDownload(
      selectedDataset.entity,
      selectedDataset.dataset,
      this.props.size_biom_enum_name,
      this.props.color
    );
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <h2>{selectedDataset.label}</h2>
        {datasetEntitySummary !== null && (
          <div className="partials_toolbar">
            <Button href={datasetEntitySummary.interactive_url} target="_blank">
              Explore relationships with other data
            </Button>
            <a href={downloadLink} download>
              <span
                className="glyphicon glyphicon-download-alt"
                title="Download plot data"
              />
            </a>
          </div>
        )}
      </div>
    );
  }

  attachEventListenerForPlotShown(handlePlotShown: () => void) {
    $('a[href="#dependency"]').on("shown.bs.tab", () => {
      handlePlotShown();
    });
  }

  removeEventListenerForPlotShown() {
    $('a[href="#dependency"]').off("shown.bs.tab");
  }

  renderPlots() {
    return (
      <>
        {!this.state.datasetEntitySummary && (
          <div
            className="fa-5x"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <i className="fas fa-spinner fa-spin" />
          </div>
        )}
        {this.state.datasetEntitySummary && (
          <SublineagePlot
            datasetEntitySummary={this.state.datasetEntitySummary}
            elementId={`sublineage_plot_${this.props.figure.name}`}
            attachEventListenerForPlotShown={
              this.attachEventListenerForPlotShown
            }
            removeEventListenerForPlotShown={
              this.removeEventListenerForPlotShown
            }
            showSublineage={this.state.showSublineage}
            key={this.state.cellLineList.name}
          />
        )}
      </>
    );
  }

  render() {
    return (
      <Row>
        <Col sm={2}>
          {this.renderControls()}
          {this.renderLegends()}
        </Col>
        <Col sm={10}>
          {this.renderHeader()}
          {this.renderPlots()}
        </Col>
      </Row>
    );
  }
}

export default hot(EntitySummary);
