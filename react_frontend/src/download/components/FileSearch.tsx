import React from "react";
import { Typeahead } from "react-bootstrap-typeahead";

export interface FileSearchOption {
  filename: string;
  releasename: string;
  description: string;
}

export interface FileSearchProps {
  searchOptions: FileSearchOption[];
  onSearch: (selection: FileSearchOption) => void;
  searchPlaceholder: string;
}

export const FileSearch = (fileSearchProps: FileSearchProps) => {
  const { searchOptions, onSearch, searchPlaceholder } = fileSearchProps;

  const filterByFields = ["filename", "releasename", "description"];

  return (
    <div style={{ maxWidth: "74ch" }}>
      <Typeahead
        filterBy={filterByFields}
        id="file-search"
        labelKey="filename"
        clearButton
        onChange={(options: FileSearchOption[]) => {
          if (options[0]) {
            onSearch(options[0]);
          }
        }}
        disabled={!searchOptions}
        options={searchOptions || []}
        selected={[]}
        minLength={1}
        placeholder={searchPlaceholder}
        renderMenuItemChildren={(option: FileSearchOption) => (
          <div>
            {option.filename}
            <div>
              <small>{`Release: ${option.releasename}`}</small>
            </div>
          </div>
        )}
        highlightOnlyResult
      />
    </div>
  );
};
