// converts y axis data to log10
import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { useCombinedRefs } from "shared/common/utilities/hooks";

import * as Plotly from "plotly.js";
import {
  PlotHTMLElement,
  PlotlyCallbacks,
  PlotlyDragmode,
} from "shared/plot/models/plotlyPlot";
import { addPlotlyCallbacks } from "shared/common/utilities/plotly";

import * as models from "src/plot/models/volcanoPlotModels";
import * as utils from "src/plot/utilities/volcanoPlotUtils";
import PlotlyWrapper from "shared/plot/plotlyWrapper/components/PlotlyWrapper";
import { PlotlyParams } from "shared/plot/plotlyWrapper/models/plotlyWrapper";

type VolcanoPlotProps = {
  xLabel: string;
  yLabel: string;
  data: Array<models.VolcanoData>;
  bounds?: { width: number; height: number };
  annotations?: Array<Partial<Plotly.Annotations>>;
  highlightedPoints?: Array<number>;
  // resizer: PlotResizer;
  onSelectedLabelChange?: models.OnSelectedLabelChange;
  // };
  onPointClick?: (point: Plotly.PlotDatum) => void;
  dragmodeWidgetOptions?: Array<PlotlyDragmode>;
} & Omit<
  React.ComponentProps<typeof PlotlyWrapper>,
  "plotlyParams" | "onPointClick"
>;
/**
 * Forward any additional PlotlyWrapper props, with the exception of:
 *  plotlyParams (which should be provided through data)
 *  onPointClick (which should be provided through onSelectedLabelChange). Anticipating that uses of VolcanoPlot will either want clicking to change the selected point (which is built into and encapsulated by this component), or will not want any onClick behavior
 */

export const VolcanoPlot = React.forwardRef(
  (props: VolcanoPlotProps, ref: React.RefObject<HTMLInputElement>) => {
    // store the ref on state, so that the callbacks (additionalPlotlyCallbacks and onPointClick) can get notified to updated with the actual ref after it is populated
    const [plotlyRefState, setPlotlyRefState] = useState<PlotHTMLElement>();
    const innerRef = useCallback((node) => {
      setPlotlyRefState(node);
    }, []);
    const refForPlotlyWrapper = useCombinedRefs(ref, innerRef);

    const memoizedAdditionalPlotlyCallbacks = useMemo(
      () => utils.getHoverCallbacks(plotlyRefState),
      [plotlyRefState]
    );

    const onPointClick = useMemo(() => {
      return utils.withColorChange(
        plotlyRefState,
        props.data,
        props.onSelectedLabelChange
      );
    }, [plotlyRefState, props.data, props.onSelectedLabelChange]);

    function buildPlotlyWrapper(plotlyParams: PlotlyParams) {
      return (
        <PlotlyWrapper
          {...props}
          ref={refForPlotlyWrapper}
          plotlyParams={plotlyParams}
          downloadIconWidgetProps={props.downloadIconWidgetProps}
          additionalPlotlyCallbacks={memoizedAdditionalPlotlyCallbacks}
          onPointClick={props.onPointClick}
          idPrefixForUniqueness={props.idPrefixForUniqueness}
          dragmodeWidgetOptions={props.dragmodeWidgetOptions}
        />
      );
    }

    return buildPlotlyWrapper({
      data: utils.formatTrace(props.data, props.highlightedPoints),
      layout: utils.formatLayout(
        props.xLabel,
        props.yLabel,
        props.bounds,
        props.annotations
      ),
      config: {},
    });
  }
);
