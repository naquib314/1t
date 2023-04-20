import * as React from "react";
import { Button, Modal } from "react-bootstrap";
import { FileCard, FileModalProps } from "./FileModal";

export interface FileModal extends FileModalProps {
  defaultModalState?: boolean;
  toggleShowFileModalHandler: () => void;
}

export const FileCardModal = (modalProps: FileModal) => {
  return (
    <div className="card-modal">
      {modalProps.show && (
        <Modal
          show={modalProps.show}
          onHide={modalProps.toggleShowFileModalHandler}
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
                onClick={modalProps.toggleShowFileModalHandler}
              >
                <strong>X</strong>
              </Button>
            </div>
            <FileCard
              file={modalProps.file}
              dataUsageUrl={modalProps.dataUsageUrl}
              release={modalProps.release}
              show={modalProps.show}
              termsDefinitions={modalProps.termsDefinitions}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};
