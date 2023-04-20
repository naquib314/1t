import { ConstellationGraphInputs } from "src/constellation/models/constellation";

export const expressionData: ConstellationGraphInputs = {
  network: {
    edges: [
      {
        from: "SOX10",
        to: "KDM7A",
        weight: 2.7,
      },
      {
        from: "MAP4K4",
        to: "NRAS",
        weight: 1.77,
      },
      {
        from: "MED1",
        to: "SOX10",
        weight: 0.6000000000000001,
      },
      {
        from: "TNS2",
        to: "SOX10",
        weight: 1.5,
      },
    ],
    nodes: [
      {
        task: "e1bbb1c7-f15d-49dd-a9ca-43be06f90e40",
        "-log10(P)": 2.3694990996346053,
        effect: -0.8434826162468111,
        gene_sets: ["HALLMARK KRAS SIGNALING\n DN"],
        id: "SOX10",
        feature: "SOX10",
        should_label: true,
        x: -0.3345816627366258,
        y: -0.18394268235317185,
      },
      {
        task: "e1bbb1c7-f15d-49dd-a9ca-43be06f90e40",
        "-log10(P)": 1.7794023153798155,
        effect: -0.7636728308020151,
        gene_sets: [],
        id: "TNS2",
        feature: "TNS2",
        should_label: true,
        x: -0.6797488224295121,
        y: -0.9497405297148427,
      },
      {
        task: "e1bbb1c7-f15d-49dd-a9ca-43be06f90e40",
        "-log10(P)": 0.8855911561533779,
        effect: -0.543837871295319,
        gene_sets: [
          "KEGG MAPK SIGNALING\n PATHWAY",
          "KEGG ERBB SIGNALING\n PATHWAY",
          "KEGG CHEMOKINE SIGNALING\n PATHWAY",
          "KEGG AXON GUIDANCE\n",
          "KEGG VEGF SIGNALING\n PATHWAY",
          "KEGG TIGHT JUNCTION\n",
          "KEGG GAP JUNCTION\n",
          "KEGG NATURAL KILLER\n CELL MEDIATED CYTOTOXICITY\n",
          "KEGG T CELL\n RECEPTOR SIGNALING PATHWAY\n",
          "KEGG B CELL\n RECEPTOR SIGNALING PATHWAY\n",
          "KEGG FC EPSILON\n RI SIGNALING PATHWAY\n",
          "KEGG LONG TERM\n POTENTIATION",
          "KEGG NEUROTROPHIN SIGNALING\n PATHWAY",
          "KEGG LONG TERM\n DEPRESSION",
          "KEGG REGULATION OF\n ACTIN CYTOSKELETON",
          "KEGG INSULIN SIGNALING\n PATHWAY",
          "KEGG GNRH SIGNALING\n PATHWAY",
          "KEGG MELANOGENESIS",
          "KEGG PATHWAYS IN\n CANCER",
          "KEGG RENAL CELL\n CARCINOMA",
          "KEGG ENDOMETRIAL CANCER\n",
          "KEGG GLIOMA",
          "KEGG PROSTATE CANCER\n",
          "KEGG THYROID CANCER\n",
          "KEGG MELANOMA",
          "KEGG BLADDER CANCER\n",
          "KEGG CHRONIC MYELOID\n LEUKEMIA",
          "KEGG ACUTE MYELOID\n LEUKEMIA",
          "KEGG NON SMALL\n CELL LUNG CANCER\n",
          "PID GMCSF PATHWAY\n",
          "PID TCR PATHWAY\n",
          "PID ER NONGENOMIC\n PATHWAY",
          "PID EPHB FWD\n PATHWAY",
          "PID CD8 TCR\n PATHWAY",
          "PID SHP2 PATHWAY\n",
          "PID MTOR 4PATHWAY\n",
          "PID IL2 1PATHWAY\n",
          "PID ERBB1 RECEPTOR\n PROXIMAL PATHWAY",
          "PID TCR RAS\n PATHWAY",
          "PID PI3KCI PATHWAY\n",
          "PID ERBB1 DOWNSTREAM\n PATHWAY",
          "PID ERBB2 ERBB3\n PATHWAY",
          "PID PDGFRB PATHWAY\n",
          "PID TRKR PATHWAY\n",
          "PID CMYB PATHWAY\n",
          "PID ERBB1 INTERNALIZATION\n PATHWAY",
          "PID CXCR3 PATHWAY\n",
          "PID RAS PATHWAY\n",
          "PID MAPK TRK\n PATHWAY",
          "PID PI3K PLC\n TRK PATHWAY",
          "PID CD8 TCR\n DOWNSTREAM PATHWAY",
          "REACTOME SIGNALING BY\n SCF KIT",
          "REACTOME DEVELOPMENTAL BIOLOGY\n",
          "REACTOME SIGNALING BY\n ERBB4",
          "REACTOME SIGNALING BY\n ERBB2",
          "REACTOME GRB2 EVENTS\n IN ERBB2 SIGNALING\n",
          "REACTOME SIGNALING BY\n EGFR IN CANCER\n",
          "REACTOME SHC1 EVENTS\n IN ERBB4 SIGNALING\n",
          "REACTOME DOWNSTREAM SIGNALING\n EVENTS OF B\n CELL RECEPTOR BCR\n",
          "REACTOME SIGNALING BY\n THE B CELL\n RECEPTOR BCR",
          "REACTOME INSULIN RECEPTOR\n SIGNALLING CASCADE",
          "REACTOME SIGNALLING TO\n RAS",
          "REACTOME CELL SURFACE\n INTERACTIONS AT THE\n VASCULAR WALL",
          "REACTOME SIGNALLING TO\n ERKS",
          "REACTOME P38MAPK EVENTS\n",
          "REACTOME SIGNALING BY\n FGFR IN DISEASE\n",
          "REACTOME GASTRIN CREB\n SIGNALLING PATHWAY VIA\n PKC AND MAPK\n",
          "REACTOME SHC1 EVENTS\n IN EGFR SIGNALING\n",
          "REACTOME TIE2 SIGNALING\n",
          "REACTOME TRANSMISSION ACROSS\n CHEMICAL SYNAPSES",
          "REACTOME NEURONAL SYSTEM\n",
          "REACTOME SIGNALING BY\n GPCR",
          "REACTOME SIGNALING BY\n PDGF",
          "REACTOME DOWNSTREAM SIGNAL\n TRANSDUCTION",
          "REACTOME AXON GUIDANCE\n",
          "REACTOME G ALPHA\n Q SIGNALLING EVENTS\n",
          "REACTOME NCAM SIGNALING\n FOR NEURITE OUT\n GROWTH",
          "REACTOME SIGNALING BY\n INSULIN RECEPTOR",
          "REACTOME SOS MEDIATED\n SIGNALLING",
          "REACTOME HEMOSTASIS",
          "REACTOME INNATE IMMUNE\n SYSTEM",
          "REACTOME ADAPTIVE IMMUNE\n SYSTEM",
          "REACTOME CYTOKINE SIGNALING\n IN IMMUNE SYSTEM\n",
          "REACTOME SIGNALING BY\n FGFR",
          "REACTOME NEUROTRANSMITTER RECEPTORS\n AND POSTSYNAPTIC SIGNAL\n TRANSMISSION",
          "REACTOME IRS MEDIATED\n SIGNALLING",
          "REACTOME ACTIVATION OF\n RAS IN B\n CELLS",
          "REACTOME SHC1 EVENTS\n IN ERBB2 SIGNALING\n",
          "REACTOME DISEASE",
          "REACTOME SIGNALING BY\n NTRKS",
          "REACTOME SIGNALING BY\n EGFR",
          "REACTOME SIGNALING BY\n NTRK1 TRKA",
          "REACTOME SIGNALING BY\n VEGF",
          "REACTOME DAP12 INTERACTIONS\n",
          "REACTOME EGFR TRANSACTIVATION\n BY GASTRIN",
          "REACTOME SIGNALING BY\n TYPE 1 INSULIN\n LIKE GROWTH FACTOR\n 1 RECEPTOR IGF1R\n",
          "REACTOME DAP12 SIGNALING\n",
          "REACTOME SHC RELATED\n EVENTS TRIGGERED BY\n IGF1R",
          "REACTOME FC EPSILON\n RECEPTOR FCERI SIGNALING\n",
          "REACTOME FCERI MEDIATED\n MAPK ACTIVATION",
          "REACTOME CREB1 PHOSPHORYLATION\n THROUGH NMDA RECEPTOR\n MEDIATED ACTIVATION OF\n RAS SIGNALING",
          "REACTOME ACTIVATION OF\n NMDA RECEPTORS AND\n POSTSYNAPTIC EVENTS",
          "REACTOME RAS ACTIVATION\n UPON CA2PLUS INFLUX\n THROUGH NMDA RECEPTOR\n",
          "REACTOME SIGNALING BY\n INTERLEUKINS",
          "REACTOME OTHER INTERLEUKIN\n SIGNALING",
          "REACTOME VEGFR2 MEDIATED\n CELL PROLIFERATION",
          "REACTOME C TYPE\n LECTIN RECEPTORS CLRS\n",
          "REACTOME CD209 DC\n SIGN SIGNALING",
          "REACTOME SIGNALING BY\n EGFRVIII IN CANCER\n",
          "REACTOME SIGNALING BY\n LIGAND RESPONSIVE EGFR\n VARIANTS IN CANCER\n",
          "REACTOME DOWNSTREAM SIGNALING\n OF ACTIVATED FGFR1\n",
          "REACTOME SHC MEDIATED\n CASCADE:FGFR1",
          "REACTOME FRS MEDIATED\n FGFR1 SIGNALING",
          "REACTOME DOWNSTREAM SIGNALING\n OF ACTIVATED FGFR2\n",
          "REACTOME SHC MEDIATED\n CASCADE:FGFR2",
          "REACTOME FRS MEDIATED\n FGFR2 SIGNALING",
          "REACTOME SHC MEDIATED\n CASCADE:FGFR3",
          "REACTOME FRS MEDIATED\n FGFR3 SIGNALING",
          "REACTOME DOWNSTREAM SIGNALING\n OF ACTIVATED FGFR3\n",
          "REACTOME FRS MEDIATED\n FGFR4 SIGNALING",
          "REACTOME DOWNSTREAM SIGNALING\n OF ACTIVATED FGFR4\n",
          "REACTOME SHC MEDIATED\n CASCADE:FGFR4",
          "REACTOME SIGNALING BY\n FGFR1",
          "REACTOME SIGNALING BY\n FGFR2",
          "REACTOME SIGNALING BY\n FGFR3",
          "REACTOME SIGNALING BY\n FGFR4",
          "REACTOME SIGNALING BY\n FGFR2 IN DISEASE\n",
          "REACTOME SIGNALING BY\n FGFR4 IN DISEASE\n",
          "REACTOME SIGNALING BY\n FGFR1 IN DISEASE\n",
          "REACTOME REGULATION OF\n RAS BY GAPS\n",
          "REACTOME DISEASES OF\n SIGNAL TRANSDUCTION",
          "REACTOME RAF ACTIVATION\n",
          "REACTOME MAP2K AND\n MAPK ACTIVATION",
          "REACTOME NEGATIVE REGULATION\n OF MAPK PATHWAY\n",
          "REACTOME MAPK FAMILY\n SIGNALING CASCADES",
          "REACTOME NEUTROPHIL DEGRANULATION\n",
          "REACTOME SIGNALING BY\n MODERATE KINASE ACTIVITY\n BRAF MUTANTS",
          "REACTOME SIGNALING BY\n RAS MUTANTS",
          "REACTOME SIGNALING BY\n BRAF AND RAF\n FUSIONS",
          "REACTOME ONCOGENIC MAPK\n SIGNALING",
          "REACTOME SIGNALING BY\n MET",
          "REACTOME PTK6 REGULATES\n RHO GTPASES RAS\n GTPASE AND MAP\n KINASES",
          "REACTOME MET ACTIVATES\n RAS SIGNALING",
          "REACTOME SIGNALING BY\n FGFR3 FUSIONS IN\n CANCER",
          "REACTOME ESR MEDIATED\n SIGNALING",
          "REACTOME SIGNALING BY\n NTRK2 TRKB",
          "REACTOME SIGNALING BY\n ERYTHROPOIETIN",
          "REACTOME SIGNALING BY\n NON RECEPTOR TYROSINE\n KINASES",
          "REACTOME SIGNALING BY\n NUCLEAR RECEPTORS",
          "REACTOME SIGNALING BY\n RECEPTOR TYROSINE KINASES\n",
          "REACTOME EXTRA NUCLEAR\n ESTROGEN SIGNALING",
          "REACTOME ACTIVATED NTRK2\n SIGNALS THROUGH RAS\n",
          "REACTOME ERYTHROPOIETIN ACTIVATES\n RAS",
          "REACTOME ACTIVATED NTRK2\n SIGNALS THROUGH FRS2\n AND FRS3",
          "REACTOME SIGNALING BY\n NTRK3 TRKC",
          "REACTOME ACTIVATED NTRK3\n SIGNALS THROUGH RAS\n",
          "REACTOME ESTROGEN STIMULATED\n SIGNALING THROUGH PRKCZ\n",
        ],
        id: "NRAS",
        feature: "NRAS",
        should_label: true,
        x: 0.04564714770711119,
        y: 2.0672378997008267,
      },
      {
        task: "e1bbb1c7-f15d-49dd-a9ca-43be06f90e40",
        "-log10(P)": 0.5350484247789887,
        effect: -0.395766759011475,
        gene_sets: [
          "KEGG MAPK SIGNALING\n PATHWAY",
          "BIOCARTA MAPK PATHWAY\n",
          "PID EPHB FWD\n PATHWAY",
          "PID TNF PATHWAY\n",
          "PID CERAMIDE PATHWAY\n",
          "PID P53 DOWNSTREAM\n PATHWAY",
          "REACTOME CELLULAR RESPONSES\n TO STRESS",
          "REACTOME OXIDATIVE STRESS\n INDUCED SENESCENCE",
          "REACTOME CELLULAR SENESCENCE\n",
          "REACTOME CELLULAR RESPONSES\n TO EXTERNAL STIMULI\n",
        ],
        id: "MAP4K4",
        feature: "MAP4K4",
        should_label: true,
        x: 0.7990559611432342,
        y: 1.7537455273565432,
      },
      {
        task: "e1bbb1c7-f15d-49dd-a9ca-43be06f90e40",
        "-log10(P)": 0.49151575420294874,
        effect: -0.37324361694047703,
        gene_sets: [
          "BIOCARTA CARM ER\n PATHWAY",
          "BIOCARTA VDR PATHWAY\n",
          "BIOCARTA PPARA PATHWAY\n",
          "BIOCARTA PITX2 PATHWAY\n",
          "PID AR PATHWAY\n",
          "PID RXR VDR\n PATHWAY",
          "PID ERA GENOMIC\n PATHWAY",
          "REACTOME DEVELOPMENTAL BIOLOGY\n",
          "REACTOME GENERIC TRANSCRIPTION\n PATHWAY",
          "REACTOME NUCLEAR RECEPTOR\n TRANSCRIPTION PATHWAY",
          "REACTOME CIRCADIAN CLOCK\n",
          "REACTOME TRANSCRIPTIONAL REGULATION\n OF WHITE ADIPOCYTE\n DIFFERENTIATION",
          "BIOCARTA PPARG PATHWAY\n",
          "REACTOME RORA ACTIVATES\n GENE EXPRESSION",
          "REACTOME BMAL1:CLOCK NPAS2\n ACTIVATES CIRCADIAN GENE\n EXPRESSION",
          "REACTOME MITOCHONDRIAL BIOGENESIS\n",
          "REACTOME REGULATION OF\n CHOLESTEROL BIOSYNTHESIS BY\n SREBP SREBF",
          "REACTOME ORGANELLE BIOGENESIS\n AND MAINTENANCE",
          "REACTOME TRANSCRIPTIONAL ACTIVATION\n OF MITOCHONDRIAL BIOGENESIS\n",
          "REACTOME ACTIVATION OF\n GENE EXPRESSION BY\n SREBF SREBP",
          "REACTOME REGULATION OF\n LIPID METABOLISM BY\n PEROXISOME PROLIFERATOR ACTIVATED\n RECEPTOR ALPHA PPARALPHA\n",
          "REACTOME METABOLISM OF\n LIPIDS",
          "REACTOME GENE EXPRESSION\n TRANSCRIPTION",
          "REACTOME ESR MEDIATED\n SIGNALING",
          "REACTOME METABOLISM OF\n STEROIDS",
          "REACTOME SIGNALING BY\n NUCLEAR RECEPTORS",
          "REACTOME ESTROGEN DEPENDENT\n GENE EXPRESSION",
        ],
        id: "MED1",
        feature: "MED1",
        should_label: true,
        x: 0.33886839227982585,
        y: -0.20000309535149838,
      },
      {
        task: "e1bbb1c7-f15d-49dd-a9ca-43be06f90e40",
        "-log10(P)": 0.07211172017561593,
        effect: 0.07545613691099501,
        gene_sets: [
          "HALLMARK HEME METABOLISM\n",
          "REACTOME DISEASE",
          "REACTOME HDMS DEMETHYLATE\n HISTONES",
          "REACTOME CHROMATIN ORGANIZATION\n",
          "REACTOME DISEASES OF\n SIGNAL TRANSDUCTION",
          "REACTOME SIGNALING BY\n BRAF AND RAF\n FUSIONS",
          "REACTOME ONCOGENIC MAPK\n SIGNALING",
        ],
        id: "KDM7A",
        feature: "KDM7A",
        should_label: true,
        x: -1.3012890455675596,
        y: 0.47804759150225534,
      },
    ],
  },
  overrepresentation: {
    gene_sets_down: {
      genes: [
        ["NRAS"],
        ["NRAS"],
        ["NRAS"],
        ["NRAS"],
        ["MED1"],
        ["NRAS"],
        ["NRAS"],
        ["NRAS"],
        ["NRAS"],
        ["MED1"],
      ],
      n: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      neg_log_p: [
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
        0.4040141563842304,
      ],
      p_value: [
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
        0.33333333333333365,
      ],
      rank: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      term: [
        "REACTOME NCAM SIGNALING\n FOR NEURITE OUT\n GROWTH",
        "REACTOME SIGNALING BY\n NTRKS",
        "REACTOME SIGNALING BY\n NON RECEPTOR TYROSINE\n KINASES",
        "REACTOME SIGNALING BY\n EGFR",
        "REACTOME ORGANELLE BIOGENESIS\n AND MAINTENANCE",
        "REACTOME SIGNALING BY\n NTRK1 TRKA",
        "REACTOME SIGNALING BY\n ERYTHROPOIETIN",
        "REACTOME SIGNALING BY\n VEGF",
        "REACTOME SIGNALING BY\n NTRK2 TRKB",
        "REACTOME REGULATION OF\n CHOLESTEROL BIOSYNTHESIS BY\n SREBP SREBF",
      ],
      term_short: [
        "NCAM SIGNALING FOR NEU...",
        "SIGNALING BY NTRKS",
        "SIGNALING BY NON RECEP...",
        "SIGNALING BY EGFR",
        "ORGANELLE BIOGENESIS A...",
        "SIGNALING BY NTRK1 TRKA",
        "SIGNALING BY ERYTHROPO...",
        "SIGNALING BY VEGF",
        "SIGNALING BY NTRK2 TRKB",
        "REGULATION OF CHOLESTE...",
      ],
      type: [
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
        "gene_set_down",
      ],
      x: [
        0.04564714770711119,
        0.04564714770711119,
        0.04564714770711119,
        0.04564714770711119,
        0.33886839227982585,
        0.04564714770711119,
        0.04564714770711119,
        0.04564714770711119,
        0.04564714770711119,
        0.33886839227982585,
      ],
      y: [
        2.0672378997008267,
        2.0672378997008267,
        2.0672378997008267,
        2.0672378997008267,
        -0.20000309535149838,
        2.0672378997008267,
        2.0672378997008267,
        2.0672378997008267,
        2.0672378997008267,
        -0.20000309535149838,
      ],
    },
    gene_sets_up: {
      genes: [
        ["KDM7A"],
        ["NRAS"],
        ["MED1"],
        ["NRAS"],
        ["NRAS"],
        ["MAP4K4"],
        ["MAP4K4"],
        ["NRAS"],
        ["KDM7A"],
        ["MED1"],
      ],
      n: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      neg_log_p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      p_value: [
        0.24999999999999983,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0.24999999999999983,
        1,
      ],
      rank: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      term: [
        "HALLMARK HEME METABOLISM\n",
        "REACTOME DAP12 SIGNALING\n",
        "REACTOME ACTIVATION OF\n GENE EXPRESSION BY\n SREBF SREBP",
        "REACTOME SHC RELATED\n EVENTS TRIGGERED BY\n IGF1R",
        "REACTOME FC EPSILON\n RECEPTOR FCERI SIGNALING\n",
        "REACTOME OXIDATIVE STRESS\n INDUCED SENESCENCE",
        "REACTOME CELLULAR SENESCENCE\n",
        "REACTOME FCERI MEDIATED\n MAPK ACTIVATION",
        "REACTOME HDMS DEMETHYLATE\n HISTONES",
        "REACTOME REGULATION OF\n LIPID METABOLISM BY\n PEROXISOME PROLIFERATOR ACTIVATED\n RECEPTOR ALPHA PPARALPHA\n",
      ],
      term_short: [
        "HEME METABOLISM",
        "DAP12 SIGNALING",
        "ACTIVATION OF GENE EXP...",
        "SHC RELATED EVENTS TRI...",
        "FC EPSILON RECEPTOR FC...",
        "OXIDATIVE STRESS INDUC...",
        "CELLULAR SENESCENCE",
        "FCERI MEDIATED MAPK AC...",
        "HDMS DEMETHYLATE HISTO...",
        "REGULATION OF LIPID ME...",
      ],
      type: [
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
        "gene_set_up",
      ],
      x: [
        -1.3012890455675596,
        0.04564714770711119,
        0.33886839227982585,
        0.04564714770711119,
        0.04564714770711119,
        0.7990559611432342,
        0.7990559611432342,
        0.04564714770711119,
        -1.3012890455675596,
        0.33886839227982585,
      ],
      y: [
        0.47804759150225534,
        2.0672378997008267,
        -0.20000309535149838,
        2.0672378997008267,
        2.0672378997008267,
        1.7537455273565432,
        1.7537455273565432,
        2.0672378997008267,
        0.47804759150225534,
        -0.20000309535149838,
      ],
    },
  },
  table: [
    {
      "-log10(P)": 2.3694990996,
      effect: -0.8434826162,
      feature: "SOX10",
    },
    {
      "-log10(P)": 1.7794023154,
      effect: -0.7636728308,
      feature: "TNS2",
    },
    {
      "-log10(P)": 1.5485790385,
      effect: -0.7213337514,
      feature: "TRIL",
    },
    {
      "-log10(P)": 0.8855911562,
      effect: -0.5438378713,
      feature: "NRAS",
    },
    {
      "-log10(P)": 0.5350484248,
      effect: -0.395766759,
      feature: "MAP4K4",
    },
    {
      "-log10(P)": 0.4980030852,
      effect: 0.3766712932,
      feature: "UNC93B1",
    },
    {
      "-log10(P)": 0.4915157542,
      effect: -0.3732436169,
      feature: "MED1",
    },
    {
      "-log10(P)": 0.2222470563,
      effect: -0.2035134905,
      feature: "SWI5",
    },
    {
      "-log10(P)": 0.2120766381,
      effect: 0.1957948112,
      feature: "ANOS1",
    },
    {
      "-log10(P)": 0.0721117202,
      effect: 0.0754561369,
      feature: "KDM7A",
    },
  ],
};

export default expressionData;