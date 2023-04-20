export interface DimensionMetadata {
  // Sample (e.g. ACH-00008) or feature (e.g. SOX10) label
  label: string;
  metadata: any;
}

export interface DimensionMetadataTableData {
  metadataName: string;
  metadataValue: string;
}
