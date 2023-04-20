import * as React from "react";
import { Grid, Row, Col, Tabs, Tab, SelectCallback } from "react-bootstrap";

import { DepmapApi } from "src/dAPI";
import { getDapi } from "src/common/utilities/context";
import WideTable, {
  WideTableColumns,
} from "shared/common/components/WideTable";
import { sampleTypeToLabel } from "src/celligner/utilities/plot";
import { titleCase } from "src/common/utilities/helper_functions";
import CellignerCellLinesForTumorsControlPanel from "./CellignerCellLinesForTumorsControlPanel";
import CellignerTumorsForCellLineControlPanel from "./CellignerTumorsForCellLineControlPanel";
import CellignerGraph from "./CellignerGraph";
import CellignerViolinPlot from "./CellignerViolinPlots";
import { Alignments, Model, Tumor, GroupingCategory } from "../models/types";
import "src/celligner/styles/celligner.scss";

function datasetFormatterCell(row: any) {
  return sampleTypeToLabel.get(row.value);
}

function distanceFormatterCell(row: any) {
  return (row.value && row.value.toFixed(3)) || "";
}

const NAME_FOR_MODEL = !enabledFeatures.celligner_app_v3
  ? "cell line"
  : "model";

const COMMON_TABLE_COLUMNS: Array<WideTableColumns> = [
  {
    Header: "Distance",
    accessor: "distance",
    columnDropdownLabel: "Distance",
    Cell: distanceFormatterCell,
    helperText: `Distance between a ${NAME_FOR_MODEL} and a tumor type is calculated by taking the median euclidean distance in 70 principal component space between that ${NAME_FOR_MODEL} and all tumors samples of that type.`,
  },
  {
    Header: "Lineage",
    accessor: "lineage",
    columnDropdownLabel: "Lineage",
  },
  {
    Header: "Subtype",
    accessor: "subtype",
    columnDropdownLabel: "Subtype",
  },
];

if (enabledFeatures.celligner_app_v3) {
  COMMON_TABLE_COLUMNS.splice(0, 0, {
    Header: "Sample Type",
    accessor: "type",
    columnDropdownLabel: "Sample Type",
    Cell: datasetFormatterCell,
  });
}

export type Props = {
  alignmentsArr: Alignments;
  models: Array<Model>;
  tumors: Array<Tumor>;
  subtypes: ReadonlyMap<string, Array<string>>;
  cellLineUrl: string;
  downloadUrl: string;
  methodologyUrl: string;
};

