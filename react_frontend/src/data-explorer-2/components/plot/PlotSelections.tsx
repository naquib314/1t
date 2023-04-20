import React, { useCallback } from "react";
import { Button } from "react-bootstrap";
import Section from "src/data-explorer-2/components/Section";
import styles from "src/data-explorer-2/styles/DataExplorer2.scss";

const MAX_NAMES = 5;

const toHyperlink = (index_type: string, plot_type: string, label: string) => {
  const urlFor: Record<string, string | undefined> = {
    gene: `../gene/${label}`,
    depmap_model: `../cell_line/${label}`,
  };

  if (plot_type === "correlation_heatmap" || !urlFor[index_type]) {
    return label;
  }

  return (
    <a href={urlFor[index_type]} target="_blank">
      {label}
    </a>
  );
};

const toHtml = (labels: string[]) => {
  return `
    <html>
      <head>
        <style>
          fieldset { width: 200px; user-select: none; }
          input, label { cursor: pointer; }
          pre { white-space: pre-wrap; word-break: break-all; }
        </style>
      </head>
      <body>
      <form>
        <fieldset>
          <legend>Format</legend>
          <div>
            <label><input checked type="radio" name="format" onclick="window.format('list')" />List</label>
            <label><input type="radio" name="format" onclick="window.format('csv')" />CSV</label>
            <label><input type="radio" name="format" onclick="window.format('tsv')" />TSV</label>
          </div>
        </fieldset>
      </form>
      <pre id="values"></pre>
        <script id="data" type="application/json">${JSON.stringify(
          labels
        )}</script>
        <script>
          function format(choice) {
            const data = document.getElementById("data");
            const list = JSON.parse(data.textContent);
            const elem = document.querySelector("#values");

            if (choice === "list") { elem.textContent = list.join("\\r\\n"); }
            if (choice === "csv") { elem.textContent = list.join(","); }
            if (choice === "tsv") { elem.textContent = list.join("\\t"); }

            const range = document.createRange();
            range.selectNodeContents(elem);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }

          format("list");
        </script>
      </body>
    </html>
  `;
};

function PlotSelections({
  data,
  plot_type,
  selectedLabels,
  onClickVisualizeSelected,
  onClickSaveSelectionAsContext,
}: any) {
  const labels: string[] = [...(selectedLabels || [])];

  const handleCopy = useCallback(() => {
    const w = window.open("");
    w.document.write(toHtml(labels));
  }, [labels]);

  return (
    <Section className={styles.PlotSelections} title="Plot Selections">
      <div className={styles.plotInstructions}>
        Select points to populate list
      </div>
      <div className={styles.plotSelectionsContent}>
        <ul className={styles.plotSelectionsList}>
          {labels.slice(0, MAX_NAMES).map((label: string) => (
            <li key={label}>
              {toHyperlink(data?.index_type, plot_type, label)}
            </li>
          ))}
          {labels.length > MAX_NAMES ? (
            <li>...and {(labels.length - MAX_NAMES).toLocaleString()} more</li>
          ) : null}
        </ul>
        <div className={styles.plotSelectionsButtons}>
          <Button onClick={handleCopy} disabled={labels.length < 1}>
            Copy
            <span className="glyphicon glyphicon-copy" />
          </Button>
          <Button
            type="button"
            disabled={
              labels.length < 1 ||
              !onClickSaveSelectionAsContext ||
              data?.index_type === "other"
            }
            onClick={onClickSaveSelectionAsContext}
          >
            Save as context +
          </Button>
          <Button
            type="button"
            bsStyle="primary"
            disabled={labels.length < 1}
            onClick={(e) => onClickVisualizeSelected(e)}
          >
            visualize
            <span className="glyphicon glyphicon-eye-open" />
          </Button>
        </div>
      </div>
    </Section>
  );
}

export default PlotSelections;
