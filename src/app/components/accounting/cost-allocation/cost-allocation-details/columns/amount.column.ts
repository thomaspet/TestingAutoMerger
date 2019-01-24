import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';

export const ammountColumn = () => {
    return new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Percent).setWidth('90px');
};
