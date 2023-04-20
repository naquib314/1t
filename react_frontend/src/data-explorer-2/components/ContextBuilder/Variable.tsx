/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useMemo, useState } from "react";
import cx from "classnames";
import Select, { createFilter } from "react-windowed-select";
import metadata from "src/data-explorer-2/json/metadata-slices.json";
import { fetchDatasetsByIndexType } from "src/data-explorer-2/api";
import { capitalize, getDimensionTypeLabel } from "src/data-explorer-2/utils";
import VariableEntity from "src/data-explorer-2/components/ContextBuilder/VariableEntity";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

const findSliceId = (value: string | null, sliceLabels: any) => {
  if (value && sliceLabels) {
    const sliceIds = Object.keys(sliceLabels);

    for (let i = 0; i < sliceIds.length; i += 1) {
      if (value.includes(sliceIds[i])) {
        return sliceIds[i];
      }
    }
  }

  return null;
};

const isCustomSlice = (value: string | null, sliceLabels: any) => {
  if (!value || !value.startsWith("slice/")) {
    return false;
  }

  if (value.endsWith("/")) {
    return true;
  }

  return Boolean(findSliceId(value, sliceLabels));
};

const toOptions = (labels: string[]) =>
  Object.entries(labels).map(([value, label]) => ({
    value,
    label,
  }));

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

function Variable({
  value,
  path,
  onChangeDataSelect,
  dispatch,
  entity_type,
  shouldShowValidation,
}: any) {
  const [datasets, setDatasets] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDatasetsByIndexType();
        const fetchedDatasets = data?.[entity_type] || [];
        setDatasets(fetchedDatasets);
      } catch (e) {
        window.console.error(e);
      }
    })();
  }, [entity_type]);

  const sliceLabels = useMemo(
    () =>
      (datasets || []).reduce(
        (memo: any, dataset: any) => ({
          ...memo,
          [`slice/${dataset.dataset_id}/`]: dataset.label,
        }),
        {}
      ),
    [datasets]
  );

  const labels: any = useMemo(() => {
    const base: Record<string, string> = {};

    if (entity_type === "depmap_model") {
      base.entity_label = "Depmap ID";
    }
    if (entity_type === "compound_experiment") {
      if (value === "entity_label") {
        base.entity_label = "Compound/experiment ID";
      }
    } else {
      base.entity_label = `${capitalize(
        getDimensionTypeLabel(entity_type)
      )} name`;
    }

    return {
      ...base,
      ...(entity_type in metadata ? (metadata as any)[entity_type] : {}),
      ...(sliceLabels || {}),
    };
  }, [sliceLabels, entity_type, value]);

  // A partial slice is used to select the dataset only.
  // A complete slice also contains a specific entity.
  const valueOrPartialSlice = isCustomSlice(value, sliceLabels)
    ? findSliceId(value, sliceLabels)
    : value;

  const dataset_id = findSliceId(value, sliceLabels)
    ?.replace("slice/", "")
    ?.slice(0, -1);
  const varEntityType = datasets?.find((d: any) => d.dataset_id === dataset_id)
    ?.entity_type;

  return (
    <div>
      <Select
        className={cx(styles.varSelect, {
          [styles.invalidSelect]: shouldShowValidation && !valueOrPartialSlice,
        })}
        styles={selectStyles}
        isLoading={!sliceLabels}
        value={
          valueOrPartialSlice && {
            value: valueOrPartialSlice,
            label: labels[valueOrPartialSlice],
          }
        }
        options={toOptions(labels)}
        onChange={onChangeDataSelect}
        placeholder="Select data…"
        menuPortalTarget={document.querySelector("#modal-container")}
        // See https://github.com/JedWatson/react-select/issues/3403#issuecomment-480183854
        filterOption={createFilter({
          matchFrom: "any",
          stringify: (option: any) => `${option.label}`,
        })}
      />
      {isCustomSlice(value, sliceLabels) && (
        <VariableEntity
          value={value}
          path={path}
          dispatch={dispatch}
          dataset_id={dataset_id}
          entity_type={varEntityType}
          shouldShowValidation={shouldShowValidation}
        />
      )}
    </div>
  );
}

export default Variable;
