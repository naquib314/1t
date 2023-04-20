/* eslint-disable @typescript-eslint/naming-convention */
import qs from "qs";
import hash from "object-hash";
import pako from "pako";
import { Base64 } from "js-base64";
import omit from "lodash.omit";
import {
  DataExplorerContext,
  DataExplorerFilters,
  DataExplorerIndexType,
  DataExplorerPlotConfig,
  PartialDataExplorerPlotConfig,
  ContextPath,
} from "src/data-explorer-2/types";

export const capitalize = (str: string) => {
  return str && str.replace(/\b[a-z]/g, (c: string) => c.toUpperCase());
};

export function getDimensionTypeLabel(entity_type: string) {
  if (entity_type === "depmap_model") {
    return "model";
  }

  if (entity_type === "compound_experiment") {
    return "compound";
  }

  if (entity_type === "msigdb_gene_set") {
    return "MSigDB gene set";
  }

  return entity_type?.replace(/_/g, " ");
}

export const isCompleteExpression = (expr: any) => {
  if (!expr) {
    return false;
  }

  if (expr.and && expr.and.length === 0) {
    return false;
  }

  if (expr.or && expr.or.length === 0) {
    return false;
  }

  const getValues = (subexpr: any) => {
    const op = Object.keys(subexpr)[0];
    return subexpr[op];
  };

  const isPopulated = (subexpr: any) =>
    Array.isArray(subexpr && getValues(subexpr))
      ? getValues(subexpr).every(isPopulated)
      : subexpr || subexpr === 0;

  return isPopulated(expr);
};

export function isCompleteDimension(dimension: any) {
  if (!dimension) {
    return false;
  }

  const {
    dataset_id,
    entity_type,
    axis_type,
    context,
    aggregation,
  } = dimension;

  return Boolean(
    dataset_id &&
      entity_type &&
      axis_type &&
      aggregation &&
      isCompleteExpression(context?.expr)
  );
}

export function isCompletePlot(
  plot?: PartialDataExplorerPlotConfig
): plot is DataExplorerPlotConfig {
  if (!plot) {
    return false;
  }

  const { plot_type, index_type, dimensions } = plot;

  if (!plot_type || !index_type || !dimensions) {
    return false;
  }

  const numAxisDimensions = ({
    density_1d: 1,
    scatter: 2,
    correlation_heatmap: 1,
  } as Record<string, number>)[plot_type];

  return (
    Object.keys(dimensions).length >= numAxisDimensions &&
    ["x", "y"].slice(0, numAxisDimensions).every((dimensionKey: string) => {
      const dimension = plot.dimensions[dimensionKey];
      return isCompleteDimension(dimension);
    })
  );
}

// FIXME: This is a rather naive implementation.
export const pluralize = (str: string) => {
  if (str?.toLowerCase() === "other") {
    return str;
  }

  return str && `${str.replace(/y$/, "ie")}s`;
};

// TODO: Convert this to an async operation (we're going to be making an
// endpoint for it).
export const lookUpContextName = (context?: Partial<DataExplorerContext>) => {
  if (!context || !context.context_type) {
    return null;
  }

  const contexts = Object.values(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    loadContextsFromLocalStorage(context.context_type)
  );

  const match = contexts.find((c) => hash(c.expr) === hash(context.expr));

  return match ? match.name : null;
};

export const defaultContextName = (numEntities: number) => {
  return ["(", numEntities, " selected", ")"].join("");
};

const isContextAll = (context: DataExplorerContext) => {
  // `true` is a special value used to match on anything.
  return context.expr === true;
};

