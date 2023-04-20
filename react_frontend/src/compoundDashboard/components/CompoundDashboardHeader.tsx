import React from "react";
import { getDapi } from "src/common/utilities/context";
import DownloadDataSvg from "src/common/components/svgs/DownloadDataSvg";
import styles from "../styles/CompoundDashboard.scss";

function CompoundDashboardHeader() {
  return (
    <h1>
      <span>PRISM Compound Dashboard</span>
      <form
        action={getDapi().getCompoundDashboardDownloadUrl("Rep_all_single_pt")}
        className={styles.headerForm}
      >
        <button type="submit" className={styles.headerButton}>
          <DownloadDataSvg />
          <span>Download repurposing single point dataset</span>
        </button>
      </form>
      <form
        action={getDapi().getCompoundDashboardDownloadUrl("rep1m")}
        className={styles.headerForm}
      >
        <button type="submit" className={styles.headerButton}>
          <DownloadDataSvg />
          <span>Download repurposing 1M dataset</span>
        </button>
      </form>
    </h1>
  );
}

export default CompoundDashboardHeader;
