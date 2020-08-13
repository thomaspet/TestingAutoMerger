import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {
    SalaryTransactionService, ErrorService, NumberFormat, VacationpayLineService, StatisticsService, SharedPayrollRunService
} from '@app/services/services';
import { SalaryTransactionSums, SalaryTransaction, VacationPayLine } from '@uni-entities';
import {BehaviorSubject, Subject, ReplaySubject, Observable, of} from 'rxjs';
import {ISummaryConfig} from '@app/components/common/summary/summary';
import {switchMap, finalize, tap} from 'rxjs/operators';
import {UniMath} from '@uni-framework/core/uniMath';
import { PayrollRunDataService } from '@app/components/salary/payroll-run/services/payroll-run-data.service';
import { IUniModal, IModalOptions, UniModalService, UniConfirmModalV2, ConfirmActions } from '@uni-framework/uni-modal';
import { UniTableConfig, UniTableColumnType, UniTableColumn } from '@uni-framework/ui/unitable';
import { SalarySumsService } from '@app/components/salary/shared/services/salary-transaction/salary-sums.service';
import { PayrollRunService } from '@app/components/salary/shared/services/payroll-run/payroll-run.service';

interface PaylistSection {
    employeeInfo: {
        number: number;
        name: string;
        payment: number;
    };
    paymentLines: SalaryTransaction[];
    collapsed: boolean;
}

interface IVacationBase {
    EmployeeID: number;
    VacationBase: number;
}

interface IControlSumModel {
    sums?: SalaryTransactionSums;
    vacationLines?: VacationPayLine[];
    vacationBases?: IVacationBase[];
}

@Component({
    selector: 'control-modal',
    templateUrl: './control-modal.component.html',
    styleUrls: ['./control-modal.component.sass']
})

export class ControlModalComponent implements OnInit, IUniModal, OnDestroy {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    private destroy$: Subject<any> = new Subject();
    public summary: ISummaryConfig[] = [];
    public busy: boolean;
    public description$: ReplaySubject<string>;
    public transes: SalaryTransaction[] = [];
    public model$: BehaviorSubject<IControlSumModel> = new BehaviorSubject({ sums: null, vacationLines: [], vacationBases: [] });
    public tableConfig: UniTableConfig;
    public payrollrunIsSettled: boolean;
    private negativeSalaryCount: number;

    constructor(
        private salaryTransactionService: SalaryTransactionService,
        private payrollRunService: PayrollRunService,
        private router: Router,
        private errorService: ErrorService,
        private salarySumsService: SalarySumsService,
        private numberFormat: NumberFormat,
        private vacationPayService: VacationpayLineService,
        private statisticsService: StatisticsService,
        private payrollRunDataService: PayrollRunDataService,
        private modalService: UniModalService,
        private sharedPayrollRunService: SharedPayrollRunService,
    ) {
        this.description$ = new ReplaySubject<string>(1);
     }

    public ngOnInit() {
        this.setNegativeSalaryCount(this.options.data.ID);
        this.getData(this.options.data.ID);
        this.generateTableConfigs();
        this.model$
            .takeUntil(this.destroy$)
            .subscribe(model => this.summary = this.getSums(model.sums, model.vacationLines, model.vacationBases));
    }

    public ngOnDestroy() {
        this.destroy$.next();
    }

    private getData(runID: number) {
        this.busy = true;
        this.payrollRunService
            .controlPayroll(runID)
            .pipe(
                switchMap(() => this.salaryTransactionService
                .GetAll(
                `filter=PayrollRunID eq ${runID}`
                + `&orderby=EmployeeNumber, Sum desc&nofilter=true`
                , ['Wagetype', 'Employee.BusinessRelationInfo', ])),
                finalize(() => this.busy = false)
            )
            .subscribe(transes => this.transes = transes);

        this.sharedPayrollRunService
            .Get(runID)
            .subscribe(payrollrun => this.description$.next(`Kontroll av lønnsavregning ${payrollrun.ID} - ${payrollrun.Description}`));

        this.salarySumsService
            .getFromPayrollRun(runID)
            .subscribe(sums => this.updateSumModel({sums: sums}));

        this.vacationPayService
            .getVacationpayBasis(0, 0, true)
            .subscribe(lines => this.updateSumModel({vacationLines: lines}));

        this.statisticsService
            .GetAll(
                `select=employeeid as EmployeeID,sum(sum) as VacationBase&model=SalaryTransaction`
                + `&filter=PayrollRunID eq ${runID} and wagetype.base_vacation eq 1`
                + `&expand=wagetype`)
            .subscribe(res => this.updateSumModel({vacationBases: res.Data}));
    }

