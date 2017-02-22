import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import { SalarybalanceService, ErrorService } from '../../../services/services';
import { Observable } from 'rxjs/Observable';
import { SalaryBalance } from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'salarybalances',
    templateUrl: 'app/components/salary/salarybalance/salarybalanceList.html',
})
export class SalarybalanceList implements OnInit {

    private tableConfig: UniTableConfig;
    private salarybalances$: Observable<SalaryBalance[]>;

    constructor(
        private _router: Router,
        private tabSer: TabService,
        private _salarybalanceService: SalarybalanceService,
        private errorService: ErrorService
    ) {
        this.tabSer.addTab({ name: 'Saldo', url: 'salary/salarybalances', moduleID: UniModules.Salarybalances, active: true });
    }

    public ngOnInit() {
        this.salarybalances$ = this._salarybalanceService.GetAll('orderBy=EmployeeID ASC')
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number);
        idCol.setWidth('5rem');

        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);
        const employeeCol = new UniTableColumn('EmployeeID', 'Ansattnr', UniTableColumnType.Text).setWidth('10rem');

        const typeCol = new UniTableColumn('InstalmentType', 'Type', UniTableColumnType.Money);

        const balanceCol = new UniTableColumn('Balance', 'Saldo', UniTableColumnType.Money);

        this.tableConfig = new UniTableConfig(false, true, 15)
            .setColumns([idCol, nameCol, employeeCol, typeCol, balanceCol])
            .setSearchable(true);
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/salarybalances/' + event.rowModel.ID);
    }

    public createSalarybalance() {
        this._router.navigateByUrl('/salary/salarybalances/0');
    }
}
