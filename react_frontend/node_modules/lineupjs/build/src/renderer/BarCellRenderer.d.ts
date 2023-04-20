import { Column, INumberColumn } from '../model';
import { IRenderContext, ERenderMode, ICellRendererFactory, IImposer, IGroupCellRenderer, ISummaryRenderer, ICellRenderer } from './interfaces';
export default class BarCellRenderer implements ICellRendererFactory {
    private readonly renderValue;
    readonly title: string;
    /**
     * flag to always render the value
     * @type {boolean}
     */
    constructor(renderValue?: boolean);
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: INumberColumn, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
//# sourceMappingURL=BarCellRenderer.d.ts.map