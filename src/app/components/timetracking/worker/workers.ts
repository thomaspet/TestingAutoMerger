import {Component} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {IViewConfig} from '../genericview/list';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'workers',
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>'
})
export class WorkerListview {
    public viewconfig: IViewConfig;

    constructor() {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: UniModules.Workers,
            baseUrl: '/timetracking/workers',
            title: 'Personer',
            data: {
                route: 'workers',
                expand: 'info'
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number)
                .setWidth('10%')
                .setFilterOperator('startswith'),
            new UniTableColumn('Info.Name', 'Navn').setWidth('40%')
        ];
        return new UniTableConfig('timetracking.worker.workers', false, true).setSearchable(true).setColumns(cols);
    }
}
