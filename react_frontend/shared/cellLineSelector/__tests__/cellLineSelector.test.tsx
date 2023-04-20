/**
 * @jest-environment jsdom
 */

import { LocalStorageListStore } from "shared/cellLineSelector/components/ListStorage";
import { getSelectedCellLineListName } from "shared/common/utilities/colorAndHighlights";

beforeEach(() => {
  // normal component calls getSelectedCellLineListName which is available as a globally-scope javascript function. mock that out here
  getSelectedCellLineListName = () => "None";
});

describe("Cell Line Selector", () => {
  it("LocalStorageListStore operations", () => {
    localStorage.clear();
    localStorage.setItem("x", "z");
    const l = new LocalStorageListStore();
    expect(l.getLists().length).toBe(0);

    l.add({ name: "x", lines: new Set(["a", "b", "c"]) });
    const lists = l.getLists();
    expect(lists.length).toBe(1);
    expect(lists[0].name).toEqual("x");
    expect(lists[0].lines).toEqual(new Set(["a", "b", "c"]));

    l.delete("x");
    expect(l.getLists().length).toBe(0);
  });
});