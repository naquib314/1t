import * as React from "react";

import LongTableWithColumnDropdown, {
  LongTableWithColumnDropdownProps,
} from "./LongTableWithColumnDropdown";

const WrapperComponent = (props) => (
  <div style={{ height: 400 }}>
    <LongTableWithColumnDropdown {...props} />
  </div>
);
WrapperComponent.displayName = "common/LongTableWithColumnDropdown";
const dataFromProps = [
  { a: 1, b: 2, c: 3 },
  { a: 4, b: 5, c: 6 },
  { a: 7, b: 8, c: 9 },
];
const props: LongTableWithColumnDropdownProps = {
  dataFromProps: dataFromProps,
  columnGroups: [
    { columns: [{ key: "a" }] },
    { name: "consonants", columns: [{ key: "b" }, { key: "c" }] },
  ],
};
export default [
  {
    component: WrapperComponent,
    name: "default",
    props,
  },
];
