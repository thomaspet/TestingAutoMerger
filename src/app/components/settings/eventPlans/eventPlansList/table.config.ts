import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';

export default new UniTableConfig('eventplans-list', false, false, 20)
    .setSearchable(false)
    .setDeleteButton(true)
    .setColumns([
        new UniTableColumn('Name', 'Navn', UniTableColumnType.Text),
        new UniTableColumn('PlanType', 'Type', UniTableColumnType.Text)
            .setTemplate(row => {
                switch (row.PlanType.toString()) {
                    case '0': return 'Webhook';
                    case '1': return 'Custom';
                    case '2': return 'Others';
                    case '3': return 'Function';
                    default: return '(Not defined)';
                }
            }),
        new UniTableColumn('Active', 'Status', UniTableColumnType.Text)
            .setTemplate(row => row.Active ? 'Aktiv' : 'Inaktiv')
    ]);

