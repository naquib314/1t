/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useEffect, useRef, useState } from "react";
import { colorPalette } from "depmap-shared";
import {
  DataExplorerPlotConfig,
  DataExplorerPlotResponse,
} from "src/data-explorer-2/types";

export const DEFAULT_COLOR = colorPalette.gene_color;
export const COMPARISON_COLOR_1 = "#1A7DB6";
export const COMPARISON_COLOR_2 = "#FEFB80";
export const COMPARISON_COLOR_1_2 = "#77BE86";

export const LEGEND_ALL = Symbol("All");
export const LEGEND_BOTH = Symbol("Both");
export const LEGEND_OTHER = Symbol("Other");
export const LEGEND_RANGE_1 = Symbol("Range 1");
export const LEGEND_RANGE_2 = Symbol("Range 2");
export const LEGEND_RANGE_3 = Symbol("Range 3");
export const LEGEND_RANGE_4 = Symbol("Range 4");
export const LEGEND_RANGE_5 = Symbol("Range 5");
export const LEGEND_RANGE_6 = Symbol("Range 6");
export const LEGEND_RANGE_7 = Symbol("Range 7");
export const LEGEND_RANGE_8 = Symbol("Range 8");
export const LEGEND_RANGE_9 = Symbol("Range 9");
export const LEGEND_RANGE_10 = Symbol("Range 10");

export type LegendKey =
  | typeof LEGEND_ALL
  | typeof LEGEND_BOTH
  | typeof LEGEND_OTHER
  | typeof LEGEND_RANGE_1
  | typeof LEGEND_RANGE_2
  | typeof LEGEND_RANGE_3
  | typeof LEGEND_RANGE_4
  | typeof LEGEND_RANGE_5
  | typeof LEGEND_RANGE_6
  | typeof LEGEND_RANGE_7
  | typeof LEGEND_RANGE_8
  | typeof LEGEND_RANGE_9
  | typeof LEGEND_RANGE_10
  | string;

export const CONTINUOUS_COLORSCALE = [
  ["0.0", "#FFFED8"],
  ["0.111111", "#EFF6BB"],
  ["0.222222", "#D4E9B0"],
  ["0.333333", "#A7D5B1"],
  ["0.444444", "#76BFB5"],
  ["0.555555", "#50A8B8"],
  ["0.666666", "#388BB3"],
  ["0.777777", "#2968A4"],
  ["0.888888", "#192E75"],
  ["1.0", "#0B1D4B"],
];

const d3_category10 = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

const d3_category20 = [
  "#1f77b4",
  "#aec7e8",
  "#ff7f0e",
  "#ffbb78",
  "#2ca02c",
  "#98df8a",
  "#d62728",
  "#ff9896",
  "#9467bd",
  "#c5b0d5",
  "#8c564b",
  "#c49c94",
  "#e377c2",
  "#f7b6d2",
  "#7f7f7f",
  "#c7c7c7",
  "#bcbd22",
  "#dbdb8d",
  "#17becf",
  "#9edae5",
];

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const countUniqueValues = (values: string[]) => {
  const len = values.length;
  const seen: Record<any, boolean> = {};
  let count = 0;

  for (let i = 0; i < len; i += 1) {
    const value = values[i];

    if (!seen[value]) {
      seen[value] = true;
      count += 1;
    }
  }

  return count;
};

export function makeCategoricalColorMap(values: string[] | null) {
  if (!values) {
    return null;
  }

  const out: Partial<Record<LegendKey, string>> = {};
  const len = values.length;
  const scale = countUniqueValues(values) <= 10 ? 10 : 20;
  const lookupTable = scale === 10 ? d3_category10 : d3_category20;
  let hasNulls = false;
  let uniqueIndex = 0;

  for (let i = 0; i < len; i += 1) {
    const value = values[i];

    if (value === null) {
      hasNulls = true;
    }

    if (!out[value] && value !== null) {
      out[value] = lookupTable[uniqueIndex % scale];
      uniqueIndex += 1;
    }
  }

  if (hasNulls) {
    out[LEGEND_OTHER] = DEFAULT_COLOR;
  }

  return out;
}

