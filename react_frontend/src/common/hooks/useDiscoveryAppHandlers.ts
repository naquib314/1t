import { useCallback } from "react";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";

type Data = Record<string, any[]>;

function getMissingDataWarning(
  plot: ExtendedPlotType,
  pointIndex: number,
  entityLabel: string
) {
  if (!plot.xValueMissing(pointIndex) && !plot.yValueMissing(pointIndex)) {
    return null;
  }

  const getTitle = (axis: typeof plot.layout.xaxis) =>
    typeof axis.title === "string" ? axis.title : axis.title.text;

  const columns = [
    plot.xValueMissing(pointIndex) && getTitle(plot.layout.xaxis),
    plot.yValueMissing(pointIndex) && getTitle(plot.layout.yaxis),
  ].filter(Boolean);

  return [
    `It is not possible to plot ${entityLabel} with the selected columns.`,
    `${
      columns.length === 1 ? "No value is" : "No values are"
    } present for ${columns.join(" and ")}.`,
  ].join(" ");
}

export default function useDiscoveryAppHandlers(
  data: Data | null,
  visiblePoints: boolean[],
  setSelectedPoint: (pointIndex: number) => void
) {
  const handleSearch = useCallback(
    (selected: { value: number; label: string }, plot: ExtendedPlotType) => {
      const pointIndex = selected.value;
      setSelectedPoint(pointIndex);

      const missingDataWarning = getMissingDataWarning(
        plot,
        pointIndex,
        selected.label
      );

      if (missingDataWarning) {
        // TODO: Turn this into a proper dialog instead of `window.alert`.
        // eslint-disable-next-line
        window.alert(missingDataWarning);
        return;
      }

      if (!visiblePoints[pointIndex]) {
        // TODO: Turn this into a proper dialog instead of `window.alert`.
        // eslint-disable-next-line
        window.alert(`${selected.label} is currently filtered out.`);
        return;
      }

      if (!plot.isPointInView(pointIndex)) {
        plot.resetZoom();
      }
    },
    [visiblePoints, setSelectedPoint]
  );

  return { handleSearch };
}
