import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {WorkTypeSystemTypePipe} from '../../common/utils/pipes';
import {IViewConfig} from '../genericview/list';

export const view = new View('worktypes', 'Timearter', 'WorktypeListview', false, 'worktype');

@Component({
    selector: 'worktypes',
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>'
})
export class WorktypeListview {
    public viewconfig: IViewConfig;

    constructor(private tabService: TabService) {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: UniModules.WorkTypes,
            detail: { route: '/timetracking/worktypes/'},
            tab: view,
            data: {
                route: 'worktypes', expand: 'product'
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig(): UniTableConfig {
        const systemTypePipe = new WorkTypeSystemTypePipe();
        const cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number)
                .setWidth('5%')
                .setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                .setWidth('25%')
                .setFilterOperator('startswith'),
            new UniTableColumn('SystemType', 'Type', UniTableColumnType.Text)
                .setFilterable(false)
                .setTemplate((rowModel: any) => systemTypePipe.transform(rowModel.SystemType, '')  )
                .setWidth('15%'),
            new UniTableColumn('Product.PartName', 'Produktnr.', UniTableColumnType.Text)
                .setFilterOperator('startswith'),
            new UniTableColumn('Price', 'Pris', UniTableColumnType.Text)
                .setFilterOperator('startswith'),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                .setFilterOperator('startswith')
                .setWidth('20%'),
            new UniTableColumn('WagetypeNumber', 'Lønnsart', UniTableColumnType.Text)
                .setFilterOperator('startswith')
        ];
        return new UniTableConfig('timetracking.worktypes.list', false, true)
            .setSearchable(true)
            .setColumns(cols);
    }
}

view.component = WorktypeListview;