function nullifyUnplottableValues(
  values?: number[],
  visibleFilter?: boolean[],
  dependentDimensions?: { values: unknown[] }[]
) {
  if (!values) {
    return null;
  }

  const out = [];

  for (let i = 0; i < values.length; i += 1) {
    let value = values[i];

    if (visibleFilter?.[i] === false) {
      value = null;
    }

    if (dependentDimensions) {
      for (let j = 0; j < dependentDimensions.length; j += 1) {
        if (dependentDimensions[j]?.values[i] === null) {
          value = null;
        }
      }
    }

    out.push(value);
  }

  return out;
}

export function formatDataForScatterPlot(data: DataExplorerPlotResponse) {
  if (!data) {
    return null;
  }

  const round = (num: number) =>
    Math.round((num + Number.EPSILON) * 1.0e7) / 1.0e7;

  const c1Values = data.filters?.color1?.values;
  const c2Values = data.filters?.color2?.values;
  const catValues = data.metadata?.color_property?.values;
  const contValues = nullifyUnplottableValues(
    data.dimensions.color?.values,
    data.filters?.visible?.values,
    [data.dimensions.x, data.dimensions.y]
  );

  return {
    x: nullifyUnplottableValues(
      data.dimensions.x.values,
      data.filters?.visible?.values
    ),
    xLabel: [
      data.dimensions.x.axis_label,
      data.dimensions.x.dataset_label,
    ].join("<br>"),

    y: nullifyUnplottableValues(
      data.dimensions?.y?.values,
      data.filters?.visible?.values
    ),
    yLabel: data.dimensions.y
      ? [data.dimensions.y.axis_label, data.dimensions.y.dataset_label].join(
          "<br>"
        )
      : null,

    color1: c1Values,
    color2: c2Values,
    catColorData: catValues,
    contColorData: contValues,

    hoverText: data.index_labels.map((label: string, i: number) => {
      const colorInfo = [];

      if (c1Values && c1Values[i] && data.color_by === "context") {
        colorInfo.push(data.filters.color1.name);
      }

      if (c2Values && c2Values[i] && data.color_by === "context") {
        colorInfo.push(data.filters.color2.name);
      }

      if (catValues && catValues[i] !== null) {
        colorInfo.push(catValues[i]);
      }

      if (contValues && contValues[i] !== null) {
        colorInfo.push(
          [
            `<b>${data.dimensions.color.axis_label}</b>`,
            round(contValues[i]),
          ].join(": ")
        );
      }

      return [`<b>${label}</b>`, ...colorInfo].join("<br>");
    }),
  };
}

export function useLegendState(
  plotConfig: DataExplorerPlotConfig,
  legendKeysWithNoData?: any
) {
  const prevPlotConfig = useRef(plotConfig);
  const recentClickKey = useRef(null);
  const recentClickMap = useRef(null);
  const [hiddenLegendValues, setHiddenLegendValues] = useState(() => new Set());

  useEffect(() => {
    let hasChanges = false;

    if (
      prevPlotConfig.current.metadata?.color_property?.slice_id !==
      plotConfig.metadata?.color_property?.slice_id
    ) {
      hasChanges = true;
    }

    if (
      prevPlotConfig.current.filters?.color1?.name !==
      plotConfig.filters?.color1?.name
    ) {
      hasChanges = true;
    }

    if (
      prevPlotConfig.current.filters?.color2?.name !==
      plotConfig.filters?.color2?.name
    ) {
      hasChanges = true;
    }

    if (
      Boolean(prevPlotConfig.current.dimensions.color?.context) !==
      Boolean(plotConfig.dimensions.color?.context)
    ) {
      hasChanges = true;
    }

    if (hasChanges) {
      setHiddenLegendValues(new Set());
    }

    prevPlotConfig.current = plotConfig;
  }, [plotConfig]);

  useEffect(() => {
    if (legendKeysWithNoData) {
      setHiddenLegendValues(legendKeysWithNoData);
    } else {
      setHiddenLegendValues(new Set());
    }
  }, [legendKeysWithNoData]);

  const onClickLegendItem = useCallback(
    (key: string | symbol, catColorMap: Record<string, string>) => {
      if (recentClickKey.current === key) {
        setHiddenLegendValues((prev) => {
          const allKeys = new Set(Reflect.ownKeys(recentClickMap.current));

          if (prev.has(key) && prev.size !== allKeys.size) {
            const next = new Set(allKeys);
            next.delete(key);
            return next;
          }

          return new Set();
        });

        return;
      }

      recentClickKey.current = key;
      recentClickMap.current = catColorMap;

      setTimeout(() => {
        recentClickKey.current = null;
      }, 300);

      setHiddenLegendValues((prev) => {
        const next = new Set(prev);

        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }

        return next;
      });
    },
    []
  );

  return { hiddenLegendValues, onClickLegendItem };
}

