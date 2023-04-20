export type DatasetLink = {
  display_name: string;
  download_url: string;
};

export type CellLineDatasets = {
  compound_viability: Array<DatasetLink>;
  loss_of_function: Array<DatasetLink>;
  omics: Array<DatasetLink>;
};

export type OncogenicAlteration = {
  gene: { name: string; url: string };
  alteration: string;
  oncogenic: "Oncogenic" | "Likely Oncogenic";
  function_change:
    | "Likely Loss-of-function"
    | "Likely Gain-of-function"
    | "Loss-of-function"
    | "Gain-of-function"
    | "Unknown";
};

export type CellLinePrefDepData = {
  depmap_id: string;
  gene_names: Array<string>;
  data: Array<Array<number | null>>;
  cell_line_col_index: number;
};
