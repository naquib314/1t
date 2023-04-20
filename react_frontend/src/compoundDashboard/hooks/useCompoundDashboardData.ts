import { useEffect, useState } from "react";
import { getDapi } from "src/common/utilities/context";
import {
  CompoundSummaryTable,
  CompoundSummaryTableRaw,
  DatasetId,
} from "../models/types";

type Key = keyof CompoundSummaryTableRaw;

function formatTooltip(datum: unknown, key: Key) {
  if (typeof datum !== "string") {
    return "";
  }

  if (key === "Name") {
    const max = 20;
    return `${datum.slice(0, max)}${datum.length > max ? "..." : ""}`;
  }

  const max = key === "MOA" ? 1 : 2;
  const parts = datum.split(/,\s*/g);
  const text = parts
    .slice(0, max)
    .map((part) =>
      part.length > 10 ? part.replace(/(\s\S+)+\s(\S+)$/, "...$2") : part
    )
    .join(", ");
  const nMore = parts.length - max;

  return nMore < 1 ? text : `${text} and ${nMore} more`;
}

function calcHoverText(data: CompoundSummaryTableRaw) {
  const keys: Key[] = ["Name", "ClinicalPhase", "Target", "MOA"];

  const labelFor: Partial<Record<Key, string>> = {
    Name: "Name",
    ClinicalPhase: "Phase",
    Target: "Target",
    MOA: "MOA",
  };

  return data.Name.map((_, index) =>
    keys
      .filter((key) => data[key][index] !== null)
      .map((key) => `${labelFor[key]}: ${formatTooltip(data[key][index], key)}`)
      .join("<br>")
  );
}

function processRawData(data: CompoundSummaryTableRaw) {
  return {
    ...data,
    hoverText: calcHoverText(data),
    isConfounder: data["TopBiomarker(s)"].map((biomarker) =>
      biomarker?.includes("confounder")
    ),
  };
}

export default function useCompoundDashboardData(datasetId: DatasetId) {
  const [data, setData] = useState<CompoundSummaryTable>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setData(null);

    (async () => {
      try {
        const dapi = getDapi();
        const nextData = await dapi.getCompoundDashboardSummaryTable(datasetId);
        setData(processRawData(nextData));
      } catch (e) {
        window.console.error(e);
        setError(true);
      }
    })();
  }, [datasetId, setData]);

  return { data, error };
}