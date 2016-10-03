import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {TabService} from '../../../../layout/navbar/tabstrip/tabService';
import {DepartmentService} from '../../../../../services/common/DepartmentService';

@Component({
    selector: 'department-dimensions-list',
    templateUrl: 'app/components/common/dimensions/departmentDimensions/list/departmentDimensionsList.html',
    directives: [UniTable],
    providers: [DepartmentService]
})
export class DepartmentDimensionsList {

    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private router: Router,
        private departmentService: DepartmentService,
        private tabService: TabService) {
        this.tabService.addTab({ name: 'Avdelinger', url: '/dimensions/departmentDimensions', active: true, moduleID: 23 });
        this.setupTable();
    }

    public createNew() {
        this.router.navigateByUrl('/dimensions/departmentDimensions/new');
    }

    public onRowSelected (event) {
        this.router.navigateByUrl('/dimensions/departmentDimensions/' + event.rowModel.ID);
    };

    private setupTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            return this.departmentService.GetAllByUrlSearchParams(urlParams);
        };

        this.tableConfig = new UniTableConfig(false, true, 25)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('DepartmentNumber', 'Avdelingsnummer', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('DepartmentManagerName', 'Avdelingsleder', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                    .setFilterOperator('contains')
            ]);
    }
}