export function calcBins(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const bins = [];

  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];

    if (value !== null && value < min) {
      min = value;
    }

    if (value !== null && value > max) {
      max = value;
    }
  }

  const NUM_BINS = 10;
  const binSize = Math.abs(max - min) / NUM_BINS;
  let binStart = min;

  for (let i = 0; i < NUM_BINS; i += 1) {
    const binEnd = i === NUM_BINS - 1 ? max : binStart + binSize;
    bins.push([binStart, binEnd]);
    binStart = binEnd;
  }

  return {
    [LEGEND_RANGE_1]: bins[0],
    [LEGEND_RANGE_2]: bins[1],
    [LEGEND_RANGE_3]: bins[2],
    [LEGEND_RANGE_4]: bins[3],
    [LEGEND_RANGE_5]: bins[4],
    [LEGEND_RANGE_6]: bins[5],
    [LEGEND_RANGE_7]: bins[6],
    [LEGEND_RANGE_8]: bins[7],
    [LEGEND_RANGE_9]: bins[8],
    [LEGEND_RANGE_10]: bins[9],
  };
}

export function calcVisibility(
  data: DataExplorerPlotResponse,
  hiddenLegendValues: any,
  continuousBins: any,
  hide_points?: boolean
) {
  if (!data) {
    return null;
  }

  if (hide_points || hiddenLegendValues.has(LEGEND_ALL)) {
    return data.dimensions.x.values.map(() => false);
  }

  const contValues = data.dimensions.color?.values;

  if (contValues) {
    return contValues.map((value: number) => {
      let out = true;

      [
        LEGEND_RANGE_1,
        LEGEND_RANGE_2,
        LEGEND_RANGE_3,
        LEGEND_RANGE_4,
        LEGEND_RANGE_5,
        LEGEND_RANGE_6,
        LEGEND_RANGE_7,
        LEGEND_RANGE_8,
        LEGEND_RANGE_9,
        LEGEND_RANGE_10,
      ].forEach((key: symbol) => {
        if (hiddenLegendValues.has(key)) {
          const [binStart, binEnd] = continuousBins[key];

          if (value !== null && value >= binStart && value < binEnd) {
            out = false;
          }

          if (key === LEGEND_RANGE_10 && value === binEnd) {
            out = false;
          }
        }
      });

      if (hiddenLegendValues.has(LEGEND_OTHER) && value === null) {
        out = false;
      }

      return out;
    });
  }

  const catValues = data.metadata?.color_property?.values;

  if (catValues) {
    const hideOthers = hiddenLegendValues.has(LEGEND_OTHER);

    return catValues.map((value: string) => {
      if (hiddenLegendValues.has(value)) {
        return false;
      }

      if (hideOthers && !value) {
        return false;
      }

      return true;
    });
  }

  const c1Values = data.filters?.color1?.values;
  const c2Values = data.filters?.color2?.values;
  const visiblePoints = data.dimensions.x.values.map(() => true);

  if (c1Values && hiddenLegendValues.has(data.filters.color1.name)) {
    c1Values.forEach((value: boolean, i: number) => {
      if (value && !(c2Values || [])[i]) {
        visiblePoints[i] = false;
      }
    });
  }

  if (c2Values && hiddenLegendValues.has(data.filters.color2.name)) {
    c2Values.forEach((value: boolean, i: number) => {
      if (value && !(c1Values || [])[i]) {
        visiblePoints[i] = false;
      }
    });
  }

  if (hiddenLegendValues.has(LEGEND_BOTH)) {
    c1Values.forEach((value: boolean, i: number) => {
      if (value && c2Values[i]) {
        visiblePoints[i] = false;
      }
    });
  }

  if (hiddenLegendValues.has(LEGEND_OTHER)) {
    const primary = c1Values || c2Values;
    const other = c2Values || [];

    primary.forEach((value: boolean, i: number) => {
      if (!value && !other[i]) {
        visiblePoints[i] = false;
      }
    });
  }

  return visiblePoints;
}

