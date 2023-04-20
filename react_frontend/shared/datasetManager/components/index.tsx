import React, { useCallback, useContext, useEffect, useState } from "react";
import { Dataset, DatasetTableData } from "shared/common/models/Dataset";

import { Spinner } from "shared/common/components/Spinner";
import WideTable from "shared/common/components/WideTable";
import Button from "react-bootstrap/lib/Button";

import styles from "shared/datasetManager/styles/styles.scss";
import { instanceOfErrorDetail } from "shared/common/models/ErrorDetail";
import ApiContext from "shared/common/utilities/ApiContext";

import FormModal from "../../common/components/FormModal";

import DatasetForm from "./AddDatasetForm";

const formatTableData = (datasets: Dataset[]): DatasetTableData[] => {
  return datasets.map(({ id, name, group, feature_type, sample_type }) => {
    const groupName = group.name;
    return {
      id,
      name,
      groupName,
      featureType: feature_type,
      sampleType: sample_type,
    };
  });
};

export default function Datasets() {
  const context = useContext(ApiContext);
  const [dapi] = useState(() => context.getApi());
  const [datasets, setDatasets] = useState<Dataset[] | null>(null);

  const [initError, setInitError] = useState(false);
  const [datasetSubmissionError, setDatasetSubmissionError] = useState<
    string | null
  >(null);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<Set<string>>(
    new Set()
  );
  const [showModal, setShowModal] = useState(false);

  const getFeatureTypes = useCallback(() => dapi.getFeatureTypes(), [dapi]);
  const getSampleTypes = useCallback(() => dapi.getSampleTypes(), [dapi]);
  const getGroups = useCallback(() => dapi.getGroups(), [dapi]);

  useEffect(() => {
    (async () => {
      try {
        const currentDatasets = await dapi.getBreadboxDatasets();
        setDatasets(currentDatasets);
      } catch (e) {
        console.error(e);
        setInitError(true);
      }
    })();
  }, [dapi]);

  if (!datasets) {
    return initError ? (
      <div className={styles.container}>
        Sorry, there was an error fetching datasets.
      </div>
    ) : (
      <Spinner />
    );
  }

  const onSubmit = async (
    datasetArgs: any,
    allowed_values_query_args: string[],
    clear_state_callback: (isSuccessfulSubmit: boolean) => void
  ) => {
    let isSubmitted = false;
    // Reset submission error state on submit
    setDatasetSubmissionError(null);
    try {
      const dataset = await dapi.postDataset(
        datasetArgs,
        allowed_values_query_args
      );
      const newDatasets = [...datasets, dataset];
      setDatasets(newDatasets);
      setShowModal(false);
      isSubmitted = true;
    } catch (e) {
      console.error(e);
      if (instanceOfErrorDetail(e)) {
        setDatasetSubmissionError(e.detail);
      }
    }
    // In case of 500 error
    if (!isSubmitted) {
      setDatasetSubmissionError("Failed to submit dataset!");
    }
    clear_state_callback(isSubmitted);
  };

  const datasetForm = (
    <DatasetForm
      onSubmit={onSubmit}
      getFeatureTypes={getFeatureTypes}
      getSampleTypes={getSampleTypes}
      getGroups={getGroups}
      datasetSubmissionError={datasetSubmissionError}
    />
  );

  const deleteButtonAction = async () => {
    let isDeleted = false;
    const datasetIdsSet = new Set(selectedDatasetIds);
    try {
      await Promise.all(
        Array.from(datasetIdsSet).map((dataset_id) => {
          return dapi.deleteDatasets(dataset_id);
        })
      );
      isDeleted = true;
    } catch (e) {
      console.error(e);
    }
    if (isDeleted) {
      setDatasets(datasets.filter((dataset) => !datasetIdsSet.has(dataset.id)));
    }
  };

  return (
    <>
      <div className={styles.primaryButtons}>
        <Button bsStyle="primary" onClick={() => setShowModal(true)}>
          Upload New Dataset
        </Button>
        <Button
          bsStyle="danger"
          onClick={() => deleteButtonAction()}
          disabled={selectedDatasetIds.size === 0 || datasets.length === 0}
        >
          Delete Selected Dataset
        </Button>
      </div>

      <WideTable
        renderWithReactTableV7
        rowHeight={40}
        idProp="id"
        onChangeSelections={(selections) => {
          setSelectedDatasetIds(new Set(selections));
        }}
        data={formatTableData(datasets)}
        columns={[
          { accessor: "name", Header: "Name", maxWidth: 800 },
          { accessor: "featureType", Header: "Feature Type", maxWidth: 300 },
          { accessor: "sampleType", Header: "Sample Type", maxWidth: 300 },
          { accessor: "groupName", Header: "Group Name", maxWidth: 300 },
        ]}
      />
      {datasets ? (
        <FormModal
          title="Add Dataset"
          showModal={showModal}
          onHide={() => setShowModal(false)}
          formComponent={datasetForm}
        />
      ) : null}
    </>
  );
}
