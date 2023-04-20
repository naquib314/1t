import * as React from "react";
import { Button, Modal, Radio } from "react-bootstrap";

import {
  AnalysisType,
  QuerySelections,
  ComputeResponse,
  ComputeResponseResult,
  SelectNSOption,
  CommonQueryProps,
} from "shared/compute/models/compute";
import { DropdownState } from "shared/interactive/models/interactive";
import { CellData } from "shared/cellLineSelector/models/cellLines";
import ProgressTracker from "shared/common/components/ProgressTracker";

import AssociationPearsonQuery from "shared/compute/components/AssociationPearsonQuery";
import { TwoClassQuery } from "shared/compute/components/TwoClassQuery";

import "shared/compute/styles/CustomAnalysisModal.scss";

// generic custom analysis modal that can be outfitted with different queries
// this component is concerned with the logic of having a modal, sending an analysis request, and handling it's progress/error messages

interface CustomAnalysisModalProps {
  showModal: boolean;
  onHide: () => void;
  queryInfo: {
    cellLineData: Map<string, CellData>; // map with key = depmapId, value = object with cell line data
    datasets: Array<SelectNSOption>;
  }; // props not used by this component, but just passed down for the child query component.
  onAssociationResultsComplete: (
    numCellLinesUsed: number,
    result: ComputeResponseResult,
    queryVectorId: string,
    overrideColorState: string,
    overrideFilterState: string,
    analysisType: AnalysisType
  ) => void;
  customAnalysisVectorDefault?: Array<DropdownState>; // this is from the query param, and thus should not change
  getTaskStatus: (taskIds: string) => Promise<ComputeResponse>;
  launchCellLineSelectorModal: () => void;
}

interface CustomAnalysisModalState {
  analysisType: AnalysisType;
  submissionResponse: Promise<ComputeResponse>;
  onSuccess: (
    response: ComputeResponse,
    onResultsComplete: (response: ComputeResponse) => void
  ) => void;
  analysisCurrentlyRunning: boolean;
}
// const TWO_CLASS_DESC = (<div>
//     <p>In this analysis, we regress the dependent variable on the independent variable and
//         report the regression coefficient along with its standard error. After repeating this
//         procedure for each column of the selected dataset (either as the dependent or independent
//         variable), we moderate the reported values using the adaptive shrinkage procedure described
//         in doi:10.1093/biostatistics/kxw041. This procedure consists of an empirical Bayes method that
//         aims to correct the selection bias due to the multiple models examined jointly. Finally,
//         we report the posterior means, the standard deviations, and the corresponding q-values as the results.</p>
//     <p>Please note, the significance of a linear association is identical to the significance of the
//         corresponding Pearson correlation, modulo the shrinkage step we included at the end. However,
//         the coefficients or effect sizes reported in these analyses should be interpreted slightly differently.
//         In particular, the regression coefficients are directional quantities and answer the question of
//         "How much would the dependent variable change if we increase the independent variable one unit
//         (assuming there are not any unobserved confounding variables)?" However, the correlation
//         coefficients are unitless and symmetric quantities that provided a scale-free measure of the concordance between two variables.</p>
// </div>);

export default class CustomAnalysisModal extends React.Component<
  CustomAnalysisModalProps,
  Partial<CustomAnalysisModalState>
