import { Column, CompositeNumberColumn } from '../model';
import { IRenderContext, ICellRendererFactory, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class InterleavingCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column): boolean;
    create(col: CompositeNumberColumn, context: IRenderContext): ICellRenderer;
    createGroup(col: CompositeNumberColumn, context: IRenderContext): IGroupCellRenderer;
    createSummary(col: CompositeNumberColumn, context: IRenderContext, _interactive: boolean): ISummaryRenderer;
}
//# sourceMappingURL=InterleavingCellRenderer.d.ts.map