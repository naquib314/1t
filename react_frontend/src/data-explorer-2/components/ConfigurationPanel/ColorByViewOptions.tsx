/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import { DataExplorerContext } from "src/data-explorer-2/types";
import {
  ColorByTypeSelector,
  EntitySelector,
  ContextSelector,
  DatasetMetadataSelector,
  SortBySelector,
} from "src/data-explorer-2/components/ConfigurationPanel/selectors";
import DimensionConfiguration from "src/data-explorer-2/components/ConfigurationPanel/DimensionConfiguration";
import {
  COMPARISON_COLOR_1,
  COMPARISON_COLOR_2,
} from "src/data-explorer-2/components/plot/prototype/plotUtils";
import styles from "src/data-explorer-2/styles/ConfigurationPanel.scss";

function ColorByViewOptions({
  show,
  plot,
  dispatch,
  onClickCreateContext,
  onClickSaveAsContext,
}: any) {
  if (!show) {
    return null;
  }

  const {
    index_type,
    plot_type,
    color_by,
    sort_by,
    dimensions,
    filters,
    metadata,
  } = plot;

  const dataset_id =
    dimensions?.x?.dataset_id || dimensions?.y?.dataset_id || null;

  return (
    <div className={styles.ColorByViewOptions}>
      <ColorByTypeSelector
        show
        enable={index_type}
        value={color_by}
        entity_type={index_type}
        onChange={(nextColorBy: string) =>
          dispatch({
            type: "select_color_by",
            payload: nextColorBy,
          })
        }
      />
      <div className={styles.colorByContext}>
        {["color1", "color2"].map((filterKey: "color1" | "color2") => (
          <React.Fragment key={filterKey}>
            <EntitySelector
              show={color_by === "entity"}
              enable={color_by === "entity"}
              entity_type={index_type}
              dataset_id={dataset_id}
              value={filters?.[filterKey]}
              swatchColor={
                filterKey === "color1" ? COMPARISON_COLOR_1 : COMPARISON_COLOR_2
              }
              onChange={(entity_label: string) => {
                dispatch({
                  type: "select_entity_label",
                  payload: {
                    path: ["filters", filterKey],
                    entity_type: index_type,
                    entity_label,
                  },
                });
              }}
            />
            <ContextSelector
              show={color_by === "context"}
              enable={color_by === "context"}
              value={filters?.[filterKey]}
              context_type={index_type}
              swatchColor={
                filterKey === "color1" ? COMPARISON_COLOR_1 : COMPARISON_COLOR_2
              }
              onClickCreateContext={() => {
                onClickCreateContext(["filters", filterKey]);
              }}
              onClickSaveAsContext={() =>
                onClickSaveAsContext(filters[filterKey], ["filters", filterKey])
              }
              onChange={(context: DataExplorerContext) => {
                dispatch({
                  type: "select_context",
                  payload: {
                    path: ["filters", filterKey],
                    context,
                  },
                });
              }}
            />
          </React.Fragment>
        ))}
      </div>
      <DatasetMetadataSelector
        show={color_by === "property"}
        enable={color_by === "property"}
        entity_type={index_type}
        value={metadata?.color_property?.slice_id}
        onChange={(slice_id: string) => {
          dispatch({
            type: "select_color_property",
            payload: { slice_id },
          });
        }}
      />
      <div className={styles.sortByContainer}>
        <SortBySelector
          show={color_by === "property" && plot_type === "density_1d"}
          enable={color_by === "property" && plot_type === "density_1d"}
          entity_type={index_type}
          value={sort_by}
          onChange={(next_sort_by: string) => {
            dispatch({
              type: "select_sort_by",
              payload: next_sort_by,
            });
          }}
        />
      </div>
      <DimensionConfiguration
        className={styles.customColorDimension}
        plot={plot}
        dimensionKey="color"
        dispatch={dispatch}
        onClickCreateContext={onClickCreateContext}
        onClickSaveAsContext={onClickSaveAsContext}
      />
    </div>
  );
}

export default ColorByViewOptions;
