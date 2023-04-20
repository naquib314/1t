import React, { ReactNode } from "react";
import cx from "classnames";
import { Popover, OverlayTrigger } from "react-bootstrap";

interface Props {
  title: string;
  content: ReactNode;
  id?: string;
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

function HelpTip({ title, content, id, className, placement }: Props) {
  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement={placement}
      overlay={
        <Popover id={id} title={title}>
          {content}
        </Popover>
      }
    >
      <span
        className={cx("glyphicon", "glyphicon-question-sign", className)}
        style={{ marginInlineStart: 8 }}
      />
    </OverlayTrigger>
  );
}

HelpTip.defaultProps = {
  id: "data-explorer-help",
  className: "",
  placement: "top",
};

export default HelpTip;
