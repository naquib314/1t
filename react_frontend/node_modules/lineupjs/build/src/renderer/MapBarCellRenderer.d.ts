import { Column, IMapColumn, IMapAbleColumn, INumberColumn } from '../model';
import { ICellRendererFactory, IImposer, IRenderContext, ERenderMode, ISummaryRenderer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class MapBarCellRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: Column, mode: ERenderMode): boolean;
    create(col: IMapColumn<number> & INumberColumn, _context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(): IGroupCellRenderer;
    createSummary(col: IMapColumn<number> & IMapAbleColumn): ISummaryRenderer;
}
export declare function renderTable<E extends {
    key: string;
}>(node: HTMLElement, arr: readonly E[], renderValue: (v: HTMLElement, entry: E) => void): void;
//# sourceMappingURL=MapBarCellRenderer.d.ts.map