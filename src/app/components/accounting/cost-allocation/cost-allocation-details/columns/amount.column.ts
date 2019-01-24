import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';

export const ammountColumn = () => {
    return new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
        .setVisible(false)
        .setWidth('90px');
};
