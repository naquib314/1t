/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import ReactSelect, { createFilter } from "react-windowed-select";
import { Checkbox } from "react-bootstrap";
import { Tooltip } from "shared/common/components/Tooltip";
import {
  DataExplorerContext,
  DataExplorerPlotConfig,
} from "src/data-explorer-2/types";
import metdataSlices from "src/data-explorer-2/json/metadata-slices.json";
import MultiPartEntitySelector from "src/data-explorer-2/components/ConfigurationPanel/MultiPartEntitySelector";
import OptimizedSelectOption from "src/data-explorer-2/components/OptimizedSelectOption";
import {
  fetchDatasetsByIndexType,
  fetchDatasetsMatchingContext,
  fetchEntityLabels,
  fetchEntityLabelsOfDataset,
} from "src/data-explorer-2/api";
import {
  capitalize,
  contextToHash,
  getDimensionTypeLabel,
  isCompleteExpression,
  loadContextsFromLocalStorage,
  negateContext,
  pluralize,
  sortDimensionTypes,
} from "src/data-explorer-2/utils";
import styles from "src/data-explorer-2/styles/ConfigurationPanel.scss";

type ColorByOptions = DataExplorerPlotConfig["color_by"];

// See https://github.com/JedWatson/react-select/issues/3403#issuecomment-480183854
const workaroundFilter = createFilter({
  matchFrom: "any",
  stringify: (option: any) => `${option.label}`,
});

interface PlotConfigSelectProps {
  label: string | null;
  placeholder: string;
  /*
   * react-select uses options formatted like:
   * [{ value: 'a', label: 'Label A' }, { value: 'b', label: 'Label B' }]
   *
   * To simplify things, this component also accepts options formatted like:
   * { a: 'Label A', b: 'Label B' }
   *
   * The simplified format is preferred. But if you need to group options, you
   * can use react-select's format. Regardless, `value` should always be a string
   * and not the { value, label } format that react-select uses.
   */
  options: Record<string, string> | object[];
  value: string;
  show: boolean;
  enable: boolean;
  onChange: (value: string) => void;
  width?: number | "max-content";
  isLoading?: boolean;
  isClearable?: boolean;
  inlineLabel?: boolean;
  hasError?: boolean;
  filterOption?: any;
}

function createOutGroups(contexts: Record<string, DataExplorerContext>) {
  const out: Record<string, any> = {};

  if (!contexts) {
    return out;
  }

  Object.keys(contexts).forEach((contextHash: string) => {
    if (contextHash !== "all" && contextHash !== "new") {
      const context = contexts[contextHash];
      const negated = negateContext(context);
      out[contextToHash(negated)] = negated;
    }
  });

  return out;
}

// Turns react-select's nestable options into a flat lookup table.
function reactSelectOptionsToMap(
  options: { value: string; label: string; options: any }[]
) {
  let out: Record<string, string> = {};

  for (let i = 0; i < options.length; i += 1) {
    const opt = options[i];

    if (opt.value) {
      out[opt.value] = opt.label;
    }

    if (opt.options) {
      const nestedOpts = reactSelectOptionsToMap(opt.options);
      out = { ...out, ...nestedOpts };
    }
  }

  return out;
}