const hasSomeMatchingTrueValue = (a: boolean[], b: boolean[]) => {
  const len = a.length;

  for (let i = 0; i < len; i += 1) {
    if (a[i] && b[i]) {
      return true;
    }
  }

  return false;
};

const hasSomeUniqueValues = (a: boolean[], b: boolean[] | undefined) => {
  if (!b) {
    return true;
  }

  const len = a.length;

  for (let i = 0; i < len; i += 1) {
    if (a[i] && !b[i]) {
      return true;
    }
  }

  return false;
};

const hasSomeNullValuesUniqueToDimension = (
  dimensions: any,
  dimensionKey: string
) => {
  const otherDims = Object.keys(dimensions).filter(
    (key) => key !== dimensionKey
  );

  const { values } = dimensions[dimensionKey];
  const len = values.length;

  for (let i = 0; i < len; i += 1) {
    if (
      values[i] === null &&
      otherDims.every((key) => dimensions[key].values[i] !== null)
    ) {
      return true;
    }
  }

  return false;
};

const hasSomeUncoloredPoints = (
  c1Values: boolean[] | undefined,
  c2Values: boolean[] | undefined,
  catValues: string[] | undefined
) => {
  const len = c1Values?.length || c2Values?.length || catValues?.length;

  for (let i = 0; i < len; i += 1) {
    if (c1Values && c2Values) {
      if (!c1Values[i] && !c2Values[i]) {
        return true;
      }
    } else if (
      (c1Values && !c1Values[i]) ||
      (c2Values && !c2Values[i]) ||
      (catValues && !catValues[i])
    ) {
      return true;
    }
  }

  return false;
};

export function getColorMap(
  data: any,
  plotConfig: any,
  sortedLegendKeys?: any
) {
  if (!data) {
    return {
      [LEGEND_ALL]: DEFAULT_COLOR,
    };
  }

  if (data.dimensions?.color?.values?.length === 0) {
    return {
      [LEGEND_ALL]: DEFAULT_COLOR,
    };
  }

  let colorMap: Partial<Record<LegendKey, string>> = {};

  if (data.metadata?.color_property) {
    colorMap = makeCategoricalColorMap(data.metadata.color_property.values);
  }

  if (data.dimensions.color) {
    colorMap = {
      [LEGEND_RANGE_1]: CONTINUOUS_COLORSCALE[0][1],
      [LEGEND_RANGE_2]: CONTINUOUS_COLORSCALE[1][1],
      [LEGEND_RANGE_3]: CONTINUOUS_COLORSCALE[2][1],
      [LEGEND_RANGE_4]: CONTINUOUS_COLORSCALE[3][1],
      [LEGEND_RANGE_5]: CONTINUOUS_COLORSCALE[4][1],
      [LEGEND_RANGE_6]: CONTINUOUS_COLORSCALE[5][1],
      [LEGEND_RANGE_7]: CONTINUOUS_COLORSCALE[6][1],
      [LEGEND_RANGE_8]: CONTINUOUS_COLORSCALE[7][1],
      [LEGEND_RANGE_9]: CONTINUOUS_COLORSCALE[8][1],
      [LEGEND_RANGE_10]: CONTINUOUS_COLORSCALE[9][1],
    };
  }

  if (data.filters?.color1) {
    if (
      hasSomeUniqueValues(
        data.filters.color1.values,
        data.filters.color2?.values
      )
    ) {
      const { name } = data.filters.color1;
      colorMap[name] = COMPARISON_COLOR_1;
    }
  }

  if (data.filters?.color2) {
    if (
      hasSomeUniqueValues(
        data.filters.color2.values,
        data.filters.color1?.values
      )
    ) {
      const { name } = data.filters.color2;
      colorMap[name] = COMPARISON_COLOR_2;
    }
  }

  if (
    data.filters?.color1 &&
    data.filters?.color2 &&
    hasSomeMatchingTrueValue(
      data.filters.color1.values,
      data.filters.color2.values
    )
  ) {
    colorMap[LEGEND_BOTH] = COMPARISON_COLOR_1_2;
  }

  if (
    data.filters?.color1 ||
    data.filters?.color2 ||
    data.metadata?.color_property
  ) {
    if (
      hasSomeUncoloredPoints(
        data.filters?.color1?.values,
        data.filters?.color2?.values,
        data.metadata?.color_property?.values
      )
    ) {
      colorMap[LEGEND_OTHER] = DEFAULT_COLOR;
    }
  }

  if (
    data.dimensions?.color &&
    hasSomeNullValuesUniqueToDimension(data.dimensions, "color")
  ) {
    colorMap[LEGEND_OTHER] = DEFAULT_COLOR;
  }

  if (Reflect.ownKeys(colorMap).length === 0) {
    colorMap[LEGEND_ALL] = DEFAULT_COLOR;
  }

  if (sortedLegendKeys) {
    const sortedColorMap: any = {};

    sortedLegendKeys.forEach((key: LegendKey) => {
      sortedColorMap[key] = colorMap[key];
    });

    return sortedColorMap;
  }

  return colorMap;
}

