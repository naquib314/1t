export interface Dataset {
  allowed_values: string[] | null;
  feature_type: string | null;
  group: any;
  id: string;
  is_transient: boolean;
  name: string;
  sample_type: string | null;
  units: string;
  value_type: string | null;
}

export interface AddCustDatasetArgs {
  name: string;
  units: string;
  feature_type: string;
  sample_type: string;
  value_type: DatasetValueType;
  data_file: any;
  is_transient: boolean;
}

export enum DatasetValueType {
  continuous = "continuous",
  categorical = "categorical",
}

export interface DatasetTableData {
  id: string;
  name: string;
  groupName: string;
  featureType: string | null;
  sampleType: string | null;
}