const contextsMatch = (a: DataExplorerContext, b: DataExplorerContext) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export function toRelatedPlot(
  plot: DataExplorerPlotConfig,
  selectedLabels: Set<string>
): DataExplorerPlotConfig {
  const numDimensions = Math.min(selectedLabels.size, 2);
  const entity_labels = [...selectedLabels];

  // correlation_heatmap -> any
  // Linking from a correlation heatmap is weird. We don't want to flip the
  // index_type and the index_labels actually match the entity_type.
  if (plot.plot_type === "correlation_heatmap") {
    const { index_type } = plot;
    const { dataset_id, entity_type } = plot.dimensions.x;

    const filters: DataExplorerFilters = {};
    let color_by: DataExplorerPlotConfig["color_by"];

    if (
      plot.filters?.distinguish1 &&
      !isContextAll(plot.filters?.distinguish1)
    ) {
      color_by = "context";
      filters.color1 = plot.filters?.distinguish1;
    }

    if (
      plot.filters?.distinguish2 &&
      !isContextAll(plot.filters?.distinguish2)
    ) {
      color_by = "context";
      filters.color2 = plot.filters?.distinguish2;
    }

    return {
      plot_type: numDimensions === 1 ? "density_1d" : "scatter",
      index_type,
      ...(color_by && ({ color_by } as any)),
      dimensions: ["x", "y"].slice(0, numDimensions).reduce(
        (dimensions: any, dimensionKey: string, index: number) => ({
          ...dimensions,
          [dimensionKey]: {
            entity_type,
            axis_type: "entity",
            dataset_id,
            context: {
              name: entity_labels[index],
              context_type: entity_type,
              expr: { "==": [{ var: "entity_label" }, entity_labels[index]] },
            },
            aggregation: "first",
          },
        }),
        {}
      ),
      ...(Object.keys(filters).length > 0 && { filters }),
    };
  }

  const index_type = plot.dimensions.x.entity_type;
  const { dataset_id } = plot.dimensions.x;
  const entity_type = plot.index_type;

  // { density_1d, scatter } -> correlation_heatmap
  if (selectedLabels.size > 2) {
    const context = {
      name: "",
      context_type: entity_type,
      expr: {
        in: [{ var: "entity_label" }, entity_labels],
      },
    };

    context.name =
      lookUpContextName(context) || defaultContextName(selectedLabels.size);

    const isCompatibleTwoContextComparison =
      plot.dimensions.x.axis_type === "context" &&
      plot.dimensions.y?.axis_type === "context" &&
      plot.dimensions.x.entity_type === index_type &&
      plot.dimensions.y?.entity_type === index_type;

    return {
      plot_type: "correlation_heatmap",
      index_type: index_type as DataExplorerIndexType,
      dimensions: {
        x: {
          axis_type: "context",
          // HACK: just use the entity_type and dataset_id from the the X axis. In theory,
          // they could be different. Should we force them to be the same?
          entity_type,
          dataset_id,
          context,
          aggregation: "correlation",
        },
      },
      ...(isCompatibleTwoContextComparison && {
        filters: {
          distinguish1: plot.dimensions.x.context,
          distinguish2: plot.dimensions.y.context,
        },
      }),
    };
  }

  // any -> { density_1d, scatter }
  const filters: DataExplorerFilters = {};
  let color_by: any = null;

  if (
    plot.dimensions.x?.entity_type === index_type &&
    !isContextAll(plot.dimensions.x.context)
  ) {
    filters.color1 = plot.dimensions.x.context;
    color_by = "entity";
  }

  if (
    plot.dimensions.y?.entity_type === index_type &&
    !isContextAll(plot.dimensions.y.context) &&
    !contextsMatch(plot.dimensions.x.context, plot.dimensions.y.context)
  ) {
    filters.color2 = plot.dimensions.y.context;
    color_by = "entity";
  }

  if (filters.color1 && plot.dimensions.x?.axis_type === "context") {
    color_by = "context";
  }

  if (filters.color2 && plot.dimensions.y?.axis_type === "context") {
    color_by = "context";
  }

  return {
    plot_type: numDimensions === 1 ? "density_1d" : "scatter",
    index_type: index_type as DataExplorerIndexType,
    ...(color_by ? { color_by, filters } : {}),
    dimensions: ["x", "y"].slice(0, numDimensions).reduce(
      (dimensions: any, dimensionKey: string, index: number) => ({
        ...dimensions,
        [dimensionKey]: {
          axis_type: "entity",
          entity_type,
          dataset_id,
          context: {
            name: entity_labels[index],
            context_type: entity_type,
            expr: { "==": [{ var: "entity_label" }, entity_labels[index]] },
          },
          aggregation: "first",
        },
      }),
      {}
    ),
  };
}

export function heatmapToDensityPlot(plot: DataExplorerPlotConfig) {
  return {
    ...plot,
    plot_type: "density_1d",
    dimensions: {
      x: {
        ...plot.dimensions.x,
        aggregation: "mean",
      },
    },
  } as DataExplorerPlotConfig;
}

