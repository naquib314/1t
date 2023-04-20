/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { get_values } from "json-logic-js";
import {
  fetchEntityLabels,
  fetchUniqueValuesOrRange,
} from "src/data-explorer-2/api";
import {
  floor,
  getOperator,
  isPartialSlice,
} from "src/data-explorer-2/components/ContextBuilder/contextBuilderUtils";
import Variable from "src/data-explorer-2/components/ContextBuilder/Variable";
import Operator from "src/data-explorer-2/components/ContextBuilder/Operator";
import List from "src/data-explorer-2/components/ContextBuilder/List";
import Constant from "src/data-explorer-2/components/ContextBuilder/Constant";
import NumberExpr from "src/data-explorer-2/components/ContextBuilder/NumberExpr";

function Comparison({
  expr,
  path,
  dispatch,
  entity_type,
  shouldShowValidation,
}: any) {
  const [summary, setSummary] = useState(null);
  const [, forceRender] = useState();
  const ref = useRef(null);

  useLayoutEffect(() => forceRender(null), []);

  useEffect(() => {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  const op = getOperator(expr);
  const [left, right] = expr[op];
  const leftPath = [...path, op, 0];
  const rightPath = [...path, op, 1];
  const slice_id = isPartialSlice(left?.var) ? null : left?.var;

  let RhsComponent = op === "in" ? List : Constant;
  let options = null;

  if (summary?.value_type === "continuous") {
    RhsComponent = NumberExpr;

    options = {
      min: summary.min,
      max: summary.max,
    };
  } else {
    options = summary?.unique_values.map((value: string) => ({
      value,
      label: value,
    }));
  }

  const handleChangeDataSelect = useCallback(
    (option: any) => {
      const operands = [{ var: option.value }, null];
      const nextValue = { "==": operands };

      dispatch({
        type: "update-value",
        payload: {
          path,
          value: nextValue,
        },
      });
    },
    [dispatch, path]
  );

  useEffect(() => {
    if (slice_id) {
      (async () => {
        setSummary(null);

        if (slice_id === "entity_label") {
          const labels = await fetchEntityLabels(entity_type);

          setSummary({ value_type: "categorical", unique_values: labels });
        } else {
          const fetchedOptions = await fetchUniqueValuesOrRange(slice_id);
          setSummary(fetchedOptions);
        }
      })();
    } else {
      setSummary(null);
    }
  }, [entity_type, slice_id]);

  useEffect(() => {
    if (summary) {
      const { value_type, min } = summary;

      if (value_type === "continuous") {
        const [lhs, rhs] = get_values(expr);

        if (op === ">" && rhs === null) {
          dispatch({
            type: "update-value",
            payload: {
              path,
              value: { ">": [lhs, floor(min)] },
            },
          });
        }
      }
    }
  }, [summary, expr, op, dispatch, path]);

  return (
    <div ref={ref} style={{ scrollMargin: 22 }}>
      <Variable
        value={left?.var || null}
        path={leftPath}
        dispatch={dispatch}
        onChangeDataSelect={handleChangeDataSelect}
        entity_type={entity_type}
        shouldShowValidation={shouldShowValidation}
      />
      <Operator
        expr={expr}
        path={path}
        op={op}
        dispatch={dispatch}
        value_type={summary?.value_type}
        isLoading={slice_id && !summary}
      />
      <RhsComponent
        key={slice_id}
        expr={right}
        path={rightPath}
        dispatch={dispatch}
        options={options}
        shouldShowValidation={shouldShowValidation}
      />
    </div>
  );
}

export default Comparison;
