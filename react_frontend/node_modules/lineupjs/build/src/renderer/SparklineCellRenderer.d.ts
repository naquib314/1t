import { Column, INumbersColumn } from '../model';
import { IRenderContext, ERenderMode, ICellRendererFactory, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class SparklineCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumbersColumn): ICellRenderer;
    createGroup(col: INumbersColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=SparklineCellRenderer.d.ts.map