export function swapAxisConfigs(plot: DataExplorerPlotConfig) {
  if (!plot?.dimensions) {
    return plot;
  }

  const { dimensions } = plot;
  const { x, y } = dimensions;

  if (!x || !y) {
    return plot;
  }

  return {
    ...plot,
    dimensions: {
      ...dimensions,
      x: y,
      y: x,
    },
  } as DataExplorerPlotConfig;
}

function compress(obj: object): string {
  // thanks to https://gist.github.com/heinrich-ulbricht/683ea2ac8ac0e7bc607e4f4a57534937
  const json = JSON.stringify(obj);
  const bytes = pako.deflate(json);
  return Base64.fromUint8Array(bytes, true);
}

function decompress(str: string): object {
  const bytes = Base64.toUint8Array(str);
  const json = pako.inflate(bytes, { to: "string" });
  return JSON.parse(json);
}

function serializePlot(plot: DataExplorerPlotConfig) {
  // Remove any incomplete options first.
  const {
    color_by,
    sort_by,
    use_clustering,
    filters,
    metadata,
    ...rest
  } = plot;
  const normalizedPlot: DataExplorerPlotConfig = rest;

  if (plot.plot_type === "correlation_heatmap") {
    if (filters?.distinguish1 || filters?.distinguish2) {
      normalizedPlot.filters = filters;
    }

    if (use_clustering) {
      normalizedPlot.use_clustering = true;
    }
  } else {
    if ((color_by && filters?.color1) || filters?.color2) {
      normalizedPlot.color_by = color_by;
      normalizedPlot.filters = filters;
    }

    if (filters?.visible) {
      normalizedPlot.filters = {
        ...normalizedPlot.filters,
        visible: filters.visible,
      };
    }

    if (color_by && metadata) {
      normalizedPlot.color_by = color_by;
      normalizedPlot.metadata = metadata;

      if (sort_by) {
        normalizedPlot.sort_by = sort_by;
      }
    }

    if (color_by && rest.dimensions?.color) {
      if (isCompleteDimension(rest.dimensions.color)) {
        normalizedPlot.color_by = color_by;
      } else {
        normalizedPlot.dimensions = omit(rest.dimensions, "color");
      }
    }
  }

  return compress(normalizedPlot);
}

function deserializePlot(encodedPlot: string) {
  return decompress(encodedPlot);
}

export const DEFAULT_EMPTY_PLOT = {
  plot_type: "scatter",
  dimensions: {},
};

export function readPlotFromQueryString() {
  const params = qs.parse(window.location.search.substr(1));
  let plot = null;

  // Old format
  if (params.plot) {
    const decoded = Base64.decode(params.plot as string);
    plot = JSON.parse(decoded);
  }

  // New compressed format
  if (params.p) {
    plot = deserializePlot(params.p as string);
  }

  // `plot.dimensions` used to be an array but now it's an object.
  // Just in case there are any old bookmarks hanging around,
  // we'll parse the array and transform it into an object.
  if (plot && Array.isArray(plot.dimensions)) {
    const [x, y] = plot.dimensions;

    plot.dimensions = {
      ...(x && { x }),
      ...(y && { y }),
    };
  }

  return plot || DEFAULT_EMPTY_PLOT;
}

export function plotToQueryString(plot: DataExplorerPlotConfig) {
  const params = qs.parse(window.location.search.substr(1));
  const encodedPlot = serializePlot(plot);

  return `?${qs.stringify({ ...params, p: encodedPlot })}`;
}

export function matchesCurrentQueryString(queryString: string) {
  const urlParams = qs.parse(window.location.search.substr(1));
  const testParams = qs.parse(queryString.substr(1));

  return urlParams.p === testParams.p;
}

// TODO: Probably should move the generation of hashes to the backend.
// We'll want to make sure it's deterministic (i.e. reordering keys
// shouldn't matter).
export function contextToHash(context: DataExplorerContext) {
  if (context.expr === true) {
    return "all";
  }

  return hash(context);
}

