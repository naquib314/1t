import React, { ReactNode, memo } from "react";
import { DatasetId } from "src/compoundDashboard/models/types";
import { DropdownButton, MenuItem } from "react-bootstrap";
import columns from "../json/columns.json";
import styles from "../styles/CompoundDashboardColumnControls.scss";

interface Props {
  datasetId: DatasetId;
  onChangeDatasetId: (id: DatasetId) => void;
  xValue: string;
  yValue: string;
  onChangeX: (value: string) => void;
  onChangeY: (value: string) => void;
}

const getColumnLabel = (value: string) => {
  const column = columns.find((c) => value === c.value);
  return column ? column.label : "unknown";
};

const Dropdown = ({
  id,
  title,
  label,
  onSelect,
  children,
}: {
  id: string;
  title: string;
  label: string;
  onSelect: (value: unknown) => void;
  children: ReactNode;
}) => {
  return (
    <DropdownButton
      id={id}
      title={
        <span>
          <div className={styles.dropdownTitle}>{title}</div>
          <div className={styles.selection}>{label}</div>
        </span>
      }
      onSelect={onSelect}
    >
      {children}
    </DropdownButton>
  );
};

function CompoundDashboardColumnControls({
  datasetId,
  onChangeDatasetId,
  xValue,
  yValue,
  onChangeX,
  onChangeY,
}: Props) {
  return (
    <div className={styles.CompoundDashboardColumnControls}>
      <Dropdown
        id="x-axis-dataset"
        title="Select dataset"
        label={datasetId === "Rep_all_single_pt" ? "Repurposing" : "Unknown"}
        onSelect={(value: any) => onChangeDatasetId(value)}
      >
        <MenuItem eventKey="Rep_all_single_pt">Repurposing</MenuItem>
      </Dropdown>
      <Dropdown
        id="x-axis-data"
        title="Select X axis"
        label={getColumnLabel(xValue)}
        onSelect={onChangeX}
      >
        {columns.map((column) => (
          <MenuItem key={column.value} eventKey={column.value}>
            {column.label}
          </MenuItem>
        ))}
      </Dropdown>
      <Dropdown
        id="y-axis-data"
        title="Select Y axis"
        label={getColumnLabel(yValue)}
        onSelect={onChangeY}
      >
        {columns.map((column) => (
          <MenuItem key={column.value} eventKey={column.value}>
            {column.label}
          </MenuItem>
        ))}
      </Dropdown>
    </div>
  );
}

export default memo(CompoundDashboardColumnControls);
