import { DepmapApi } from "src/dAPI";
import { VectorCatalogApi } from "shared/interactive/models/vectorCatalogApi";
import * as context from "src/common/utilities/context";

export function mockDapi(impl: Partial<DepmapApi>) {
  (context as any).getDapi = () => impl;
}

export function mockVectorCatalogApi(impl: Partial<VectorCatalogApi>) {
  (context as any).getVectorCatalogApi = () => impl;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
