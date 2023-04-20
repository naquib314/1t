import { hot } from "react-hot-loader/root";
import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Button } from "react-bootstrap";
import * as Papa from "papaparse";

import { getDapi } from "src/common/utilities/context";
import { EntityType } from "src/entity/models/entities";
import {
  CompoundDosePredictiveModelResults,
  GenePredictiveModelResults,
  PredictiveModelResults,
  PredictabilityTable,
  ScreenType,
} from "src/predictability/models/predictive";
import PredictiveModelsForScreen from "src/predictability/components/PredictiveModelsForScreen";
import "src/predictability/styles/predictability_tab.scss";
import { DepmapApi } from "src/dAPI";

interface Props {
  entityIdOrLabel: number | string;
  entityLabel: string;
  entityType: EntityType;
  customDownloadsLink: string;
  methodologyUrl: string;
}

const InformationalContent = (props: {
  dapi: DepmapApi;
  tables: Array<{
    screen: string;
    screenType: ScreenType;
    modelsAndResults: Array<PredictiveModelResults>;
  }>;
  entityLabel: string;
  entityType: EntityType;
  compoundScreenName: string;
  customDownloadsLink: string;
  methodologyUrl: string;
}) => {
  const {
    dapi,
    tables,
    entityLabel,
    entityType,
    compoundScreenName,
    customDownloadsLink,
    methodologyUrl,
  } = props;

  const downloadData = useCallback(() => {
    const data: Array<{
      screen: string;
      model: string;
      compoundExperimentId?: string;
      modelCorrelation: number;
      feature: string;
      featureImportance: number;
      featureCorrelation: number;
      featureType: string;
    }> = [];
    tables.forEach((table) => {
      table.modelsAndResults.forEach((modelAndResults) => {
        modelAndResults.results.forEach((result) => {
          let row;
          if (entityType === EntityType.Compound) {
            row = {
              screen: compoundScreenName,
              model: table.screen,
              compoundExperimentId: (modelAndResults as CompoundDosePredictiveModelResults)
                .compoundExperimentId,
              modelCorrelation: modelAndResults.modelCorrelation,
              feature: result.featureName,
              featureImportance: result.featureImportance,
              featureCorrelation: result.correlation,
              featureType: result.featureType,
            };
          } else {
            row = {
              screen: table.screen,
              model: (modelAndResults as GenePredictiveModelResults).modelName,
              modelCorrelation: modelAndResults.modelCorrelation,
              feature: result.featureName,
              featureImportance: result.featureImportance,
              featureCorrelation: result.correlation,
              featureType: result.featureType,
            };
          }
          data.push(row);
        });
      });
    });
    const csv = Papa.unparse(data);

    const f = new Blob([csv], { type: "text/csv" });
    const csvURL = window.URL.createObjectURL(f);
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute(
      "download",
      `depmap_predictability_data_${entityLabel}.csv`
    );
    tempLink.click();
    document.removeChild(tempLink);
  }, [tables, entityType, entityLabel, compoundScreenName]);

  return (
    <div className="button-container">
      <Button
        bsStyle="link"
        bsSize="xs"
        className="icon-button"
        href={methodologyUrl}
        target="_blank"
      >
        <img
          src={dapi._getFileUrl("/static/img/predictability/pdf.svg")}
          alt=""
          className="icon"
        />
        <span>Information about this page</span>
      </Button>

      <Button
        bsStyle="link"
        bsSize="xs"
        className="icon-button"
        disabled={!tables}
        onClick={downloadData}
      >
        <img
          src={dapi._getFileUrl("/static/img/predictability/download.svg")}
          alt=""
          style={{ height: 14, marginInlineEnd: 2 }}
        />
        <span>Download data for {entityLabel}</span>
      </Button>

      <Button
        bsStyle="link"
        bsSize="xs"
        className="icon-button"
        href={dapi.getPredictabilityDownloadUrl(entityType)}
        download
      >
        <img
          src={dapi._getFileUrl("/static/img/predictability/download.svg")}
          alt=""
          style={{ height: 14, marginInlineEnd: 2 }}
        />
        <span>Download data for all {entityType}s</span>
      </Button>

      <Button
        bsStyle="link"
        bsSize="xs"
        href={customDownloadsLink}
        className="icon-button"
      >
        <i className="fa fa-link" aria-hidden="true" />
        <span>Download input data</span>
      </Button>
    </div>
  );
};