export function PlotConfigSelect({
  label,
  inlineLabel,
  placeholder,
  options,
  show,
  enable,
  value,
  isLoading,
  isClearable,
  onChange,
  width,
  hasError,
  filterOption,
}: PlotConfigSelectProps) {
  const [menuPlacement, setMenuPlacement] = useState("bottom");
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef(null);

  const calcMenuPlacement = useCallback(() => {
    if (ref.current) {
      const offsetTop = ref.current.offsetTop - ref.current.scrollTop;
      const nextMenuPlacement =
        offsetTop > window.innerHeight - 210 ? "top" : "bottom";

      if (menuPlacement !== nextMenuPlacement) {
        setIsTruncated(false);
        setMenuPlacement(nextMenuPlacement);
      }
    }
  }, [menuPlacement, setMenuPlacement]);

  useLayoutEffect(() => {
    if (ref.current) {
      const parent = ref.current.querySelector("span > div > div > div");
      const el = parent.querySelector("div");
      setIsTruncated(el.clientWidth > parent.clientWidth - 9);
    } else {
      setIsTruncated(false);
    }
  }, [value, isLoading]);

  if (!show) {
    return null;
  }

  const flattenedOptions = Array.isArray(options)
    ? reactSelectOptionsToMap(options as any[])
    : options;

  const toOption = (val: string) => {
    return val ? { value: val, label: flattenedOptions[val] } : null;
  };

  const formattedOptions = Array.isArray(options)
    ? options
    : Object.keys(options).map(toOption);

  const reactSelectValue = toOption(value);

  const MaybeTooltip =
    reactSelectValue && isTruncated
      ? ({ children }: any) => (
          <Tooltip
            id="plot-config-tooltip"
            content={reactSelectValue.label}
            placement="top"
          >
            {children}
          </Tooltip>
        )
      : React.Fragment;

  return (
    <span className={styles.PlotConfigSelect} ref={ref}>
      {label && (
        <div
          className={cx(styles.selectorLabel, {
            [styles.inlineLabel]: inlineLabel,
          })}
        >
          <label>{label}</label>
        </div>
      )}
      <MaybeTooltip>
        <span
          onFocus={() => {
            const tooltip: HTMLElement | null = document.querySelector(
              '[role="tooltip"]'
            );

            if (tooltip) {
              tooltip.style.display = "none";
            }
          }}
        >
          <ReactSelect
            className={cx(styles.Select, { [styles.selectError]: hasError })}
            styles={{
              control: (base: any) => ({
                ...base,
                fontSize: 12,
              }),
              menu: (base: any) => ({
                ...base,
                fontSize: 12,
                minWidth: "100%",
                width,
              }),
            }}
            isDisabled={!enable}
            isClearable={isClearable}
            isLoading={isLoading}
            placeholder={placeholder}
            options={formattedOptions}
            value={reactSelectValue}
            onChange={(option: any) => onChange(option ? option.value : null)}
            menuPortalTarget={document.body}
            onMenuOpen={calcMenuPlacement}
            menuPlacement={menuPlacement}
            components={{ Option: OptimizedSelectOption }}
            filterOption={filterOption || workaroundFilter}
          />
        </span>
      </MaybeTooltip>
    </span>
  );
}

PlotConfigSelect.defaultProps = {
  width: "max-content",
  isLoading: false,
  isClearable: false,
  inlineLabel: false,
  hasError: false,
  filterOption: undefined,
};

export function PlotTypeSelector({ show, enable, value, dispatch }: any) {
  return (
    <PlotConfigSelect
      label="Plot Type"
      inlineLabel
      placeholder="Select type…"
      options={{
        density_1d: "Density 1D",
        scatter: "Scatter plot",
        correlation_heatmap: "Correlation heatmap",
      }}
      show={show}
      enable={enable}
      value={value}
      onChange={(plot_type: string) =>
        dispatch({ type: "select_plot_type", payload: plot_type })
      }
    />
  );
}

export function PointsSelector({
  show,
  enable,
  value,
  plot_type,
  dispatch,
}: any) {
  const [datasetsByIndexType, setDatasetsByIndexType] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDatasetsByIndexType();
        setDatasetsByIndexType(data);
      } catch (e) {
        window.console.error(e);
      }
    })();
  }, []);

  const types = sortDimensionTypes(
    Object.keys(datasetsByIndexType || {})
  ).filter((index_type: string) => {
    if (
      index_type === "other" &&
      value !== "other" &&
      plot_type === "scatter"
    ) {
      return false;
    }

    return true;
  });

  if (value && !types.includes(value)) {
    // Also add the currently selected index_type (just in case we're viewing
    // an old plot that was generated when different options were present).
    types.push(value);
  }

  const options = types.reduce(
    (memo: any, index_type: any) => ({
      ...memo,
      [index_type]: capitalize(pluralize(getDimensionTypeLabel(index_type))),
    }),
    {}
  );

  return (
    <div>
      <PlotConfigSelect
        label="Points"
        inlineLabel
        placeholder="Select points…"
        options={options}
        show={show}
        enable={enable}
        value={value}
        isLoading={!datasetsByIndexType}
        onChange={(index_type: string) =>
          dispatch({
            type: "select_index_type",
            payload: index_type,
          })
        }
      />
    </div>
  );
}

