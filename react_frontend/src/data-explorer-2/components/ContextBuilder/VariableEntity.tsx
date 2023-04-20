/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";
import Select from "react-windowed-select";
import { getDimensionTypeLabel } from "src/data-explorer-2/utils";
import { isPartialSlice } from "src/data-explorer-2/components/ContextBuilder/contextBuilderUtils";
import { fetchEntityLabelsOfDataset } from "src/data-explorer-2/api";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

const entityLabelFromSliceId = (slice_id?: string, dataset_id?: string) => {
  if (!slice_id && !dataset_id) {
    return null;
  }

  return slice_id.replace(`slice/${dataset_id}/`, "").replace(/\/[^/]*$/, "");
};

const selectStyles = {
  control: (base: any) => ({
    ...base,
    fontSize: 13,
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: 12,
    minWidth: "100%",
    width: "max-content",
  }),
};

function VariableEntity({
  value,
  path,
  entity_type,
  dataset_id,
  dispatch,
  shouldShowValidation,
}: any) {
  const ref = useRef(null);
  const [entityLabels, setEntityLabels] = useState(null);

  useEffect(() => {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  useEffect(() => {
    let unmounted = false;

    (async () => {
      if (dataset_id) {
        try {
          const data = await fetchEntityLabelsOfDataset(
            entity_type,
            dataset_id
          );

          if (!unmounted) {
            setEntityLabels(data);
          }
        } catch (e) {
          window.console.error(e);
        }
      }
    })();

    return () => {
      unmounted = true;
    };
  }, [entity_type, dataset_id]);

  const options = useMemo(() => {
    const out: any = [];

    if (!entityLabels) {
      return null;
    }

    for (let i = 0; i < entityLabels.length; i += 1) {
      const label = entityLabels[i];
      out.push({ label, value: label });
    }

    return out;
  }, [entityLabels]);

  const handleChange = (option: any) => {
    const featureType =
      entity_type === "depmap_model" ? "transpose_label" : "label";
    const nextSliceId = `slice/${dataset_id}/${option.value}/${featureType}`;
    const parentPath = path.slice(0, -2);

    dispatch({
      type: "update-value",
      payload: {
        path: parentPath,
        value: { ">": [{ var: nextSliceId }, null] },
      },
    });
  };

  const selectedLabel = entityLabelFromSliceId(value, dataset_id);
  const selectedValue = selectedLabel
    ? { label: selectedLabel, value: selectedLabel }
    : null;

  return (
    <div ref={ref} style={{ scrollMargin: 22 }}>
      <Select
        className={cx(styles.varEntitySelect, {
          [styles.invalidSelect]:
            shouldShowValidation && (!value || isPartialSlice(value)),
        })}
        styles={selectStyles}
        isLoading={!options}
        value={selectedValue}
        options={options}
        onChange={handleChange}
        placeholder={`Select ${getDimensionTypeLabel(entity_type)}…`}
        menuPortalTarget={document.querySelector("#modal-container")}
      />
    </div>
  );
}

export default VariableEntity;
