import * as React from "react";
import { Radio } from "react-bootstrap";
import { DropdownState } from "shared/interactive/models/interactive";
import { VectorCatalog } from "shared/interactive/components/VectorCatalog";
import { UploadTask } from "shared/userUpload/models/userUploads";
import { FileUpload } from "shared/compute/components/FileUpload";
import ApiContext from "shared/common/utilities/ApiContext";
import uniqueId from "lodash.uniqueid";

import "shared/compute/styles/CustomOrCatalogVectorSelect.scss";

type vectorSelectInputType = "catalog" | "custom";

interface CustomOrCatalogVectorSelectProps {
  onChange: (queryVectorId?: string) => void;
  vectorDefault?: Array<DropdownState>; // this is from the query param, and thus should not change
}

interface CustomOrCatalogVectorSelectState {
  inputType: vectorSelectInputType;
  messageWarning: string;
  messageDetail: string;
  isLoading: boolean;
}

export class CustomOrCatalogVectorSelect extends React.Component<
  CustomOrCatalogVectorSelectProps,
  CustomOrCatalogVectorSelectState
> {
  static contextType = ApiContext;

  private radioName = `vectorSelectInputType-${uniqueId()}`;

  constructor(props: any) {
    super(props);

    this.state = {
      inputType: "catalog",
      messageWarning: "",
      messageDetail: "",
      isLoading: false,
    };
  }

  renderVectorCatalog = () => {
    return (
      <VectorCatalog
        onSelection={(id: string, labels: any) => {
          // we don't use the labels param
          this.props.onChange(id);
        }}
        catalog="continuous"
        initialDropdowns={this.props.vectorDefault} // may be null (passed down null) or undefined (not specified in props)
      />
    );
  };

  renderCustomUpload = () => {
    const example = (
      <div style={{ marginBottom: "20px" }}>
        <div style={{ paddingRight: "10px" }}>
          Upload a csv with the format:
        </div>
        <table className="custom_csv_example_table">
          <tbody>
            <tr>
              <td>cell line 1</td>
              <td>0.5</td>
            </tr>
            <tr>
              <td>cell line 2</td>
              <td>0.5</td>
            </tr>
            <tr>
              <td>cell line 3</td>
              <td>0.5</td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    const customUploadComponent = (
      <div>
        {example}
        <FileUpload onChange={this.customUploadOnChange} />
        {this.state.isLoading && <span className="Select-loading" />}

        <div className="has-error">{this.state.messageWarning}</div>
        <div>{this.state.messageDetail}</div>
      </div>
    );
    return customUploadComponent;
  };

  handleUploadResponse = (uploadTask: UploadTask) => {
    let messageWarning = "";

    if (uploadTask.state == "FAILURE") {
      messageWarning = `Error: ${uploadTask.message}`;

      this.props.onChange();
    } else if (uploadTask.state == "SUCCESS") {
      if (uploadTask.result.warnings.length > 0) {
        messageWarning = uploadTask.result.warnings.join("\n");
      }

      if (uploadTask.sliceId) {
        this.props.onChange(uploadTask.sliceId);
      } else {
        // Breadbox uses a more streamline approach for setting sliceId in the backend.
        // This means sliceId is present in uploadTask.result, rather than the uploadTask
        // itself. We leave the logic for uploadTask.sliceId, because this component is shared
        // by the legacy portal backend.

        this.props.onChange(uploadTask.result.sliceId);
      }
    }
    this.setState({
      messageWarning,
      messageDetail: "",
      isLoading: false,
    });
  };

  customUploadOnChange = (uploadFile: any) => {
    if (!uploadFile || uploadFile.filename == "") {
      this.props.onChange();
      this.setState({
        messageWarning: "",
        messageDetail: "",
      });
      return;
    }
    if (uploadFile.size > 10000000) {
      // front end size limit for vector
      // this is needed because oauth reads the entire request body into memory
      this.setState({
        messageWarning: "File is too large, max size is 10MB",
        messageDetail: "",
      });
      return;
    }
    /**
      "Clear" the selected vector, i.e. notify the parent that we're loading and there isn't a valid selection
      The FileUpload component is actually wired up to call this onChange function with an empty string whenever it is clicked
      Which is to say, given the current functionality of FileUpload, the if block above is fired on click, and thus the onChange(null) below is not necessary
      However, keeping the onChange below as a safeguard, in anticipation that one may change the behavior of FileUpload without realizing that it has consequences on this
    */
    this.props.onChange();
    this.setState({
      isLoading: true,
    });

    const { getApi } = this.context;

    getApi()
      .postCustomCsvOneRow({ uploadFile })
      .then(this.handleUploadResponse);
  };

  render() {
    return (
      <div>
        <div>
          <Radio
            name={this.radioName}
            checked={this.state.inputType === "catalog"}
            onChange={() => {
              this.props.onChange();
              this.setState({
                inputType: "catalog",
              });
            }}
          >
            Portal data
          </Radio>
          {this.state.inputType === "catalog" && (
            <div style={{ marginLeft: "20px" }}>
              {this.renderVectorCatalog()}
            </div>
          )}
          <Radio
            name={this.radioName}
            checked={this.state.inputType === "custom"}
            onChange={() => {
              this.props.onChange();
              this.setState({
                inputType: "custom",
                messageWarning: "",
                messageDetail: "",
              });
            }}
          >
            Custom upload
          </Radio>
          {this.state.inputType === "custom" && (
            <div style={{ marginLeft: "20px" }}>
              {this.renderCustomUpload()}
            </div>
          )}
        </div>
      </div>
    );
  }
}