type ValidTab = "cell-line-for-tumors" | "tumors-for-cell-line";
type State = {
  activeTab: ValidTab;
  colorByCategory: GroupingCategory;
  selectedPrimarySite: string;
  selectedPoints: Array<number>;
  tumorDistances: Array<number>;
  cellLineDistances: Array<number>;
  mostCommonLineage: string;
};
const ExplanationText = (props: {
  dapi: DepmapApi;
  methodologyUrl: string;
}) => {
  const { dapi, methodologyUrl } = props;
  return (
    <>
      {methodologyUrl && (
        <div>
          <a
            href={methodologyUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="icon-button-link"
          >
            <img
              src={dapi._getFileUrl("/static/img/predictability/pdf.svg")}
              alt=""
              className="icon"
            />
            <span>Methodology</span>
          </a>
        </div>
      )}
      <p>
        Celligner is intended to help researchers select {NAME_FOR_MODEL}s that
        most closely resemble a tumor type of interest. The method is based on
        an unsupervised approach that corrects for differences when integrating
        the CCLE and tumor expression datasets (TCGA, Treehouse, and TARGET). To
        learn more,{" "}
        <a
          href="https://doi.org/10.1038/s41467-020-20294-x"
          target="_blank"
          rel="noreferrer noopener"
        >
          see the article
        </a>
        .
      </p>
    </>
  );
};

export default class CellignerPage extends React.Component<Props, State> {
  dapi: DepmapApi;

  cellLinesForTumorsColumns: Array<WideTableColumns>;

  tumorsForCellLinesColumns: Array<WideTableColumns>;

  // data munging
  primarySites: Array<string>;

  constructor(props: Props) {
    super(props);

    this.state = {
      activeTab: "cell-line-for-tumors",
      colorByCategory: "primarySite",
      selectedPrimarySite: null,
      selectedPoints: props.alignmentsArr.cluster.map((_, i) => i),
      tumorDistances: null,
      cellLineDistances: null,
      mostCommonLineage: null,
    };

    this.dapi = getDapi();

    // data munging
    this.primarySites = Array.from(props.subtypes.keys()).sort();

    // bind functions
    this.renderCellLineLink = this.renderCellLineLink.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.handleSelectedPrimarySitesChange = this.handleSelectedPrimarySitesChange.bind(
      this
    );
    this.handleSelectedSubtypeChange = this.handleSelectedSubtypeChange.bind(
      this
    );
    this.handleColorByCategoryChange = this.handleColorByCategoryChange.bind(
      this
    );
    this.handleCellLineSelected = this.handleCellLineSelected.bind(this);

    this.cellLinesForTumorsColumns = ([
      {
        Header: `${titleCase(NAME_FOR_MODEL)} Name`,
        accessor: "displayName",
        columnDropdownLabel: `${titleCase(NAME_FOR_MODEL)} Name`,
        Cell: this.renderCellLineLink,
      },
    ] as Array<WideTableColumns>).concat(COMMON_TABLE_COLUMNS);

    this.tumorsForCellLinesColumns = ([
      {
        Header: "Tumor Sample ID",
        accessor: "displayName",
        columnDropdownLabel: "Tumor Sample ID",
        Cell: this.renderCellLineLink,
      },
    ] as Array<WideTableColumns>).concat(COMMON_TABLE_COLUMNS);
  }

  handleSelectTab(activeTab: ValidTab) {
    const { alignmentsArr } = this.props;

    if (activeTab === "cell-line-for-tumors") {
      this.setState({
        activeTab,
        selectedPoints: alignmentsArr.cluster.map((_, i) => i),
        tumorDistances: null,
        mostCommonLineage: null,
      });
    } else {
      this.setState({
        activeTab,
        selectedPoints: alignmentsArr.cluster.map((_, i) => i),
        selectedPrimarySite: null,
        cellLineDistances: null,
        colorByCategory: "primarySite",
      });
    }
  }

  handleSelectedPrimarySitesChange(selectedPrimarySite: string) {
    const { alignmentsArr, subtypes } = this.props;

    const selectedPoints: Array<number> = [];
    alignmentsArr.primarySite.forEach((primarySite, i) => {
      if (primarySite === selectedPrimarySite) {
        selectedPoints.push(i);
      } else if (!selectedPrimarySite) {
        selectedPoints.push(i);
      }
    });

    this.setState(
      {
        selectedPrimarySite,
        selectedPoints,
        cellLineDistances: null,
        colorByCategory: selectedPrimarySite ? "subtype" : "primarySite",
      },
      () => {
        if (selectedPrimarySite) {
          const subtypeOptions = subtypes.get(selectedPrimarySite);
          if (subtypeOptions.length === 1 && subtypeOptions[0] === "all") {
            this.handleSelectedSubtypeChange("all");
          }
        }
      }
    );
  }

  handleSelectedSubtypeChange(selectedSubtype: string) {
    const { selectedPrimarySite } = this.state;
    this.dapi
      .getCellignerDistancesToTumors(selectedPrimarySite, selectedSubtype)
      .then(
        (response: { medianDistances: Array<number> }) => {
          this.setState({
            cellLineDistances: response.medianDistances,
          });
        },
        (reason: any) => {
          this.setState({ cellLineDistances: null });
          console.log(reason);
        }
      );
  }

  handleColorByCategoryChange(colorByCategory: GroupingCategory) {
    this.setState({ colorByCategory });
  }

  handleCellLineSelected(selectedSampleId: string, kNeighbors: number) {
    const { alignmentsArr } = this.props;

    const cellLineIndex = alignmentsArr.sampleId.findIndex(
      (sampleId) => sampleId === selectedSampleId
    );
    this.dapi
      .getCellignerDistancesToCellLine(selectedSampleId, kNeighbors)
      .then((e) => {
        this.setState({
          tumorDistances: e.distance_to_tumors,
          mostCommonLineage: e.most_common_lineage,
          selectedPoints: e.color_indexes.concat([cellLineIndex]),
        });
      })
      .catch((e) => console.log("error", e));
  }

  renderCellLineLink({ original }: { original: Model }) {
    const { cellLineUrl } = this.props;

    return original.modelLoaded ? (
      <a href={`${cellLineUrl}${original.sampleId}`} target="_blank">
        {original.displayName}
      </a>
    ) : (
      original.displayName
    );
  }

  renderControlPanel() {
    const {
      models,

      subtypes,
    } = this.props;

    const { activeTab, colorByCategory, selectedPrimarySite } = this.state;

    if (activeTab === "cell-line-for-tumors") {
      return (
        <CellignerCellLinesForTumorsControlPanel
          selectedPrimarySite={selectedPrimarySite}
          onSelectedPrimarySitesChange={this.handleSelectedPrimarySitesChange}
          subtypes={subtypes}
          colorByCategory={colorByCategory}
          onColorByCategoryChange={this.handleColorByCategoryChange}
          onSubtypeSelected={this.handleSelectedSubtypeChange}
        />
      );
    }
    if (activeTab === "tumors-for-cell-line") {
      return (
        <CellignerTumorsForCellLineControlPanel
          cellLines={models}
          onCellLineSelected={this.handleCellLineSelected}
        />
      );
    }
    return null;
  }

  renderGraph() {
    const { alignmentsArr, subtypes } = this.props;

    const {
      colorByCategory,
      tumorDistances,
      selectedPoints,
      selectedPrimarySite,
    } = this.state;

    return (
      <CellignerGraph
        alignments={alignmentsArr}
        subtypes={subtypes}
        colorByCategory={colorByCategory}
        selectedPrimarySite={selectedPrimarySite}
        selectedPoints={selectedPoints}
        subsetLegendBySelectedLineages={!!tumorDistances}
      />
    );
  }

  renderViolinPlot() {
    const { tumors } = this.props;

    const { activeTab, tumorDistances, mostCommonLineage } = this.state;
    const hideViolinPlots =
      activeTab === "cell-line-for-tumors" ||
      !tumorDistances ||
      !mostCommonLineage;

    return (
      <CellignerViolinPlot
        show={!hideViolinPlots}
        tumors={tumors}
        tumorDistances={tumorDistances}
        mostCommonLineage={mostCommonLineage}
      />
    );
  }

  renderTable() {
    const { models, tumors, downloadUrl } = this.props;

    const { activeTab, tumorDistances, cellLineDistances } = this.state;

    if (activeTab === "cell-line-for-tumors") {
      return (
        <div style={{ height: 400 }}>
          <WideTable
            key={activeTab}
            data={
              cellLineDistances
                ? models.map((cellLine, i) => {
                    return {
                      ...cellLine,
                      distance: cellLineDistances[i],
                    };
                  })
                : models
            }
            columns={this.cellLinesForTumorsColumns}
            sorted={[{ id: "distance", desc: true }]}
            downloadURL={downloadUrl}
          />
        </div>
      );
    }
    if (activeTab === "tumors-for-cell-line") {
      return (
        <div style={{ height: 400 }}>
          <WideTable
            key={activeTab}
            data={
              tumorDistances
                ? tumors.map((tumor, i) => {
                    return { ...tumor, distance: tumorDistances[i] };
                  })
                : tumors
            }
            columns={this.tumorsForCellLinesColumns}
            sorted={[{ id: "distance", desc: true }]}
          />
        </div>
      );
    }
    return null;
  }

  render() {
    const { methodologyUrl } = this.props;
    const { activeTab } = this.state;
    return (
      <Grid fluid>
        <Row>
          <h1>
            Celligner: Tumor +{" "}
            {!enabledFeatures.celligner_app_v3
              ? `${NAME_FOR_MODEL} model`
              : NAME_FOR_MODEL}{" "}
            alignment
          </h1>
        </Row>
        <Row>
          <Tabs
            activeKey={activeTab}
            onSelect={this.handleSelectTab as SelectCallback}
            id="celligner-tabs"
          >
            <Tab
              eventKey={"cell-line-for-tumors" as ValidTab}
              title={`Rank ${NAME_FOR_MODEL}s for selected tumors`}
            />
            <Tab
              eventKey={"tumors-for-cell-line" as ValidTab}
              title={`Find most similar tumors for a given ${NAME_FOR_MODEL}`}
            />
          </Tabs>
        </Row>
        <Row>
          <Col sm={2}>
            {this.renderControlPanel()}
            <ExplanationText dapi={this.dapi} methodologyUrl={methodologyUrl} />
          </Col>
          <Col sm={10}>
            {this.renderGraph()}
            {this.renderViolinPlot()}
            {this.renderTable()}
          </Col>
        </Row>
      </Grid>
    );
  }
}