const ceil = (n: number, p: number) => Math.ceil(n * p) / p;
const floor = (n: number, p: number) => Math.floor(n * p) / p;

function precision(n: number) {
  const decimalPart = `${n}`.split(".")[1];

  if (!decimalPart) {
    return 1;
  }

  let e = 10;

  for (let i = 0; i < decimalPart.length; i += 1) {
    if (decimalPart[i] !== "0") {
      return e * 10;
    }

    e *= 10;
  }

  return 100;
}

export function categoryToDisplayName(
  category: LegendKey,
  data: any,
  continuousBins: any
) {
  if (category === LEGEND_BOTH) {
    return `Both (${[data.filters.color1.name, data.filters.color2.name].join(
      " & "
    )})`;
  }

  if (category === LEGEND_ALL) {
    return "All";
  }

  if (category === LEGEND_OTHER) {
    return data.color_by === "custom" ? "N/A" : "Other";
  }

  if (typeof category === "symbol") {
    const [binStart, binEnd] = continuousBins[category];
    const p = precision(Math.abs(binEnd - binStart));

    if (!Number.isFinite(binStart) || !Number.isFinite(binEnd)) {
      return "No data";
    }

    return [ceil(binStart, p), floor(binEnd, p)];
  }

  return category;
}

const sortLegendKeys = (data: any, catData: any, sort_by: any) => {
  const visible = data.filters?.visible;

  if (sort_by === "mean_values_asc" || sort_by === "mean_values_desc") {
    const meansByCategory: any = {};

    for (let i = 0; i < catData.values.length; i += 1) {
      const key = catData.values[i];
      const legendKey = key === null ? LEGEND_OTHER : key;
      const mean = meansByCategory[legendKey];
      const value = data.dimensions.x.values[i];

      if (value !== null && (!visible || visible.values[i])) {
        if (!mean) {
          meansByCategory[legendKey] = [value, 1];
        } else {
          const [sum, divisor] = meansByCategory[legendKey];
          meansByCategory[legendKey] = [sum + value, divisor + 1];
        }
      }
    }

    return Reflect.ownKeys(meansByCategory).sort(
      (keyA: LegendKey, keyB: LegendKey) => {
        const [sumA, divisorA] = meansByCategory[keyA];
        const [sumB, divisorB] = meansByCategory[keyB];
        const a = sumA / divisorA;
        const b = sumB / divisorB;

        return sort_by === "mean_values_asc" ? a - b : b - a;
      }
    );
  }

  if (sort_by === "alphabetical") {
    const valuesByCategory: any = {};

    for (let i = 0; i < catData.values.length; i += 1) {
      const key = catData.values[i];
      const legendKey = key === null ? LEGEND_OTHER : key;
      const value = data.dimensions.x.values[i];

      if (value !== null && (!visible || visible.values[i])) {
        valuesByCategory[legendKey] = legendKey;
      }
    }

    return Reflect.ownKeys(valuesByCategory).sort(
      (keyA: LegendKey, keyB: LegendKey) => {
        if (typeof keyA === "symbol") {
          return 1;
        }

        if (typeof keyB === "symbol") {
          return -1;
        }

        return collator.compare(keyA, keyB);
      }
    );
  }

  const valuesByCategory: any = {};

  for (let i = 0; i < catData.values.length; i += 1) {
    const key = catData.values[i];
    const legendKey = key === null ? LEGEND_OTHER : key;
    const minOrMax = valuesByCategory[legendKey];
    const value = data.dimensions.x.values[i];

    if (value !== null && (!visible || visible.values[i])) {
      if (
        minOrMax === undefined ||
        (sort_by === "min_values" && value < minOrMax) ||
        (sort_by === "max_values" && value > minOrMax)
      ) {
        valuesByCategory[legendKey] = value;
      }
    }
  }

  return Reflect.ownKeys(valuesByCategory).sort(
    (keyA: LegendKey, keyB: LegendKey) => {
      const a = valuesByCategory[keyA];
      const b = valuesByCategory[keyB];

      return sort_by === "min_values" ? a - b : b - a;
    }
  );
};

