import { LongTable } from "shared/common/components/LongTable";
import { CellData } from "shared/cellLineSelector/models/cellLines";
const randomString = () => {
  return Math.random().toString(36).substring(2, 7);
};

const primaryDiseases: string[] = [
  "Ovarian Cancer",
  "Leukemia",
  "Colon/Colorectal Cancer",
  "Skin Cancer",
  "Lung Cancer",
  "Bladder Cancer",
  "Kidney Cancer",
  "Breast Cancer",
  "Pancreatic Cancer",
  "Myeloma",
  "Brain Cancer",
  "Sarcoma",
  "Leukemia",
  "Bone Cancer",
  "Fibroblast",
  "Gastric Cancer",
  "Neuroblastoma",
  "Lung Cancer",
  "Prostate Cancer",
];
const lineages: string[] = [
  "ovary",
  "leukemia",
  "colorectal",
  "lung",
  "urinary_tract",
  "skin",
  "kidney",
  "breast",
  "pancreas",
  "multiple_myeloma",
  "central_nervous_system",
  "thyroid",
  "lymphoma",
  "bone",
  "fibroblast",
  "gastric",
  "rhabdomyosarcoma",
  "soft_tissue",
  "peripheral_nervous_system",
  "mesothelioma",
  "prostate",
  "rhabdoid",
  "bile_duct",
  "uterus",
];

const dataFromProps: CellData[] = [];
for (let i = 0; i < 1000; i++) {
  const cellName = randomString().toUpperCase();
  // @ts-ignore TS2345
  dataFromProps.push({
    //col0: false,
    displayName: cellName,
    lineName: cellName,
    primaryDisease:
      primaryDiseases[Math.floor(Math.random() * primaryDiseases.length)],
    lineage: lineages[Math.floor(Math.random() * lineages.length)],
    depmapId: "ACH-" + i.toString(),
  });
}

export default [
  {
    component: LongTable,
    name: "a lot data",
    props: {
      dataFromProps: dataFromProps,
    },
  },
];
