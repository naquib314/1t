export interface Compound {
  label: string;
  moa?: string;
  target_gene?: Array<Gene>;
  disease_area?: string;
  indication?: string;
  smiles?: string;
  inchikey?: string;
  phase?: string;
  broadId?: string;
}

type Gene = {
  // TODO
};

export enum EntityType {
  Gene = "gene",
  Compound = "compound",
}
