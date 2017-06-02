import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UniComponentLayout, LayoutBuilder, FieldType, FieldSize } from 'uniform-ng2/main';
import { ErrorService, SalaryBalanceLineService } from '../../../services/services';
import { SalaryBalance, SalaryBalanceLine } from '../../../unientities';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ToastService, ToastType, ToastTime } from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'salarybalanceline',
    templateUrl: './salarybalanceline.html'
})
export class SalarybalanceLine implements OnInit {
    @Input() private salarybalance: SalaryBalance;
    @Output() public linesSaved: EventEmitter<any> = new EventEmitter<any>();
    private busy: boolean;

    private layout$: BehaviorSubject<UniComponentLayout> = new BehaviorSubject(new UniComponentLayout());
    private salaryBalanceLine$: BehaviorSubject<SalaryBalanceLine> = new BehaviorSubject(new SalaryBalanceLine());
    private config$: BehaviorSubject<any> = new BehaviorSubject({});


    constructor(
        private _salarybalancelineService: SalaryBalanceLineService,
        private _toastService: ToastService,
        private errorService: ErrorService,
        private layoutBuilder: LayoutBuilder
    ) {

    }

    public ngOnInit() {
        this.layout$.next(this.createLayout());
    }

    public saveSalaryBalanceLine() {
        this.salaryBalanceLine$
            .take(1)
            .do(() => this.busy = true)
            .finally(() => this.busy = false)
            .switchMap(salaryBalanceLine => {
                salaryBalanceLine.SalaryBalanceID = this.salarybalance.ID;
                return salaryBalanceLine.ID 
                    ? this._salarybalancelineService.Put(salaryBalanceLine.ID, salaryBalanceLine)
                    : this._salarybalancelineService.Post(salaryBalanceLine);
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do(() => this._toastService.addToast('Trekk lagret', ToastType.good, ToastTime.short))
            .subscribe(() => this.linesSaved.emit(true));

    }

    private createLayout(): UniComponentLayout {
        return this.layoutBuilder
            .createNewLayout()
            .addField(
                'Description',
                'Forklaring',
                FieldType.TEXT,
                FieldSize.Normal)
            .addField(
                'Date',
                'Dato',
                FieldType.LOCAL_DATE_PICKER,
                FieldSize.Normal)
            .addField(
                'Amount',
                'Beløp',
                FieldType.NUMERIC,
                FieldSize.Normal)
            .getLayout();
    }
}
