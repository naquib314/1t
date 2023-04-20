import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap";
import { DatasetValueType } from "shared/common/models/Dataset";
import FeatureType from "shared/common/models/FeatureType";
import SampleType from "shared/common/models/SampleType";
import Group from "shared/common/models/Group";
import { ValueType } from "react-select";
import TagInput, { Option } from "../../common/components/TagInput";

interface DatasetFormProps {
  onSubmit: (
    args: any,
    query_args: string[],
    clear_state_callback: (isSuccessfulSubmit: boolean) => void
  ) => void;
  datasetSubmissionError: string | null;
  getFeatureTypes: () => Promise<FeatureType[]>;
  getSampleTypes: () => Promise<SampleType[]>;
  getGroups: () => Promise<Group[]>;
}

interface AllowedValuesInput {
  readonly inputValue: string;
  readonly valueOptions: readonly Option[];
  readonly allowedValues: string[];
}

const initialValues = {
  name: "",
  units: "",
  feature_type: "",
  sample_type: "",
  is_transient: false,
  data_file: "",
  sample_file: "",
  feature_file: "",
  group_id: "",
  value_type: "",
};

const createOption = (label: string) => ({
  label,
  value: label,
});

export default function DatasetForm(props: DatasetFormProps) {
  const [values, setValues] = useState(initialValues);
  const {
    onSubmit,
    datasetSubmissionError,
    getFeatureTypes,
    getSampleTypes,
    getGroups,
  } = props;
  const [
    allowedValuesInputOptions,
    setAllowedValuesInputOptions,
  ] = useState<AllowedValuesInput>({
    inputValue: "",
    valueOptions: [],
    allowedValues: [],
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [featureTypeOptions, setFeatureTypeOptions] = useState<
    FeatureType[] | null
  >(null);
  const [sampleTypeOptions, setSampleTypeOptions] = useState<
    SampleType[] | null
  >(null);
  const [groupOptions, setGroupOptions] = useState<Group[] | null>(null);
  const [initFetchError, setInitFetchError] = useState(false);
  const formElement = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [featureTypes, sampleTypes, groups] = await Promise.all([
          getFeatureTypes(),
          getSampleTypes(),
          getGroups(),
        ]);
        setFeatureTypeOptions(featureTypes);
        setSampleTypeOptions(sampleTypes);
        setGroupOptions(groups);
      } catch (e) {
        console.error(e);
        setInitFetchError(true);
      }
    })();
  }, [getFeatureTypes, getSampleTypes, getGroups]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleFileUpload = (
    e: React.FormEvent<HTMLInputElement & FormControl>
  ) => {
    const target = e.target as HTMLInputElement;
    setValues({
      ...values,
      [e.currentTarget.name]: target.files?.[0],
    });
  };

  const DatasetValueSelector = () => {
    return (
      <>
        <option key="default" value="">
          --Select--
        </option>
        {Object.values(DatasetValueType).map((val) => {
          return (
            <option key={val} value={val}>
              {val}
            </option>
          );
        })}
      </>
    );
  };

  const TypeSelector = (typeSelectorProps: {
    typeOptions: FeatureType[] | SampleType[] | null;
  }) => {
    const { typeOptions } = typeSelectorProps;
    return (
      <>
        <option key="default" value="">
          --Select--
        </option>
        {typeOptions?.map(({ name }) => {
          return (
            <option key={name} value={name}>
              {name}
            </option>
          );
        })}
      </>
    );
  };

  const GroupSelector = (groupSelectorProps: {
    groupSelectorOptions: Group[] | null;
  }) => {
    const { groupSelectorOptions } = groupSelectorProps;
    return (
      <>
        <option key="default" value="">
          --Select--
        </option>
        {groupSelectorOptions?.map(({ id, name }) => {
          return (
            <option key={id} value={id}>
              {name}
            </option>
          );
        })}
      </>
    );
  };

  const handleAllowedValuesChange = (
    valueAfterAction: ValueType<Option, true>
    // actionMeta: ActionMeta<Option>
  ) => {
    // console.log(actionMeta)
    setAllowedValuesInputOptions({
      ...allowedValuesInputOptions,
      /* eslint-disable-next-line no-unneeded-ternary */
      valueOptions: valueAfterAction ? valueAfterAction : [],
      allowedValues: valueAfterAction
        ? valueAfterAction.map((option) => {
            return option.label;
          })
        : [],
    });
  };

  const handleAllowedValuesInputChange = (inputValue: string) => {
    setAllowedValuesInputOptions({
      ...allowedValuesInputOptions,
      inputValue,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!allowedValuesInputOptions.inputValue) return;
    const valuesArray = allowedValuesInputOptions.inputValue
      .split(",")
      .map((option) => option.trim());
    const valueOptions = valuesArray.map((val) => {
      return createOption(val);
    });
    switch (e.key) {
      case "Enter":
      case "Tab":
        setAllowedValuesInputOptions({
          inputValue: "",
          valueOptions: [
            ...allowedValuesInputOptions.valueOptions,
            ...valueOptions,
          ],
          allowedValues: [
            ...allowedValuesInputOptions.allowedValues,
            ...valuesArray,
          ],
        });
        e.preventDefault();
        break;
      default:
        console.log("Unrecognized key pressed");
    }
  };

  const disableSubmit = () => {
    const requiredForms:
      | NodeListOf<HTMLInputElement>
      | undefined = formElement.current?.querySelectorAll("[required]");
    const submittedVals: string[] = [];

    requiredForms?.forEach((x) => submittedVals.push(x.value));
    return submittedVals.some((x) => x === "");
  };

  const clearStateOnSubmit = (isSuccessfulSubmit: boolean) => {
    if (isSuccessfulSubmit) {
      setValues(initialValues);
      setAllowedValuesInputOptions({
        inputValue: "",
        valueOptions: [],
        allowedValues: [],
      });
      const dataFile = document?.getElementById("dataFile") as HTMLFormElement;
      dataFile.value = "";
      const sampleFile = document?.getElementById(
        "sampleFile"
      ) as HTMLFormElement;
      const featureFile = document?.getElementById(
        "featureFile"
      ) as HTMLFormElement;
      sampleFile.value = "";
      featureFile.value = "";
    }
    setIsSubmitted(false);
  };

  return (
    <>
      {initFetchError ? (
        <p>Failed to fetch data options!</p>
      ) : (
        <form ref={formElement}>
          <p>Fill out the fields below to add your dataset!</p>
          <FormGroup controlId="name">
            <ControlLabel>Dataset Name</ControlLabel>
            <FormControl
              name="name"
              type="text"
              value={values.name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup controlId="valueType">
            <ControlLabel>Value Type</ControlLabel>
            <FormControl
              componentClass="select"
              name="value_type"
              onChange={handleInputChange}
              value={values.value_type}
            >
              <DatasetValueSelector />
            </FormControl>
          </FormGroup>
          {values.value_type === "categorical" ? (
            <FormGroup controlId="allowedValues">
              <ControlLabel>Allowed Categorical Values</ControlLabel>
              <TagInput
                inputValue={allowedValuesInputOptions.inputValue}
                value={allowedValuesInputOptions.valueOptions}
                onInputChange={handleAllowedValuesInputChange}
                onChange={() => {
                  if (Array.isArray(allowedValuesInputOptions.valueOptions)) {
                    throw new Error(
                      "Unexpected type passed to ReactSelect onChange handler"
                    );
                  }
                  return handleAllowedValuesChange;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type value or comma-separated values (e.g. val1,val2) and press 'Enter' or 'Tab'"
                isDisabled={values.value_type !== "categorical"}
              />
            </FormGroup>
          ) : null}
          <FormGroup controlId="units">
            <ControlLabel>Units</ControlLabel>
            <FormControl
              name="units"
              type="text"
              value={values.units}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup controlId="feature_type">
            <ControlLabel>Feature Type</ControlLabel>
            <FormControl
              name="feature_type"
              componentClass="select"
              value={values.feature_type}
              onChange={handleInputChange}
              required
            >
              <TypeSelector typeOptions={featureTypeOptions} />
            </FormControl>
          </FormGroup>
          <FormGroup controlId="sample_type">
            <ControlLabel>Sample Type</ControlLabel>
            <FormControl
              name="sample_type"
              componentClass="select"
              value={values.sample_type}
              onChange={handleInputChange}
              required
            >
              <TypeSelector typeOptions={sampleTypeOptions} />
            </FormControl>
          </FormGroup>
          <FormGroup controlId="group">
            <ControlLabel>Group</ControlLabel>
            <FormControl
              componentClass="select"
              name="group_id"
              onChange={handleInputChange}
              value={values.group_id}
            >
              <GroupSelector groupSelectorOptions={groupOptions} />
            </FormControl>
          </FormGroup>
          <FormGroup controlId="dataFile">
            <ControlLabel>Dataset File</ControlLabel>
            <FormControl
              name="data_file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              required
            />
          </FormGroup>
          <FormGroup controlId="sampleFile">
            <ControlLabel>
              Additional Sample Metadata File <i>(Optional)</i>
            </ControlLabel>
            <FormControl
              name="sample_file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </FormGroup>
          <FormGroup controlId="featureFile">
            <ControlLabel>
              Additional Feature Metadata File <i>(Optional)</i>
            </ControlLabel>
            <FormControl
              name="feature_file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </FormGroup>

          <Button
            disabled={disableSubmit() || isSubmitted}
            onClick={() => {
              onSubmit(
                values,
                allowedValuesInputOptions.allowedValues,
                clearStateOnSubmit
              );
              setIsSubmitted(true);
            }}
          >
            Submit
          </Button>
          {isSubmitted ? "  Submitting Dataset..." : ""}
          <p style={{ color: "red" }}>{datasetSubmissionError}</p>
        </form>
      )}
    </>
  );
}
