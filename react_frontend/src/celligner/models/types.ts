export enum CellignerSampleType {
  TCGA_TUMOR = "tcgaplus-tumor",
  MET500_TUMOR = "met500-tumor",
  DEPMAP_MODEL = "depmap-model",
  NOVARTIS_PDX_MODEL = "novartisPDX-model",
  PEDIATRIC_PDX_MODEL = "pediatricPDX-model",
}

export type CellignerTumorTypes =
  | CellignerSampleType.TCGA_TUMOR
  | CellignerSampleType.MET500_TUMOR;

export type CellignerModelTypes =
  | CellignerSampleType.DEPMAP_MODEL
  | CellignerSampleType.NOVARTIS_PDX_MODEL
  | CellignerSampleType.PEDIATRIC_PDX_MODEL;

export interface Alignments {
  sampleId: Array<string>;
  displayName: Array<string>;
  modelLoaded: Array<boolean>;
  umap1: Array<number>;
  umap2: Array<number>;
  primarySite: Array<string>;
  subtype: Array<string>;
  primaryMet: Array<string | null>;
  type: Array<CellignerSampleType>;
  // tcga_type: Array<string | null>;
  cluster: Array<number>;
}

export interface Sample {
  displayName: string;
  sampleId: string;
  umap1: number;
  umap2: number;
  lineage: string;
  subtype: string;
  cluster: number;
}

export interface Tumor extends Sample {
  type: CellignerTumorTypes;
}

export interface Model extends Sample {
  type: CellignerModelTypes;

  modelLoaded: boolean;
}

export type GroupingCategory =
  | "primarySite"
  | "subtype"
  | "primaryMet"
  // | "tcga_type"
  | "cluster"
  | "type";

export interface Point {
  x: number;
  y: number;
}
