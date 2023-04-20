/* eslint-disable react/require-default-props */
import React, { useEffect, useRef, useState } from "react";
import type {
  Config,
  Data as PlotlyData,
  Layout,
  PlotlyHTMLElement,
  PlotMouseEvent,
} from "plotly.js";
import { CONTINUOUS_COLORSCALE } from "src/data-explorer-2/components/plot/prototype/plotUtils";
import PlotlyLoader, {
  PlotlyType,
} from "src/data-explorer-2/components/plot/PlotlyLoader";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";

type Data = Record<string, string[] | number[][]>;

interface Props {
  data: Data;
  xKey: string;
  yKey: string;
  zKey: string;
  z2Key?: string;
  zLabel: string;
  z2Label?: string;
  // Height can be defined in pixels or set to "auto."  In auto mode, it will
  // attempt to fill the height of the viewport.
  height: number | "auto";
  selectedLabels?: Set<string>;
  onSelectLabels?: (labels: string[]) => void;
  onLoad?: (plot: ExtendedPlotType) => void;
}

const calcPlotHeight = (plot: HTMLDivElement) => {
  return window.innerHeight - plot.offsetTop - 22;
};

const calcDoubleHeatmapRatio = (width: number) => {
  return (width - 75) / width - 0.5;
};

const truncate = (s: string) => {
  const MAX = 15;
  return s && s.length > MAX ? `${s.substr(0, MAX)}…` : s;
};

const calcPath = ([xIndex, yIndex]: [number, number]) => {
  const p1 = [-0.5 + xIndex, -0.5 + yIndex].join(" ");
  const p2 = [0.5 + xIndex, -0.5 + yIndex].join(" ");
  const p3 = [0.5 + xIndex, 0.5 + yIndex].join(" ");
  const p4 = [-0.5 + xIndex, 0.5 + yIndex].join(" ");

  return `M ${p1} L ${p2} L ${p3} L ${p4} Z`;
};

