import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../../framework/ui/unitable/index';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {
    SalaryTransactionService, PayrollrunService, ErrorService, SalarySumsService, NumberFormat, VacationpayLineService
} from '../../../../services/services';
import { SalaryTransactionSums, SalaryTransaction, VacationPayLine } from '../../../../unientities';
import {BehaviorSubject, Subject, ReplaySubject} from 'rxjs';
import {ISummaryConfig} from '@app/components/common/summary/summary';
import {switchMap, finalize} from 'rxjs/operators';

interface PaylistSection {
    employeeInfo: {
        number: number;
        name: string;
        payment: number;
    };
    paymentLines: SalaryTransaction[];
    collapsed: boolean;
}

@Component({
    selector: 'control-modal',
    templateUrl: './controlModal.html',
    styleUrls: ['./controlModal.sass']
})

export class ControlModal implements OnInit, IUniModal, OnDestroy {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    private destroy$: Subject<any> = new Subject();
    public summary: ISummaryConfig[] = [];
    public busy: boolean;
    public description$: ReplaySubject<string>;
    public transes: SalaryTransaction[] = [];
    public model$: BehaviorSubject<{
        sums: SalaryTransactionSums,
        vacationLines: VacationPayLine[]
    }> = new BehaviorSubject({ sums: null, vacationLines: [] });
    public tableConfig: UniTableConfig;
    public payrollrunIsSettled: boolean;
    constructor(
        private _salaryTransactionService: SalaryTransactionService,
        private _payrollRunService: PayrollrunService,
        private _router: Router,
        private errorService: ErrorService,
        private salarySumsService: SalarySumsService,
        private numberFormat: NumberFormat,
        private vacationPayService: VacationpayLineService,
    ) {
        this.description$ = new ReplaySubject<string>(1);
     }

    public ngOnInit() {
        this.getData(this.options.data.ID);
        this.generateTableConfigs();
        this.model$
            .takeUntil(this.destroy$)
            .subscribe(model => this.summary = this.getSums(model.sums, model.vacationLines));
    }

    public ngOnDestroy() {
        this.destroy$.next();
    }

    private getData(runID: number) {
        this.busy = true;
        this._payrollRunService
            .controlPayroll(runID)
            .pipe(
                switchMap(() => this._salaryTransactionService
                .GetAll(
                `filter=PayrollRunID eq ${runID}`
                + `&orderby=EmployeeNumber, Sum desc&nofilter=true`
                , ['Wagetype', 'Employee.BusinessRelationInfo', ])),
                finalize(() => this.busy = false)
            )
            .subscribe(transes => this.transes = transes);

        this._payrollRunService
            .Get(runID)
            .subscribe(payrollrun => this.description$.next(`Kontroll av lønnsavregning ${payrollrun.ID} - ${payrollrun.Description}`));

        this.salarySumsService
            .getFromPayrollRun(runID)
            .subscribe(sums => {
                const model = this.model$.getValue();
                model.sums = sums;
                this.model$.next(model);
            });

        this.vacationPayService
            .getVacationpayBasis()
            .subscribe(lines => {
                const model = this.model$.getValue();
                model.vacationLines = lines;
                this.model$.next(model);
            });
    }

    private generateTableConfigs() {
        const empInfoCol = new UniTableColumn('EmployeeNumber', 'Ansatt')
            .setTemplate((row: SalaryTransaction) => `${row.EmployeeNumber} - ${row.Employee.BusinessRelationInfo.Name}`)
            .setRowGroup(true);
        const wagetypeNumberCol = new UniTableColumn(
            'WageTypeNumber', 'Lønnsart', UniTableColumnType.Number);
        const wagetypenameCol = new UniTableColumn('Text', 'Navn', UniTableColumnType.Text);
        const fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate);
        const toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate);
        const accountCol = new UniTableColumn('Account', 'Konto', UniTableColumnType.Text);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money)
            .setIsSumColumn(true)
            .setAggFunc((rows: SalaryTransaction[]) => rows
                    .filter(row => row.Wagetype && row.Wagetype.Base_Payment)
                    .reduce((sum, row) => sum + row.Sum, 0));
        const paymentCol = new UniTableColumn('Wagetype.Base_Payment', 'Utbetales', UniTableColumnType.Text)
            .setTemplate((row: SalaryTransaction) => {
                if (!row.Wagetype) {
                    return;
                }

                return row.Wagetype.Base_Payment ? 'Ja' : 'Nei';
            });

        this.tableConfig = new UniTableConfig('salary.payrollrun.controlModal', false, false)
            .setColumns([
                empInfoCol, wagetypeNumberCol, wagetypenameCol, accountCol, fromdateCol,
                toDateCol, amountCol, rateCol, sumCol, paymentCol]);

    }

    private getSums(sums: SalaryTransactionSums, vacationLines: VacationPayLine[] = []): ISummaryConfig[] {
        return [
            {
                title: 'Arbeidsgiveravgift',
                value: sums && this.numberFormat.asMoney(sums.calculatedAGA),
                description: sums && `av ${this.numberFormat.asNumber(sums.baseAGA, {decimalLength: 0})}`
            },
            {
                title: 'Feriepenger',
                value: this.numberFormat.asMoney(vacationLines.reduce((sum, line) => sum + line.VacationPay60, 0)),
                description: vacationLines.length
                    ? `av ${this.numberFormat
                        .asNumber(
                            vacationLines.reduce((sum, line) => sum + line.ManualVacationPayBase + line.SystemVacationPayBase, 0),
                            {decimalLength: 0}
                    )}`
                    : ``
            },
            {
                title: 'Forskuddstrekk',
                value: sums && this.numberFormat.asMoney(sums.tableTax + sums.percentTax + sums.manualTax),
                description: sums && `av ${this.numberFormat.asMoney(sums.basePercentTax + sums.baseTableTax)}`
            },
            {title: 'Sum til utbetaling', value: sums && this.numberFormat.asMoney(sums.netPayment)},
        ];
    }

    public runSettling() {
        this.busy = true;
        const runID: number = this.options.data.ID;
        this._payrollRunService
            .runSettling(runID)
            .finally(() => this.busy = false)
            .do(response => this.payrollrunIsSettled = response)
            .subscribe((response: boolean) => {
                if (response) {
                    const config = this.options.modalConfig;
                    if (config && config.update) {
                        config.update();
                    }
                }
            },
            (err) => {
                this.errorService.handle(err);
            });
    }

    public sendPayments() {
        this.busy = true;
        const runID: number = this.options.data.ID;
        this._payrollRunService
            .sendPaymentList(runID)
            .subscribe((response: boolean) => {
                this._router.navigateByUrl('/bank?code=payment_list');
                this.close();
            },
            (err) => {
                this.busy = false;
                this.errorService.handle(err);
            });
    }

    public close() {
        this.onClose.next(false);
    }
}
