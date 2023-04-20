import { Column, INumberColumn, INumbersColumn } from '../model';
import { IRenderContext, ERenderMode, ICellRendererFactory, IImposer, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class HistogramCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumbersColumn, _context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(col: INumberColumn, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    createSummary(col: INumberColumn, context: IRenderContext, interactive: boolean, imposer?: IImposer): ISummaryRenderer;
}
//# sourceMappingURL=HistogramCellRenderer.d.ts.map