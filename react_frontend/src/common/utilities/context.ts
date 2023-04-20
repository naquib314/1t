import { VectorCatalogApi } from "shared/interactive/models/vectorCatalogApi";
import { BreadboxApi } from "src/bbAPI";
import { DepmapApi } from "src/dAPI";

let urlPrefix: string;
let dapi: DepmapApi;
let bbapi: BreadboxApi;
let vectorCatalogApi: VectorCatalogApi;

export function setUrlPrefix(prefix: string) {
  urlPrefix = prefix;
}

export function fetchUrlPrefix() {
  if (typeof urlPrefix === "undefined") {
    throw Error("urlPrefix has not been set");
  }
  return urlPrefix;
}

export function getDapi(): DepmapApi {
  if (typeof dapi === "undefined") {
    dapi = new DepmapApi(fetchUrlPrefix());
  }
  return dapi;
}

export function getBreadboxApi(): BreadboxApi {
  if (typeof bbapi === "undefined") {
    const prefix = fetchUrlPrefix();
    if (prefix == "/") {
      bbapi = new BreadboxApi("http://127.0.0.1:8000");
      return bbapi;
    }

    bbapi = new BreadboxApi(`${prefix}/breadbox`);
  }
  return bbapi;
}

export function bbGetVectorCatalogApi(): VectorCatalogApi {
  if (typeof vectorCatalogApi === "undefined") {
    const api = getBreadboxApi();
    vectorCatalogApi = new VectorCatalogApi(api);
  }
  return vectorCatalogApi;
}

export function getVectorCatalogApi(): VectorCatalogApi {
  if (typeof vectorCatalogApi === "undefined") {
    const api = getDapi();
    vectorCatalogApi = new VectorCatalogApi(api);
  }
  return vectorCatalogApi;
}

export function toStaticUrl(relativeUrl: string) {
  const assetUrl = relativeUrl.trim().replace(/^\//, "");
  return `${fetchUrlPrefix()}/static/${assetUrl}`.replace(/^\/\//, "");
}

export const apiFunctions = {
  breadbox: {
    getApi: getBreadboxApi,
    getVectorCatalogApi: bbGetVectorCatalogApi,
  },
  depmap: {
    getApi: getDapi,
    getVectorCatalogApi,
  },
};
