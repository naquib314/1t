/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import { DataExplorerContext } from "src/data-explorer-2/types";
import { ContextSelector } from "src/data-explorer-2/components/ConfigurationPanel/selectors";

function FilterViewOptions({
  plot,
  dispatch,
  filterKeys,
  labels,
  includeAllInOptions,
  onClickCreateContext,
  onClickSaveAsContext,
}: any) {
  const { index_type, filters } = plot;
  let context_type = index_type;

  // FIXME: The correlation heatmap is clearly messed up because we have to do
  // this (and similar hacks).
  if (plot.plot_type === "corelation_heatmap") {
    context_type = plot.dimensions.x.entity_type;
  }

  return (
    <div>
      {filterKeys.map((filterKey: string, index: number) => (
        <ContextSelector
          key={filterKey}
          show
          includeAllInOptions={includeAllInOptions}
          label={labels?.[index]}
          enable={index_type}
          value={filters?.[filterKey]}
          context_type={context_type}
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
      ))}
    </div>
  );
}

export default FilterViewOptions;
