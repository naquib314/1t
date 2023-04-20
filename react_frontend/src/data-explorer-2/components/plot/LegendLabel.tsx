import React, { useLayoutEffect, useRef, useState } from "react";
import { Tooltip } from "shared/common/components/Tooltip";
import { categoryToDisplayName } from "src/data-explorer-2/components/plot/prototype/plotUtils";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

function LegendLabel({ data, continuousBins, category }: any) {
  const ref = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useLayoutEffect(() => {
    // HACK: This assumes a fixed width.
    if (ref.current?.offsetWidth > 178) {
      setShowTooltip(true);
    }
  }, []);

  const name = categoryToDisplayName(category, data, continuousBins);
  const nameElement =
    typeof name === "string" ? (
      <span>{name}</span>
    ) : (
      <span>
        {name[0]}
        <span style={{ margin: 4 }}> – </span>
        {name[1]}
      </span>
    );

  if (showTooltip) {
    return (
      <Tooltip
        className={styles.legendTooltip}
        id="legend-item-tooltip"
        content={name as any}
        placement="top"
      >
        {nameElement}
      </Tooltip>
    );
  }

  return <span ref={ref}>{nameElement}</span>;
}

export default LegendLabel;