function PrototypeCorrelationHeatmap({
  data,
  xKey,
  yKey,
  zKey,
  z2Key,
  zLabel,
  z2Label,
  height,
  selectedLabels = new Set(),
  onSelectLabels = () => {},
  onLoad = () => {},
  Plotly,
}: any) {
  const ref = useRef<ExtendedPlotType>(null);
  const [doubleHeatMapRatio, setDoubleHeatMapRatio] = useState(42);

  useEffect(() => {
    setDoubleHeatMapRatio(calcDoubleHeatmapRatio(ref.current.clientWidth));
  }, []);

  const axes = useRef<Partial<Layout>>({
    xaxis: undefined,
    yaxis: undefined,
  });

  useEffect(() => {
    axes.current = {
      xaxis: undefined,
      yaxis: undefined,
    };
  }, [xKey, yKey, zLabel, z2Label, data]);

  // On mount, we call the `onLoad` callback with a reference to the DOM node
  // (which is extended with convenience functions).
  useEffect(() => {
    if (onLoad && ref.current) {
      onLoad(ref.current);
    }
  }, [onLoad]);

  useEffect(() => {
    const plot = ref.current as ExtendedPlotType;
    const x = data[xKey];
    const y = data[yKey];
    const z = data[zKey];
    const z2 = z2Key ? data[z2Key] : null;

    let plotlyData: PlotlyData[] = [
      {
        type: "heatmap",
        name: zLabel,
        x,
        y,
        z,
        colorscale: CONTINUOUS_COLORSCALE as any,
        xaxis: "x",
        yaxis: "y",
        hoverinfo: "x+y+z",
      },
      z2Key
        ? {
            type: "heatmap",
            name: z2Label,
            x,
            y,
            z: z2,
            colorscale: CONTINUOUS_COLORSCALE as any,
            showscale: false,
            xaxis: "x2",
            yaxis: "y2",
            hoverinfo: "x+y+z",
          }
        : null,
    ];

    // Add some undocumented features (unfortunately these won't type check)
    // See /Users/rcreasi/ref/plotly.js/src/traces/heatmap/attributes.js
    plotlyData = plotlyData.map((trace) => ({
      ...trace,
      hoverongaps: false,
      xgap: 1,
      ygap: 1,
    }));

    let selectedPoint: any = null;

    for (let i = 0; i < x.length; i += 1) {
      for (let j = 0; j < y.length; j += 1) {
        const label1 = x[i];
        const label2 = y[j];

        if (z[j][i] !== undefined) {
          if (
            label1 === label2 &&
            selectedLabels?.size === 1 &&
            selectedLabels.has(label1)
          ) {
            selectedPoint = [i, j];
          }

          if (
            label1 !== label2 &&
            selectedLabels?.size === 2 &&
            selectedLabels.has(label1) &&
            selectedLabels.has(label2)
          ) {
            selectedPoint = [i, j];
          }
        }
      }
    }

    const yaxis = axes.current.yaxis || {
      automargin: true,
      autorange: true,
      tickvals: y,
      ticktext: y.map(truncate),
      domain: z2Key ? [0.25, 0.75] : [0, 1],
    };

    const layout: Partial<Layout> = {
      height: height === "auto" ? calcPlotHeight(plot) : height,
      margin: { t: 30, l: 80, r: 30, b: 106 },
      hovermode: "closest",
      hoverlabel: { namelength: -1 },

      xaxis: {
        tickvals: x,
        ticktext: x.map(truncate),
        domain: [0, z2Key ? doubleHeatMapRatio : 1],
        title: { text: zLabel, standoff: 10 },
      },

      yaxis,

      ...(z2Key && {
        xaxis2: {
          tickvals: x,
          ticktext: x.map(truncate),
          domain: [1 - doubleHeatMapRatio, 1],
          anchor: "y2",
          title: { text: z2Label, standoff: 10 },
        },
      }),

      ...(z2Key && {
        yaxis2: { ...yaxis, anchor: "x2" },
      }),

      // Preserve the existing dragmode if present.
      dragmode: plot?.layout?.dragmode || "zoom",

      shapes: selectedPoint
        ? [
            {
              type: "path",
              path: calcPath(selectedPoint),
              xref: "x",
              yref: "y",
              line: { width: 2, color: "red" },
            },
            z2Key
              ? {
                  type: "path",
                  path: calcPath(selectedPoint),
                  xref: "x2",
                  yref: "y2",
                  line: { width: 2, color: "red" },
                }
              : null,
          ]
        : null,
    };

    const config: Partial<Config> = {
      // Automatically resizes the plot when the window is resized.
      responsive: true,
    };

    // Add a few non-standard methods to the plot for convenience.
    plot.setDragmode = (dragmode) => {
      setTimeout(() => {
        if (!plot.data) {
          return;
        }

        Plotly.update(plot, {}, { dragmode });
      }, 0);
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
    };

    plot.zoomIn = () => setTimeout(zoom, 0, "in");
    plot.zoomOut = () => setTimeout(zoom, 0, "out");
    plot.resetZoom = () => setTimeout(zoom, 0, "reset");
    plot.downloadImage = (options) => Plotly.downloadImage(plot, options);
    (plot as any).purge = () => Plotly.purge(plot);

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

    on("plotly_click", (e: PlotMouseEvent) => {
      const px = e.points[0].x;
      const py = e.points[0].y;

      onSelectLabels?.([px, py]);
    });

    on("plotly_relayout", () => {
      axes.current = {
        xaxis: { ...plot.layout.xaxis, autorange: false },
        yaxis: { ...plot.layout.yaxis, autorange: false },
      };

      if (z2Key) {
        const [rx0, rx1] = plot.layout.xaxis.range;
        const [ry0, ry1] = plot.layout.yaxis.range;

        if (
          rx0 !== plot.layout.xaxis2.range[0] ||
          rx1 !== plot.layout.xaxis2.range[1] ||
          ry0 !== plot.layout.yaxis2.range[0] ||
          ry1 !== plot.layout.yaxis2.range[1]
        ) {
          // TODO: Try to sync heatmap zoom levels
        }
      }
    });

    on("plotly_autosize", () => {
      if (height === "auto") {
        setTimeout(() => {
          plot.layout.height = calcPlotHeight(plot);
          Plotly.redraw(plot);
        });
      }

      setDoubleHeatMapRatio(calcDoubleHeatmapRatio(plot.clientWidth));
    });

    return () => {
      listeners.forEach(([eventName, callback]) =>
        plot.removeListener(eventName, callback)
      );
    };
  }, [
    data,
    xKey,
    yKey,
    zKey,
    z2Key,
    zLabel,
    z2Label,
    height,
    doubleHeatMapRatio,
    selectedLabels,
    onSelectLabels,
    Plotly,
  ]);

  return <div ref={ref} />;
}

export default function LazyPrototypeCorrelationHeatmap({
  data,
  ...otherProps
}: Props) {
  return (
    <PlotlyLoader version="module">
      {(Plotly: PlotlyType) =>
        data ? (
          <PrototypeCorrelationHeatmap
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
