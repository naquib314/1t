/* eslint-disable react/destructuring-assignment */
import React, { useReducer, useState } from "react";
import jsonBeautify from "json-beautify";
import {
  Button,
  Form,
  FormControl,
  FormGroup,
  ControlLabel,
} from "react-bootstrap";
import { isCompleteExpression } from "src/data-explorer-2/utils";
import contextBuilderReducer from "src/data-explorer-2/components/ContextBuilder/contextBuilderReducer";
import {
  denormalizeExpr,
  normalizeExpr,
} from "src/data-explorer-2/components/ContextBuilder/contextBuilderUtils";
import Expression from "src/data-explorer-2/components/ContextBuilder/Expression";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

type Expr = Record<string, any>;

const SHOW_DEBUG_INFO = false;

const emptyExpr: Expr = { "==": [null, null] };
const emptyGroup: Expr = denormalizeExpr(emptyExpr);

function ModalContent({ context, onClickSave, onClickCancel }: any) {
  const [name, setName] = useState(context.name || "");
  const [expr, dispatch] = useReducer(
    contextBuilderReducer,
    denormalizeExpr(context.expr) || emptyGroup
  );
  const [shouldShowValidation, setShouldShowValidation] = useState(false);

  const handleClickSave = () => {
    setShouldShowValidation(true);

    if (name && isCompleteExpression(expr)) {
      onClickSave({
        name,
        context_type: context.context_type,
        expr: normalizeExpr(expr),
      });
    }
  };

  return (
    <div className={styles.ModalContent}>
      <Form
        inline
        onSubmit={(e) => {
          e.preventDefault();
          handleClickSave();
        }}
        autoComplete="off"
      >
        <FormGroup
          validationState={(() => {
            if (!shouldShowValidation) {
              return null;
            }

            return name ? "success" : "error";
          })()}
        >
          <ControlLabel>Context name</ControlLabel>
          <FormControl
            className={styles.contextNameInput}
            name="context-name"
            type="text"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
            placeholder="Type a name…"
            autoComplete="off"
          />
        </FormGroup>
      </Form>
      <div className={styles.mainGroup}>
        <Expression
          expr={expr}
          path={[]}
          dispatch={dispatch}
          entity_type={context.context_type}
          shouldShowValidation={shouldShowValidation}
        />
      </div>
      {SHOW_DEBUG_INFO && (
        <div style={{ marginTop: 20 }}>
          <pre
            style={{
              border: `1px solid ${
                isCompleteExpression(expr) ? "#0a0" : "#f99"
              }`,
            }}
          >
            <code style={{ fontSize: 10 }}>
              {jsonBeautify(expr, null, 2, 80)}
            </code>
          </pre>
        </div>
      )}
      <div className={styles.footer}>
        <Button id="cancel-context-builder" onClick={onClickCancel}>
          Cancel
        </Button>
        <Button
          id="save-context-builder"
          bsStyle="primary"
          onClick={handleClickSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default ModalContent;
