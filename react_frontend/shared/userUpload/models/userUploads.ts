import {
  PendingCeleryTask,
  ProgressCeleryTask,
  SuccessCeleryTask,
  FailedCeleryTask,
} from "shared/compute/models/celery";

export enum UploadFormat {
  Taiga = "taiga",
  File = "file",
}

export interface SuccessUploadTask extends SuccessCeleryTask {
  result: {
    datasetId: string;
    warnings: Array<string>;
    // Transient and private
    forwardingUrl?: string;
    sliceId?: string; // For Breadbox use. Otherwise, use the sliceId outside of result
    dataset?: any;
  };

  // For single-row upload only
  sliceId?: string;
}

export type UploadTaskUserError = {
  message: string;
};

export type UploadTask =
  | PendingCeleryTask
  | ProgressCeleryTask
  | SuccessUploadTask
  | FailedCeleryTask;

export type UserUploadArgs = {
  displayName: string;
  units: string;
  transposed: boolean;

  uploadFile?: File;
  taigaId?: string;

  /* Access group for private datasets */
  selectedGroup?: number;
};
