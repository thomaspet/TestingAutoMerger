import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { EventSubscriber } from '@app/unientities';

const tableConfig = new UniTableConfig('settings.eventplan.subscribers', true, true, 20)
    .setSearchable(false)
    .setEditable(true)
    .setColumns([
        new UniTableColumn('Name', 'Mottaker', UniTableColumnType.Text, true),
        new UniTableColumn('Endpoint', 'Url', UniTableColumnType.Text, true),
        new UniTableColumn('Active', 'Status', UniTableColumnType.Select, true)
            .setOptions({
                itemTemplate: option => option ? 'Aktiv' : 'Inaktiv',
                resource: [true, false]
            })
            .setTemplate(row => row.Active ? 'Aktiv' : 'Inaktiv')
    ])
    .setColumnMenuVisible(true, false);
    tableConfig.defaultRowData = (() => {
        const value = new EventSubscriber();
        value.Active = true;
        return value;
    })();

export default tableConfig;

