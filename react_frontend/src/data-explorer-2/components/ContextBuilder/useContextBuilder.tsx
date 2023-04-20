/* eslint-disable @typescript-eslint/naming-convention */
import React, { useRef, useState } from "react";
import {
  DataExplorerContext,
  DataExplorerPlotConfig,
  ContextPath,
} from "src/data-explorer-2/types";
import {
  negateContext,
  plotToQueryString,
  saveContextToLocalStorage,
} from "src/data-explorer-2/utils";
import ContextBuilderModal from "src/data-explorer-2/components/ContextBuilder/ContextBuilderModal";

export default function useContextBuilder(
  plot: DataExplorerPlotConfig,
  setPlot: Function
) {
  const [showContextModal, setShowContextModal] = useState(false);
  const contextToEdit = useRef<any>(null);
  const onClickSave = useRef(null);

  const saveContext = (
    context: DataExplorerContext,
    path: ContextPath | null,
    isNew: boolean,
    wasNegatedContext: boolean
  ) => {
    const contextToSet = wasNegatedContext ? negateContext(context) : context;

    setPlot((prevPlot: DataExplorerPlotConfig) => {
      let nextPlot = { ...prevPlot };

      if (path && path[0] === "dimensions") {
        const dimensionKey = path[1];

        nextPlot = {
          ...nextPlot,
          dimensions: {
            ...plot.dimensions,
            [dimensionKey]: {
              ...plot.dimensions[dimensionKey],
              context: contextToSet,
            },
          },
        };
      }

      if (path && path[0] === "filters") {
        const filterProp = path[1];

        nextPlot = {
          ...nextPlot,
          filters: {
            ...plot.filters,
            [filterProp]: contextToSet,
          },
        };
      }

      const queryString = plotToQueryString(nextPlot);

      // FIXME: It's weird to have a side effect in a setter. Perhaps I could
      // use the reducer instead.
      if (isNew) {
        window.history.pushState(null, "", queryString);
      } else {
        window.history.replaceState(null, "", queryString);
      }

      return nextPlot;
    });

    saveContextToLocalStorage(context);
    setShowContextModal(false);
  };

  const onClickCreateContext = (path: ContextPath) => {
    let context_type;

    if (path[0] === "dimensions") {
      const [i, j] = path;
      context_type = plot[i][j].entity_type;
    } else {
      context_type = plot.index_type;
    }

    contextToEdit.current = { context_type };

    onClickSave.current = (newContext: DataExplorerContext) => {
      saveContext(newContext, path, true, false);
    };

    setShowContextModal(true);
  };

  const onClickSaveAsContext = (
    context: DataExplorerContext,
    path: ContextPath | null
  ) => {
    const isNegated = Boolean(
      typeof context.expr === "object" && context.expr["!"]
    );

    contextToEdit.current = isNegated ? negateContext(context) : context;

    onClickSave.current = (newContext: DataExplorerContext) => {
      saveContext(newContext, path, false, isNegated);
    };

    setShowContextModal(true);
  };

  return {
    onClickCreateContext,
    onClickSaveAsContext,
    ContextBuilder: () => (
      <ContextBuilderModal
        show={showContextModal}
        context={contextToEdit.current}
        onClickSave={onClickSave.current}
        onHide={() => setShowContextModal(false)}
      />
    ),
  };
}