    private updateSumModel(state: IControlSumModel) {
        const model = this.model$.getValue();
        model.sums = state.sums || model.sums;
        model.vacationBases = state.vacationBases || model.vacationBases;
        model.vacationLines = state.vacationLines || model.vacationLines;
        this.model$.next(model);
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
            .setAggFunc((rows: SalaryTransaction[]) => UniMath.round(rows
                    .filter(row => row.Wagetype && row.Wagetype.Base_Payment)
                    .reduce((sum, row) => sum + row.Sum, 0), 2));
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

    private getSums(
        sums: SalaryTransactionSums,
        vacationLines: VacationPayLine[] = [],
        vacationBases: IVacationBase[] = []): ISummaryConfig[] {
        return [
            {
                title: 'Grunnlag AGA',
                value: sums && this.numberFormat.asNumber(sums.baseAGA, {decimalLength: 0}),
            },
            {
                title: 'Feriepenger',
                value: this.numberFormat.asMoney(this.calculateVacationPay(vacationLines, vacationBases)),
                description: sums && `av ${this.numberFormat
                        .asNumber(
                            sums.baseVacation,
                            {decimalLength: 0}
                    )}`
            },
            {
                title: 'Forskuddstrekk',
                value: sums && this.numberFormat.asMoney(sums.tableTax + sums.percentTax + sums.manualTax),
                description: sums && `av ${this.numberFormat.asMoney(sums.basePercentTax + sums.baseTableTax)}`
            },
            {title: 'Sum til utbetaling', value: sums && this.numberFormat.asMoney(sums.netPayment)},
        ];
    }

    private calculateVacationPay(vacationLines: VacationPayLine[], vacationBases: IVacationBase[]) {
        if (!vacationLines.length || !vacationBases.length) {
            return 0;
        }
        return vacationBases
            .reduce((sum, curr) =>
                sum + curr.VacationBase
                * this.getRate(vacationLines.find(l => l.EmployeeID === curr.EmployeeID)) / 100, 0);
    }

    private getRate(line: VacationPayLine) {

        const age = line.Employee.BirthDate
            ? line.Year - new Date(line.Employee.BirthDate).getFullYear()
            : 0;
        if (age > 59) {
            return line.Rate60;
        }

        return line.Rate;
    }

    public runSettling() {
        this.busy = true;
        const canRunSettling$ = !!this.negativeSalaryCount ?
            this.openNegativeSalaryConfirmModal() : of(ConfirmActions.ACCEPT);

        canRunSettling$.pipe(
            finalize(() => this.busy = false),
            switchMap((res) => {
                if (res === ConfirmActions.ACCEPT) {
                    return this.payrollRunService.runSettling(this.options.data.ID);
                }
                return of(false);
            }),
            tap(response => this.payrollrunIsSettled = response)
        ).subscribe((response: boolean) => {
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
        this.payrollRunService
            .sendPaymentList(runID)
            .subscribe((response: boolean) => {
                this.router.navigateByUrl('/bank/ticker?code=payment_list');
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

    private setNegativeSalaryCount(payrollRunID: Number) {
        this.payrollRunDataService.getNegativeSalaryTransactionCount(
            payrollRunID).subscribe( count => this.negativeSalaryCount = count);
    }

    public openNegativeSalaryConfirmModal(): Observable<any> {
        return this.modalService.open(UniConfirmModalV2, {
            header: 'Negativ lønn',
            message: `${this.negativeSalaryCount} ansatte har negativ lønn. ` +
            `Disse beløpene vil bli opprettet som autogenererte forskudd dersom du avregner.`,
            buttonLabels: {accept: 'Avregn', cancel: 'Avbryt'}
        }).onClose;
    }
}
