/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import {
  AssociationAndCheckbox,
  Catalog,
  AddDatasetOneRowArgs,
  Feature,
  PlotFeatures,
} from "shared/interactive/models/interactive";
import { VectorResponse } from "shared/common/components/LongTable";
import {
  UnivariateAssociationsParams,
  ComputeResponse,
} from "shared/compute/models/compute";
import {
  AddCustDatasetArgs,
  Dataset,
  DatasetValueType,
} from "shared/common/models/Dataset";
import { Trace } from "src/trace";
import { CeleryTask, FailedCeleryTask } from "shared/compute/models/celery";
import {
  UploadTask,
  UploadTaskUserError,
  UserUploadArgs,
} from "shared/userUpload/models/userUploads";
import encodeParams from "shared/common/utilities/encodeParams";

import {
  CellignerColorsForCellLineSelector,
  CellLineSelectorLines,
} from "shared/cellLineSelector/models/CellLineSelectorLines";
import Group, {
  GroupArgs,
  GroupEntry,
  GroupEntryArgs,
} from "shared/common//models/Group";
import FeatureType from "shared/common//models/FeatureType";
import SampleType from "shared/common//models/SampleType";
import * as Papa from "papaparse";

// The Breadbox API includes a bit more information than the Portal.
type FeatureWithCatalog = Feature & { catalog: Catalog };
interface BreadboxPlotFeatures extends PlotFeatures {
  features: FeatureWithCatalog[];
}

const log = console.debug.bind(console);

function convertChildIdsToStrings(obj: {
  children: [{ id: number | string }];
}) {
  return {
    ...obj,
    children: obj.children.map((child) => ({ ...child, id: String(child.id) })),
  };
}

export class BreadboxApi {
  urlPrefix: string;

  trace: Trace | null;

  constructor(urlPrefix: string) {
    this.urlPrefix = urlPrefix === "/" ? "" : urlPrefix;
    this.trace = null;
  }

  getTraceParentField() {
    if (this.trace && this.trace.traceID && this.trace.currentSpan) {
      return `00-${this.trace.traceID}-${this.trace.currentSpan.spanID}-01`;
    }
    return null;
  }

