export type DatasetId = "Rep_all_single_pt" | "unknown";

// raw data as returned by the server
export type CompoundSummaryTableRaw = {
  BroadID: string[];
  ColumnName: string[];
  Name: string[];
  PearsonScore: number[];
  BimodalityCoefficient: number[];
  ModelType: string[];
  "TopBiomarker(s)": string[];
  NumberOfSensitiveLines: number[];
  Dose: number[];
  Target: string[];
  DiseaseArea: string[];
  ClinicalPhase: string[];
  DrugType: string[];
  MOA: string[];
};

// that raw data with a few extra properties calculated at runtime
export type CompoundSummaryTable = CompoundSummaryTableRaw & {
  isConfounder: boolean[];
  hoverText: string[];
};
