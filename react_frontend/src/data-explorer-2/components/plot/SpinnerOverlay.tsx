import React, { useLayoutEffect, useRef, useState } from "react";
import { Spinner } from "shared/common/components/Spinner";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

function SpinnerOverlay() {
  const container = useRef(null);
  const [style, setStyle] = useState(null);

  useLayoutEffect(() => {
    const el = container.current.parentElement;
    const width = el.clientWidth;
    const height = el.clientHeight;
    setStyle({ width, height });
  }, []);

  return (
    <>
      <div className={styles.SpinnerOverlay} style={style} ref={container}>
        <div className={styles.overlayBackground} />
      </div>
      <div className={styles.SpinnerOverlay} style={style}>
        <div>
          <Spinner position="relative" left="-2px" />
        </div>
      </div>
    </>
  );
}

export default SpinnerOverlay;
