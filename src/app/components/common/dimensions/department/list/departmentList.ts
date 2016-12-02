import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {TabService, UniModules} from '../../../../layout/navbar/tabstrip/tabService';
import {DepartmentService} from '../../../../../services/common/DepartmentService';
import {ErrorService} from '../../../../../services/common/ErrorService';

@Component({
    selector: 'department-dimensions-list',
    templateUrl: 'app/components/common/dimensions/department/list/departmentList.html'
})
export class DepartmentList {

    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private router: Router,
        private departmentService: DepartmentService,
        private tabService: TabService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({ name: 'Avdelinger', url: '/dimensions/department', active: true, moduleID: UniModules.Departments });
        this.setupTable();
    }

    public createNew() {
        this.router.navigateByUrl('/dimensions/department/new');
    }

    public onRowSelected (event) {
        this.router.navigateByUrl('/dimensions/department/' + event.rowModel.ID);
    };

    private setupTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            return this.departmentService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
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
