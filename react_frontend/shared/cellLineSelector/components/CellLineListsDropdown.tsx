import * as React from "react";
import { MenuItem, DropdownButton } from "react-bootstrap";
import { setSelectedCellLineListName } from "shared/common/utilities/colorAndHighlights";

import {
  CustomList,
  LocalStorageListStore,
  DEFAULT_EMPTY_CELL_LINE_LIST,
} from "shared/cellLineSelector/components/ListStorage";

type Props = {
  id?: string;
  defaultNone?: boolean;
  onListSelect: (cellLineList: CustomList) => void;
  onListsChange?: () => void;
  launchCellLineSelectorModal: () => void;
};

type State = {
  selectedCellLineList: CustomList;
  cellLineLists: ReadonlyArray<string>;
};

export default class CellLineListsDropdown extends React.Component<
  Props,
  State
> {
  cellLineListStorage = new LocalStorageListStore();

  static defaultProps: Partial<Props> = {
    defaultNone: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedCellLineList: props.defaultNone
        ? DEFAULT_EMPTY_CELL_LINE_LIST
        : this.cellLineListStorage.readSelectedList(),
      cellLineLists: this.cellLineListStorage.getListOfListNames(),
    };

    props.onListSelect(this.state.selectedCellLineList);

    this.onListsChange = this.onListsChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener("celllinelistsupdated", this.onListsChange);
  }

  componentWillUnmount() {
    window.removeEventListener("celllinelistsupdated", this.onListsChange);
  }

  onListsChange() {
    const { selectedCellLineList } = this.state;
    const cellLineLists = this.cellLineListStorage.getListOfListNames();

    const newSelectedCellLineList = cellLineLists.includes(
      selectedCellLineList.name
    )
      ? this.cellLineListStorage.readList(selectedCellLineList.name)
      : DEFAULT_EMPTY_CELL_LINE_LIST;

    if (this.props.onListsChange) {
      this.props.onListsChange();
    }

    this.props.onListSelect(newSelectedCellLineList);

    this.setState({
      selectedCellLineList: newSelectedCellLineList,
      cellLineLists,
    });
  }

  renderOption(cellLineListName: string, key: number) {
    const { onListSelect } = this.props;
    const { selectedCellLineList } = this.state;

    const cellLineListSelected = selectedCellLineList.name == cellLineListName;
    return (
      <MenuItem
        eventKey={key}
        key={key}
        active={cellLineListSelected}
        onSelect={() => {
          setSelectedCellLineListName(cellLineListName);
          const newSelectedCellLineList = this.cellLineListStorage.readList(
            cellLineListName
          );
          onListSelect(newSelectedCellLineList);
          this.setState({ selectedCellLineList: newSelectedCellLineList });
        }}
      >
        {cellLineListName}
      </MenuItem>
    );
  }

  render() {
    const { selectedCellLineList, cellLineLists } = this.state;

    return (
      <DropdownButton
        bsStyle="default"
        title={selectedCellLineList.name}
        id={this.props.id || "cell_line_lists_dropdown"}
        className="wrap-text"
      >
        {this.renderOption(DEFAULT_EMPTY_CELL_LINE_LIST.name, -1)}
        <MenuItem divider />

        {cellLineLists.length > 0 &&
          cellLineLists.map(this.renderOption.bind(this))}
        {cellLineLists.length > 0 && <MenuItem divider />}

        <MenuItem
          eventKey={cellLineLists.length}
          onSelect={() => {
            this.props.launchCellLineSelectorModal();
          }}
        >
          Create/edit a list
        </MenuItem>
      </DropdownButton>
    );
  }
}
