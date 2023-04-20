/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Modal } from "react-bootstrap";
import { capitalize, getDimensionTypeLabel } from "src/data-explorer-2/utils";
import ModalContent from "src/data-explorer-2/components/ContextBuilder/ModalContent";
import styles from "src/data-explorer-2/styles/ContextBuilder.scss";

interface Props {
  show: boolean;
  context: Record<any, any> | null;
  onClickSave: (newContext: any) => void;
  onHide: () => void;
  isExistingContext?: boolean;
  backdrop?: "static" | boolean;
}

function ContextBuilderModal({
  show,
  context,
  onClickSave,
  onHide,
  backdrop,
  isExistingContext,
}: Props) {
  const contextTypeName = context
    ? capitalize(getDimensionTypeLabel(context.context_type))
    : "";

  const title = `${
    context?.expr
      ? `${isExistingContext ? "Edit" : "Save as"}`
      : `Create ${/^[AEIOU]/.test(contextTypeName) ? "an" : "a"}`
  } ${contextTypeName} Context`;

  return (
    <Modal
      className={styles.ContextBuilder}
      backdrop={backdrop}
      show={show}
      onHide={onHide}
      bsSize="large"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body key={`${show}`}>
        <ModalContent
          context={context}
          onClickSave={onClickSave}
          onClickCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
}

ContextBuilderModal.defaultProps = {
  isExistingContext: false,
  backdrop: "static",
};

export default ContextBuilderModal;
