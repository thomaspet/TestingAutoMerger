import { Component, OnInit,  ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { UniTable, UniTableConfig, UniTableColumn, UniTableColumnType } from 'unitable-ng2/main';
import { ErrorService, SalaryBalanceLineService } from '../../../services/services';
import { SalaryBalance, SalaryBalanceLine } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { ToastService, ToastType, ToastTime } from '../../../../framework/uniToast/toastService';

import * as moment from 'moment';

@Component({
    selector: 'salarybalanceline',
    templateUrl: './salarybalanceline.html'
})
export class SalarybalanceLine implements OnInit {
    @ViewChild(UniTable) private table: UniTable;
    private salarybalancelineTable: UniTableConfig;
    @Input() private salarybalance: SalaryBalance;
    private salarybalanceLines: SalaryBalanceLine[] = [];
    @Output() public linesSaved: EventEmitter<any> = new EventEmitter<any>();
    private busy: boolean;

    constructor(
        private _salarybalancelineService: SalaryBalanceLineService,
        private _toastService: ToastService,
        private errorService: ErrorService
    ) {

    }

    public ngOnInit() {
        this.createConfig();
    }

    public saveSalarybalanceLines() {
        this.busy = true;
        this.salarybalanceLines = this.table.getTableData();
        let saveObservables: Observable<any>[] = [];
        this.salarybalanceLines.forEach((salarybalanceline: SalaryBalanceLine) => {
            salarybalanceline.SalaryBalanceID = this.salarybalance.ID;
            salarybalanceline.ID > 0 ?
                saveObservables.push(this._salarybalancelineService.Put(salarybalanceline.ID, salarybalanceline)) :
                saveObservables.push(this._salarybalancelineService.Post(salarybalanceline));
        });

        Observable.forkJoin(saveObservables)
            .finally(() => {
                this.busy = false;
            })
            .subscribe(allSaved => {
                this.linesSaved.emit(true);
                this._toastService.addToast('Trekk lagret', ToastType.good, ToastTime.short);
            },
            err => this.errorService.handle(err));
    }

    private createConfig() {
        let descriptionCol = new UniTableColumn('Description', 'Forklaring', UniTableColumnType.Text);
        let dateCol = new UniTableColumn('Date', 'Dato', UniTableColumnType.LocalDate);
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money);

        this.salarybalancelineTable = new UniTableConfig(true, false, 1)
            .setColumns([descriptionCol, dateCol, amountCol]);
    }
}
