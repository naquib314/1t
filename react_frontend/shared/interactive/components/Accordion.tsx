import * as React from "react";
import type { Property } from "csstype";
import "shared/interactive/styles/accordion.scss";

interface Props {
  title: React.ReactNode;
  isOpen?: boolean;
  titleStyle?: React.CSSProperties;
}

interface State {
  isOpen: boolean;
  maxHeight: Property.MaxHeight;
  transition: Property.Transition;
  overflowIfOpen: Property.Overflow;
}

export default class Accordion extends React.Component<Props, State> {
  expandableElement: HTMLElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: props.isOpen ? props.isOpen : false,
      maxHeight: props.isOpen ? "1000px" : 0,
      transition: props.isOpen ? "max-height 0.6s ease" : "",
      overflowIfOpen: "hidden",
    };
  }

  componentDidUpdate = (prevProps: Props) => {
    const { isOpen } = this.props;
    if (prevProps.isOpen !== isOpen) {
      this.toggle();
    }
  };

  toggle = () => {
    const { isOpen } = this.state;
    let newState: any = {};
    if (isOpen) {
      newState = {
        isOpen: false,
        maxHeight: this.expandableElement?.getBoundingClientRect().height,
        transition: null,
        overflowIfOpen: "hidden",
      };
      this.setState(newState);

      setTimeout(
        () =>
          this.setState({
            maxHeight: 0,
            transition: "max-height 0.6s ease",
          }),
        0
      );
    } else {
      newState = {
        isOpen: true,
        maxHeight: "1000px",
        transition: "max-height 2s ease",
      };
      this.setState(newState);

      setTimeout(() => {
        this.setState({
          overflowIfOpen: "visible", // overflow visible so that dropdown options are shown
        });
      }, 200); // this number is in miliseconds, needs to be after the transition
    }
  };

  render() {
    const { children, titleStyle, title } = this.props;
    const { transition, maxHeight, isOpen, overflowIfOpen } = this.state;

    const style: React.CSSProperties = {
      transition,
      maxHeight,
      overflow: isOpen ? overflowIfOpen : "hidden",
    };
    let triangleClass;
    if (isOpen) {
      triangleClass = "glyphicon glyphicon-minus";
    } else {
      triangleClass = "glyphicon glyphicon-plus";
    }
    /*
     * The flex transition is smoother, but the max-height one doesn't require setting height
     * <div style={{display: 'flex', 'flexDirection': 'column', height: '100px'}}>
     * transition: 'flex 0.2s ease-out',
     */

    return (
      <div
        style={{
          margin: 8,
        }}
        className="depmap-accordion"
      >
        <div onClick={this.toggle} className="accordion-header">
          <span style={titleStyle}>
            <span className="accordion-title">{title}</span>
            <span
              className={triangleClass}
              aria-hidden="true"
              style={{
                float: "right",
                margin: "0",
                position: "relative",
                top: "50%",
                lineHeight: "unset",
              }}
            />
          </span>
        </div>
        <div
          style={style}
          ref={(element: HTMLDivElement) => {
            this.expandableElement = element;
          }}
        >
          {children}
        </div>
      </div>
    );
  }
}