// TODO: Convert this to an async operation (we're going to be making an
// endpoint for it).
export function saveContextToLocalStorage(
  context: DataExplorerContext,
  hashToReplace?: string
) {
  const compressedJson = window.localStorage.getItem(
    "dx2_prototype_user_contexts"
  );

  const allContexts: Record<string, DataExplorerContext> = compressedJson
    ? decompress(compressedJson)
    : ({} as any);

  const userContexts: Record<string, DataExplorerContext> = {};

  Object.entries(allContexts).forEach(([oldHash, oldContext]) => {
    if (oldHash === hashToReplace) {
      userContexts[contextToHash(context)] = context;
    } else {
      userContexts[oldHash] = oldContext;
    }
  });

  if (!hashToReplace) {
    userContexts[contextToHash(context)] = context;
  }

  window.localStorage.setItem(
    "dx2_prototype_user_contexts",
    compress(userContexts)
  );
}

export function deleteContextFromLocalStorage(hashToDelete: string) {
  const compressedJson = window.localStorage.getItem(
    "dx2_prototype_user_contexts"
  );

  const allContexts: Record<string, any> = compressedJson
    ? decompress(compressedJson)
    : {};

  const userContexts: Record<string, any> = {};

  Object.entries(allContexts).forEach(([oldHash, oldContext]) => {
    if (oldHash !== hashToDelete) {
      userContexts[oldHash] = oldContext;
    }
  });

  window.localStorage.setItem(
    "dx2_prototype_user_contexts",
    compress(userContexts)
  );
}

// TODO: Convert this to an async operation (we're going to be making an
// endpoint for it).
export function loadContextsFromLocalStorage(context_type: string) {
  const out: Record<string, any> = {};

  const compressedJson = window.localStorage.getItem(
    "dx2_prototype_user_contexts"
  );

  const allContexts: Record<string, any> = compressedJson
    ? decompress(compressedJson)
    : {};

  Object.entries(allContexts).forEach(([contextHash, context]) => {
    if (context.context_type === context_type) {
      out[contextHash] = context;
    }
  });

  return out;
}

export function getStoredContextTypes() {
  const out: Set<string> = new Set();

  const compressedJson = window.localStorage.getItem(
    "dx2_prototype_user_contexts"
  );

  const allContexts: Record<string, any> = compressedJson
    ? decompress(compressedJson)
    : {};

  Object.values(allContexts).forEach((context: any) => {
    out.add(context.context_type);
  });

  return out;
}

export function negateContext(context: any) {
  const negateExpr = (expr: any) => (expr["!"] ? expr["!"] : { "!": expr });

  return {
    name: context.name.startsWith("Not ")
      ? context.name.slice(4)
      : `Not ${context.name}`,
    context_type: context.context_type,
    expr: negateExpr(context.expr),
  };
}

function compareContexts(
  contextA: DataExplorerContext,
  contextB: DataExplorerContext
) {
  if (!contextA || !contextB) {
    return false;
  }

  return hash(contextA) === hash(contextB);
}

export function findPathsToContext(plot: DataExplorerPlotConfig, context: any) {
  const paths: ContextPath[] = [];

  Object.entries(plot.dimensions).forEach(([key, dimension]: any) => {
    if (compareContexts(context, dimension.context)) {
      paths.push(["dimensions", key, "context"]);
    }
  });

  Object.entries(plot.filters || {}).forEach(([key, filter]: any) => {
    if (compareContexts(context, filter)) {
      paths.push(["filters", key]);
    }
  });

  return paths;
}

export const checkQueryStringLength = (queryString: string) => {
  const { origin, pathname } = window.location;
  const href = `${origin}${pathname}${queryString}`;

  if (href.length > 4094) {
    // eslint-disable-next-line no-alert
    window.alert(
      [
        "Warning: ",
        "The URL is too long and will not be able to be bookmarked or shared. ",
        "This can happen when there are contexts that contain lists of ",
        "hundreds of items (genes, models, etc.)",
        "\n\n",
        "This will be solved in a future version. For now, try to limit the ",
        "length of context lists to ~200 items.",
      ].join("")
    );
  }
};

export const sortDimensionTypes = (types: string[]) => {
  const set = new Set(types);

  const middle = types
    .filter((type) => !["depmap_model", "gene", "other"].includes(type))
    .sort();

  // prioritize "depmap_model" and "gene" and stick "other" last
  return [
    set.has("depmap_model") && "depmap_model",
    set.has("gene") && "gene",
    ...middle,
    set.has("other") && "other",
  ].filter(Boolean);
};
