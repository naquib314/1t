import DataSlicer from "./DataSlicer";
import { ExportDataQuery } from "../models/api";
import { DatasetDownloadMetadata } from "shared/dataSlicer/models";

const randomState = () => {
  const stateArray = [
    "PENDING",
    "PENDING",
    "PENDING",
    "PENDING",
    "PENDING",
    "SUCCESS",
    "FAILURE",
  ];
  return stateArray[Math.floor(Math.random() * stateArray.length)];
};

const mockGetDatasetsList = (): Promise<DatasetDownloadMetadata[]> => {
  return Promise.resolve([
    {
      id: "GDSC1_AUC",
      display_name: "Drug sensitivity AUC (Sanger GDSC1)",
      path: "compound/auc/",
    },
    {
      id: "GDSC1_IC50",
      display_name: "Drug sensitivity IC50 (Sanger GDSC1)",
      path: "compound/ic_50/",
    },
    {
      id: "Avana",
      display_name: "CRISPR CERES (Achilles Avana) Internal 18Q3",
      path: "gene/crispr/",
    },
    {
      id: "Sanger_CRISPR",
      display_name: "CRISPR CERES (Score)",
      path: "gene/crispr/",
    },
    {
      id: "RNAi_merged",
      display_name: "RNAi (Combined Broad, Novartis, Marcotte)",
      path: "gene/rnai/",
    },
    {
      id: "Repurposing_secondary_AUC",
      display_name: "Drug sensitivity AUC (PRISM Repurposing Secondary Screen)",
      path: "compound/auc/",
    },
  ]);
};

const mockExportData = (query: ExportDataQuery): Promise<any> => {
  return Promise.resolve({
    id: "12345",
    state: "PENDING",
  });
};

const mockGetTaskStatus = () => {
  const state = randomState();
  return Promise.resolve({
    id: "12345",
    state: state,
    nextPollDelay: 1000,
    message:
      state == "FAILURE"
        ? "an unexpected error occurred :("
        : state == "PENDING"
        ? "working..."
        : "",
    download_url: "no",
  });
};

export default [
  {
    component: DataSlicer,
    name: "default",
    props: {
      getDatasetsList: mockGetDatasetsList,
      exportData: mockExportData,
      getTaskStatus: mockGetTaskStatus,
    },
  },
];
