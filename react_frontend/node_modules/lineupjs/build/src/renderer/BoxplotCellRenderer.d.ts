import { IBoxPlotColumn, INumberColumn, Column } from '../model';
import { IRenderContext, ERenderMode, ICellRendererFactory, IImposer, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class BoxplotCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: IBoxPlotColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(col: INumberColumn, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    createSummary(col: INumberColumn, context: IRenderContext, _interactive: boolean, imposer?: IImposer): ISummaryRenderer;
}
//# sourceMappingURL=BoxplotCellRenderer.d.ts.map