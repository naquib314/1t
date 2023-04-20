import "src/public-path";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CustomList } from "shared/cellLineSelector/components/ListStorage";

import { getQueryParams } from "shared/common/utilities/route";
import { getDapi, getVectorCatalogApi } from "src/common/utilities/context";

import { DatasetOption } from "src/entity/components/EntitySummary";

import ErrorBoundary from "src/common/components/ErrorBoundary";
import { WideTableProps } from "shared/common/components/WideTable";

import { EntitySummaryResponse } from "src/dAPI";
import { Option } from "src/common/models/utilities";
import renderCellLineSelectorModal from "shared/cellLineSelector/utilities/renderCellLineSelectorModal";

import { ConnectivityValue } from "./constellation/models/constellation";
import { EntityType } from "./entity/models/entities";

export { setUrlPrefix } from "src/common/utilities/context";
export { log, tailLog, getLogCount } from "src/common/utilities/log";

const DoseResponseTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "DoseResponseTab" */
      "src/compound/components/DoseResponseTab"
    )
);

const EntitySummary = React.lazy(
  () =>
    import(
      /* webpackChunkName: "EntitySummary" */
      "src/entity/components/EntitySummary"
    )
);

const CelfiePage = React.lazy(
  () =>
    import(
      /* webpackChunkName: "CelfiePage" */
      "./celfie/components/CelfiePage"
    )
);

const PredictabilityTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "PredictabilityTab" */
      "src/predictability/components/PredictabilityTab"
    )
);

const SublineagePlot = React.lazy(
  () =>
    import(
      /* webpackChunkName: "SublineagePlot" */
      "src/entity/components/SublineagePlot"
    )
);

const WideTable = React.lazy(
  () =>
    import(
      /* webpackChunkName: "WideTable" */
      "shared/common/components/WideTable"
    )
);

const ContextManager = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ContextManager" */
      "src/data-explorer-2/components/ContextManager"
    )
);

const StandaloneContextEditor = React.lazy(
  () =>
    import(
      /* webpackChunkName: "StandaloneContextEditor" */
      "src/data-explorer-2/components/StandaloneContextEditor"
    )
);

const Wrapper = ({ children }: { children: React.ReactElement }) => children;
const HotWrapper = hot(Wrapper);

// Render element inside an ErrorBoundary
const renderWithErrorBoundary = (
  element: React.ReactElement,
  container: Element
) => {
  ReactDOM.render(
    <ErrorBoundary>
      <HotWrapper>{element}</HotWrapper>
    </ErrorBoundary>,
    container
  );
};

export function launchCellLineSelectorModal() {
  const container = document.getElementById("cell_line_selector_modal"); // defined in layout.html

  renderCellLineSelectorModal(getDapi, getVectorCatalogApi, container);
}

export function launchContextManagerModal() {
  const container = document.getElementById("cell_line_selector_modal"); // reusing this element

  const hide = () => ReactDOM.unmountComponentAtNode(container);

  // Unmount a previous instance if any (otherwise this is a no-op).
  hide();

  ReactDOM.render(
    <React.Suspense fallback={null}>
      <ContextManager onHide={hide} />
    </React.Suspense>,
    container
  );
}

export function editContext(context: any, hash: string) {
  const container = document.getElementById("cell_line_selector_modal");
  const hide = () => ReactDOM.unmountComponentAtNode(container);
  hide();

  ReactDOM.render(
    <React.Suspense fallback={null}>
      <StandaloneContextEditor
        context={context}
        hash={hash}
        onHide={() => {
          hide();
        }}
      />
    </React.Suspense>,
    container
  );
}

export function initPredictiveTab(
  elementId: string,
  entityId: number,
  entityLabel: string,
  entityType: EntityType,
  customDownloadsLink: string,
  methodologyUrl: string
) {
  renderWithErrorBoundary(
    <React.Suspense fallback={<div>Loading...</div>}>
      <PredictabilityTab
        entityIdOrLabel={entityId}
        entityLabel={entityLabel}
        entityType={entityType}
        customDownloadsLink={customDownloadsLink}
        methodologyUrl={methodologyUrl}
      />
    </React.Suspense>,
    document.getElementById(elementId)
  );
}

export function initDoseResponseTab(
  elementId: string,
  datasetOptions: Array<any>
) {
  renderWithErrorBoundary(
    <React.Suspense fallback={<div>Loading...</div>}>
      <DoseResponseTab datasetOptions={datasetOptions} />
    </React.Suspense>,
    document.getElementById(elementId)
  );
}

export function initWideTable(elementId: string, config: WideTableProps) {
  const {
    data,
    columns,
    invisibleColumns,
    defaultColumnsToShow,
    columnOrdering,
    additionalReactTableProps,
    downloadURL,
    allowDownloadFromTableData,
    sorted,
    renderExtraDownloads,
  } = config;

  renderWithErrorBoundary(
    <React.Suspense fallback={<div>Loading...</div>}>
      <WideTable
        renderWithReactTableV7
        data={data}
        columns={columns}
        invisibleColumns={invisibleColumns}
        defaultColumnsToShow={defaultColumnsToShow}
        columnOrdering={columnOrdering}
        additionalReactTableProps={additionalReactTableProps}
        downloadURL={downloadURL}
        allowDownloadFromTableData={allowDownloadFromTableData}
        sorted={sorted}
        renderExtraDownloads={renderExtraDownloads}
      />
    </React.Suspense>,
    document.getElementById(elementId)
  );
}

