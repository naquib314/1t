/* eslint react/jsx-props-no-spreading: "off" */
import React, { useCallback, useRef } from "react";
import cx from "classnames";
import Select from "react-windowed-select";
import OptimizedSelectOption from "src/data-explorer-2/components/OptimizedSelectOption";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

const selectStyles = {
  control: (base: any) => ({
    ...base,
    fontSize: 13,
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: 12,
    minWidth: "100%",
    width: 250,
  }),
};

function pastedTextToEntityLabels(pastedText: string) {
  const text = pastedText.trim();
  let separator: string | RegExp = ",";

  if (/\r?\n/.test(text)) {
    separator = /\r?\n/;
  }

  if (text.includes("\t")) {
    separator = "\t";
  }

  const out = text
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);

  if (out.length > 500) {
    // eslint-disable-next-line no-alert
    window.alert("Sorry, too many values. Try pasting under 500.");
    return [];
  }

  return out;
}

function List({ expr, path, dispatch, options, shouldShowValidation }: any) {
  const ref = useRef(null);

  const handleCopy = useCallback(
    (e: any) => {
      if (expr) {
        e.clipboardData.setData("text/plain", expr.join("\r\n"));
      }

      e.preventDefault();
    },
    [expr]
  );

  const handlePaste = useCallback(
    (e: any) => {
      const pastedText = (
        e.clipboardData || (window as any).clipboardData
      ).getData("text");

      const pastedLabels = pastedTextToEntityLabels(pastedText);
      const uniqueLabels = new Set([...(expr || []), ...pastedLabels]);

      dispatch({
        type: "update-value",
        payload: {
          path,
          value: [...uniqueLabels],
        },
      });

      e.preventDefault();
    },
    [expr, path, dispatch]
  );

  return (
    <div
      className={styles.listSelectContainer}
      onCopy={handleCopy}
      onPaste={handlePaste}
      ref={ref}
    >
      <Select
        isMulti
        isClearable={false}
        className={cx(styles.listSelect, {
          [styles.invalidSelect]: shouldShowValidation && !expr,
        })}
        styles={selectStyles}
        value={
          expr ? expr.map((value: string) => ({ value, label: value })) : null
        }
        onChange={(selections: any) => {
          const nextValue =
            selections?.length > 0
              ? selections.map(({ value }: any) => value)
              : null;

          dispatch({
            type: "update-value",
            payload: {
              path,
              value: nextValue,
            },
          });

          setTimeout(() => {
            ref.current.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }, 0);
        }}
        options={options}
        isDisabled={!options}
        placeholder="Select values…"
        menuPortalTarget={document.querySelector("#modal-container")}
        components={{ Option: OptimizedSelectOption }}
      />
    </div>
  );
}

export default List;
