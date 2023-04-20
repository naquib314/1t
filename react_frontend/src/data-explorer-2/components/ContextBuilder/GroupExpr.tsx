import React, { useRef, useEffect } from "react";
import cx from "classnames";
import { get_values } from "json-logic-js";
import { pluralize, getDimensionTypeLabel } from "src/data-explorer-2/utils";
import { getOperator } from "src/data-explorer-2/components/ContextBuilder/contextBuilderUtils";
import AnyAllSelect from "src/data-explorer-2/components/ContextBuilder/AnyAllSelect";
import Expression from "src/data-explorer-2/components/ContextBuilder/Expression";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

const MAX_CONDITIONS = 10;

function Result({ result, isTopLevel, entity_type }: any) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  return (
    <div
      className={styles.groupExprResult}
      ref={ref}
      style={{ scrollMargin: 24 }}
    >
      {!isTopLevel && <span className={styles.groupExprResultSeparator} />}
      <div className={styles.groupExprResultValue}>
        {isTopLevel ? (
          <>
            <span>{result.num_matches.toLocaleString()}</span>
            <span>of {result.num_candidates.toLocaleString()}</span>
            <span>{pluralize(getDimensionTypeLabel(entity_type))}</span>
          </>
        ) : (
          <>
            {result.num_matches.toLocaleString()}
            {result.num_matches === 1 ? " match" : " matches"}
          </>
        )}
      </div>
    </div>
  );
}

function Group({
  expr,
  path,
  dispatch,
  entity_type,
  shouldShowValidation,
  result,
}: any) {
  const container = useRef(null);
  const op = getOperator(expr);
  const isTopLevel = path.length === 0;
  const numConditions = get_values(expr).length;

  return (
    <div className={cx(styles.Group, { [styles.nestedGroup]: !isTopLevel })}>
      <AnyAllSelect path={path} value={op} dispatch={dispatch} />
      <div className={styles.groupExpr}>
        <div ref={container} className={cx({ [styles.mainExpr]: isTopLevel })}>
          {expr[op].map((subExpr: any, i: number) => (
            <div
              key={[...path, op, i].toString()}
              style={{ marginTop: i > 0 ? 10 : 0 }}
            >
              <Expression
                expr={subExpr}
                path={[...path, op, i]}
                dispatch={dispatch}
                entity_type={entity_type}
                shouldShowValidation={shouldShowValidation}
                isLastOfList={i === expr[op].length - 1}
              />
            </div>
          ))}
        </div>
        <div className={styles.groupSummary}>
          {isTopLevel ? (
            <button
              id="add-condition"
              type="button"
              className={styles.addButton}
              onClick={() => {
                dispatch({
                  type: "add-condition",
                  payload: { path: [...path, op] },
                });
              }}
              disabled={numConditions >= MAX_CONDITIONS}
            >
              + add condition
            </button>
          ) : (
            <div />
          )}
          {result && (
            <Result
              result={result}
              isTopLevel={isTopLevel}
              entity_type={entity_type}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Group;
