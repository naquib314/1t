import { get_operator, get_values } from "json-logic-js";

export const isBoolean = (expr: any) => expr?.and || expr?.or;

export const isComparison = (expr: any) =>
  ["==", "!=", "in", ">", ">=", "<", "<="].some((op) => expr && op in expr);

export const ceil = (num: number) =>
  Math.ceil((num + Number.EPSILON) * 100) / 100;

export const floor = (num: number) =>
  Math.floor((num + Number.EPSILON) * 100) / 100;

export const round = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const isPartialSlice = (value: string | null) =>
  value?.startsWith("slice/") && value?.endsWith("/");

export const opLabels = {
  "==": "is",
  "!=": "is not",
  in: "is in",
  or: "or",
  and: "and",
  ">": ">",
  ">=": "≥",
  "<": "<",
  "<=": "≤",
};

type Op = keyof typeof opLabels;

export const getOperator = (expr: any): Op => {
  const op = get_operator(expr);

  if (op) {
    return op as Op;
  }

  throw new Error(`Unknown operator ${Object.keys(expr)[0]}`);
};

export const isVar = (expr: any) => {
  return expr && expr.var;
};

// To make it easier to edit expressions, we want make sure there's a top-level
// boolean wrapper expression (even if it consists of a single subexpression).
export const denormalizeExpr = (expr: Record<string, any>) => {
  if (!expr) {
    return null;
  }

  return expr.and || expr.or ? expr : { and: [expr] };
};

// Before saving, we put such an expression back to normal.
export const normalizeExpr = (expr: Record<string, any>) => {
  if (get_values(expr).length > 1) {
    return expr;
  }

  const op = getOperator(expr);
  return expr[op][0];
};
