/* eslint-disable react/require-default-props */
// This is a forked version of /react_frontend/src/plot/styles/ScatterPlot.tsx
// The idea is this one can be used for experimental changes.
import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  Annotations,
  Config,
  Data as PlotlyData,
  Layout,
  PlotlyHTMLElement,
  PlotMouseEvent,
  PlotSelectionEvent,
} from "plotly.js";
import PlotlyLoader, {
  PlotlyType,
} from "src/data-explorer-2/components/plot/PlotlyLoader";
import {
  COMPARISON_COLOR_1,
  COMPARISON_COLOR_1_2,
  COMPARISON_COLOR_2,
  CONTINUOUS_COLORSCALE,
  DEFAULT_COLOR,
  getRange,
  makeCategoricalColorMap,
} from "src/data-explorer-2/components/plot/prototype/plotUtils";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";
import styles from "src/plot/styles/ScatterPlot.scss";

type Data = Record<string, any[]>;

const MAX_POINTS_TO_ANNOTATE = 10;

interface Props {
  data: Data;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  // Height can be defined in pixels or set to "auto."  In auto mode, it will
  // attempt to fill the height of the viewport.
  height: number | "auto";
  // If defined, the corresponding key from `data` will used to generate hover
  // text.
  hoverTextKey?: string;
  // Allows you to specify which key of `data` should be used to label annotations.
  // If this is not defined, it will try to use `hoverTextKey` instead. If that's
  // not defined, it will use (x, y) values to annotate points.
  colorKey1?: string;
  colorKey2?: string;
  categoricalColorKey?: string;
  continuousColorKey?: string;
  selectedPoints?: Set<number>;
  onClickPoint?: (pointIndex: number, ctrlKey: boolean) => void;
  onMultiselect?: (pointIndices: number[]) => void;
  onClickResetSelection?: () => void;
  pointVisibility?: boolean[];
  showYEqualXLine?: boolean;
  onLoad?: (plot: ExtendedPlotType) => void;
}

type PropsWithPlotly = Props & { Plotly: PlotlyType };

const calcPlotHeight = (plot: HTMLDivElement) => {
  return window.innerHeight - plot.offsetTop - 22;
};

