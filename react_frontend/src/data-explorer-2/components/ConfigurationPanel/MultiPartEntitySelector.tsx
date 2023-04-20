/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useState } from "react";
import { apply } from "json-logic-js";
import {
  fetchEntityLabels,
  fetchEntityLabelsOfDataset,
} from "src/data-explorer-2/api";
import { PlotConfigSelect } from "src/data-explorer-2/components/ConfigurationPanel/selectors";
import contextBuilderReducer from "src/data-explorer-2/components/ContextBuilder/contextBuilderReducer";
import metdataSlices from "src/data-explorer-2/json/metadata-slices.json";
import styles from "src/data-explorer-2/styles/ConfigurationPanel.scss";

const REGEXES: Record<string, RegExp> = {
  compound_experiment: /(.*) ((?<!-)\(.*)/,
};

const SLICE_IDS: Record<string, string[]> = {
  compound_experiment: [
    "slice/compound_experiment/compound_name/label",
    "slice/compound_experiment/compound_instance/label",
  ],
};

const labelToData = (label: string, entity_type: string) => {
  if (!(entity_type in REGEXES) || !(entity_type in SLICE_IDS)) {
    throw new Error(`Unsupported entity_type "${entity_type}"`);
  }

  const out: Record<string, string> = {};
  const parts = REGEXES[entity_type].exec(label);

  SLICE_IDS[entity_type].forEach((slice_id: string, index: number) => {
    out[slice_id] = parts[index + 1];
  });

  return out;
};

const filterLabels = (labels: string[], entity_type: string, expr: any) => {
  const out: string[] = [];

  for (let i = 0; i < labels.length; i += 1) {
    const label = labels[i];
    const data = labelToData(label, entity_type);

    if (apply(expr, data)) {
      out.push(label);
    }
  }

  return out;
};

const templateExpr = (entity_type: string) => {
  if (!(entity_type in SLICE_IDS)) {
    throw new Error(`Unsupported entity_type "${entity_type}"`);
  }

  return {
    and: SLICE_IDS[entity_type].map((slice_id) => ({
      "==": [{ var: slice_id }, null],
    })),
  };
};

const convertExpr = (expr: any, entity_type: string) => {
  if (!expr) {
    return null;
  }

  if (expr.and) {
    return expr;
  }

  if (!(entity_type in REGEXES)) {
    throw new Error(`Unsupported entity_type "${entity_type}"`);
  }

  const nextExpr = templateExpr(entity_type);
  const entity_label = expr["=="][1];
  const parts = REGEXES.compound_experiment.exec(entity_label) as any;

  // eslint-disable-next-line prefer-destructuring
  nextExpr.and[0]["=="][1] = parts[1];
  // eslint-disable-next-line prefer-destructuring
  nextExpr.and[1]["=="][1] = parts[2];

  return nextExpr;
};

const stripNullValuesFromExpression = (expr: any) => {
  if (!expr?.and) {
    return true;
  }

  const result = {
    and: expr.and.filter((subexpr: any) => {
      return subexpr["=="][1] !== null;
    }),
  };

  return result.and.length === 0 ? true : result;
};

const stripSliceIdFromExpression = (expr: any, slice_id: string) => {
  if (!expr?.and) {
    return true;
  }

  const result = {
    and: expr.and.filter((subexpr: any) => {
      return subexpr["=="][0].var !== slice_id;
    }),
  };

  return result.and.length === 0 ? true : result;
};

const sliceToPlaceholder = (entity_type: string, slice_id: string) => {
  const entityLabel = (metdataSlices as any)[entity_type][slice_id];

  return `Select ${entityLabel}…`;
};

const toEntityLabel = (expr: any, entity_type: string) => {
  if (entity_type === "compound_dose_replicate") {
    return expr.and
      .slice(1)
      .map((subexpr: any) => subexpr["=="][1])
      .join(" ");
  }

  return expr.and.map((subexpr: any) => subexpr["=="][1]).join(" ");
};

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function PartSelector({
  show,
  slice_id,
  entity_type,
  candidates,
  value,
  onChange,
  isLoading,
}: any) {
  const subLabels = candidates.map((label: string) => {
    const data: any = labelToData(label, entity_type);
    return data[slice_id];
  });

  const options = [...new Set(subLabels)]
    .sort(collator.compare)
    .map((label: string) => ({ label, value: label }));

  return (
    <PlotConfigSelect
      enable
      isClearable
      show={show}
      label={null}
      placeholder={sliceToPlaceholder(entity_type, slice_id)}
      options={options}
      value={value}
      onChange={onChange}
      isLoading={isLoading}
      width={
        slice_id === "slice/compound_dose_replicate/replicate/label"
          ? "max-content"
          : 250
      }
    />
  );
}

const shouldShowPart = (expr: any, slice_id: string) => {
  if (slice_id === "slice/compound_experiment/compound_instance/label") {
    return expr?.and?.[0]["=="][1] || expr?.and?.[1]["=="][1];
  }

  return true;
};

const findCandidates = (
  expr: any,
  slice_id: string,
  entity_type: string,
  allLabels: string[]
) => {
  let testExpr = stripNullValuesFromExpression(expr);
  testExpr = stripSliceIdFromExpression(testExpr, slice_id);

  return filterLabels(allLabels, entity_type, testExpr);
};

const inferDefaultValues = (
  expr: any,
  entity_type: string,
  allLabels: string[],
  ignoreIndex: number
) => {
  let nextExpr = expr;

  expr?.and?.forEach((subexpr: any, index: number) => {
    if (index === ignoreIndex) {
      return;
    }

    const slice_id = subexpr["=="][0].var;

    const candidates = findCandidates(expr, slice_id, entity_type, allLabels);

    if (candidates.length === 1) {
      const data = labelToData(candidates[0], entity_type);
      const nextValue = data[slice_id];

      nextExpr = contextBuilderReducer(expr, {
        type: "update-value",
        payload: {
          path: ["and", index, "==", 1],
          value: nextValue,
        },
      });
    }
  });

  return nextExpr;
};

const shouldClearAll = (entity_type: string) => {
  if (entity_type === "compound_experiment") {
    return true;
  }

  return false;
};

const computeNextExpr = (
  expr: any,
  nextValue: string | null,
  index: number,
  entity_type: string,
  allLabels: string[]
) => {
  if (nextValue === null && shouldClearAll(entity_type)) {
    return templateExpr(entity_type);
  }

  let nextExpr = contextBuilderReducer(expr, {
    type: "update-value",
    payload: {
      path: ["and", index, "==", 1],
      value: nextValue,
    },
  });

  nextExpr = inferDefaultValues(nextExpr, entity_type, allLabels, index);

  return nextExpr;
};

function MultiPartEntitySelector({
  entity_type,
  value,
  onChange,
  dataset_id,
  swatchColor,
}: any) {
  const [expr, setExpr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allLabels, setAllLabels] = useState([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      if (dataset_id) {
        const labels = await fetchEntityLabelsOfDataset(
          entity_type,
          dataset_id
        );
        setAllLabels(labels);
      } else {
        const labels = await fetchEntityLabels(entity_type);
        setAllLabels(labels);
      }

      setIsLoading(false);
    })();
  }, [dataset_id, entity_type]);

  useEffect(() => {
    if (value?.expr) {
      setExpr(convertExpr(value.expr, entity_type));
    } else {
      setExpr(templateExpr(entity_type));
    }
  }, [value, entity_type]);

  const handleChange = useCallback(
    (nextValue: string | null, index: number) => {
      const nextExpr = computeNextExpr(
        expr,
        nextValue,
        index,
        entity_type,
        allLabels
      );

      setExpr(nextExpr);

      onChange({
        name: toEntityLabel(nextExpr, entity_type),
        context_type: entity_type,
        expr: nextExpr,
      });
    },
    [entity_type, expr, onChange, allLabels]
  );

  return (
    <div className={styles.MultiPartEntitySelector}>
      {expr?.and?.map((subexpr: any, index: number) => {
        const slice_id = subexpr["=="][0].var;
        const partValue = subexpr["=="][1] || null;

        const candidates = findCandidates(
          expr,
          slice_id,
          entity_type,
          allLabels
        );

        return (
          <div key={slice_id} className={styles.entitySelect}>
            {swatchColor && index === 0 && (
              <span
                className={styles.swatch}
                style={{ backgroundColor: swatchColor }}
              />
            )}
            <PartSelector
              show={shouldShowPart(expr, slice_id)}
              slice_id={slice_id}
              entity_type={entity_type}
              candidates={candidates}
              value={partValue}
              isLoading={isLoading}
              onChange={(nextValue: string) => handleChange(nextValue, index)}
            />
          </div>
        );
      })}
    </div>
  );
}

export default MultiPartEntitySelector;
