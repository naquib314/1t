import React, { useEffect, useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import { Button, DropdownButton, MenuItem } from "react-bootstrap";
import { Tooltip } from "shared/common/components/Tooltip";
import {
  PanIcon,
  ZoomIcon,
  BoxSelectIcon,
  LassoSelectIcon,
} from "shared/plot/plotlyWrapper/components/DragmodeIcon";
import type ExtendedPlotType from "src/plot/models/ExtendedPlotType";
import styles from "../styles/PlotControls.scss";

type Option = { label: string; value: number };
type Dragmode = "zoom" | "pan" | "select" | "lasso";
type DownloadImageOptions = Omit<
  Parameters<ExtendedPlotType["downloadImage"]>[0],
  "format"
>;

interface Props {
  plot: ExtendedPlotType | null;
  searchOptions: Option[];
  onSearch: (selection: Option) => void;
  onDownload: () => void;
  searchPlaceholder: string;
  downloadImageOptions?: DownloadImageOptions;
}

const toIcon = (dragmode: Dragmode) =>
  ({
    zoom: ZoomIcon,
    pan: PanIcon,
    select: BoxSelectIcon,
    lasso: LassoSelectIcon,
  }[dragmode]);

const getTooltipText = (dragmode: Dragmode) =>
  ({
    zoom: "Zoom",
    pan: "Pan",
    select: "Box Select",
    lasso: "Lasso Select",
  }[dragmode]);

const DragmodeButton = ({
  dragmode,
  active,
  disabled,
  onClick,
}: {
  dragmode: Dragmode;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) => {
  const IconButton = toIcon(dragmode);

  return (
    <Tooltip
      id={`${dragmode}-tooltip`}
      content={getTooltipText(dragmode)}
      placement="top"
    >
      <IconButton
        bsSize="xs"
        active={active}
        disabled={disabled}
        onClick={onClick}
      />
    </Tooltip>
  );
};

function PlotControls({
  plot,
  searchOptions,
  onSearch,
  onDownload,
  searchPlaceholder,
  downloadImageOptions,
}: Props) {
  const [dragmode, setDragmode] = useState<Dragmode>("zoom");

  useEffect(() => {
    plot?.setDragmode(dragmode);
  }, [plot, dragmode]);

  return (
    <div className={styles.PlotControls}>
      <div className={styles.container}>
        <div className={styles.buttonGroup}>
          <DragmodeButton
            dragmode="zoom"
            disabled={!plot}
            active={dragmode === "zoom"}
            onClick={() => setDragmode("zoom")}
          />
          <DragmodeButton
            dragmode="pan"
            disabled={!plot}
            active={dragmode === "pan"}
            onClick={() => setDragmode("pan")}
          />
          <DragmodeButton
            dragmode="select"
            disabled={!plot}
            active={dragmode === "select"}
            onClick={() => setDragmode("select")}
          />
          <DragmodeButton
            dragmode="lasso"
            disabled={!plot}
            active={dragmode === "lasso"}
            onClick={() => setDragmode("lasso")}
          />
        </div>
        <div className={styles.buttonGroup}>
          <Button disabled={!plot} onClick={plot?.zoomIn}>
            <span className="glyphicon glyphicon-plus" />
          </Button>
          <Button disabled={!plot} onClick={plot?.zoomOut}>
            <span className="glyphicon glyphicon-minus" />
          </Button>
          <Button disabled={!plot} onClick={plot?.resetZoom}>
            reset
          </Button>
        </div>
        <div className={styles.buttonGroup}>
          <Tooltip
            id="label-points-tooltip"
            content="Label selected points"
            placement="top"
          >
            <Button disabled={!plot} onClick={() => plot.annotateSelected()}>
              <span className="glyphicon glyphicon-tags" />
            </Button>
          </Tooltip>
          <Tooltip
            id="unlabel-points-tooltip"
            content="Unlabel all points"
            placement="top"
          >
            <Button disabled={!plot} onClick={() => plot.removeAnnotations()}>
              <span className="glyphicon glyphicon-ban-circle" />
            </Button>
          </Tooltip>
        </div>
        <div className={styles.search}>
          <Typeahead
            id="plot-controls-search"
            onChange={(options: Option[]) => {
              if (options[0]) {
                onSearch(options[0]);
              }
            }}
            disabled={!searchOptions}
            options={searchOptions || []}
            selected={[]}
            minLength={1}
            placeholder={searchPlaceholder}
            highlightOnlyResult
          />
        </div>
        <div className={styles.buttonGroup}>
          <Tooltip
            id="download-data-tooltip"
            content="Download filtered data"
            placement="top"
          >
            <DropdownButton
              id="plot-controls-download"
              title={<span className="glyphicon glyphicon-download-alt" />}
              bsSize="small"
              pullRight
            >
              {downloadImageOptions && (
                <MenuItem
                  onClick={() =>
                    plot.downloadImage({
                      ...downloadImageOptions,
                      format: "png",
                    })
                  }
                >
                  Image (.png)
                </MenuItem>
              )}
              {downloadImageOptions && (
                <MenuItem
                  onClick={() =>
                    plot.downloadImage({
                      ...downloadImageOptions,
                      format: "svg",
                    })
                  }
                >
                  Image (.svg)
                </MenuItem>
              )}
              <MenuItem onClick={onDownload}>Filtered data (.csv)</MenuItem>
            </DropdownButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

PlotControls.defaultProps = {
  downloadImageOptions: null,
};

export default PlotControls;
