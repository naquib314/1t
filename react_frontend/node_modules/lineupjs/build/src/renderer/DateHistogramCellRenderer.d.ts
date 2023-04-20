import { Column, IDateColumn, IDatesColumn } from '../model';
import { ERenderMode, ICellRendererFactory, IRenderContext, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export default class DateHistogramCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: IDatesColumn, _context: IRenderContext): ICellRenderer;
    createGroup(col: IDateColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: IDateColumn, context: IRenderContext, interactive: boolean): ISummaryRenderer;
}
//# sourceMappingURL=DateHistogramCellRenderer.d.ts.map