export function AxisSelector({
  show,
  enable,
  label,
  plot_type,
  index_type,
  entity_type,
  axis_type,
  onChange,
}: any) {
  const [datasetsByIndexType, setDatasetsByIndexType] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDatasetsByIndexType();
        setDatasetsByIndexType(data);
      } catch (e) {
        window.console.error(e);
      }
    })();
  }, []);

  const datasets = datasetsByIndexType?.[index_type] || [];
  const entityTypes = new Set<string>();

  datasets.forEach((dataset: any) => entityTypes.add(dataset.entity_type));
  // Also add the currently selected entity_type (just in case we're viewing an
  // old plot that was generated when different options were present).
  if (entity_type) {
    entityTypes.add(entity_type);
  }

  const options: Record<string, string> = {};

  sortDimensionTypes([...entityTypes]).forEach((dsEntityType: any) => {
    const formattedEntityType = capitalize(getDimensionTypeLabel(dsEntityType));

    if (plot_type !== "correlation_heatmap") {
      options[`${dsEntityType}_entity`] = formattedEntityType;
    }

    if (dsEntityType !== "other" || entity_type === "other") {
      options[`${dsEntityType}_context`] = `${formattedEntityType} Context`;
    }
  });

  const formattedValue =
    entity_type && axis_type ? `${entity_type}_${axis_type}` : null;

  return (
    <PlotConfigSelect
      show={show}
      enable={enable}
      value={formattedValue}
      label={label}
      options={options}
      placeholder="Select type…"
      isLoading={!datasetsByIndexType}
      onChange={(option: string) => {
        const nextAxisType = option.endsWith("_entity") ? "entity" : "context";
        const nextEntityType = option.replace(/_(entity|context)$/, "");
        onChange(nextAxisType, nextEntityType);
      }}
    />
  );
}

export function DatasetSelector({
  show,
  enable,
  value,
  index_type,
  entity_type,
  selectedContext,
  onChange,
}: any) {
  const [datasetsByIndexType, setDatasetsByIndexType] = useState(null);
  const [contextDatasetIds, setContextDatasetIds] = useState(null);
  const [isEvaluatingContext, setIsEvaluatingContext] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDatasetsByIndexType();
        setDatasetsByIndexType(data);
      } catch (e) {
        window.console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedContext && isCompleteExpression(selectedContext.expr)) {
        try {
          setIsEvaluatingContext(true);
          const ids = await fetchDatasetsMatchingContext(selectedContext);
          setContextDatasetIds(ids);
        } catch (e) {
          window.console.error(e);
        } finally {
          setIsEvaluatingContext(false);
        }
      } else {
        setContextDatasetIds(null);
      }
    })();
  }, [selectedContext]);

  const datasets = datasetsByIndexType?.[index_type] || [];

  const options = isEvaluatingContext
    ? {}
    : datasets
        .filter((dataset: any) => dataset.entity_type === entity_type)
        .filter(
          (dataset: any) =>
            dataset.dataset_id === value ||
            !contextDatasetIds ||
            contextDatasetIds.includes(dataset.dataset_id)
        )
        .reduce(
          (memo: any, dataset: any) => ({
            ...memo,
            [dataset.dataset_id]: dataset.label,
          }),
          {}
        );

  // Edge case: It's possible the user is viewing a dataset that we removed or
  // revoked. In that case, we don't know what it's called but we can provide
  // the dataset_id for debugging purposes.
  if (
    value &&
    datasetsByIndexType &&
    !isEvaluatingContext &&
    !Object.keys(options).includes(value)
  ) {
    options[value] = `Unknown dataset (${value})`;

    window.console.warn(
      "This plot was saved with a removed or revoked dataset."
    );
    window.console.warn(`Dataset ID: ${value}`);
  }

  const notFound =
    value && contextDatasetIds && !contextDatasetIds.includes(value);

  const getEntityType = (dataset_id: string) => {
    const dataset = datasets.find((d: any) => d.dataset_id === dataset_id);
    return dataset.entity_type;
  };

  return (
    <div className={styles.datasetSelector}>
      <PlotConfigSelect
        label="Data"
        placeholder="Choose data type…"
        options={options}
        show={show}
        enable={enable}
        value={value}
        hasError={notFound}
        isLoading={!datasetsByIndexType || isEvaluatingContext}
        isClearable
        filterOption={notFound ? (option: any) => option.value !== value : null}
        onChange={(dataset_id: string | null) => {
          if (dataset_id) {
            onChange(dataset_id, getEntityType(dataset_id));
          } else {
            onChange(null, null);
          }
        }}
      />
    </div>
  );
}