const PredictabilityRowForEntity = (props: {
  tables: Array<PredictabilityTable>;
  entityType: EntityType;
  dapi: DepmapApi;
}) => {
  const { dapi, entityType, tables } = props;
  if (!tables) {
    return null;
  }

  if (entityType === EntityType.Gene) {
    return (
      <Row>
        {tables.map((table) => {
          const { screen, screenType, modelsAndResults } = table;
          return (
            <Col key={screen} md={6}>
              <PredictiveModelsForScreen
                key={screen}
                dapi={dapi}
                entityType={entityType}
                screen={screen}
                screenType={screenType}
                modelsAndResults={modelsAndResults}
              />
            </Col>
          );
        })}
      </Row>
    );
  }

  // sorted on back end; grouping by compound experiment, which should each have 3 tables
  const groupedTables = tables.reduce((r: PredictabilityTable[][], e, i) => {
    if (i % 3 === 0) {
      r.push([e]);
    } else {
      r[r.length - 1].push(e);
    }
    return r;
  }, []);
  return (
    <>
      {groupedTables.map((group, i) => {
        return (
          <Row
            key={
              (group[0]
                .modelsAndResults as CompoundDosePredictiveModelResults[])[0]
                .compoundExperimentId
            }
          >
            <Col md={12}>
              <div className="compound-experiment-label-container">
                <div className="all-caps">Compound experiment ID</div>
                <div className="compound-experiment-label">
                  {
                    (group[0]
                      .modelsAndResults[0] as CompoundDosePredictiveModelResults)
                      .compoundExperimentId
                  }
                </div>
              </div>
            </Col>
            {group.map((table) => {
              const { screen, screenType, modelsAndResults } = table;

              return (
                <Col key={modelsAndResults[0].modelName} md={4}>
                  <PredictiveModelsForScreen
                    key={screen}
                    dapi={dapi}
                    entityType={entityType}
                    screen={screen}
                    screenType={screenType}
                    modelsAndResults={modelsAndResults}
                  />
                </Col>
              );
            })}
            {i !== groupedTables.length - 1 && <hr />}
          </Row>
        );
      })}
    </>
  );
};

const PredictabilityTab = (props: Props) => {
  const {
    entityIdOrLabel,
    entityLabel,
    entityType,
    customDownloadsLink,
    methodologyUrl,
  } = props;
  const [tables, setTables] = useState<Array<PredictabilityTable>>(null);
  const [compoundScreenName, setCompoundScreenName] = useState<string>();
  const [dapi] = useState(getDapi());

  useEffect(() => {
    if (entityType === EntityType.Gene) {
      dapi.getPredictiveTableGene(entityIdOrLabel as number).then((r) => {
        setTables(r);
      });
    } else {
      dapi.getPredictiveTableCompound(entityIdOrLabel as string).then((r) => {
        setCompoundScreenName(r.screen);
        setTables(
          r.data.map((d) => {
            return {
              screen: d.modelName,
              screenType: ScreenType.Compound,
              modelsAndResults: [d],
            };
          })
        );
      });
    }
  }, [entityIdOrLabel, entityType, dapi]);

  return (
    <>
      <InformationalContent
        dapi={dapi}
        tables={tables}
        entityLabel={entityLabel}
        entityType={entityType}
        compoundScreenName={compoundScreenName}
        customDownloadsLink={customDownloadsLink}
        methodologyUrl={methodologyUrl}
      />
      <Row>
        {entityType === EntityType.Compound && (
          <Col sm={12}>
            <div className="screen-label">{compoundScreenName}</div>
          </Col>
        )}
      </Row>
      <PredictabilityRowForEntity
        tables={tables}
        dapi={dapi}
        entityType={entityType}
      />
    </>
  );
};

export default hot(PredictabilityTab);
