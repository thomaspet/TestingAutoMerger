import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';

export const percentColumn = () => {
    return new UniTableColumn('Percent', 'Prosent', UniTableColumnType.Percent).setWidth('90px');
};
