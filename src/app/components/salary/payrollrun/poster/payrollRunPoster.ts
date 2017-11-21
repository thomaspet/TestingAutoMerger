import {
    Component, OnInit, OnChanges, Input, ChangeDetectionStrategy, SimpleChanges, Output, EventEmitter
} from '@angular/core';
import {IPosterWidget} from '../../../common/poster/poster';
import {PayrollRun, Employee, SalaryTransactionSums} from '../../../../unientities';
import {
    SalarySumsService, EmployeeService, NumberFormat,
    ErrorService, PayrollrunService, PayrollRunPaymentStatus} from '../../../../services/services';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

enum PosterElements {
    Period = 0,
    PayDate = 1,
    EmployeeSelection = 2,
    Payment = 3
}

@Component({
    selector: 'payroll-run-poster',
    templateUrl: './payrollRunPoster.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PayrollRunPoster implements OnInit, OnChanges {

    @Input() public payrollRun: PayrollRun;
    @Input() public employees: Employee[];
    @Output() public payStatus: EventEmitter<PayrollRunPaymentStatus> = new EventEmitter();

    private payrollrunWidgets: IPosterWidget[] = [
        {
            type: 'table',
            config: {
                rows: [{
                    cells: [{
                        text: ''
                    }]
                }]
            }
        },
        {
            type: 'text',
            config: {
                mainText: { text: '' }
            }
        },
        {
            type: 'alerts',
            config: {
                alerts: [{
                    text: '',
                    class: ''
                },
                {
                    text: '',
                    class: ''
                }]
            }
        },
        {
            type: 'text',
            config: {
                mainText: { text: '' }
            }
        }
    ];

    private widgets$: BehaviorSubject<IPosterWidget[]> = new BehaviorSubject([]);
    constructor(
        private salarySumsService: SalarySumsService,
        private employeeService: EmployeeService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private payrollRunService: PayrollrunService
    ) { }

    public ngOnInit() {
        this.widgets$.next(this.payrollrunWidgets);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['payrollRun']) {
            this.updatePayrollRun(changes['payrollRun'].currentValue);
        }
        if (changes['employees']) {
            this.updateEmployees(changes['employees'].currentValue);
        }
    }

    private updatePayrollRun(payrollRun: PayrollRun) {
        if (payrollRun && payrollRun.ID) {
            this.payrollRunService
                .setPaymentStatusOnPayroll(payrollRun)
                .do(run => this.payStatus.emit(run[this.payrollRunService.payStatusProp]))
                .switchMap(run => {
                    payrollRun = run;
                    return this.salarySumsService.getFromPayrollRun(payrollRun.ID);
                })
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map((totalSums: SalaryTransactionSums) => {
                    let posterPeriod = {
                        type: 'table',
                        config: {
                            rows: [
                                {
                                    cells: [
                                        {
                                            text: 'Periode fastlønn',
                                            header: true,
                                            colspan: 3
                                        }
                                    ]
                                },
                                {
                                    cells: [
                                        {
                                            text: moment(payrollRun.FromDate).format('DD.MM.YYYY'),
                                            header: false
                                        },
                                        {
                                            text: ' - ',
                                            header: false
                                        },
                                        {
                                            text: moment(payrollRun.ToDate).format('DD.MM.YYYY'),
                                            header: false
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                        posterDates = {
                            type: 'text',
                            config: {
                                topText: [
                                    { text: 'Utbetalingsdato', class: 'large' }
                                ],
                                mainText: { text: moment(payrollRun.PayDate).format('DD.MM.YYYY') }
                            }
                        },
                        posterPayout = {
                            type: 'text',
                            config: {
                                topText: [
                                    { text: this.payrollRunPaymentText(payrollRun), class: 'large' }
                                ],
                                mainText: { text: this.numberFormat.asMoney(totalSums.netPayment) },
                                bottomText: [
                                    {text: this.payrollRunService.GetPaymentStatusText(payrollRun), class: 'small'}
                                ]
                            }
                        };

                    this.payrollrunWidgets[PosterElements.Period] = posterPeriod;
                    this.payrollrunWidgets[PosterElements.PayDate] = posterDates;
                    this.payrollrunWidgets[PosterElements.Payment] = posterPayout;
                    return this.payrollrunWidgets;
                })
                .subscribe((widgets) => this.widgets$.next(widgets));
        }
    }

    private payrollRunPaymentText(payrollRun: PayrollRun): string {
        return payrollRun[this.payrollRunService.payStatusProp] === PayrollRunPaymentStatus.Paid
            ? 'Utbetalt beløp'
            : 'Beløp til utbetaling';
    }

    private updateEmployees(emps: Employee[]) {
        if (emps) {
            this.employeeService
                .GetAll('')
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map((employees: Employee[]) => {

                    let posterSelection: IPosterWidget = {
                        type: 'alerts',
                        config: {
                            alerts: [
                                {
                                    text: this.EmployeeSumText(emps.length, 'i lønnsavregningen'),
                                    class: 'success'
                                }
                            ]
                        }
                    };

                    if (employees.length - emps.length > 0) {
                        posterSelection.config.alerts.push(
                            {
                                text: this.EmployeeSumText(employees.length - emps.length,
                                    'utelatt på grunn av utvalg'),
                                class: 'success'
                            }
                        );
                    }
                    this.payrollrunWidgets[PosterElements.EmployeeSelection] = posterSelection;

                    return this.payrollrunWidgets;
                })
                .subscribe((widgets) => this.widgets$.next(widgets));
        }
    }

    private EmployeeSumText(count: number, postText: string): string {
        if (count === 1) { return count + ' ansatt ' + postText; }

        return count + ' ansatte ' + postText;
    }
}
