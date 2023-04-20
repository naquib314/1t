import { DownloadFile } from "shared/dataSlicer/models/downloads";

export interface DownloadMetadata {
  url: string;
  // CustomDownloadData if in Elara
  downloadInfo: DownloadFile;
  label: string;
}

export interface ElaraDownloadMetadata {
  url: string;
  // CustomDownloadData if in Elara
  downloadInfo: CustomDownloadData;
  label: string;
}

export type CustomDownloadData = {
  // Called fileName to match portal terminology,
  // but in Breadbox it's easier to think of it as datasetName
  fileName: string;
  fileDescription?: string;
  downloadUrl: string;
  releaseName: string;
  size: string;
};

export interface DatasetOptionsWithLabels {
  label: string;
  id: string;
}

export interface DatasetDownloadMetadata {
  id: string;
  display_name: string;
  category: string | null;
  download_entry_url: string;
}
