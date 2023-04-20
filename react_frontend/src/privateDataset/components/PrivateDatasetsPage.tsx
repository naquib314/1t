import * as React from "react";
import { useState } from "react";
import ReactTable, { Column } from "react-table";
import { Button } from "react-bootstrap";
import UserUploadModal from "shared/userUpload/components/UserUploadModal";
import { DepmapApi } from "src/dAPI";
import { getDapi } from "src/common/utilities/context";
import { UploadTask, UploadFormat } from "shared/userUpload/models/userUploads";

/**
 * Component that displays private datasets accessible by the current user.
 *
 * Future functionality may include editting user groups.
 */

type Props = {
  datasets: Array<{
    dataset_id: string;
    display_name: string;
    private_group_display_name: string;
  }>;
  groups: Array<{ groupId: number; displayName: string }>;
  email: string;
  onShowModal: () => void;
};

type State = {
  datasetsToDelete: Set<string>;
  uploadTask: UploadTask;
};

class PrivateDatasetsPageMain extends React.Component<Props, State> {
  uploadForm: React.RefObject<HTMLFormElement>;

  dapi: DepmapApi;

  DATASET_COLUMNS: Array<Column> = [
    {
      Header: "",
      accessor: "dataset_id",
      width: 40,
      Cell: (row) => (
        <input
          type="checkbox"
          checked={this.state.datasetsToDelete.has(row.value)}
          onChange={() => {
            this.state.datasetsToDelete.has(row.value)
              ? this.state.datasetsToDelete.delete(row.value)
              : this.state.datasetsToDelete.add(row.value);
            this.setState({
              datasetsToDelete: new Set(this.state.datasetsToDelete),
            });
          }}
        />
      ),
    },
    {
      Header: "Display name",
      accessor: "display_name",
      style: { textAlign: "left" },
      headerStyle: { textAlign: "left" },
      filterable: true,
    },
    {
      Header: "Group",
      accessor: "private_group_display_name",
      style: { textAlign: "left" },
      headerStyle: { textAlign: "left" },
      filterable: true,
    },
    {
      Header: "View in Data Explorer",
      accessor: "data_explorer_url",
      style: { textAlign: "left" },
      headerStyle: { textAlign: "left" },
      width: 150,
      Cell: (row) => (
        <a href={row.value} target="_blank">
          Data Explorer <i className="fas fa-link" />
        </a>
      ),
    },
  ];

  constructor(props: Props) {
    super(props);

    this.uploadForm = React.createRef();

    this.dapi = getDapi();

    this.state = {
      datasetsToDelete: new Set(),
      uploadTask: null,
    };
  }

  renderGroups() {
    return (
      <>
        <h2>Your groups</h2>
        <ul>
          {this.props.groups.map((group) => (
            <li key={group.groupId}>{group.displayName}</li>
          ))}
        </ul>
      </>
    );
  }

  renderPrivateDatasetsTable() {
    if (this.props.datasets.length == 0) {
      return (
        <>
          <h2>Your datasets</h2>
          <p>You don&apos;t have any private datasets.</p>
          <Button bsStyle="primary" onClick={this.props.onShowModal}>
            Upload new dataset
          </Button>
        </>
      );
    }
    return (
      <>
        <h2>Your datasets</h2>
        <div className="button-toolbar">
          <Button bsStyle="primary" onClick={this.props.onShowModal}>
            Upload new dataset
          </Button>
          <Button
            onClick={() => {
              const datasetsToDeleteNames = Array.from(
                this.state.datasetsToDelete
              ).map(
                (datasetId) =>
                  this.props.datasets.find(
                    (dataset) => dataset.dataset_id == datasetId
                  ).display_name
              );
              if (
                confirm(
                  `Are you sure you want to delete the following datasets?\n- ${datasetsToDeleteNames.join(
                    "\n- "
                  )}`
                )
              ) {
                this.dapi
                  .deletePrivateDatasets(
                    Array.from(this.state.datasetsToDelete)
                  )
                  .then(() => window.location.reload());
              }
            }}
            disabled={this.state.datasetsToDelete.size == 0}
            bsClass="btn btn-sm btn-danger btn-danger-outline"
          >
            Delete selected datasets
          </Button>
        </div>
        <ReactTable
          data={this.props.datasets}
          columns={this.DATASET_COLUMNS}
          defaultPageSize={10}
        />
      </>
    );
  }

  render() {
    if (this.props.groups.length == 0) {
      return (
        <p>
          You are not a member of any authorization group. Please{" "}
          <a href={`mailto:${this.props.email}`}>
            email us about creating a group
          </a>
          .
        </p>
      );
    }
    return (
      <>
        {this.renderGroups()}
        {this.renderPrivateDatasetsTable()}
        <div className="page-bottom-spacer" />
      </>
    );
  }
}

export default function PrivateDatasetsPage(props: Omit<Props, "onShowModal">) {
  const [show, setShow] = useState(false);
  const dapi = getDapi();
  return (
    <>
      <PrivateDatasetsPageMain {...props} onShowModal={() => setShow(true)} />
      <UserUploadModal
        show={show}
        onHide={() => {
          setShow(false);
        }}
        uploadFormat={UploadFormat.File}
        isPrivate
        isTransient={false}
        taskKickoffFunction={dapi.uploadPrivateDataset.bind(dapi)}
        groups={props.groups}
        getTaskStatus={(taskId: string) => dapi.getTaskStatus(taskId)}
      />
    </>
  );
}
