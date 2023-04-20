import * as React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { getDapi } from "../utilities/context";

type TriggerType = "click" | "hover" | "focus";

interface Props {
  popoverContent: React.ReactNode;
  popoverId: string;
  target?: React.ReactNode;
  popoverTitle?: string;
  trigger?: TriggerType | Array<TriggerType>;
  placement?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const infoImg = (
  <img
    style={{
      height: "13px",
      paddingLeft: "4px",
      cursor: "pointer",
    }}
    src={getDapi()._getFileUrl("/static/img/gene_overview/info_purple.svg")}
    alt="description of term"
    className="icon"
  />
);

const InfoIcon = (props: Props) => {
  const {
    target,
    popoverContent,
    popoverId,
    popoverTitle,
    trigger,
    placement,
    className,
  } = props;
  const popover = (
    <Popover id={popoverId} title={popoverTitle} className={className}>
      {popoverContent}
    </Popover>
  );
  return (
    <OverlayTrigger
      trigger={trigger}
      placement={placement}
      overlay={popover}
      rootClose
    >
      {target}
    </OverlayTrigger>
  );
};

InfoIcon.defaultProps = {
  target: infoImg,
  popoverTitle: null,
  trigger: "click",
  placement: "right",
  className: "",
};

export default InfoIcon;