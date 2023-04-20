/* eslint-disable react/require-default-props */
import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  Annotations,
  Config,
  Data as PlotlyData,
  Layout,
  PlotlyHTMLElement,
  PlotMouseEvent,
  PlotSelectionEvent,
  ViolinData,
} from "plotly.js";
import seedrandom from "seedrandom";
import PlotlyLoader, {
  PlotlyType,
} from "src/data-explorer-2/components/plot/PlotlyLoader";
import {
  COMPARISON_COLOR_2,
  CONTINUOUS_COLORSCALE,
  DEFAULT_COLOR,
  getRange,
  isEveryValueNull,
  LegendKey,
  LEGEND_OTHER,
  LEGEND_RANGE_1,
  LEGEND_RANGE_2,
  LEGEND_RANGE_3,
} from "src/data-explorer-2/components/plot/prototype/plotUtils";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";

type Data = Record<string, any[]>;

const MAX_POINTS_TO_ANNOTATE = 10;

interface Props {
  data: Data;
  xKey: string;
  xLabel: string;
  hoverTextKey?: string;
  height: number | "auto";
  colorMap: any;
  colorData: any;
  continuousColorKey?: string;
  legendDisplayNames: any;
  selectedPoints?: Set<number>;
  onClickPoint?: (pointIndex: number, ctrlKey: boolean) => void;
  onMultiselect?: (pointIndices: number[]) => void;
  onClickResetSelection?: () => void;
  pointVisibility?: boolean[];
  onLoad?: (plot: ExtendedPlotType) => void;
  hiddenLegendValues: any;
}

const calcPlotHeight = (plot: HTMLDivElement) => {
  return window.innerHeight - plot.offsetTop - 22;
};

const truncate = (s: string) => {
  const MAX = 25;
  return s && s.length > MAX ? `${s.substr(0, MAX)}…` : s;
};

// TODO: If we have continuous color data, can we use that to make the y values
// more meaningful (less random)?
const calcY = (
  x: any,
  colorKeys: any,
  colorData: any,
  hiddenLegendValues: any
) => {
  const sRandom = seedrandom("fixedSeed");

  if (!colorData) {
    return x.map(() => sRandom() / 2.1 + 1);
  }

  const y: any = [];
  let offsetY = colorKeys.length - hiddenLegendValues.size;

  colorKeys.forEach((key: string) => {
    if (!hiddenLegendValues.has(key)) {
      colorData.forEach((colorKey: any, i: number) => {
        if (colorKey === key) {
          y[i] = sRandom() / 2.1 + offsetY;
        }
      });

      offsetY -= 1;
    } else {
      colorData.forEach((colorKey: any) => {
        if (colorKey === key) {
          // Make sure values are deterministic.
          sRandom();
        }
      });
    }
  });

  return y;
};