> {
  // needs to be optional because the key in syntax declares all
  private queryComponents: { [key in AnalysisType]?: any } = {};

  constructor(props: any) {
    super(props);
    this.state = {
      analysisType: undefined,
      submissionResponse: undefined,
      analysisCurrentlyRunning: false,
    };
  }

  clearPreviousRun = () => {
    // called on modal enter
    this.setState({
      submissionResponse: undefined,
    });
  };

  onModalEnter = () => {
    const { analysisType } = this.state;
    this.clearPreviousRun();
    if (analysisType && this.queryComponents[analysisType]) {
      // onEnter first fires with no query component rendered yet, just the analysis select
      this.queryComponents[analysisType].setStatesFromProps();
    }
  };

  sendQueryGeneric = (
    runCustomAnalysis: () => Promise<ComputeResponse>,
    onSuccess: (
      response: ComputeResponse,
      onResultsComplete?: (response: ComputeResponse) => void
    ) => void
  ) => {
    const submissionResponse = runCustomAnalysis();
    this.setState({
      submissionResponse,
      onSuccess, // this changes because the analysis type might change
      analysisCurrentlyRunning: true,
    });
  };

  onSuccessGeneric = (
    response: ComputeResponse,
    onResultsComplete: (response: any) => void
  ): void => {
    onResultsComplete(response);
    this.setState({
      analysisCurrentlyRunning: false,
    });
    this.closeModal();
  };

  renderSelectAnalysis = () => {
    const { analysisType } = this.state;
    const selectAnalysisOnChange = (event: React.FormEvent<Radio>) => {
      const target = event.target as HTMLInputElement;
      this.setState({
        analysisType: target.value as AnalysisType,
      });
    };

    return (
      <div className="analysis-type-div">
        <strong>Select type of analysis to run</strong>
        <div data-selenium-id="analysis-type">
          <Radio
            name="selectAnalysis"
            value="pearson"
            checked={analysisType === "pearson"}
            onChange={selectAnalysisOnChange}
          >
            <strong>Pearson correlation</strong>
            <p>
              Computes Pearson correlation for each feature in the selected
              dataset along with corresponding q-value.
            </p>
          </Radio>
          {enabledFeatures.linear_association && (
            <Radio
              name="selectAnalysis"
              value="association"
              checked={analysisType === "association"}
              onChange={selectAnalysisOnChange}
            >
              <strong>Linear association</strong>
              <p>
                Regress a dependent variable on a independent variable and
                report a moderated regression coefficient along with its q-value
              </p>
            </Radio>
          )}
          <Radio
            name="selectAnalysis"
            value="twoClass"
            checked={analysisType === "twoClass"}
            onChange={selectAnalysisOnChange}
          >
            <strong>Two class comparison</strong>
            <p>
              Computes a moderated estimate of the difference between
              groups&apos; means for each feature along with the corresponding
              q-value.
            </p>
          </Radio>
        </div>
      </div>
    );
  };

  renderBody = (querySelections?: QuerySelections) => {
    if (querySelections === undefined) {
      // null when query not selected
      return (
        <div className="query-container">
          <div className="modal-row">
            <div className="modal-column">{this.renderSelectAnalysis()}</div>
            <div className="modal-column" />
          </div>
          <div className="modal-row">
            <div className="modal-column" />
            <div className="modal-column" />
          </div>
        </div>
      );
    }

    return (
      <div className="query-container">
        <div className="modal-row">
          <div className="modal-column">{this.renderSelectAnalysis()}</div>
          <div className="modal-column">{querySelections[1]}</div>
          {2 in querySelections && (
            <div className="modal-column">{querySelections[2]}</div>
          )}
        </div>
        <div className="modal-row">
          <div className="modal-column">{querySelections[3]}</div>
          {4 in querySelections && (
            <div className="modal-column">{querySelections[4]}</div>
          )}
          {5 in querySelections && (
            <div className="modal-column">{querySelections[5]}</div>
          )}
        </div>
      </div>
    );
  };

  renderBodyFooter = (
    querySelections: QuerySelections | undefined,
    queryIsValid: boolean,
    sendQuery?: () => void
  ) => {
    const { getTaskStatus } = this.props;
    const {
      analysisCurrentlyRunning,
      submissionResponse,
      onSuccess,
    } = this.state;
    return (
      <div>
        {/* enclosing div to return one react element */}
        <Modal.Body>{this.renderBody(querySelections)}</Modal.Body>
        <Modal.Footer>
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
              }}
            >
              <Button
                className="btn btn-primary run-btn cust-assoc-run-btn"
                data-selenium-id="cust-assoc-run-btn"
                disabled={!queryIsValid || analysisCurrentlyRunning} // queryIsValid is supplied by child
                onClick={sendQuery} // supplied by child, wraps sendQueryGeneric
              >
                Run
              </Button>
              <div style={{ marginRight: "10px" }}>
                {submissionResponse != null && (
                  <ProgressTracker
                    submissionResponse={submissionResponse}
                    onSuccess={(response: any, onResultsComplete: any) =>
                      onSuccess?.(response, onResultsComplete)
                    }
                    onFailure={() => {
                      this.setState({
                        analysisCurrentlyRunning: false,
                      });
                    }}
                    getTaskStatus={getTaskStatus}
                  />
                )}
              </div>
            </div>
          </div>
        </Modal.Footer>
      </div>
    );
  };

  closeModal = (): void => {
    const { onHide } = this.props;
    onHide();
    this.clearPreviousRun();
  };

  render() {
    const {
      queryInfo,
      onAssociationResultsComplete,
      customAnalysisVectorDefault,
      showModal,
      launchCellLineSelectorModal,
    } = this.props;
    const { analysisType } = this.state;

    let QueryComponentClass: React.ComponentClass<CommonQueryProps>;
    if (analysisType === "pearson" || analysisType === "association") {
      QueryComponentClass = AssociationPearsonQuery;
    } else {
      QueryComponentClass = TwoClassQuery;
    }
    return (
      <div>
        <Modal
          className="custom-associations-modal"
          show={showModal}
          bsSize="large"
          onHide={this.closeModal}
          onEnter={this.onModalEnter}
        >
          <Modal.Header closeButton>
            <Modal.Title>Custom Analyses</Modal.Title>
          </Modal.Header>
          {analysisType == null ? (
            this.renderBodyFooter(undefined, false, undefined)
          ) : (
            <QueryComponentClass
              launchCellLineSelectorModal={launchCellLineSelectorModal}
              analysisType={analysisType} // only used for association and pearson
              renderBodyFooter={this.renderBodyFooter}
              sendQueryGeneric={this.sendQueryGeneric}
              onSuccessGeneric={this.onSuccessGeneric}
              queryInfo={queryInfo}
              onAssociationResultsComplete={onAssociationResultsComplete}
              customAnalysisVectorDefault={customAnalysisVectorDefault}
              ref={(el) => {
                this.queryComponents[analysisType] = el;
              }}
            />
          )}
        </Modal>
      </div>
    );
  }
}