function SinglePartEntitySelector({
  enable,
  value,
  entity_type,
  dataset_id,
  swatchColor,
  onChange,
}: any) {
  const [entityLabels, setEntityLabels] = useState(null);

  useEffect(() => {
    (async () => {
      if (entity_type) {
        try {
          setEntityLabels(null);
          let data: any = null;

          if (dataset_id) {
            data = await fetchEntityLabelsOfDataset(entity_type, dataset_id);
          } else {
            data = await fetchEntityLabels(entity_type);
          }

          setEntityLabels(data);
        } catch (e) {
          window.console.error(e);
        }
      }

      if (!entity_type) {
        setEntityLabels(null);
      }
    })();
  }, [entity_type, dataset_id]);

  // important to memoize -- this list may contain thousands of elements
  const options = useMemo(() => {
    const out: Record<string, string> = {};

    if (!entityLabels) {
      return out;
    }

    for (let i = 0; i < entityLabels.length; i += 1) {
      const label = entityLabels[i];
      out[label] = label;
    }

    return out;
  }, [entityLabels]);

  const isLoading = entityLabels === null;
  const rhsValue = value?.expr?.["=="]?.[1];
  // Indicates that the entity is not part of the selected dataset. This can't
  // happen if the dataset is selected first but can happen if it is changed
  // later.
  const notFound = !isLoading && rhsValue && !(rhsValue in options);

  const placeholder = notFound
    ? `${rhsValue.slice(0, 15)} not found`
    : `Select ${getDimensionTypeLabel(entity_type)}…`;

  return (
    <div className={styles.entitySelect}>
      {swatchColor && (
        <span
          className={styles.swatch}
          style={{ backgroundColor: swatchColor }}
        />
      )}
      <PlotConfigSelect
        width={300}
        label={null}
        placeholder={placeholder}
        options={options}
        show
        enable={enable}
        value={notFound ? null : rhsValue}
        hasError={notFound}
        isLoading={isLoading}
        onChange={onChange}
        isClearable
      />
    </div>
  );
}

