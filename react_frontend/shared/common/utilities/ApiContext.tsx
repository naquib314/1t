import React from "react";
import {
  AssociationAndCheckbox,
  PlotFeatures,
} from "shared/interactive/models/interactive";
import {
  UserUploadArgs,
  UploadTask,
} from "shared/userUpload/models/userUploads";
import {
  CellLineSelectorLines,
  CellignerColorsForCellLineSelector,
} from "shared/cellLineSelector/models/CellLineSelectorLines";
import { CeleryTask } from "shared/compute/models/celery";
import { Dataset } from "shared/compute/components/DatasetSelect";
import { Dataset as BreadboxDataset } from "shared/common/models/Dataset";
import { VectorCatalogApi } from "shared/interactive/models/vectorCatalogApi";
import Group, { GroupArgs, GroupEntry, GroupEntryArgs } from "../models/Group";
import FeatureType from "../models/FeatureType";
import SampleType from "../models/SampleType";

export interface SharedApi {
  urlPrefix: string;
  getDatasets: () => Promise<Dataset[]>;
  getFeedbackUrl: () => Promise<string>;
  getCellLineUrlRoot: () => Promise<string>;
  getTaskStatus: (id: string) => Promise<CeleryTask>;
  getCellLineSelectorLines: () => Promise<CellLineSelectorLines>;
  getAssociations: (x: string) => Promise<AssociationAndCheckbox>;
  postCustomTaiga: (config: UserUploadArgs) => Promise<UploadTask>;
  postCustomCsv: (config: UserUploadArgs) => Promise<UploadTask>;
  getCellignerColorMap: () => Promise<CellignerColorsForCellLineSelector>;
  getFeaturePlot: (
    features: string[],
    groupBy: string,
    filter: string,
    computeLinearFit: boolean
  ) => Promise<PlotFeatures>;
  // The following will throw errors if used in depmap mode. They're only relevant to breadbox.
  getBreadboxDatasets: () => Promise<BreadboxDataset[]>;
  getBreadboxUser: () => Promise<string>;
  postDataset: (
    datasetArgs: any,
    allowed_values: string[]
  ) => Promise<BreadboxDataset>;
  deleteDatasets: (id: string) => Promise<any>;
  getGroups: () => Promise<Group[]>;
  postGroup: (groupArgs: GroupArgs) => Promise<Group>;
  deleteGroup: (id: string) => Promise<any>;
  postGroupEntry: (
    groupId: string,
    groupEntryArgs: GroupEntryArgs
  ) => Promise<GroupEntry>;
  deleteGroupEntry: (groupEntryId: string) => Promise<any>;
  getFeatureTypes: () => Promise<FeatureType[]>;
  getSampleTypes: () => Promise<SampleType[]>;
}

export interface ApiContextInterface {
  getApi: () => SharedApi;
  getVectorCatalogApi: () => VectorCatalogApi;
}

const apiFunctions = {
  breadbox: {
    getApi: () => {
      throw new Error("getBreadboxApi is not implemented");
    },
    getVectorCatalogApi: () => {
      throw new Error("getVectorCatalogApi is not implemented");
    },
  },
  depmap: {
    getApi: () => {
      throw new Error("getDapi is not implemented");
    },
    getVectorCatalogApi: () => {
      throw new Error("getVectorCatalogApi is not implemented");
    },
  },
};

const ApiContext = React.createContext<ApiContextInterface>(
  apiFunctions.depmap
);

export default ApiContext;
