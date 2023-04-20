import {
  FakeButton,
  LongTable,
  LongTableWithCustomColumns,
} from "shared/common/components/LongTable";
import { CellData } from "shared/cellLineSelector/models/cellLines";
import { DropdownState, Link } from "shared/interactive/models/interactive";
import { VectorCatalog } from "shared/interactive/components/VectorCatalog";
import * as React from "react";

const randomString = () => {
  return Math.random().toString(36).substring(2, 7);
};

const randomNumber = () => {
  return Math.random();
};
const something = [
  {
    depmapId: "ACH-001001",
    displayName: "143B",
    lineName: "143B_BONE",
    lineage: "Bone",
    primaryDisease: "Bone Sarcoma",
  },
  {
    depmapId: "ACH-000788",
    displayName: "A2058",
    lineName: "A2058_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-000052",
    displayName: "A673",
    lineName: "A673_BONE",
    lineage: "Bone",
    primaryDisease: "unknown",
  },
  {
    depmapId: "ACH-000580",
    displayName: "C32",
    lineName: "C32_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-000210",
    displayName: "CADOES1",
    lineName: "CADOES1_BONE",
    lineage: "Bone",
    primaryDisease: "Bone Sarcoma",
  },
  {
    depmapId: "ACH-000458",
    displayName: "CJM",
    lineName: "CJM_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-000805",
    displayName: "COLO679",
    lineName: "COLO679_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-000706",
    displayName: "EKVX",
    lineName: "EKVX_LUNG",
    lineage: "Lung",
    primaryDisease: "Lung NSCLC",
  },
  {
    depmapId: "ACH-000585",
    displayName: "EPLC272H",
    lineName: "EPLC272H_LUNG",
    lineage: "Unknown",
    primaryDisease: "Lung NSCLC",
  },
  {
    depmapId: "ACH-000279",
    displayName: "EWS502",
    lineName: "EWS502_BONE",
    lineage: "Bone",
    primaryDisease: "Bone Sarcoma",
  },
  {
    depmapId: "ACH-000131",
    displayName: "HS229T",
    lineName: "HS229T_LUNG",
    lineage: "Fibroblast",
    primaryDisease: "Lung NSCLC",
  },
  {
    depmapId: "ACH-000014",
    displayName: "HS294T",
    lineName: "HS294T_SKIN",
    lineage: "Skin",
    primaryDisease: "unknown",
  },
  {
    depmapId: "ACH-000552",
    displayName: "HT29",
    lineName: "HT29_LARGE_INTESTINE",
    lineage: "Colorectal",
    primaryDisease: "Colon Cancer",
  },
  {
    depmapId: "ACH-001170",
    displayName: "PETA",
    lineName: "PETA_SKIN",
    lineage: "Skin",
    primaryDisease: "Merkel",
  },
  {
    depmapId: "ACH-000441",
    displayName: "SH4",
    lineName: "SH4_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-000810",
    displayName: "SKMEL30",
    lineName: "SKMEL30_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-001205",
    displayName: "TC32",
    lineName: "TC32_BONE",
    lineage: "Bone",
    primaryDisease: "Bone Sarcoma",
  },
  {
    depmapId: "ACH-000425",
    displayName: "UACC62",
    lineName: "UACC62_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-000304",
    displayName: "WM115",
    lineName: "WM115_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
  {
    depmapId: "ACH-000899",
    displayName: "WM88",
    lineName: "WM88_SKIN",
    lineage: "Skin",
    primaryDisease: "Melanoma/Skin Cancer",
  },
];
const primaryDiseases: string[] = [
  "Ovarian Cancer",
  "Leukemia",
  "Colon/Colorectal Cancer",
  "Skin Cancer",
  "Lung Cancer",
  "Lung Cancer",
  "Lung Cancer",
  // "Bladder Cancer",
  // "Kidney Cancer",
  // "Breast Cancer",
  // "Pancreatic Cancer",
  // "Myeloma",
  // "Brain Cancer",
  // "Sarcoma",
  // "Leukemia",
  // "Bone Cancer",
  // "Fibroblast",
  // "Gastric Cancer",
  // "Neuroblastoma",
  // "Lung Cancer",
  // "Prostate Cancer"
];
const lineages: string[] = [
  "ovary",
  "ovary",
  "ovary",
  "leukemia",
  "leukemia",
  "colorectal",
  "colorectal",
  "colorectal",
  "colorectal",
  "colorectal",
  "colorectal",
  "colorectal",
  "lung",
  "urinary_tract",
  "skin",
  "kidney",
  "breast",
  "pancreas",
  "multiple_myeloma",
  "central_nervous_system",
  "central_nervous_system",
  "central_nervous_system",
  "central_nervous_system",
  "central_nervous_system",
  "central_nervous_system",
  "thyroid",
  "lymphoma",
  "bone",
  "fibroblast",
  "fibroblast",
  "fibroblast",
  "gastric",
  "rhabdomyosarcoma",
  "rhabdomyosarcoma",
  "soft_tissue",
  "peripheral_nervous_system",
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
  let numString = i.toString();
  while (numString.length < 6) {
    numString = "0" + numString;
  }
  dataFromProps.push({
    //col0: false,
    displayName: cellName,
    lineName: cellName,
    primaryDisease:
      primaryDiseases[Math.floor(Math.random() * primaryDiseases.length)],
    lineage: lineages[Math.floor(Math.random() * lineages.length)],
    depmapId: "ACH-" + numString,
  });
}

const getRandomData = (rows: number) => {
  const data: CellData[] = [];
  for (let i = 0; i < rows; i++) {
    const cellName = randomString().toUpperCase();
    let numString = i.toString();
    while (numString.length < 6) {
      numString = "0" + numString;
    }
    data.push({
      //col0: false,
      displayName: cellName,
      lineName: cellName,
      primaryDisease:
        primaryDiseases[Math.floor(Math.random() * primaryDiseases.length)],
      lineage: lineages[Math.floor(Math.random() * lineages.length)],
      depmapId: "ACH-" + numString,
    });
  }
  return data;
};
const getTastyData = (rows: number) => {
  const data: any[] = [];
  for (let i = 0; i < rows; i++) {
    data.push({
      name: randomString().toUpperCase(),
      category: lineages[Math.floor(Math.random() * lineages.length)],
      number: Math.random(),
    });
  }
  return data;
};
const fetchNewData = () => {
  console.log("fetching real fake data");
  return {
    cellLines: [
      "ACH-000014",
      "ACH-000788",
      "ACH-000580",
      "ACH-001001",
      "ACH-000458",
      "ACH-000706",
      "ACH-000585",
      "ACH-000425",
      "ACH-000810",
      "ACH-000304",
    ],
    values: [
      -0.394298365492,
      -0.238689471287,
      -0.155907722374,
      0.541769486275,
      0.311244838011,
      0.32624806828499997,
      0.39094935073200004,
      -0.219672870132,
      -0.38241264060099994,
      -1.0152833780600001,
    ],
  };
};
const renderVectorCatalog = () => {
  return (
    <VectorCatalog
      onSelection={(
        id: string,
        labels: Array<Link>,
        dropdowns: Array<DropdownState>
      ) => {
        console.log(id);
      }}
      catalog={"continuous"}
      initialDropdowns={[
        {
          dropdownId: "root",
          selected: {
            id: "",
            label: "",
            optionValue: "",
            terminal: false,
            url: null,
          },
          options: [
            {
              group: null,
              id: "genes",
              label: "Gene",
              optionValue: "gene",
              terminal: false,
              url: null,
            },
            {
              group: null,
              id: "compounds",
              label: "Compound",
              optionValue: "compound",
              terminal: false,
              url: null,
            },
            {
              group: null,
              id: "others",
              label: "Other",
              optionValue: "other",
              terminal: false,
              url: null,
            },
          ],
          type: "static",
          placeholder: "type",
          persistSelectedIfNotFound: false,
          isLoading: false,
          numInputRequests: 0,
        },
      ]}
    />
  );
};
export default [
  {
    component: LongTableWithCustomColumns,
    name: "a lot of gibberish data",
    props: {
      startingData: getRandomData(2000),
      fetchNewColumnData: fetchNewData,
      addCheckboxes: true,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "a modest amount of yeehaw",
    props: {
      startingData: dataFromProps.slice(0, 10),
      fetchNewColumnData: fetchNewData,
      addCheckboxes: true,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "a singularity",
    props: {
      startingData: dataFromProps.slice(0, 1),
      fetchNewColumnData: fetchNewData,
      addCheckboxes: true,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "yeet",
    props: {
      startingData: something,
      addCheckboxes: true,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "no checkboxes!!!!",
    props: {
      startingData: something,
      addCheckboxes: false,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "obscene amount of yeehaw",
    props: {
      startingData: getRandomData(20000),
      addCheckboxes: true,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "lol no data",
    props: {
      startingData: [{}],
      addCheckboxes: true,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "some experiment with just using a vector ID",
    props: {
      startingData: dataFromProps,
      addCheckboxes: true,
      addNewColumnComponent: (onClick: any) => {
        return <FakeButton onClick={onClick} />;
      },
      fetchNewColumnData: fetchNewData,
    },
  },
  {
    component: LongTableWithCustomColumns,
    name: "let's get some rep for all the data types",
    props: {
      startingData: getTastyData(1000),
      addCheckboxes: true,
    },
  },
];
