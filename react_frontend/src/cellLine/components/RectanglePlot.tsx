import React, { useEffect, useRef } from "react";
import StackedBoxPlotUtils from "src/cellLine/utilities/boxplotUtils";

export interface RectPlotProps {
  svgName: string;
  scoresMatrix: Array<Array<number>>; // matrix of z-scores across all cell lines
  labels: Array<string>; // gene or compound names
  cellLineColIndex: number; // index of the column with data for this cell line
  xAxisLabel?: string;
  yAxisLabel?: string;
  linkType?: "gene" | "compound";
}

const getGenePageUrl = (gene: string) => {
  return window.location.href
    .replace(/\/cell_line\/.*/, `/gene/${encodeURIComponent(gene)}`)
    .replace(window.location.search, "");
};

const RectanglePlot = ({
  svgName,
  scoresMatrix,
  labels,
  cellLineColIndex,
  xAxisLabel,
  yAxisLabel,
  linkType,
}: RectPlotProps) => {
  const d3Container = useRef(null);

  function getSortedNonNulls(numberArray: number[]) {
    return numberArray.filter((x) => x != null).sort((a, b) => a - b);
  }

  useEffect(() => {
    if (labels) {
      // Initialize the plot
      const boxplotUtils = new StackedBoxPlotUtils(
        svgName,
        d3Container,
        labels
      );

      // render the axes
      boxplotUtils.initAxes(scoresMatrix);
      boxplotUtils.labelXAxis(xAxisLabel);

      // Identify and label outliers
      const q1Values: number[] = scoresMatrix.map((geneScores) => {
        return boxplotUtils.d3.quantile(getSortedNonNulls(geneScores), 0.25);
      });
      const q3Values: number[] = scoresMatrix.map((geneScores) => {
        return boxplotUtils.d3.quantile(getSortedNonNulls(geneScores), 0.75);
      });
      const interQuartileRanges = q1Values.map(
        (q1Val, i) => q3Values[i] - q1Val
      );
      const lowerCutoffs = q1Values.map(
        (q1Val, i) => q1Val - 1.5 * interQuartileRanges[i]
      );
      const upperCutoffs = q3Values.map(
        (q3Val, i) => q3Val + 1.5 * interQuartileRanges[i]
      );
      const isOutlier = (val: number, labelIndex: number) => {
        return val < lowerCutoffs[labelIndex] || val > upperCutoffs[labelIndex];
      };
      const outliers = scoresMatrix.map((geneScores, i) => {
        return getSortedNonNulls(geneScores).filter((geneEffect) =>
          isOutlier(geneEffect, i)
        );
      });
      boxplotUtils.markOutliers(labels, outliers);

      // Render the whiskers
      const nonOutliers: number[][] = scoresMatrix.map((geneScores, i) => {
        return getSortedNonNulls(geneScores).filter(
          (geneEffect) => !isOutlier(geneEffect, i)
        );
      });
      const lowerWhiskerVals = nonOutliers.map((rowVals) =>
        Math.min(...rowVals)
      );
      const upperWhiskerVals = nonOutliers.map((rowVals) =>
        Math.max(...rowVals)
      );
      boxplotUtils.renderHorizontalLines(
        lowerWhiskerVals,
        upperWhiskerVals,
        "#A0A0A0"
      );
      boxplotUtils.renderVerticalTick(lowerWhiskerVals, "#A0A0A0", 4);
      boxplotUtils.renderVerticalTick(upperWhiskerVals, "#A0A0A0", 4);

      // Render the box (from one quartile to the other)
      boxplotUtils.renderBoxes(q1Values, q3Values, "#BBB");

      // Render the median value
      const medians: number[] = scoresMatrix.map((geneScores) => {
        return boxplotUtils.d3.quantile(getSortedNonNulls(geneScores), 0.5);
      });
      boxplotUtils.renderVerticalTick(medians, "#333", 2);

      // Render the values for this particular cell line in red
      const cellLineValues: number[] = scoresMatrix.map(
        (geneScores) => geneScores[cellLineColIndex]
      );
      boxplotUtils.renderPoints(cellLineValues, "#FFBA7A");
    }
  }, [
    svgName,
    scoresMatrix,
    labels,
    cellLineColIndex,
    xAxisLabel,
    yAxisLabel,
    linkType,
  ]);

  return (
    <div className="pref-dep-plot">
      <div className="pref-dep-labels-container">
        {labels.map((label) => (
          <p key={label}>
            <a href={getGenePageUrl(label)}>{label}</a>
          </p>
        ))}
      </div>
      <div className="pref-dep-svg-container" ref={d3Container} />
    </div>
  );
};

export default RectanglePlot;
