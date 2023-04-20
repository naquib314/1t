import React from "react";
import { DataExplorerContext } from "src/data-explorer-2/types";
import { saveContextToLocalStorage } from "src/data-explorer-2/utils";
import ContextBuilderModal from "src/data-explorer-2/components/ContextBuilder/ContextBuilderModal";

function StandaloneContextEditor({ context, hash, onHide }: any) {
  if (!context || !hash) {
    return null;
  }

  const onClickSave = (editedContext: DataExplorerContext) => {
    saveContextToLocalStorage(editedContext, hash);
    onHide();

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

  return (
    <ContextBuilderModal
      show
      context={context}
      isExistingContext
      onClickSave={onClickSave}
      onHide={onHide}
    />
  );
}

export default StandaloneContextEditor;
