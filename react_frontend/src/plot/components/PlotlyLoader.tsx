import { useEffect, useState, ReactElement } from "react";

export type PlotlyType = typeof import("plotly.js");

interface Props {
  // "global" is the old version of Plotly loaded from cdn.plot.ly
  // "module" is the new version set in package.json
  version: "global" | "module";
  children: (Plotly: PlotlyType) => ReactElement;
}

function PlotlyLoader({ version, children }: Props) {
  const [LoadedPlotly, setLoadedPLotly] = useState<PlotlyType | null>(null);

  useEffect(() => {
    if (version === "module") {
      (async () => {
        const lib = (
          await import(
            // webpackChunkName: "custom-plotly"
            "../models/custom-plotly" as string
          )
        ).default;

        setLoadedPLotly(lib);
      })();
    } else {
      // @ts-ignore
      setLoadedPLotly(Plotly); // global version
    }
  }, [version]);

  return LoadedPlotly ? children(LoadedPlotly) : null;
}

export default PlotlyLoader;