import React from "react";

import CreatableSelect from "react-select/creatable";
import { ActionMeta, ValueType } from "react-select";

const components = {
  DropdownIndicator: null as any,
};

export interface Option {
  readonly label: string;
  readonly value: string;
}

interface TagInputProps {
  readonly inputValue: string;
  readonly value: readonly Option[];
  onInputChange: (inputValue: string) => void;
  onChange: (
    valueAfterAction: ValueType<Option, true>,
    actionMeta?: ActionMeta<Option>
  ) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

const TagInput = (props: TagInputProps) => {
  const {
    inputValue,
    onInputChange,
    onKeyDown,
    onChange,
    value,
    placeholder,
    isDisabled,
  } = props;
  return (
    <CreatableSelect
      components={components}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onKeyDown={onKeyDown}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      menuIsOpen={false}
      isMulti
      isClearable
      isDisabled={isDisabled}
    />
  );
};

TagInput.defaultProps = {
  placeholder: "",
  isDisabled: true,
};

export default TagInput;
