import React from "react";
import Select from "react-windowed-select";
import { opLabels } from "src/data-explorer-2/components/ContextBuilder/contextBuilderUtils";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

type OperatorType = keyof typeof opLabels;
type ValueType = "continuous" | "categorical";

const toOperatorLabel = (value_type: ValueType, op: any) => {
  if (value_type === "continuous" && op === "==") {
    return "=";
  }

  return (opLabels as any)[op];
};

const toOperatorOptions = (value_type: ValueType, operators: any[]) => {
  return operators.map((op) => {
    return {
      value: op,
      label: toOperatorLabel(value_type, op),
    };
  });
};

type Op = keyof typeof opLabels;

type Props = {
  expr: any;
  path: any;
  op: keyof typeof opLabels;
  dispatch: Function;
  value_type: ValueType;
  isLoading: boolean;
};

const getNextValue = (expr: any, op: Op, nextOp: Op) => {
  const [lhs, rhs] = expr[op];
  let nextValue = [lhs, rhs];

  if (op === "in") {
    nextValue = [lhs, rhs?.length ? rhs[0] : null];
  }

  if (nextOp === "in") {
    nextValue = [lhs, rhs ? [rhs] : null];
  }

  return {
    [nextOp]: nextValue,
  };
};

function Operator({ expr, op, path, dispatch, value_type, isLoading }: Props) {
  let options: OperatorType[] = [];

  if (value_type === "continuous") {
    options = [">", "<", ">=", "<="];
  }

  if (value_type === "categorical") {
    options = ["==", "!=", "in"];
  }

  return (
    <Select
      className={styles.opSelect}
      isLoading={isLoading}
      isDisabled={!isLoading && !value_type}
      value={
        value_type
          ? { value: op, label: toOperatorLabel(value_type, op) }
          : null
      }
      options={value_type ? toOperatorOptions(value_type, options) : null}
      onChange={(option: any) => {
        dispatch({
          type: "update-value",
          payload: {
            path,
            value: getNextValue(expr, op, option.value),
          },
        });
      }}
      menuPortalTarget={document.querySelector("#modal-container")}
      placeholder=""
    />
  );
}

export default Operator;
