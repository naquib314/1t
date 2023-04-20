import React, { useEffect, useState } from "react";
import cx from "classnames";
import { evaluateContext } from "src/data-explorer-2/api";
import { Button } from "react-bootstrap";
import { isCompleteExpression } from "src/data-explorer-2/utils";
import {
  isBoolean,
  isComparison,
  normalizeExpr,
} from "src/data-explorer-2/components/ContextBuilder/contextBuilderUtils";
import GroupExpr from "src/data-explorer-2/components/ContextBuilder/GroupExpr";
import Comparison from "src/data-explorer-2/components/ContextBuilder/Comparison";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

const MAX_CONDITIONS = 10;

interface ExpressionProps {
  expr: any;
  path: (string | number)[];
  dispatch: any;
  entity_type: any;
  shouldShowValidation: boolean;
  isLastOfList?: boolean;
}

function Expression({
  expr,
  path,
  dispatch,
  entity_type,
  shouldShowValidation,
  isLastOfList,
}: ExpressionProps): React.ReactElement {
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      if (isCompleteExpression(expr)) {
        const fetchedResult = await evaluateContext(
          {
            context_type: entity_type,
            expr: normalizeExpr(expr),
          },
          true
        );
        setResult(fetchedResult);
      } else {
        setResult(null);
      }
    })();
  }, [expr, entity_type]);

  if (isBoolean(expr)) {
    return (
      <GroupExpr
        expr={expr}
        path={path}
        dispatch={dispatch}
        entity_type={entity_type}
        shouldShowValidation={shouldShowValidation}
        result={result}
      />
    );
  }

  if (isComparison(expr)) {
    const numConditions = +path.slice().pop() + 1;

    return (
      <div className={cx({ [styles.topLevelRule]: path.length < 3 })}>
        <div className={styles.comparisonExpr}>
          <Comparison
            expr={expr}
            path={path}
            dispatch={dispatch}
            entity_type={entity_type}
            shouldShowValidation={shouldShowValidation}
          />
          <div>
            <div>
              {path.length > 0 && (
                <Button
                  id="delete-condition"
                  style={{ height: 38 }}
                  onClick={() => {
                    dispatch({ type: "delete-condition", payload: { path } });
                  }}
                >
                  <i className="glyphicon glyphicon-trash" />
                </Button>
              )}
              {path.length > 0 && (path.length < 3 || isLastOfList) && (
                <Button
                  id="add-condition"
                  style={{ marginLeft: 6, height: 38 }}
                  disabled={numConditions >= MAX_CONDITIONS}
                  onClick={() => {
                    if (path.length < 3) {
                      dispatch({ type: "convert-to-group", payload: { path } });
                    } else {
                      dispatch({
                        type: "add-condition",
                        payload: { path: path.slice(0, -1) },
                      });
                    }
                  }}
                >
                  <i className="glyphicon glyphicon-plus" />
                </Button>
              )}
            </div>
            {result && (
              <div className={styles.subexprResult}>
                {result.num_matches.toLocaleString()}
                {result.num_matches === 1 ? " match" : " matches"}
              </div>
            )}
          </div>
        </div>
        {expr?.in?.[1] === null && (
          <div className={styles.listInputHint}>
            Hint: You can paste lists of values into the input above.
          </div>
        )}
      </div>
    );
  }

  return <div className={styles.Expression}>⚠️ Unknown expression</div>;
}

Expression.defaultProps = {
  isLastOfList: false,
};

export default Expression;