  _fetch = <T>(url: string): Promise<T> => {
    const headers: { [key: string]: string } = {};
    const traceParentField = this.getTraceParentField();
    if (traceParentField) {
      headers.traceparent = traceParentField;
    }

    const fullUrl = this.urlPrefix + url;
    log(`fetching ${fullUrl}`);
    return fetch(fullUrl, {
      credentials: "include",
      headers,
    }).then(
      (response: Response): Promise<T> => {
        log(`response arrived from ${fullUrl}`);
        return response.json().then(
          (body: T): Promise<T> => {
            // nesting to access response.status
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(body);
            }
            return Promise.reject(body);
          }
        );
      }
    );
  };

  _postMultipart = <T>(url: string, args: any): Promise<T> => {
    const fullUrl = this.urlPrefix + url;
    log(`post multipart to ${fullUrl}`);

    const data = new FormData();
    // eslint-disable-next-line no-restricted-syntax
    for (const prop in args) {
      if (Object.prototype.hasOwnProperty.call(args, prop)) {
        data.append(prop, args[prop]);
      }
    }
    return fetch(fullUrl, {
      credentials: "include",
      method: "POST",
      body: data,
    }).then(
      (response: Response): Promise<T> => {
        log(`response arrived from ${fullUrl}`);
        return response.json().then(
          (body: T): Promise<T> => {
            // nesting to access response.status
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(body);
            }
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject({ body, status: response.status } as {
              body: T;
              status: number;
            });
          }
        );
      }
    );
  };

  _delete = (url: string, id: string) => {
    const fullUrl = this.urlPrefix + url;
    return fetch(`${fullUrl}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: id,
    }).then(
      (response: Response): Promise<any> => {
        log(`response arrived from ${fullUrl}`);
        return response.json().then(
          (body: string): Promise<any> => {
            // nesting to access response.status
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(body);
            }
            return Promise.reject(body);
          }
        );
      }
    );
  };

  getFeaturePlot(
    features: string[],
    groupBy: string,
    filter: string,
    computeLinearFit: boolean
  ): Promise<BreadboxPlotFeatures> {
    const params: any = {
      groupBy,
      filter,
      computeLinearFit,
    };
    if (groupBy !== null && groupBy !== undefined) {
      params.groupBy = groupBy;
    }
    return this._postJson<BreadboxPlotFeatures>(
      `/api/get-features?${encodeParams(params)}`,
      features
    );
  }

  getAssociations(): Promise<AssociationAndCheckbox> {
    return Promise.reject(Error("getAssociations() not implemented"));
  }

  getCellLineUrlRoot(): Promise<string> {
    return Promise.reject(Error("getCellLineUrlRoot() not implemented"));
  }

  getFeedbackUrl(): Promise<string> {
    return Promise.reject(Error("getFeedbackUrl() not implemented"));
  }

  getDatasets(): Promise<any> {
    return this._fetch<Dataset[]>("/datasets").then((datasets) =>
      datasets.map(({ id, name }) => ({ label: name, value: id }))
    );
  }

  getBreadboxUser(): Promise<string> {
    return this._fetch<string>("/user");
  }

  getBreadboxDatasets(): Promise<Dataset[]> {
    return this._fetch<Dataset[]>("/datasets");
  }

  deleteDatasets(id: string) {
    return this._delete("/datasets", id);
  }

  postDataset(datasetArgs: any, allowed_values: string[]): Promise<Dataset> {
    const data = new FormData();
    // eslint-disable-next-line no-restricted-syntax
    for (const prop in datasetArgs) {
      if (Object.prototype.hasOwnProperty.call(datasetArgs, prop)) {
        data.append(prop, datasetArgs[prop]);
      }
    }
    const params: any = {
      allowed_values,
    };
    const url = `/datasets/?${encodeParams(params)}`;
    const fullUrl = this.urlPrefix + url;
    log(`fetching ${fullUrl}`);

    return fetch(fullUrl, {
      credentials: "include",
      method: "POST",
      body: data,
    }).then(
      (response: Response): Promise<Dataset> => {
        return response.json().then(
          (body: UploadTask): Promise<Dataset> => {
            // nesting to access response.status
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(body.result?.dataset);
            }
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject({ body, status: response.status } as {
              body: UploadTask;
              status: number;
            });
          }
        );
      }
    );
  }

  getFeatureTypes(): Promise<FeatureType[]> {
    return this._fetch<FeatureType[]>("/types/feature");
  }

  getSampleTypes(): Promise<SampleType[]> {
    return this._fetch<FeatureType[]>("/types/sample");
  }

  getGroups(): Promise<Group[]> {
    return this._fetch<Group[]>("/groups");
  }

  postGroup(groupArgs: GroupArgs): Promise<Group> {
    return this._postJson<Group>("/groups", groupArgs);
  }

  deleteGroup(id: string) {
    return this._delete("/groups", id);
  }

  postGroupEntry(
    groupId: string,
    groupEntryArgs: GroupEntryArgs
  ): Promise<GroupEntry> {
    return this._postJson<GroupEntry>(
      `/groups/${groupId}/addAccess`,
      groupEntryArgs
    );
  }

  deleteGroupEntry(groupEntryId: string) {
    const url = `/groups/${groupEntryId}/removeAccess`;
    const fullUrl = this.urlPrefix + url;
    return fetch(fullUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: groupEntryId,
    }).then(
      (response: Response): Promise<string> => {
        log(`response arrived from ${fullUrl}`);
        return response.json().then(
          (body: string): Promise<string> => {
            // nesting to access response.status
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(body);
            }
            return Promise.reject(body);
          }
        );
      }
    );
  }

  postCustomTaiga = (config: UserUploadArgs): Promise<UploadTask> => {
    if (!config) {
      console.log("Not implemented");
    }
    return Promise.reject(Error("postCustomTaiga() not implemented"));
  };

  postCustomCsv = (config: AddDatasetOneRowArgs): Promise<UploadTask> => {
    const { uploadFile } = config;
    const { name } = uploadFile;
    const finalConfig: AddCustDatasetArgs = {
      name,
      units: "float",
      feature_type: "generic",
      sample_type: "depmap_model",
      value_type: DatasetValueType.continuous,
      data_file: config.uploadFile,
      is_transient: true,
    };
    return this._postMultipart<UploadTask>("/datasets/", finalConfig);
  };

  _assertCsvSingleColumnNoHeader = (
    dataRow: any[],
    index: number
  ): UploadTaskUserError | void => {
    if (dataRow.length > 2) {
      return {
        message: "File has too many columns",
      };
    }

    if (index === 0) {
      if (
        dataRow[0] === undefined ||
        dataRow[0] === null ||
        dataRow[0] === ""
      ) {
        return {
          message:
            "Index of first row is NaN. Please upload a file without a header.",
        };
      }
    }

    return null;
  };

  parseFileToAddHeader = (rawFile: any, headerStr: string) => {
    return new Promise<any>((resolve, reject) => {
      Papa.parse(rawFile, {
        complete: (results) => {
          results.data.map((val, index) => {
            const error = this._assertCsvSingleColumnNoHeader(val, index);
            if (error) {
              reject(new Error(error.message));
            }

            return error;
          });

          results.data.splice(0, 0, ["", headerStr]);

          resolve(results.data);
        },
      });
    });
  };

  async postCustomCsvOneRow(config: AddDatasetOneRowArgs): Promise<UploadTask> {
    const { uploadFile } = config;
    const { name } = uploadFile;

    return this.parseFileToAddHeader(config.uploadFile, "custom data")
      .then((parsedFile) => {
        const unparsedFile = Papa.unparse(parsedFile);
        const finalUploadFile = new Blob([unparsedFile], {
          type: "text/csv",
        });

        const finalConfig: AddCustDatasetArgs = {
          name,
          units: "float",
          feature_type: "generic",
          sample_type: "depmap_model",
          value_type: DatasetValueType.continuous,
          data_file: finalUploadFile,
          is_transient: true,
        };

        return this._postMultipart<UploadTask>("/datasets/", finalConfig);
      })
      .catch((error: Error) => {
        const failedUploadTask: FailedCeleryTask = {
          id: "",
          message: error.message,
          nextPollDelay: 1000,
          percentComplete: undefined,
          result: undefined,
          state: "FAILURE",
        };
        return failedUploadTask;
      });
  }

  getTaskStatus(id: string): Promise<CeleryTask> {
    return this._fetch<CeleryTask>(`/api/task/${id}`);
  }

  getCellLineSelectorLines(): Promise<CellLineSelectorLines> {
    return this._fetch<CellLineSelectorLines>(
      "/partials/data_table/cell_line_selector_lines"
    );
  }

  getCellignerColorMap(): Promise<CellignerColorsForCellLineSelector> {
    return Promise.reject(Error("getCellignerColorMap() not implemented"));
  }

  getVectorCatalogChildren(
    catalog: Catalog,
    id: string,
    prefix = ""
  ): Promise<any> {
    // chances are, you shouldn't be using this. use getVectorCatalogOptions in vectorCatalogApi, which wraps around this
    const params = {
      catalog,
      id,
      prefix,
    };
    return this._fetch<any>(
      `/datasets/vector_catalog/data/catalog/children?${encodeParams(params)}`
    ).then((res) => {
      // FIXME: This is a workaround for the case where the response is empty.
      // The existing Data Explorer logic tries to rename properties of a
      // nonexistent object.
      const dummyObject: any = {
        category: null,
        persistChildIfNotFound: false,
        children: [],
      };

      return res.length ? convertChildIdsToStrings(res[0]) : dummyObject;
    });
  }

  getVectorCatalogPath(catalog: Catalog, id: string): Promise<Array<any>> {
    // chances are, you shouldn't be using this. use getVectorCatalogPath in vectorCatalogApi, which wraps around this
    const params = { catalog, id };
    return this._fetch<Array<any>>(
      `/datasets/vector_catalog/data/catalog/path?${encodeParams(params)}`
    );
  }

  getVector(featureCatalogNodeId: string): Promise<VectorResponse> {
    // The Portal uses a dedicated endpoint to get a single feature. Here we're
    // using /api/get-features instead and re-formatting the response.
    return this._postJson<BreadboxPlotFeatures>(`/api/get-features`, [
      featureCatalogNodeId,
    ]).then((res) => {
      const feature = res.features[0];
      const isCategorical = feature.catalog === "categorical";
      const valuesKey = isCategorical ? "categoricalValues" : "values";

      return {
        cellLines: res.depmap_ids,
        [valuesKey]: feature.values,
      };
    });
  }

  computeUnivariateAssociations(
    config: UnivariateAssociationsParams
  ): Promise<ComputeResponse> {
    return this._postJson<ComputeResponse>(
      "/compute/compute_univariate_associations",
      config
    );
  }

  _postJson = <T>(url: string, args: any): Promise<T> => {
    const fullUrl = this.urlPrefix + url;
    log(`post json to ${fullUrl}`);

    const headers: { [key: string]: string } = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const traceParentField = this.getTraceParentField();
    if (traceParentField) {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      headers["traceparent"] = traceParentField;
    }
    return fetch(fullUrl, {
      credentials: "include",
      method: "POST",
      headers,
      body: JSON.stringify(args),
    }).then(
      (response: Response): Promise<T> => {
        log(`response arrived from ${fullUrl}`);
        return response.json().then(
          (body: T): Promise<T> => {
            // nesting to access response.status
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(body);
            }
            return Promise.reject(body);
          }
        );
      }
    );
  };
}
