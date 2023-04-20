import React from "react";

import { CeleryTask } from "shared/compute/models/celery";
import ProgressTracker from "shared/common/components/ProgressTracker";

interface Props {
  getMorpheusUrl?: (downloadUrls: string) => Promise<string>;
  getCitationUrl?: (datasetId: string) => Promise<string>;
  citationUrls: (string | null)[];
  datasetDisplayNames: string[];
  datasetIds: string[];
  getTaskStatus: (taskId: string) => Promise<CeleryTask>;
  submissionResponse: Promise<CeleryTask>;
}
interface State {
  downloadUrl: string;
  morpheusUrl: string;
  citationUrls: string[];
}
interface DataSlicerResult {
  downloadUrl: string;
}

export default class DownloadTracker extends React.Component<
  Props,
  Partial<State>
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      downloadUrl: "",
      morpheusUrl: "",
      citationUrls: [""],
    };
  }

  onResultsComplete = (response: DataSlicerResult) => {
    const { downloadUrl } = response;
    const { getMorpheusUrl, citationUrls } = this.props;
    window.location.assign(downloadUrl);
    const newState: any = {};
    newState.downloadUrl = downloadUrl;
    const promisesToKeep: Map<string, Promise<any>> = new Map<
      string,
      Promise<any>
    >();
    if (getMorpheusUrl) {
      promisesToKeep.set("morpheusUrl", getMorpheusUrl(downloadUrl));
    }
    if (citationUrls) {
      newState.citationUrls = citationUrls;
    }
    Promise.all(Array.from(promisesToKeep.values())).then((values) => {
      const keys = Array.from(promisesToKeep.keys());
      values.forEach((value, index) => {
        newState[keys[index]] = value;
      });
      this.setState(newState);
    });
  };

  render() {
    const { citationUrls, downloadUrl, morpheusUrl } = this.state;
    const mergedDatasetDownload = citationUrls && citationUrls.length > 1;

    const {
      submissionResponse,
      getTaskStatus,
      datasetDisplayNames,
    } = this.props;
    return (
      <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
        <ProgressTracker
          submissionResponse={submissionResponse}
          onSuccess={(response) => {
            this.onResultsComplete(response.result);
          }}
          onFailure={() => {
            console.log("oops failure");
          }}
          getTaskStatus={getTaskStatus}
        />
        {downloadUrl && (
          <div>
            <div
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: mergedDatasetDownload ? "nowrap" : "normal",
                paddingLeft: "20px",
              }}
            >
              <a href={downloadUrl} download>
                {mergedDatasetDownload
                  ? "Merged Download File"
                  : datasetDisplayNames[0]}
              </a>
            </div>
            {enabledFeatures.morpheus && morpheusUrl && (
              <a
                style={{ paddingLeft: "20px" }}
                href={morpheusUrl}
                target="_blank"
              >
                View in Morpheus
              </a>
            )}
            {!mergedDatasetDownload &&
              citationUrls &&
              citationUrls.length > 0 &&
              citationUrls.map((url) => (
                <a style={{ paddingLeft: "20px" }} href={url} target="_blank">
                  Citation
                </a>
              ))}
            {mergedDatasetDownload &&
              citationUrls &&
              citationUrls.length > 0 &&
              citationUrls.map((url, index) => (
                <div
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    paddingLeft: "20px",
                  }}
                >
                  <a href={url} target="_blank">
                    Citation: {datasetDisplayNames[index]}
                  </a>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }
}
