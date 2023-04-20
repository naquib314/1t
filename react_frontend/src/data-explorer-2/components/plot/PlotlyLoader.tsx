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
    let mounted = true;

    if (version === "module") {
      (async () => {
        const lib = (
          await import(
            // webpackChunkName: "custom-plotly"
            "src/plot/models/custom-plotly.js" as string
          )
        ).default;

        if (mounted) {
          setLoadedPLotly(lib); // module version
        }
      })();
    } else if (mounted) {
      // @ts-ignore
      setLoadedPLotly(Plotly); // global version
    }

    return () => {
      mounted = false;
    };
  }, [version]);

  return LoadedPlotly ? children(LoadedPlotly) : null;
}

export default PlotlyLoader;