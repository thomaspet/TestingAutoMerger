import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SalaryBalance, SalaryBalanceLine, FieldType } from '@uni-entities';
import { BehaviorSubject } from 'rxjs';
import { UniComponentLayout, LayoutBuilder, FieldSize } from '@uni-framework/ui/uniform';
import { SalaryBalanceLineService, ErrorService } from '@app/services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';

@Component({
  selector: 'uni-salary-balance-line',
  templateUrl: './salary-balance-line.component.html',
  styleUrls: ['./salary-balance-line.component.sass']
})
export class SalaryBalanceLineComponent implements OnInit {
        @Input() private salarybalance: SalaryBalance;
        @Output() public linesSaved: EventEmitter<any> = new EventEmitter<any>();
        public busy: boolean;

        public layout$: BehaviorSubject<UniComponentLayout> = new BehaviorSubject(new UniComponentLayout());
        public salaryBalanceLine$: BehaviorSubject<SalaryBalanceLine> = new BehaviorSubject(new SalaryBalanceLine());
        public config$: BehaviorSubject<any> = new BehaviorSubject({});


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
                .asObservable()
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
