/* eslint-disable @typescript-eslint/naming-convention */
import omit from "lodash.omit";
import {
  DataExplorerPlotType,
  PartialDataExplorerPlotConfig,
} from "src/data-explorer-2/types";

type ActionType =
  | "set_plot"
  | "select_plot_type"
  | "select_index_type"
  | "select_axis_type"
  | "select_entity_label"
  | "select_context"
  | "select_dataset_id"
  | "select_aggregation"
  | "select_color_by"
  | "select_sort_by"
  | "select_color_property"
  | "select_hide_points"
  | "select_use_clustering";

// TODO: Make specific types for different `payload`s
export type PlotConfigReducerAction = { type: ActionType; payload: any };

const DEFAULT_SORT = "mean_values_asc";

const defaultAggregation = (plot_type: DataExplorerPlotType) => {
  return plot_type === "correlation_heatmap" ? "correlation" : "mean";
};

const isEmptyObject = (obj?: object) =>
  obj !== null && typeof obj === "object" && Object.keys(obj).length === 0;

// Strips out any optional fields that are empty objects or `false` options.
const normalize = (plot: PartialDataExplorerPlotConfig) => {
  let nextPlot = plot;

  if (isEmptyObject(plot.filters)) {
    nextPlot = omit(nextPlot, "filters");
  }

  if (isEmptyObject(plot.metadata)) {
    nextPlot = omit(nextPlot, "metadata");
  }

  if (plot.hide_points === false) {
    nextPlot = omit(nextPlot, "hide_points");
  }

  if (plot.use_clustering === false) {
    nextPlot = omit(nextPlot, "use_clustering");
  }

  if (plot.plot_type !== "density_1d") {
    nextPlot = omit(nextPlot, "sort_by");
  }

  return nextPlot;
};

