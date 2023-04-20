import React, { useEffect, useRef, useState, ReactNode } from "react";
import cx from "classnames";
import { CSSTransition } from "react-transition-group";
import styles from "../../styles/FilterControls.scss";

interface Props {
  hasChanges: boolean;
  label?: string;
  disabled?: boolean;
  expanded?: boolean;
  onClickExpand?: () => void;
  children: ReactNode;
}

function FilterAccordion({
  hasChanges,
  label,
  disabled,
  expanded,
  onClickExpand,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [transitionActive, setTransitionActive] = useState(false);

  useEffect(() => {
    // When the accordion is collapsed, reset the parent container's scroll
    // position. This smooths out the animation which otherwise looks weird
    // (the sticky labels suddenly become unstuck).
    if (!expanded) {
      ref.current.parentElement.parentElement.scrollTop = 0;
    }
  }, [expanded]);

  return (
    <div
      ref={ref}
      className={cx(styles.FilterAccordion, {
        [styles.disabled]: disabled,
        [styles.expanded]: expanded,
        [styles.transitionActive]: transitionActive,
      })}
    >
      <button
        type="button"
        className={styles.expandButton}
        onClick={() => {
          if (!disabled) {
            onClickExpand();
          }
        }}
      >
        <div className={styles.expandButtonLabel}>
          <span className={styles.sectionChangedIndicator}>
            <span style={{ visibility: hasChanges ? "visible" : "hidden" }}>
              {"\u2022"}
            </span>
          </span>
          {label}
        </div>
        <div className={styles.expandedIndicator}>{expanded ? "–" : "+"}</div>
      </button>
      <CSSTransition
        in={expanded}
        timeout={{ enter: 250, exit: 200 }}
        classNames={{
          enter: styles.transitionEnter,
          enterActive: styles.transitionEnterActive,
          exit: styles.transitionExit,
          exitActive: styles.transitionExitActive,
        }}
        onEnter={() => setTransitionActive(true)}
        onEntered={() => setTransitionActive(false)}
        onExit={() => setTransitionActive(true)}
        onExited={() => setTransitionActive(false)}
        unmountOnExit
      >
        <div className={styles.accordionContent}>{children}</div>
      </CSSTransition>
    </div>
  );
}

FilterAccordion.defaultProps = {
  label: null,
  disabled: false,
  expanded: false,
  onClickExpand: () => {},
};

export default FilterAccordion;