function PrototypeDensity1D({
  data,
  xKey,
  xLabel,
  colorMap,
  colorData,
  continuousColorKey,
  legendDisplayNames,
  height,
  hoverTextKey,
  selectedPoints = null,
  pointVisibility = null,
  onClickPoint = () => {},
  onMultiselect = () => {},
  onClickResetSelection = () => {},
  onLoad = () => {},
  Plotly,
  hiddenLegendValues,
}: any) {
  const ref = useRef<ExtendedPlotType>(null);

  const axes = useRef<Partial<Layout>>({
    xaxis: undefined,
    yaxis: undefined,
  });

  const annotationTails = useRef<Record<string, { ax: number; ay: number }>>(
    {}
  );

  const [dragmode, setDragmode] = useState<Layout["dragmode"]>("zoom");

  useEffect(() => {
    if (onLoad && ref.current) {
      onLoad(ref.current);
    }
  }, [onLoad]);

  const [minX, maxX] = useMemo(() => getRange(data[xKey]), [data, xKey]);

  // When the type of data changes, we force an autoscale by discarding the
  // stored axes.
  useEffect(() => {
    axes.current = {
      xaxis: undefined,
      yaxis: undefined,
    };
  }, [xLabel, colorData, minX, maxX]);

  useEffect(() => {
    axes.current.yaxis = undefined;
  }, [colorMap, colorData, hiddenLegendValues.size]);

  useEffect(() => {
    const plot = ref.current as ExtendedPlotType;
    const colorKeys = Reflect.ownKeys(colorMap || {});
    const x = data[xKey];
    const y: any = calcY(x, colorKeys, colorData, hiddenLegendValues);
    const text = hoverTextKey ? data[hoverTextKey] : null;
    const visible = pointVisibility ?? x.map(() => true);
    const contColorData = data[continuousColorKey];
    let color: any;
    let lineColor;

    if (contColorData) {
      color = contColorData.map((value: any) => {
        return value === null ? colorMap[LEGEND_OTHER] : value;
      });

      lineColor = colorData.map((legendKey: LegendKey) => {
        if (legendKey === LEGEND_RANGE_1) {
          return "#333";
        }

        if (legendKey === LEGEND_RANGE_2) {
          return "#555";
        }

        if (legendKey === LEGEND_RANGE_3) {
          return "#777";
        }

        return "#fff";
      });
    } else if (colorData) {
      color = colorData.map((legendKey: LegendKey) => colorMap[legendKey]);

      lineColor = colorData.map((legendKey: LegendKey, i: number) => {
        return color[i] === COMPARISON_COLOR_2 ? "#666" : "#fff";
      });
    } else {
      color = DEFAULT_COLOR;
      lineColor = "#fff";
    }

    const unselectedTrace = {
      type: "scattergl",
      x: x.map((xValue: number, i: number) => (visible[i] ? xValue : null)),
      y,
      name: "",
      mode: "markers",
      hoverinfo: "x+text",
      text,
      selectedpoints: selectedPoints ? [...selectedPoints] : [],
      marker: {
        color,
        colorscale: contColorData ? CONTINUOUS_COLORSCALE : undefined,
        size: 7,
        line: { color: lineColor, width: 0.5 },
        opacity: selectedPoints?.size > 0 ? 0.75 : 1,
      },
      selected: { marker: { opacity: 1 } },
      unselected: {
        marker: {
          opacity: selectedPoints?.size > 0 ? 0.75 : 1,
        },
      },
    };

    const selectedTrace = {
      ...unselectedTrace,
      marker: {
        color,
        colorscale: contColorData ? CONTINUOUS_COLORSCALE : undefined,
        size: 7,
        line: { color: "#000", width: 1 },
      },
      selected: { marker: { opacity: 1 } },
      unselected: { marker: { opacity: 0 } },
    };

    const templateViolin = {
      type: "violin",
      x,
      y0: 1,
      points: false,
      fillcolor: "#ddd",
      hoverinfo: "none",
      line: { color: "#666" },
      side: "positive",
      width: 1,
      meanline: { visible: true },
    } as Partial<ViolinData>;

    const violinTraces = colorKeys
      .filter((key: string) => !hiddenLegendValues.has(key))
      .map((legendKey: LegendKey, index: number) => {
        return {
          ...templateViolin,
          name: legendDisplayNames[legendKey],
          opacity: 0.75,
          x: colorData
            ? x.filter((_: any, i: number) => colorData[i] === legendKey)
            : x,
          y0: colorKeys.length - hiddenLegendValues.size - index,
          fillcolor: colorMap[legendKey],
        };
      })
      .filter((trace) => !isEveryValueNull(trace.x));

    const plotlyData: PlotlyData[] = [
      unselectedTrace as any,
      selectedTrace,
      ...violinTraces,
    ];

    const layout: Partial<Layout> = {
      height: height === "auto" ? calcPlotHeight(plot) : height,
      margin: { t: 30, l: 30, r: 30 },
      hovermode: "closest",
      hoverlabel: {
        namelength: -1,
      },

      showlegend: false,

      xaxis: axes.current.xaxis || {
        title: xLabel,
        exponentformat: "e",
        type: "linear",
        autorange: true,
      },

      yaxis: {
        ...(axes.current.yaxis || { autorange: true }),

        visible:
          Boolean(colorData) &&
          colorData.length > 0 &&
          violinTraces.length < 40,
        automargin: true,
        tickvals: violinTraces.map((vt: any) => vt.y0),
        ticktext: violinTraces.map((vt: any) => truncate(vt.name)),
      },

      dragmode,

      annotations: [
        ...(selectedPoints?.size <= MAX_POINTS_TO_ANNOTATE
          ? selectedPoints
          : []),
      ]
        .filter(
          // Filter out any annotations associated with missing data. This can
          // happen if the x or y column has changed since the annotations were
          // created.
          (pointIndex) =>
            typeof x[pointIndex] === "number" &&
            typeof y[pointIndex] === "number"
        )
        .map((pointIndex) => ({
          x: x[pointIndex],
          y: y[pointIndex],
          text: text[pointIndex],
          visible: visible[pointIndex],
          xref: "x",
          yref: "y",
          arrowhead: 0,
          standoff: 4,
          arrowcolor: "#888",
          bordercolor: "#c7c7c7",
          bgcolor: "#fff",
          pointIndex,
          // Restore any annotation arrowhead positions the user may have edited.
          ax: annotationTails.current[`${xKey}-${pointIndex}`]?.ax,
          ay: annotationTails.current[`${xKey}-${pointIndex}`]?.ay,
        })),
    } as any;

    const config: Partial<Config> = {
      responsive: true,
      edits: { annotationTail: true },
    };

    Plotly.react(plot, plotlyData, layout, config);

    // Keep track of added listeners so we can easily remove them.
    const listeners: [string, Function][] = [];

    const on = (eventName: string, callback: Function) => {
      plot.on(
        eventName as Parameters<PlotlyHTMLElement["on"]>[0],
        callback as Parameters<PlotlyHTMLElement["on"]>[1]
      );
      listeners.push([eventName, callback]);
    };

    // HACK: The zoom functions provided by Plotly's modebar aren't exposed
    // by its API. The only way to trigger them is by actually clicking the
    // buttons 😕
    const getButton = (attr: string, val: string) =>
      plot.querySelector(
        `.modebar-btn[data-attr="${attr}"][data-val="${val}"]`
      ) as HTMLAnchorElement;

    const zoom = (val: "in" | "out" | "reset") => {
      getButton("zoom", val).click();

      // This redraw fixes a very strange bug where setting the drag mode to
      // select (or lasso) with a filter also applied causes all of the points
      // to disappear.
      Plotly.redraw(plot);
    };

    // After initializing the plot with `autorange` set to true, store what
    // Plotly calculated for the axes zoom level and turn off autorange.
    on("plotly_afterplot", () => {
      if (!axes.current.xaxis || !axes.current.yaxis) {
        axes.current = {
          xaxis: { ...plot.layout.xaxis, autorange: false },
          yaxis: { ...plot.layout.yaxis, autorange: false },
        };
      }
    });

    on("plotly_relayout", () => {
      axes.current = {
        xaxis: { ...plot.layout.xaxis, autorange: false },
        yaxis: { ...plot.layout.yaxis, autorange: false },
      };

      plot.layout.annotations.forEach(
        ({ pointIndex, ax, ay }: Annotations & { pointIndex: number }) => {
          annotationTails.current[`${xKey}-${pointIndex}`] = { ax, ay };
        }
      );
    });

    const assignRandomAnnotationPositions = (pointIndices: number[]) => {
      const random = (min: number, max: number, i: number) => {
        const smin = min / 15;
        const smax = max / 15;
        const value = Math.floor(Math.random() * (smax - smin + 1) + smin);
        const sign = i < pointIndices.length / 2 ? -1 : 1;
        return sign * value * 15;
      };

      pointIndices.forEach((p, i) => {
        const key = `${xKey}-${p}`;
        annotationTails.current[key] = annotationTails.current[key] || {
          ax: random(50, 150, i),
          ay: random(30, 70, i),
        };
      });
    };

    on("plotly_click", (e: PlotMouseEvent) => {
      const { curveNumber, pointIndex } = e.points[0];
      const anyModifier =
        e.event.ctrlKey || e.event.metaKey || e.event.shiftKey;

      if (curveNumber === 0 && onClickPoint) {
        onClickPoint(pointIndex, anyModifier);
      }

      // WORKAROUND: If you mean to double-click to zoom out and
      // select a point by accident, restore the previous selections.
      const prevAxes = axes.current;
      const prevSelection = selectedPoints;

      setTimeout(() => {
        if (axes.current !== prevAxes && prevSelection) {
          onMultiselect([...prevSelection]);
        }
      }, 100);
    });

    on("plotly_selecting", () => {
      if (selectedPoints?.size > 0) {
        onClickResetSelection();
      }
    });

    on("plotly_selected", (e: PlotSelectionEvent) => {
      const points = e ? e.points.map((p) => p.pointIndex) : [];
      assignRandomAnnotationPositions(points);
      onMultiselect(points);
    });

    on("plotly_deselect", () => {
      onClickResetSelection();
    });

    // WORKAROUND: Double-click is supposed to reset the zoom but it only works
    // actually intermittently so we'll do it ourselves.
    on("plotly_doubleclick", () => {
      plot.resetZoom();
    });

    // WORKAROUND: For some reason, autosize only works
    // with width so we'll calculate the height as well.
    on("plotly_autosize", () => {
      if (height === "auto") {
        setTimeout(() => {
          plot.layout.height = calcPlotHeight(plot);
          Plotly.redraw(plot);
        });
      }
    });

    // Add a few non-standard methods to the plot for convenience.
    plot.setDragmode = (nextDragmode) => {
      const shouldResetSelection =
        plot.layout.dragmode !== nextDragmode &&
        (nextDragmode === "select" || nextDragmode === "lasso");

      if (shouldResetSelection && onClickResetSelection) {
        onClickResetSelection();
      }

      setDragmode(nextDragmode);
    };

    plot.zoomIn = () => setTimeout(zoom, 0, "in");
    plot.zoomOut = () => setTimeout(zoom, 0, "out");
    plot.resetZoom = () => setTimeout(zoom, 0, "reset");
    plot.downloadImage = (options) => Plotly.downloadImage(plot, options);
    (plot as any).purge = () => Plotly.purge(plot);

    plot.isPointInView = (pointIndex: number) => {
      const px = x[pointIndex] as number;
      const py = y[pointIndex] as number;
      const xrange = plot.layout.xaxis.range as [number, number];
      const yrange = plot.layout.yaxis.range as [number, number];

      return (
        px >= xrange[0] && px <= xrange[1] && py >= yrange[0] && py <= yrange[1]
      );
    };

    plot.xValueMissing = (pointIndex: number) => {
      return typeof data[xKey][pointIndex] !== "number";
    };

    // Not possible
    plot.yValueMissing = () => false;

    return () => {
      listeners.forEach(([eventName, callback]) =>
        plot.removeListener(eventName, callback)
      );
    };
  }, [
    data,
    xKey,
    xLabel,
    colorMap,
    colorData,
    continuousColorKey,
    legendDisplayNames,
    hoverTextKey,
    height,
    selectedPoints,
    onClickPoint,
    onMultiselect,
    onClickResetSelection,
    pointVisibility,
    dragmode,
    Plotly,
    hiddenLegendValues,
  ]);

  return <div ref={ref} />;
}

export default function LazyPrototypeDensity1D({ data, ...otherProps }: Props) {
  return (
    <PlotlyLoader version="module">
      {(Plotly: PlotlyType) =>
        data ? (
          <PrototypeDensity1D
            data={data}
            Plotly={Plotly}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
          />
        ) : null
      }
    </PlotlyLoader>
  );
}
