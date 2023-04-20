import { ISequence } from '../internal';
import { Column, IDataRow, IMultiLevelColumn } from '../model';
import { AAggregatedGroupRenderer } from './AAggregatedGroupRenderer';
import { IRenderContext, ICellRendererFactory, IImposer, IGroupCellRenderer, ICellRenderer } from './interfaces';
export default class MultiLevelCellRenderer extends AAggregatedGroupRenderer<IMultiLevelColumn & Column> implements ICellRendererFactory {
    private readonly stacked;
    readonly title: string;
    constructor(stacked?: boolean);
    canRender(col: Column): boolean;
    create(col: IMultiLevelColumn & Column, context: IRenderContext, imposer?: IImposer): ICellRenderer;
    createGroup(col: IMultiLevelColumn & Column, context: IRenderContext, imposer?: IImposer): IGroupCellRenderer;
    protected aggregatedIndex(rows: ISequence<IDataRow>, col: IMultiLevelColumn & Column): {
        index: number;
        row: IDataRow;
    };
}
//# sourceMappingURL=MultiLevelCellRenderer.d.ts.map