export function EntitySelector(props: any) {
  const { show, entity_type } = props;

  if (!show) {
    return null;
  }

  if (entity_type === "compound_experiment") {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MultiPartEntitySelector {...props} />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <SinglePartEntitySelector {...props} />;
}

export function ContextSelector({
  show,
  enable,
  value,
  label,
  context_type,
  includeAllInOptions,
  swatchColor,
  onClickCreateContext,
  onClickSaveAsContext,
  onChange,
}: any) {
  const loadedContexts = loadContextsFromLocalStorage(context_type);
  const outGroups = createOutGroups(loadedContexts);
  const forceUpdate = useReducer(() => ({}), {})[1];
  const [reactKey, setReactKey] = useState(1);

  useEffect(() => {
    window.addEventListener("dx2_contexts_updated", forceUpdate);
    return () =>
      window.removeEventListener("dx2_contexts_updated", forceUpdate);
  });

  const contexts: Record<string, any> = {
    all: { name: "All", context_type, expr: true },
    ...loadedContexts,
    ...outGroups,
  };

  const hashOfSelectedValue = value ? contextToHash(value) : null;
  let shouldShowSaveButton = false;

  if (
    hashOfSelectedValue &&
    !contexts[hashOfSelectedValue] &&
    context_type !== "other"
  ) {
    contexts[hashOfSelectedValue] = value;
    shouldShowSaveButton = true;
  }

  const toOptions = (contextGroup: Record<string, any>) => {
    const out: any[] = [];

    Object.keys(contextGroup).forEach((hash: string) => {
      out.push({
        label: contextGroup[hash].name,
        value: hash,
      });
    });

    return out;
  };

  const unsavedContexts =
    value &&
    hashOfSelectedValue !== "all" &&
    !(hashOfSelectedValue in loadedContexts) &&
    !(hashOfSelectedValue in outGroups)
      ? {
          label: "Unsaved Contexts",
          options: [
            {
              label: value.name,
              value: hashOfSelectedValue,
            },
          ],
        }
      : null;

  const options = [
    includeAllInOptions ? { label: "All", value: "all" } : null,
    { label: "New", value: "new" },
    value && hashOfSelectedValue !== "all" && !shouldShowSaveButton
      ? { label: "Edit current", value: "edit" }
      : null,
    unsavedContexts,
    { label: "My Contexts", options: toOptions(loadedContexts) },
    { label: "Out Groups", options: toOptions(outGroups) },
  ].filter(Boolean);

  if (!show) {
    return null;
  }

  return (
    <div className={styles.contextSelectorContainer}>
      <div className={styles.contextSelector}>
        {swatchColor && (
          <span
            className={styles.swatch}
            style={{ backgroundColor: swatchColor }}
          />
        )}
        <PlotConfigSelect
          key={`${reactKey}`}
          label={label}
          width={300}
          placeholder="Choose context…"
          options={options}
          show
          enable={enable && context_type !== "other"}
          value={hashOfSelectedValue}
          isClearable
          onChange={(contextHash: string) => {
            if (contextHash === "new") {
              onClickCreateContext();
              // Fixes a bug where this select becomes unclickable if you cancel
              // the Context Editor.
              setReactKey((k) => -k);
            } else if (contextHash === "edit") {
              (window as any).DepMap.editContext(value, hashOfSelectedValue);
              setReactKey((k) => -k);
            } else {
              onChange(contexts[contextHash] || null);
            }
          }}
        />
      </div>
      {shouldShowSaveButton && (
        <button
          className={styles.saveAsContextButton}
          type="button"
          onClick={onClickSaveAsContext}
        >
          Save as context +
        </button>
      )}
    </div>
  );
}

export function AggregationSelector({ show, enable, value, onChange }: any) {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.aggregationSelector}>
      <PlotConfigSelect
        label="Aggregate"
        inlineLabel
        placeholder="Choose a method…"
        options={{
          mean: "Mean",
          median: "Median",
          "25%tile": "25%tile",
          "75%tile": "75%tile",
        }}
        show
        enable={enable}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function ColorByTypeSelector({
  show,
  enable,
  value,
  entity_type,
  onChange,
}: any) {
  const entityTypeLabel = capitalize(getDimensionTypeLabel(entity_type));

  const options: Partial<Record<ColorByOptions, string>> = {
    entity: entityTypeLabel,
  };

  if (entity_type !== "other") {
    options.context = `${entityTypeLabel} Context`;
  }

  if (
    Object.keys(metdataSlices).includes(entity_type) &&
    // FIXME: We want to hide "compound" and "experiment" which are custom
    // slices that are useful for making contexts but NOT for coloring. For
    // now, we'll completely hide this option because there are no useful
    // selections. In the future, we'll want a way to hide those just those two
    // slices.
    entity_type !== "compound_experiment"
  ) {
    options.property = `${entityTypeLabel} Property`;
  }

  if (entity_type !== "other") {
    options.custom = "Custom";
  }

  return (
    <div className={styles.colorBySelector}>
      <PlotConfigSelect
        label="Color by"
        placeholder="Choose type…"
        options={options}
        show={show}
        enable={enable}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function DatasetMetadataSelector({
  show,
  enable,
  entity_type,
  value,
  onChange,
}: any) {
  const options = {
    ...(metdataSlices as any)[entity_type],
  };

  if (typeof value === "string" && !(value in options)) {
    options[value] = "(unknown property)";
  }

  return (
    <div className={styles.colorBySelector}>
      <PlotConfigSelect
        label={null}
        placeholder="Choose property…"
        show={show}
        enable={enable}
        value={value}
        options={options}
        onChange={onChange}
        isClearable
      />
    </div>
  );
}

export function SortBySelector({ show, enable, value, onChange }: any) {
  return (
    <PlotConfigSelect
      label="Sort by"
      placeholder="Select sort…"
      options={{
        mean_values_asc: "Mean values (ascending)",
        mean_values_desc: "Mean values (descending)",
        max_values: "Max values",
        min_values: "Min values",
        alphabetical: "Alphabetical",
      }}
      show={show}
      enable={enable}
      value={value}
      onChange={onChange}
    />
  );
}

export function ShowPointsCheckbox({ show, value, onChange }: any) {
  if (!show) {
    return null;
  }

  return (
    <Checkbox
      className={styles.ShowPointsCheckbox}
      checked={value}
      onChange={(e) => onChange((e.target as any).checked)}
    >
      <span>Show points</span>
    </Checkbox>
  );
}

export function UseClusteringCheckbox({ show, value, onChange }: any) {
  if (!show) {
    return null;
  }

  return (
    <Checkbox
      checked={value}
      onChange={(e) => onChange((e.target as any).checked)}
    >
      <span>Use clustering</span>
    </Checkbox>
  );
}
