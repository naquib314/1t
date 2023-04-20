import { CellData } from "shared/cellLineSelector/models/cellLines";
import { DropdownState } from "shared/interactive/models/interactive";
import { CeleryTask } from "shared/compute/models/celery";

export type AssociationOrPearsonAnalysisType = "association" | "pearson";
export type AnalysisType = AssociationOrPearsonAnalysisType | "twoClass";
export type VariableType = "dependent" | "independent";

export type SelectNSOption = {
  label: string;
  value: string;
};

export type QuerySelections = {
  // these numbers refer to positions in the model grid
  //    1  2
  // 3  4  5

  1: React.ReactNode;
  2?: React.ReactNode;
  3: React.ReactNode;
  4?: React.ReactNode;
  5?: React.ReactNode;
};

export interface UnivariateAssociationsParams {
  analysisType: AnalysisType;
  datasetId: string;
  queryId?: string;
  vectorVariableType?: VariableType;
  queryCellLines: ReadonlyArray<string> | null; // technically optional on the back end if type is association, but the front end always has this property (even if the value may be null)
  queryValues?: ReadonlyArray<string | number>;
}

export interface ComputeResponseResult {
  taskId: string;
  entityType: string;
  queryValues?: Array<number | string>; // not used in all analyses types
  queryCellLines?: Array<string>;
  numCellLinesUsed: number;
  colorSliceId?: string; // not used in all analyses types
  filterSliceId: string;
  data: Array<ComputeResponseRow>;
  totalRows: number;
}

export interface ComputeResponseRow {
  label: string;
  EffectSize?: number; // only used in association and two class
  Cor?: number; // only for pearson #
  PValue: number;
  QValue: number;
  numCellLines: number;
  vectorId: string;
  annotatedTarget?: string;
}

export interface ComputeResponse extends CeleryTask {
  result: ComputeResponseResult; // not returned if the job failed
}

export interface CommonQueryProps {
  analysisType: AnalysisType; // only used for association and pearson
  renderBodyFooter: (
    querySelections: QuerySelections,
    queryIsValid: boolean,
    sendQuery: () => void
  ) => React.ReactNode;
  sendQueryGeneric: (
    runCustomAnalysis: () => Promise<ComputeResponse>,
    onSuccess: (
      response: ComputeResponse,
      onResultsComplete?: (response: ComputeResponse) => void
    ) => void
  ) => void;
  onSuccessGeneric: (
    response: ComputeResponse,
    onResultsComplete: (response: any) => void
  ) => void;
  queryInfo: {
    cellLineData: Map<string, CellData>; // map with key = depmapId, value = object with cell line data
    datasets: Array<SelectNSOption>;
    xDropdowns?: Array<DropdownState>;
    yDropdowns?: Array<DropdownState>;
  };
  onAssociationResultsComplete: (
    numCellLinesUsed: number,
    result: ComputeResponseResult,
    queryVectorId: string,
    overrideColorState: string,
    overrideFilterState: string,
    analysisType: AnalysisType
  ) => void;
  customAnalysisVectorDefault?: Array<DropdownState>; // this is from the query param, and thus should not change
  launchCellLineSelectorModal: () => void;
}