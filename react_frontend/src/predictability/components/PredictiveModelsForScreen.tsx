import React from "react";
import { DepmapApi } from "src/dAPI";
import { EntityType } from "src/entity/models/entities";

import PredictiveModelTable from "src/predictability/components/PredictiveModelTable";
import {
  PredictiveModelResults,
  ModelType,
  ScreenType,
} from "src/predictability/models/predictive";

const MODEL_FEATURE_SETS = {
  [ModelType.CoreOmics]:
    "Expression, Dam. Mut., Other Mut., Hot. Mut., RPPA, Metabolomics, Methylation, Lineage, Confounders",
  [ModelType.Related]:
    "Expression, Dam. Mut., Other Mut., Hot. Mut., RPPA, Methylation, Lineage, Confounders",
  [ModelType.DNABased]:
    "Dam. Mut., Other Mut., Hot. Mut., Methylation, Lineage, Confounders",
  [ModelType.ExtendedOmics]:
    "Expression, Copy num., Dam. Mut., Other Mut., Hot. Mut., Fusion, Lineage, RPPA, Metabolomics, Confounders",
};

interface Props {
  dapi: DepmapApi;
  entityType: EntityType;
  screen: string;
  screenType: ScreenType;
  modelsAndResults: Array<PredictiveModelResults>;
}

export default function PredictiveModelsForScreen(props: Props) {
  const { dapi, entityType, screen, screenType, modelsAndResults } = props;
  return (
    <div>
      <div className="screen-label">{screen}</div>
      <div className="tables-headers">
        <div className={`model-label all-caps ${entityType}`}>
          {entityType === EntityType.Gene && "Model"}
        </div>
        <div className="accuracy-label">
          <span className="all-caps">Accuracy Score</span> (Pearson)
        </div>
      </div>
      {modelsAndResults.map((modelAndResults, i) => {
        const { modelCorrelation, results } = modelAndResults;
        let key;
        let tableTitle;
        let modelFeatureSets;
        const { modelName } = modelAndResults;
        if (entityType === EntityType.Gene) {
          tableTitle = modelName;
          modelFeatureSets = MODEL_FEATURE_SETS[modelName];
          key = tableTitle;
        } else {
          key = modelName;
        }

        return (
          <PredictiveModelTable
            key={key}
            dapi={dapi}
            entityType={entityType}
            screenType={screenType}
            modelName={tableTitle}
            modelFeatureSets={modelFeatureSets}
            modelCorrelation={modelCorrelation}
            results={results}
            defaultOpen={
              entityType === EntityType.Gene
                ? i === 0
                : modelAndResults.modelCorrelation ===
                  Math.max(...modelsAndResults.map((m) => m.modelCorrelation))
            }
          />
        );
      })}
    </div>
  );
}