export function calcDensityStats(
  data: any,
  continuousBins: any,
  sort_by: string
) {
  const color1 = data?.filters?.color1;
  const color2 = data?.filters?.color2;
  const catData = data?.metadata?.color_property;
  const contData = data?.dimensions?.color;
  const visible = data?.filters?.visible;

  if (color1 || color2) {
    const out = [];
    const len = (color1 || color2).values.length;

    for (let i = 0; i < len; i += 1) {
      if (color1?.values[i] && color2?.values[i]) {
        out[i] = LEGEND_BOTH;
      } else if (color1?.values[i]) {
        out[i] = color1.name;
      } else if (color2?.values[i]) {
        out[i] = color2.name;
      } else {
        out[i] = LEGEND_OTHER;
      }
    }

    return [out];
  }

  if (catData) {
    const counts: Record<string, number> = {};
    const unusedKeys = new Set();

    if (visible) {
      for (let i = 0; i < catData.values.length; i += 1) {
        const category = catData.values[i];
        counts[category] = counts[category] || 0;
        counts[category] +=
          visible.values[i] && data.dimensions.x.values[i] !== null ? 1 : 0;
      }

      Object.keys(counts).forEach((category) => {
        if (counts[category] === 0) {
          unusedKeys.add(category);
        }
      });
    }

    return [
      catData.values.map((x: unknown) => (x === null ? LEGEND_OTHER : x)),
      unusedKeys,
      sortLegendKeys(data, catData, sort_by),
    ];
  }

  if (contData) {
    const out: any = [];
    const len = contData.values.length;
    const keys = Reflect.ownKeys(continuousBins || {});
    const unusedKeys = new Set(keys);

    for (let i = 0; i < len; i += 1) {
      const value = contData.values[i];
      let found = false;

      if (value === null) {
        out[i] = LEGEND_OTHER;
        found = true;
        unusedKeys.delete(LEGEND_OTHER);
      }

      keys.forEach((key: any) => {
        const [binStart, binEnd] = (continuousBins as any)[key];

        if (
          !found &&
          ((value >= binStart && value < binEnd) ||
            (key === LEGEND_RANGE_10 && value >= binStart && value === binEnd))
        ) {
          found = true;
          out[i] = key;
          unusedKeys.delete(key);
        }
      });
    }

    return [out, unusedKeys];
  }

  return [null];
}

export function isEveryValueNull(values: any[]) {
  if (!values && values.length === 0) {
    return false;
  }

  for (let i = 0; i < values.length; i += 1) {
    if (values[i] !== null) {
      return false;
    }
  }

  return true;
}

export function getRange(values?: number[]) {
  let min = Infinity;
  let max = -Infinity;

  if (values) {
    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];

      if (value !== null && value !== undefined) {
        if (value < min) {
          min = value;
        }

        if (value > max) {
          max = value;
        }
      }
    }
  }

  return [min, max];
}
