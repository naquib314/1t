import React from "react";
import Accordion from "shared/interactive/components/Accordion";
import { CellLineDatasets } from "src/cellLine/models/types";

interface DatasetsTileProps {
  cellLineDatasets: CellLineDatasets;
}

const DatasetsTile = ({ cellLineDatasets }: DatasetsTileProps) => {
  return (
    <article className="card_wrapper datasets_tile">
      <div className="card_border container_fluid">
        <h2 className="no_margin cardtitle_text">
          Sequenced and profiled in the following datasets:
        </h2>
        <div className="card_padding">
          <Accordion
            title={`Compound Viability (${cellLineDatasets.compound_viability.length} datasets)`}
          >
            {cellLineDatasets.compound_viability.map((dataset) => (
              <p className="accordion_contents" key={dataset.display_name}>
                <a href={dataset.download_url}>{dataset.display_name}</a>
              </p>
            ))}
          </Accordion>
          <Accordion
            title={`Loss of Function (${cellLineDatasets.loss_of_function.length} datasets)`}
          >
            {cellLineDatasets.loss_of_function.map((dataset) => (
              <p className="accordion_contents" key={dataset.display_name}>
                <a href={dataset.download_url}>{dataset.display_name}</a>
              </p>
            ))}
          </Accordion>
          <Accordion
            title={`Omics (${cellLineDatasets.omics.length} datasets)`}
          >
            {cellLineDatasets.omics.map((dataset) => (
              <p className="accordion_contents" key={dataset.display_name}>
                <a href={dataset.download_url}>{dataset.display_name}</a>
              </p>
            ))}
          </Accordion>
        </div>
      </div>
    </article>
  );
};

export default DatasetsTile;
