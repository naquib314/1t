import React, { CSSProperties } from "react";
import styles from "shared/common/styles/Spinner.scss";

interface SpinnerProps {
  left?: string;
  position?: CSSProperties["position"];
}

export class Spinner extends React.Component<SpinnerProps> {
  render() {
    let { left } = this.props;
    if (!left) {
      left = "65vw";
    }

    let { position } = this.props;
    if (!position) {
      position = "absolute";
    }

    return (
      /// / percentage of viewport width
      <div className={styles.spinner} style={{ position, zIndex: 1, left }}>
        <div />
        <div className={styles.rect2} />
        <div className={styles.rect3} />
        <div className={styles.rect4} />
        <div className={styles.rect5} />
      </div>
    );
  }
}
