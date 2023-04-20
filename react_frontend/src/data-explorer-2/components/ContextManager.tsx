import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ReactSelect from "react-windowed-select";
import { DataExplorerContext } from "src/data-explorer-2/types";
import { fetchDatasetsByIndexType } from "src/data-explorer-2/api";
import {
  capitalize,
  deleteContextFromLocalStorage,
  getDimensionTypeLabel,
  getStoredContextTypes,
  loadContextsFromLocalStorage,
  saveContextToLocalStorage,
  sortDimensionTypes,
} from "src/data-explorer-2/utils";
import ContextBuilderModal from "src/data-explorer-2/components/ContextBuilder/ContextBuilderModal";
import styles from "src/data-explorer-2/styles/ContextManager.scss";

interface Props {
  onHide: () => void;
}

function Welcome() {
  return (
    <div>
      <p>
        Welcome! This is an <b>Early Access</b> version of the new Context
        Manager. Here you can create and edit the contexts that Data Explorer
        2.0 uses to aggregate, filter and color data.
      </p>
      <p>
        If you’ve used Cell Line Selector before, you’ll be familiar with the
        cell line lists it generates. A “context” is conceptually similar to one
        of those lists. However, instead of manually checking off each cell line
        you want to include, you define a rule (or set of rules) that describes
        what that list show look like. For instance, in just a few clicks, you
        could create the rule “Lineage is Lung” and save it as a context.
      </p>
      <p>
        Unlike its predecessor, Data Explorer 2.0 has the ability to plot more
        than just cell line models. Accordingly, you can create different types
        of contexts.
      </p>
    </div>
  );
}

function ContextListItem({
  contextName,
  onClickEdit,
  onClickDuplicate,
  onClickDelete,
}: any) {
  return (
    <div className={styles.ContextListItem}>
      <span>{contextName}</span>
      <span>
        <Button name="edit-context" onClick={onClickEdit}>
          <i className="glyphicon glyphicon-pencil" />
        </Button>
        <Button name="duplicate-context" onClick={onClickDuplicate}>
          <i className="glyphicon glyphicon-duplicate" />
        </Button>
        <Button name="delete-context" onClick={onClickDelete}>
          <i className="glyphicon glyphicon-trash" />
        </Button>
      </span>
    </div>
  );
}

function ContextTypeSelect({ value, onChange }: any) {
  const [datasetsByIndexType, setDatasetsByIndexType] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDatasetsByIndexType();
        setDatasetsByIndexType(data);
      } catch (e) {
        window.console.error(e);
      }
    })();
  }, []);

  const options = sortDimensionTypes(Object.keys(datasetsByIndexType || {}))
    .filter((index_type: string) => index_type !== "other")
    .map((index_type: string) => ({
      value: index_type,
      label: capitalize(getDimensionTypeLabel(index_type)),
    }));

  const selectedValue = options?.find((option: any) => {
    return option.value === value;
  });

  return (
    <div className={styles.ContextTypeSelect}>
      <div>
        <label htmlFor="context-type">Context type</label>
      </div>
      <ReactSelect
        id="context-type"
        options={options}
        value={selectedValue}
        onChange={(option: any) => {
          onChange(option.value);
        }}
        isLoading={!datasetsByIndexType}
      />
    </div>
  );
}

function ContextManager({ onHide }: Props) {
  const [showContextModal, setShowContextModal] = useState(false);
  const [contextType, setContextType] = useState("depmap_model");
  const [, forceRender] = useState({});
  const contextToEdit = useRef(null);
  const onClickSave = useRef(null);

  useEffect(() => {
    let modal: HTMLElement = document.querySelector("#modal-container");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-container";
      modal.style.zIndex = "1051";
      modal.style.position = "absolute";
      modal.style.top = "0";
      document.body.appendChild(modal);
    }
  }, []);

  const contexts = loadContextsFromLocalStorage(contextType);
  const isStorageEmpty = getStoredContextTypes().size === 0;

  const handleClickEdit = (
    hash: string | null,
    context: Partial<DataExplorerContext>
  ) => {
    contextToEdit.current = context;
    setShowContextModal(true);

    onClickSave.current = (editedContext: DataExplorerContext) => {
      saveContextToLocalStorage(editedContext, hash);
      setShowContextModal(false);

      if (context.name) {
        window.dispatchEvent(
          new CustomEvent("dx2_context_edited", {
            detail: {
              prevContext: context,
              nextContext: editedContext,
            },
          })
        );
      }
    };
  };

  const handleClickDuplicate = (context: DataExplorerContext) => {
    const duplicateContext = {
      ...context,
      name: `Copy of ${context.name}`,
    };

    saveContextToLocalStorage(duplicateContext);
    window.dispatchEvent(new Event("dx2_contexts_updated"));
    forceRender({});
  };

  const handleClickDelete = (hash: string, contextName: string) => {
    // TODO: Josh wants a way to suppress these warnings.
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Are you sure you want to delete context "${contextName}"?`
    );

    if (confirmed) {
      deleteContextFromLocalStorage(hash);
      window.dispatchEvent(new Event("dx2_contexts_updated"));
      forceRender({});
    }
  };

  return (
    <>
      <Modal
        className={styles.ContextManager}
        show
        backdrop="static"
        onHide={onHide}
        style={{
          visibility: showContextModal ? "hidden" : "visible",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Context Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isStorageEmpty && <Welcome />}
          <ContextTypeSelect
            value={contextType}
            onChange={(value: string) => setContextType(value)}
          />
          <div className={styles.ContextList}>
            <div className={styles.ContextListItems}>
              {Object.entries(contexts).map(([hash, context]) => (
                <ContextListItem
                  key={hash}
                  contextName={context.name}
                  onClickEdit={() => handleClickEdit(hash, context)}
                  onClickDuplicate={() => handleClickDuplicate(context)}
                  onClickDelete={() => handleClickDelete(hash, context.name)}
                />
              ))}
            </div>
            <div className={styles.NewContextItem}>
              <Button
                onClick={() => {
                  handleClickEdit(null, { context_type: contextType });
                }}
              >
                Create new +
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <ContextBuilderModal
        backdrop={false}
        show={showContextModal}
        context={contextToEdit.current}
        isExistingContext
        onClickSave={onClickSave.current}
        onHide={() => setShowContextModal(false)}
      />
    </>
  );
}

export default ContextManager;
