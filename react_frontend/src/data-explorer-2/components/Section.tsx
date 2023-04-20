import React, { useState, ReactNode } from "react";
import cx from "classnames";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

interface Props {
  title: ReactNode;
  className?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, className, children, defaultOpen }: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className={cx(styles.Section, className)}>
      <label className={styles.sectionTitle}>
        <span>{title}</span>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "—" : "+"}
        </button>
      </label>
      {open && <div>{children}</div>}
    </div>
  );
}

Section.defaultProps = {
  className: null,
  defaultOpen: true,
};

export default Section;
