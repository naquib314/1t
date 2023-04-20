import * as React from "react";
import { Button, Modal } from "react-bootstrap";
import { ReleaseCard, ReleaseModalProps } from "./ReleaseModal";

export interface ReleaseModal extends ReleaseModalProps {
  defaultModalState?: boolean;
  toggleShowReleaseModalHandler: () => void;
}

export const ReleaseCardModal = (modalProps: ReleaseModal) => {
  const { termsDefinitions } = modalProps;
  return (
    <div className="card-modal">
      {modalProps.show && (
        <Modal
          show={modalProps.show}
          onHide={modalProps.toggleShowReleaseModalHandler}
          dialogClassName="dataset_modal"
        >
          <Modal.Body>
            <div>
              <Button
                style={{
                  display: "relative",
                  float: "right",
                  fontSize: "14pt",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={modalProps.toggleShowReleaseModalHandler}
              >
                <strong>X</strong>
              </Button>
            </div>
            <ReleaseCard
              termsDefinitions={termsDefinitions}
              file={modalProps.file}
              dataUsageUrl={modalProps.dataUsageUrl}
              release={modalProps.release}
              show={modalProps.show}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};
