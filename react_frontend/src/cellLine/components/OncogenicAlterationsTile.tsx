import React from "react";
import { OncogenicAlteration } from "src/cellLine/models/types";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { toStaticUrl } from "src/common/utilities/context";

interface OncogenicAlterationsTileProps {
  oncogenicAlterations: Array<OncogenicAlteration>;
}

const OncogenicAlterationsTile = ({
  oncogenicAlterations,
}: OncogenicAlterationsTileProps) => {
  const oncoLabelToIconClass = {
    Oncogenic: "fas fa-check-circle blue",
    "Likely Oncogenic": "fas fa-check-circle light_blue",
  };

  const functionLabelToIconClass = {
    "Likely Loss-of-function": "fas fa-minus-circle light_blue",
    "Likely Gain-of-function": "fas fa-plus-circle light_blue",
    "Loss-of-function": "fas fa-minus-circle blue",
    "Gain-of-function": "fas fa-plus-circle blue",
    Unknown: "",
  };

  const tooltip = (content: string) => (
    <Tooltip id={content}>{content}</Tooltip>
  );

  const tableRows = oncogenicAlterations.map((alteration) => (
    <tr key={alteration.alteration}>
      <td>
        <a href={alteration.gene.url}>{alteration.gene.name}</a>
      </td>
      <td>
        <a
          href={`https://www.oncokb.org/gene/${alteration.gene.name}/${alteration.alteration}`}
        >
          {alteration.alteration}
        </a>
      </td>
      <td className="center">
        <OverlayTrigger placement="top" overlay={tooltip(alteration.oncogenic)}>
          <i className={`${oncoLabelToIconClass[alteration.oncogenic]}`} />
        </OverlayTrigger>
      </td>
      <td className="center">
        <OverlayTrigger
          placement="top"
          overlay={tooltip(alteration.function_change)}
        >
          <i
            className={`${
              functionLabelToIconClass[alteration.function_change]
            }`}
          />
        </OverlayTrigger>
      </td>
    </tr>
  ));

  return (
    <article className="card_wrapper oncogenic_alterations_tile">
      <div className="card_border container_fluid">
        <h2 className="no_margin cardtitle_text">Oncogenic Alterations</h2>
        <div className="card_padding">
          <table className="table">
            <thead>
              <tr>
                <th>Gene</th>
                <th>Alteration</th>
                <th className="center">Oncogenic</th>
                <th className="center">Function</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
          <img
            src={toStaticUrl("img/mutations/oncokb_logo.png")}
            alt=""
            className="oncokb_logo"
          />
        </div>
      </div>
    </article>
  );
};

export default OncogenicAlterationsTile;
