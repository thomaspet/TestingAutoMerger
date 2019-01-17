import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';

export default new UniTableConfig('cost-allocation-list', false, false, 20)
    .setSearchable(false)
    .setDeleteButton(true)
    .setColumns([
        new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
    ]);
