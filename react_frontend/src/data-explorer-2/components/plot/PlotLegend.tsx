import React, { useLayoutEffect, useRef, useState } from "react";
import Section from "src/data-explorer-2/components/Section";
import HelpTip from "src/data-explorer-2/components/HelpTip";
import LegendLabel from "src/data-explorer-2/components/plot/LegendLabel";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

function LegendLabels({
  data,
  colorMap,
  continuousBins,
  hiddenLegendValues,
  legendKeysWithNoData,
  onClickLegendItem,
}: any) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setOffset(ref.current.offsetTop - 161);
    }
  }, [data]);

  // TODO: Add "select/unselect all" buttons
  return (
    <div
      ref={ref}
      className={styles.LegendLabels}
      style={{ maxHeight: `calc(100vh - 504px - ${offset}px)` }}
    >
      {Reflect.ownKeys(colorMap || {})
        .filter(
          (category: any) =>
            data?.color_by === "custom" ||
            !legendKeysWithNoData ||
            !legendKeysWithNoData.has(category)
        )
        .map((category: any) => (
          <div key={category.toString()}>
            <button
              type="button"
              style={{
                opacity: hiddenLegendValues.has(category) ? 0.3 : 1.0,
              }}
              onClick={() => onClickLegendItem(category, colorMap)}
            >
              <span
                className={styles.legendSwatch}
                style={{ backgroundColor: colorMap[category] }}
              />
              <LegendLabel
                data={data}
                continuousBins={continuousBins}
                category={category}
              />
            </button>
          </div>
        ))}
    </div>
  );
}

function PlotLegend({
  data,
  colorMap,
  continuousBins,
  hiddenLegendValues,
  legendKeysWithNoData,
  onClickLegendItem,
}: any) {
  return (
    <Section title="Legend">
      <div className={styles.plotInstructions}>
        Click to toggle on/off
        <HelpTip
          id="legend-doubleclick-help"
          placement="left"
          title="Double-click works too"
          content={
            <div>
              Double-click an item to see it in isolation. Then double-click it
              a second time to turn everything back on.
            </div>
          }
        />
      </div>
      {data?.dimensions?.color && (
        <div className={styles.colorDimensionLabels}>
          <div>{data.dimensions.color.axis_label}</div>
          <div>{data.dimensions.color.dataset_label}</div>
        </div>
      )}
      <LegendLabels
        data={data}
        colorMap={colorMap}
        continuousBins={continuousBins}
        hiddenLegendValues={hiddenLegendValues}
        legendKeysWithNoData={legendKeysWithNoData}
        onClickLegendItem={onClickLegendItem}
      />
    </Section>
  );
}

export default PlotLegend;
