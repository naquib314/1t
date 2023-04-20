import React, { useCallback, useState } from "react";
import Button from "react-bootstrap/lib/Button";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

interface Props {
  feedbackUrl: string;
}

function FeedbackBanner({ feedbackUrl }: Props) {
  const [hidden, setHidden] = useState(() => {
    return Boolean(
      window.localStorage.getItem("dx2_feedback_banner_dismissed")
    );
  });

  const handleClickClose = useCallback(() => {
    setHidden(true);
  }, []);

  const handleClickHideForever = useCallback(() => {
    window.localStorage.setItem("dx2_feedback_banner_dismissed", "true");
    setHidden(true);
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <div className={styles.FeedbackBanner}>
      <p>
        Help us improve Data Explorer 2.0! If you have a moment, please share
        your thoughts in
        <>
          {" "}
          <a href={feedbackUrl} target="_blank" rel="noopener noreferrer">
            this survey
          </a>
          .
        </>
        <Button bsStyle="primary" onClick={handleClickClose}>
          Ask me later
        </Button>
        <Button bsStyle="danger" onClick={handleClickHideForever}>
          Don’t show this again
        </Button>
      </p>
    </div>
  );
}

export default FeedbackBanner;
