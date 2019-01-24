import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';

export default () => {
    return new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Percent).setWidth('90px');
};