function PrototypeScatterPlot({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  height,
  colorKey1,
  colorKey2,
  categoricalColorKey,
  continuousColorKey,
  hoverTextKey = null,
  selectedPoints = null,
  pointVisibility = null,
  showYEqualXLine = false,
  onClickPoint = () => {},
  onMultiselect = () => {},
  onClickResetSelection = () => {},
  onLoad = () => {},
  Plotly,
}: PropsWithPlotly) {
  const ref = useRef<ExtendedPlotType>(null);
  // We save the axes of the plot so we can keep the zoom level consistent
  // between calls to Plotly#react. This value is upated
  // - When the plot is first rendered (and an autorange is calculated)
  // - After each plotly_relayout event (e.g. when the user changes the zoom
  // level).
  const axes = useRef<Partial<Layout>>({
    xaxis: undefined,
    yaxis: undefined,
  });

  const extents = useMemo(() => {
    const [minX, maxX] = getRange(data[xKey]);
    const [minY, maxY] = getRange(data[yKey]);

    return { minX, maxX, minY, maxY };
  }, [data, xKey, yKey]);

  const categoricalColorData = useRef(null);
  const annotationTails = useRef<Record<string, { ax: number; ay: number }>>(
    {}
  );

  const [dragmode, setDragmode] = useState<Layout["dragmode"]>("zoom");

  // On mount, we call the `onLoad` callback with a reference to the DOM node
  // (which is extended with convenience functions).
  useEffect(() => {
    if (onLoad && ref.current) {
      onLoad(ref.current);
    }
  }, [onLoad]);

  // When the columns or underlying data change, we force an autoscale by
  // discarding the stored axes.
  useEffect(() => {
    axes.current = {
      xaxis: undefined,
      yaxis: undefined,
    };
  }, [xKey, yKey, xLabel, yLabel, data]);

  useEffect(() => {
    const values = data?.[categoricalColorKey];

    if (values) {
      const colorMap = makeCategoricalColorMap(values);

      categoricalColorData.current = values.map(
        (value: any) => colorMap[value]
      );
    } else {
      categoricalColorData.current = null;
    }
  }, [data, categoricalColorKey]);

  // All other updates are handled by this one big effect.
  useEffect(() => {
    const plot = ref.current as ExtendedPlotType;

    const x = data[xKey];
    const y = data[yKey];
    const text = hoverTextKey ? data[hoverTextKey] : null;
    const visible = pointVisibility ?? x.map(() => true);

    const color1 = colorKey1 ? data[colorKey1] : null;
    const color2 = colorKey2 ? data[colorKey2] : null;
    const contColorData = continuousColorKey ? data[continuousColorKey] : null;

    const color = contColorData
      ? contColorData.map((c: any) => (c === null ? DEFAULT_COLOR : c))
      : x.map((_: any, i: number) => {
          if (categoricalColorData.current?.[i]) {
            return categoricalColorData.current?.[i];
          }

          if (color1?.[i] && color2?.[i]) {
            return COMPARISON_COLOR_1_2;
          }

          if (color1?.[i]) {
            return COMPARISON_COLOR_1;
          }

          if (color2?.[i]) {
            return COMPARISON_COLOR_2;
          }

          return DEFAULT_COLOR;
        });

    const colorscale = contColorData ? CONTINUOUS_COLORSCALE : undefined;

    const annotationText =
      text ||
      x.map((_: any, i: number) => `${x[i]?.toFixed(2)}, ${y[i]?.toFixed(2)}`);

    // TODO: Create a utility for this so that it is consistent across 1D/2D
    // plots.
    const lineColor = color.map((c: string | number) => {
      if (c === COMPARISON_COLOR_2) {
        return "#666";
      }

      return typeof c === "number" ? "#aaa" : "#fff";
    });

    const templateTrace = {
      type: "scattergl",
      y,
      name: "",
      mode: "markers",
      text,
      selectedpoints: selectedPoints ? [...selectedPoints] : [],
      marker: {
        color,
        colorscale,
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

    const defaultColorTrace = {
      ...templateTrace,
      x: x.map((xValue: number, i: number) => {
        if (!visible[i]) {
          return null;
        }

        return color[i] === DEFAULT_COLOR ? xValue : null;
      }),
    };

    const userColoredTrace = {
      ...templateTrace,
      x: x.map((xValue: number, i: number) => {
        if (!visible[i]) {
          return null;
        }

        return color[i] === DEFAULT_COLOR ? null : xValue;
      }),
    };

    // These colors will have already been plotted by `userColoredTrace` above,
    // but this makes sure that color1 is plotted on top color2 (preferable
    // when comparing an in group vs an out group).
    const color1Trace = color1
      ? {
          ...templateTrace,
          x: x.map((xValue: number, i: number) => {
            if (!visible[i]) {
              return null;
            }

            return color[i] === COMPARISON_COLOR_1 ? xValue : null;
          }),
        }
      : null;

    // WORKAROUND: We use a special trace to give selected points a dark
    // outline. It would be preferable to set the `line` property of
    // 'selected.marker' but Plotly does not support that. Instead,
    // we set a dark `line` on the default `marker` and then hide
    // unselected points by giving them 0 opacity.
    const selectedTrace1 = {
      ...templateTrace,
      x: defaultColorTrace.x,
      marker: {
        color,
        colorscale,
        size: 7,
        line: { color: "#000", width: 1 },
      },
      selected: { marker: { opacity: 1 } },
      unselected: { marker: { opacity: 0 } },
    };

    const selectedTrace2 = {
      ...selectedTrace1,
      x: userColoredTrace.x,
    };

    const plotlyData: PlotlyData[] = [
      defaultColorTrace as PlotlyData,
      userColoredTrace as PlotlyData,
      color1Trace as PlotlyData,
      selectedTrace1 as PlotlyData,
      selectedTrace2 as PlotlyData,
    ].filter(Boolean);

    const layout: Partial<Layout> = {
      dragmode,
      height: height === "auto" ? calcPlotHeight(plot) : height,
      margin: { t: 30, l: 80, r: 30 },
      hovermode: "closest",
      hoverlabel: {
        namelength: -1,
      },

      // We hide the legend because the traces don't have names and the second
      // one is only use to render a single highlighted point. Labeling them
      // would only cause confusion.
      showlegend: false,

      // Restore or initialize axes. We set `autorange` to true on the first render
      // so that Plotly can calculate the extents of the plot for us.
      xaxis: axes.current.xaxis || {
        title: xLabel,
        exponentformat: "e",
        type: "linear",
        autorange: true,
      },

      yaxis: axes.current.yaxis || {
        title: yLabel,
        exponentformat: "e",
        autorange: true,
      },

      shapes: showYEqualXLine
        ? [
            {
              type: "line",
              xref: "x",
              yref: "y",
              x0: extents.minX,
              x1: extents.maxX,
              y0: extents.minY,
              y1: extents.maxY,
              line: { width: 1, color: "#444" },
            },
          ]
        : null,

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
          text: annotationText[pointIndex],
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
          ax: annotationTails.current[`${xKey}-${yKey}-${pointIndex}`]?.ax,
          ay: annotationTails.current[`${xKey}-${yKey}-${pointIndex}`]?.ay,
        })),
    };

    const config: Partial<Config> = {
      // Automatically resizes the plot when the window is resized.
      responsive: true,

      // Allows the user to move annotations (but just the tail and not the
      // whole thing).
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
          annotationTails.current[`${xKey}-${yKey}-${pointIndex}`] = { ax, ay };
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
        const key = `${xKey}-${yKey}-${p}`;
        annotationTails.current[key] = annotationTails.current[key] || {
          ax: random(50, 150, i),
          ay: random(30, 70, i),
        };
      });
    };

    on("plotly_click", (e: PlotMouseEvent) => {
      const { pointIndex } = e.points[0];
      const anyModifier =
        e.event.ctrlKey || e.event.metaKey || e.event.shiftKey;

      if (onClickPoint) {
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

    plot.yValueMissing = (pointIndex: number) => {
      return typeof data[yKey][pointIndex] !== "number";
    };

    return () => {
      listeners.forEach(([eventName, callback]) =>
        plot.removeListener(eventName, callback)
      );
    };
  }, [
    data,
    xKey,
    yKey,
    colorKey1,
    colorKey2,
    categoricalColorKey,
    continuousColorKey,
    xLabel,
    yLabel,
    hoverTextKey,
    height,
    selectedPoints,
    onClickPoint,
    onMultiselect,
    onClickResetSelection,
    pointVisibility,
    dragmode,
    extents,
    showYEqualXLine,
    Plotly,
  ]);

  return <div className={styles.ScatterPlot} ref={ref} />;
}

export default function LazyPrototypeScatterPlot({
  data,
  ...otherProps
}: Props) {
  return (
    <PlotlyLoader version="module">
      {(Plotly: PlotlyType) =>
        data ? (
          <PrototypeScatterPlot
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
