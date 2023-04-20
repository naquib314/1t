import { Column, IDataRow, INumberColumn } from '../model';
import { IRenderContext, ERenderMode, ICellRendererFactory, IImposer, ICellRenderer, IGroupCellRenderer, ISummaryRenderer } from './interfaces';
export declare function toHeatMapColor(v: number | null, row: IDataRow, col: INumberColumn, imposer?: IImposer): string;
export default class BrightnessCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumberColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=BrightnessCellRenderer.d.ts.map