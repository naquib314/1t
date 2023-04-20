import qs from "qs";
import PQueue from "p-queue/dist";
import omit from "lodash.omit";
import {
  DataExplorerAnonymousContext,
  DataExplorerContext,
  DataExplorerFilters,
  DataExplorerMetadata,
  DataExplorerPlotConfigDimension,
} from "src/data-explorer-2/types";
import { isCompleteDimension } from "src/data-explorer-2/utils";
import { fetchUrlPrefix } from "src/common/utilities/context";

const urlPrefix = `${fetchUrlPrefix().replace(/^\/$/, "")}/data_explorer_2`;

// TODO: replace this with a proper caching library
const fetchJsonCache: Record<string, any> = {};
const queue = new PQueue({ concurrency: 1 });

const fetchJson = <T>(url: string): Promise<T> => {
  if (!fetchJsonCache[url]) {
    fetchJsonCache[url] = new Promise((resolve, reject) => {
      fetch(urlPrefix + url, { credentials: "include" })
        .then((response) => {
          return response.json().then((body) => {
            if (response.status >= 200 && response.status < 300) {
              resolve(body);
            } else {
              fetchJsonCache[url] = null;
              reject(body);
            }
          });
        })
        .catch((e) => {
          fetchJsonCache[url] = null;
          reject(e);
        });
    });
  }

  return fetchJsonCache[url];
};

const postJson = <T>(url: string, obj: any): Promise<T> => {
  const json = JSON.stringify(obj);
  const cacheKey = `${url}-${json}`;

  if (!fetchJsonCache[cacheKey]) {
    fetchJsonCache[cacheKey] = new Promise((resolve, reject) => {
      fetch(urlPrefix + url, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      })
        .then((response) => {
          return response.json().then((body) => {
            if (response.status >= 200 && response.status < 300) {
              resolve(body);
            } else {
              fetchJsonCache[cacheKey] = null;
              reject(body);
            }
          });
        })
        .catch((e) => {
          fetchJsonCache[cacheKey] = null;
          reject(e);
        });
    });
  }

  return fetchJsonCache[cacheKey];
};

export async function fetchPlotDimensions(
  index_type: string,
  color_by: string,
  dimensions: Record<string, DataExplorerPlotConfigDimension>,
  filters?: DataExplorerFilters,
  metadata?: DataExplorerMetadata
) {
  const json = {
    index_type,

    color_by:
      isCompleteDimension(dimensions.color) ||
      filters?.color1 ||
      filters?.color2 ||
      metadata?.color_property
        ? color_by
        : null,

    dimensions: isCompleteDimension(dimensions.color)
      ? dimensions
      : omit(dimensions, "color"),

    filters,
    metadata,
  } as any;

  // These calls can be very expensive so we queue them up.
  return queue.add(() => postJson<any>("/plot_dimensions", json));
}

export async function fetchCorrelation(
  index_type: string,
  dimensions: Record<string, DataExplorerPlotConfigDimension>,
  filters?: DataExplorerFilters,
  use_clustering?: boolean
) {
  const json = {
    index_type,
    dimensions,
    filters: filters || undefined,
    use_clustering: Boolean(use_clustering),
  } as any;

  // These calls can be very expensive so we queue them up.
  return queue.add(() => postJson<any>("/get_correlation", json));
}

export function fetchDatasetsByIndexType() {
  return fetchJson<any>(`/datasets_by_index_type`);
}

export function fetchDatasetsMatchingContext(
  context: DataExplorerContext | DataExplorerAnonymousContext
) {
  return postJson<any>("/datasets_matching_context", { context });
}

export function fetchEntityLabels(entity_type: string) {
  const query = qs.stringify({ entity_type });

  return fetchJson<any>(`/entity_labels?${query}`);
}

export function fetchEntityLabelsOfDataset(
  entity_type: string,
  dataset_id: string
) {
  const query = qs.stringify({ entity_type, dataset_id });

  return fetchJson<any>(`/entity_labels_of_dataset?${query}`);
}

export function fetchUniqueValuesOrRange(slice_id: string) {
  const query = qs.stringify({ slice_id });
  return fetchJson<any>(`/unique_values_or_range?${query}`);
}

export async function evaluateContext(
  context: DataExplorerContext | DataExplorerAnonymousContext,
  summarize: boolean
) {
  return postJson<any>("/evaluate_context", { context, summarize });
}
