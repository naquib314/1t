type PartialDeep<T> = { [P in keyof T]?: PartialDeep<T[P]> };

export type DataExplorerPlotType =
  | "density_1d"
  | "scatter"
  | "correlation_heatmap";

export type DataExplorerIndexType = "depmap_model" | "gene" | string;

export type DataExplorerContext = {
  name: string;
  context_type: string;
  expr: Record<string, any> | boolean;
};

export type DataExplorerAnonymousContext = Omit<DataExplorerContext, "name">;

export type DataExplorerAggregation =
  | "first"
  | "correlation"
  | "mean"
  | "median"
  | "25%tile"
  | "75%tile";

export type DataExplorerFilters = Partial<
  Record<
    "color1" | "color2" | "visible" | "distinguish1" | "distinguish2",
    DataExplorerContext
  >
>;

export interface DataExplorerPlotConfigDimension {
  axis_type: "entity" | "context";
  entity_type: string;
  dataset_id: string;
  context: DataExplorerContext;
  aggregation: DataExplorerAggregation;
}

// HACK: This Metadata type is intended as a stopgap. It should be removed from
// the data model when we migrate to BreadBox. Its purpose is to provide a way
// to request series that can *only* be referenced by `slice_id`. Certain
// pseudo-datasets (e.g. lineage) don't have a `dataset_id` or `entity_type`
// and thus are incompatible with the above notion of a dimension. Such
// datasets cannot be plotted directly but it's still useful to get data from
// them for the purposes of coloring and filtering.
export type DataExplorerMetadata = Record<string, { slice_id: string }>;

export interface DataExplorerPlotResponseDimension {
  axis_label: string;
  dataset_label: string;
  values: number[];
}

export interface DataExplorerPlotConfig {
  plot_type: DataExplorerPlotType;
  index_type: DataExplorerIndexType;
  dimensions: Record<string, DataExplorerPlotConfigDimension>;
  color_by?: "entity" | "context" | "property" | "custom";
  // TODO: Add "median"
  sort_by?:
    | "mean_values_asc"
    | "mean_values_desc"
    | "max_values"
    | "min_values"
    | "alphabetical";
  filters?: DataExplorerFilters;
  metadata?: DataExplorerMetadata;
  hide_points?: boolean;
  use_clustering?: boolean;
}

export type PartialDataExplorerPlotConfig = PartialDeep<DataExplorerPlotConfig>;

export interface DataExplorerPlotResponse {
  plot_type: DataExplorerPlotType;
  index_type: DataExplorerIndexType;
  index_labels: string[];
  color_by: "entity" | "context" | "property" | "custom" | null;
  dimensions: Record<string, DataExplorerPlotResponseDimension>;
  filters: Record<string, { name: string; values: boolean[] }>;
  metadata: Record<string, { values: (string | number)[] }>;
}

// Contexts are used in two different ways:
// - As a property of each dimension
// - As filters
// When configuring them, it's convenient to be able to specify their path
// within a `DataExplorerPlotConfig` object.
export type ContextPath =
  | ["dimensions", "x", "context"]
  | ["dimensions", "y", "context"]
  | ["dimensions", "color", "context"]
  | ["filters", "color1"]
  | ["filters", "color2"]
  | ["filters", "visible"]
  | ["filters", "distinguish1"]
  | ["filters", "distinguish2"];