function plotConfigReducer(
  plot: PartialDataExplorerPlotConfig,
  action: PlotConfigReducerAction
) {
  switch (action.type) {
    // HACK: "set_plot" is used in cases where we want to completely replace
    // the plot with something known to be valid. Some examples include:
    //
    // - Loading a plot from a URL
    // - Using "visualize selected" to derive a related plot
    // - Replacing an existing context with an edited one
    //
    // It seems we could use a "select_context" action for that last one,
    // though 🤔
    case "set_plot":
      return typeof action.payload === "function"
        ? action.payload(plot)
        : action.payload;

    case "select_plot_type": {
      const nextPlotType = action.payload;
      let dx = plot.dimensions?.x || {};

      // These selections are incompatible. Take the nuclear option and wipe
      // everything.
      if (nextPlotType === "scatter" && plot.index_type === "other") {
        return {
          plot_type: nextPlotType,
          dimensions: { x: {}, y: {} },
        };
      }

      if (dx.aggregation === "correlation") {
        dx = {
          ...dx,
          aggregation: dx.axis_type === "entity" ? "first" : "mean",
        };
      }

      if (nextPlotType === "correlation_heatmap") {
        if (dx.axis_type !== "context") {
          dx = { ...dx, axis_type: "context", context: null };
        }

        dx = { ...dx, aggregation: "correlation" };
      }

      let nextPlot: PartialDataExplorerPlotConfig = {
        ...plot,
        plot_type: nextPlotType,
        dimensions: {
          x: dx,
          ...(nextPlotType === "scatter" ? { y: {} } : {}),
        },
      };

      if (nextPlotType === "correlation_heatmap") {
        nextPlot = omit(nextPlot, [
          "color_by",
          "sort_by",
          "filters",
          "metadata",
        ]);
      } else if (plot.dimensions?.color) {
        nextPlot.dimensions.color = plot.dimensions.color;
      }

      // Scenario: a scatter with a "color by" property is switched to a 1D
      // plot.
      // How to handle: Preserve that selection and introduce a default sort.
      if (nextPlotType === "density_1d" && plot.metadata?.color_property) {
        nextPlot.sort_by = DEFAULT_SORT;
      }

      return normalize(nextPlot);
    }

    case "select_index_type":
      return omit(
        {
          ...plot,
          index_type: action.payload,
          dimensions:
            plot.plot_type === "scatter" ? { x: {}, y: {} } : { x: {} },
        },
        ["color_by", "filters", "metadata"]
      );

    case "select_axis_type": {
      const { path, axis_type, entity_type } = action.payload;

      if (path[0] !== "dimensions") {
        window.console.error(
          '"select_axis_type" is only implemented for dimensions'
        );
        return plot;
      }

      const dimensionKey = path[1];
      const prevDimension = plot.dimensions?.[dimensionKey] || {};
      let dataset_id;

      if (prevDimension.entity_type === entity_type) {
        dataset_id = prevDimension.dataset_id;
      }

      return {
        ...plot,
        dimensions: {
          ...plot.dimensions,

          [dimensionKey]: {
            axis_type,
            entity_type,
            ...{ dataset_id },
            aggregation:
              axis_type === "entity"
                ? "first"
                : defaultAggregation(plot.plot_type),
          },
        },
      };
    }

    case "select_dataset_id": {
      const { path, dataset_id } = action.payload;

      if (path[0] !== "dimensions") {
        window.console.error(
          '"select_dataset_id" is only implemented for dimensions'
        );
        return plot;
      }

      const dimensionKey = path[1];
      const prevDimension = plot.dimensions?.[dimensionKey] || {};

      return {
        ...plot,

        dimensions: {
          ...plot.dimensions,

          [dimensionKey]: {
            ...prevDimension,
            dataset_id,
          },
        },
      };
    }

    case "select_entity_label": {
      const { path, entity_type, entity_label } = action.payload;
      let context = null;

      if (typeof entity_label === "string") {
        // Even though we just want to request a single entity, we still use
        // a context. It's a trivial context where we're just comparing the
        // entity_label to itself.

        context = {
          name: entity_label,
          context_type: entity_type,
          expr: { "==": [{ var: "entity_label" }, entity_label] },
        };
      }

      // By using the MultiPartEntitySelector, you can actually select a single
      // entity by building up a non-trivial context.
      if (typeof entity_label === "object") {
        context = entity_label;
      }

      if (path[0] === "filters") {
        const filterKey = path[1];

        if (entity_label === null) {
          return normalize({
            ...plot,
            filters: omit(plot.filters, filterKey),
          });
        }

        return {
          ...plot,
          filters: {
            ...plot.filters,
            [filterKey]: context,
          },
        };
      }

      const dimensionKey = path[1];
      const prevDimension = plot.dimensions[dimensionKey];

      return {
        ...plot,

        dimensions: {
          ...plot.dimensions,
          [dimensionKey]: {
            ...prevDimension,
            context,
            aggregation: "first",
          },
        },
      };
    }

    case "select_context": {
      const { path, context } = action.payload;

      if (path[0] === "filters") {
        const filterKey = path[1];

        if (context === null) {
          return normalize({
            ...plot,
            filters: omit(plot.filters, filterKey),
          });
        }

        return {
          ...plot,
          filters: {
            ...plot.filters,
            [filterKey]: context,
          },
        };
      }

      const dimensionKey = path[1];
      const prevDimension = plot.dimensions[dimensionKey];

      // TODO: Look for a `visible` filter and set a `filter_by` property to
      // "context." This is a dummy property (there is no separate UI control
      // for it) but it should be present for future compatibility (as it's
      // very likely we'll have different ways to filter in the future).
      return {
        ...plot,
        dimensions: {
          ...plot.dimensions,
          [dimensionKey]: {
            dataset_id: prevDimension.dataset_id,
            entity_type: prevDimension.entity_type,
            axis_type: prevDimension.axis_type,
            aggregation:
              prevDimension.aggregation || defaultAggregation(plot.plot_type),
            context,
          },
        },
      };
    }

    case "select_aggregation": {
      const { path, aggregation } = action.payload;

      if (path[0] !== "dimensions") {
        window.console.error(
          '"select_aggregation" is only implemented for dimensions'
        );
        return plot;
      }

      const dimensionKey = path[1];
      const prevDimension = plot.dimensions[dimensionKey];

      return {
        ...plot,
        dimensions: {
          ...plot.dimensions,
          [dimensionKey]: {
            dataset_id: prevDimension.dataset_id,
            entity_type: prevDimension.entity_type,
            axis_type: prevDimension.axis_type,
            context: prevDimension.context,
            aggregation,
          },
        },
      };
    }

    case "select_color_by": {
      let dimensions;

      if (action.payload === "custom") {
        dimensions = {
          ...plot.dimensions,
          color: {},
        };
      } else {
        dimensions = omit(plot.dimensions, "color");
      }

      const visibleFilter = plot.filters?.visible;

      return normalize({
        ...plot,
        color_by: action.payload,
        sort_by: DEFAULT_SORT,
        dimensions,
        filters: visibleFilter ? { visible: visibleFilter } : {},
        metadata: {},
      });
    }

    case "select_sort_by": {
      return normalize({
        ...plot,
        sort_by: action.payload,
      });
    }

    case "select_color_property": {
      const { slice_id } = action.payload;

      if (slice_id === null) {
        return normalize({
          ...plot,
          metadata: omit(plot.metadata, "color_property"),
        });
      }

      return {
        ...plot,
        metadata: {
          ...plot.metadata,
          color_property: {
            slice_id,
          },
        },
      };
    }

    case "select_hide_points": {
      return normalize({
        ...plot,
        hide_points: action.payload,
      });
    }

    case "select_use_clustering": {
      return normalize({
        ...plot,
        use_clustering: action.payload,
      });
    }

    default:
      return plot;
  }
}

export default plotConfigReducer;
