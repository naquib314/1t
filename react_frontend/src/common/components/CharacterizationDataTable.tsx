import React, { useState, useEffect } from "react";
import { fetchUrlPrefix } from "src/common/utilities/context";
import WideTable from "shared/common/components/WideTable";

let relativeUrlPrefix = fetchUrlPrefix();

if (relativeUrlPrefix === "/") {
  relativeUrlPrefix = "";
}

const urlPrefix = `${window.location.protocol}//${window.location.host}${relativeUrlPrefix}`;

interface Props {
  id: string;
  physicalUnit: string;
  characterization: string;
}

function TableData({ id, physicalUnit, characterization }: Props) {
  const [data, setData] = useState([]);
  const [columnNames, setColumnNames] = useState([]);
  const [defaultColumnsToShow, setDefaultColumns] = useState([]);
  const [downloadURL, setDownloadURL] = useState("");

  const columns = columnNames.map((name) => {
    return {
      accessor: name,
      Cell: (row: any) => {
        if (row.value.type === "link") {
          return <a href={row.value.url}>{row.value.name}</a>;
        }
        return row.value;
      },
    };
  });

  useEffect(() => {
    const URL = `${urlPrefix}/${physicalUnit}/${characterization}/${id}`;
    fetch(URL)
      .then((res) => res.json())
      .then((response) => {
        setData(response.data);
        setColumnNames(response.columns);
        setDefaultColumns(response.default_columns_to_show);
        setDownloadURL(response.download_url);
      });
  }, [id, physicalUnit, characterization]);
  if (
    data.length === 0 ||
    columns.length === 0 ||
    defaultColumnsToShow.length === 0
  ) {
    return null;
  }
  return (
    <WideTable
      renderWithReactTableV7
      data={data}
      columns={columns}
      defaultColumnsToShow={defaultColumnsToShow}
      downloadURL={downloadURL}
    />
  );
}

export default TableData;