export function initEntitySummary(
  elementId: string,
  summary: {
    initialSelectedDataset: DatasetOption;
    size_biom_enum_name: string;
    color: string;
    figure: { name: number };
    show_auc_message: boolean;
    summary_options: Array<DatasetOption>;
  }
) {
  const {
    size_biom_enum_name: sizeBiomEnumName,
    color,
    figure,
    show_auc_message: showAUCMessage,
    summary_options: summaryOptions,
  } = summary;
  const query = getQueryParams();
  let initialSelectedDataset = summary.summary_options[0];
  if ("dependency" in query) {
    initialSelectedDataset = summary.summary_options.find(
      (o) => o.dataset === query.dependency
    );
  }
  renderWithErrorBoundary(
    <React.Suspense fallback={<div>Loading...</div>}>
      <EntitySummary
        size_biom_enum_name={sizeBiomEnumName}
        color={color}
        figure={figure}
        show_auc_message={showAUCMessage}
        summary_options={summaryOptions}
        initialSelectedDataset={initialSelectedDataset}
      />
    </React.Suspense>,
    document.getElementById(elementId)
  );
}

// fixme: take this out when characterization moves to the full entitySummary
export function initSublineagePlot(
  elementId: string,
  datasetEntitySummary: EntitySummaryResponse,
  cellLineList: CustomList,
  name: number,
  showSublineageCheckboxId: string,
  rerenderPlotEventName: string
) {
  const attachEventListenerForPlotShown = (handlePlotShown: () => void) => {
    $('a[href="#characterization"]').on("shown.bs.tab", () => {
      handlePlotShown();
    });
    $(".characterizationRadio").change(() => {
      handlePlotShown();
    });
  };

  const removeEventListenerForPlotShown = () => {
    $('a[href="#dependency"]').off("shown.bs.tab");
  };

  const renderPlot = () => {
    const showSublineageCheckbox = document.getElementById(
      showSublineageCheckboxId
    ) as HTMLInputElement;
    const showSublineage = showSublineageCheckbox.checked;
    renderWithErrorBoundary(
      <React.Suspense fallback={<div>Loading...</div>}>
        <SublineagePlot
          datasetEntitySummary={datasetEntitySummary}
          elementId={`sublineage_plot_${name}`}
          attachEventListenerForPlotShown={attachEventListenerForPlotShown}
          removeEventListenerForPlotShown={removeEventListenerForPlotShown}
          showSublineage={showSublineage}
          key={cellLineList.name}
        />
      </React.Suspense>,
      document.getElementById(elementId)
    );
  };

  // hook only for the characterization tab, so that the plot is redrawn when show sublineage changes
  window.addEventListener(rerenderPlotEventName, renderPlot);

  renderPlot();
}

export function initCelfiePage(
  elementId: string,
  similarityOptions: Array<Option<string>>,
  colorOptions: Array<Option<string>>,
  connectivityOptions: Array<Option<ConnectivityValue>>,
  targetFeatureLabel: string,
  datasets: Array<Option<string>>,
  dependencyProfileOptions: Array<DatasetOption>,
  howToImg: string
) {
  const dapi = getDapi();
  dapi.startTrace("celfieInit");
  renderWithErrorBoundary(
    <React.Suspense fallback={<div>Loading...</div>}>
      <CelfiePage
        getGraphData={(
          taskIds,
          numGenes,
          similarityMeasure,
          connectivity,
          topFeature
        ) =>
          dapi.getConstellationGraphs(
            taskIds,
            null,
            similarityMeasure,
            numGenes,
            connectivity,
            topFeature
          )
        }
        getVolcanoData={(taskId: string) => {
          // const span = dapi.startSpan("getVolcanoData")
          return dapi.getTaskStatus(taskId).finally(() => {
            // span.end();
          });
        }}
        similarityOptions={similarityOptions}
        colorOptions={colorOptions}
        connectivityOptions={connectivityOptions}
        targetFeatureLabel={targetFeatureLabel}
        datasets={datasets}
        getComputeUnivariateAssociations={(params) => {
          const span = dapi.startSpan("computeUnivariateAssociations");
          return dapi.withSpan(span, () =>
            dapi.computeUnivariateAssociations(params).finally(() => {
              span.end();
            })
          );
        }}
        startSpan={(label: string) => dapi.startSpan(label)}
        dependencyProfileOptions={dependencyProfileOptions}
        onCelfieInitialized={() => dapi.endTrace()}
        howToImg={howToImg}
        methodIcon={dapi._getFileUrl("/static/img/predictability/pdf.svg")}
        methodPdf={dapi._getFileUrl(
          "/static/pdf/Genomic_Associations_Methodology.pdf"
        )}
      />
    </React.Suspense>,
    document.getElementById(elementId)
  );
}
