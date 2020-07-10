import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {PaycheckSendingComponent, PaycheckFormat} from './paycheck-sending.component';
import {IUniModal, IModalOptions, UniModalService, ConfirmActions, UniPreviewModal} from '@uni-framework/uni-modal';
import {Observable} from 'rxjs';
import {ErrorService, PayrollrunService, ReportDefinitionService, IPaycheckEmailInfo} from '@app/services/services';
import {ToastTime, ToastType, ToastService} from '@uni-framework/uniToast/toastService';
import {Employee, ReportDefinition} from '@uni-entities';
import {filter, tap, switchMap, catchError, finalize, map} from 'rxjs/operators';
import {ComboButtonAction} from '@uni-framework/ui/combo-button/combo-button';

@Component({
    selector: 'paycheck-sender-modal',
    templateUrl: './paycheck-sender-modal.component.html'
})

export class PaycheckSenderModalComponent implements OnInit, IUniModal {
    @ViewChild(PaycheckSendingComponent, { static: true }) private paycheckSending: PaycheckSendingComponent;
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    public saveActions: ComboButtonAction[] = [];
    public checkedEmps: Employee[];
    public busy: boolean = true;
    public mailOptions: IPaycheckEmailInfo;
    report: ReportDefinition;

    constructor(
        private errorService: ErrorService,
        private modalService: UniModalService,
        private payrollRunService: PayrollrunService,
        private toastService: ToastService,
        private reportdefinitionService: ReportDefinitionService,
    ) { }

    public ngOnInit() {
        this.updateSaveActions();
    }

    public handlePaychecks(printAll: boolean = false) {
        const selectedPrints = this.checkedEmps.filter(emp => emp['_paycheckFormat'] === PaycheckFormat.PRINT);
        const selectedEmails = this.checkedEmps.filter(emp => emp['_paycheckFormat'] === PaycheckFormat.E_MAIL);

        this.printPaychecks(printAll ? this.checkedEmps : selectedPrints, this.report);

        if (printAll) {
            this.paycheckSending.resetRows();
            return;
        }

        this.emailPaychecks(selectedEmails)
            .subscribe(response => {
                if (!response) {
                    return;
                }
                this.paycheckSending.resetRows();
            });
    }

    private emailPaychecks(employees: Employee[]): Observable<boolean> {
        return this.modalService
            .confirm({
                header: 'Send lønnslipp',
                message: `Sender lønnslipper til ${employees.length} ansatte`,
                buttonLabels: {
                    accept: 'Send',
                    cancel: 'Avbryt',
                }
            })
            .onClose
            .pipe(
                filter((action: ConfirmActions) => action === ConfirmActions.ACCEPT),
                map(() => employees),
                filter(emps => !!emps.length),
                tap(() => this.busy = true),
                switchMap(emps => this.payrollRunService.emailPaychecks(
                    this.options.data,
                    {
                        EmpIDs: emps.map(emp => emp.ID),
                        Mail: this.mailOptions,
                    })),
                catchError((err, obs) => this.errorService.handleRxCatch(err, obs)),
                finalize(() => this.busy = false),
                tap((response: boolean) => {
                    response
                        ? this.toastService
                            .addToast(
                            'Lønnslipper er sendt',
                            ToastType.good,
                            ToastTime.short,
                            'Valgte lønnslipper er sendt til ansatte')
                        : this.toastService
                            .addToast(
                            'Feil',
                            ToastType.bad,
                            ToastTime.short,
                            'Sending av valgte lønnslipper feilet');
                }),
            );
    }

    private printPaychecks(employees: Employee[], report: any) {
        if (!employees.length || !report) {
            return;
        }

        const employeeFilter = employees
            .map(emp => emp.EmployeeNumber)
            .join(',');

        report.parameters = [
            {Name: 'EmployeeFilter', value: employeeFilter},
            {Name: 'RunID', value: this.options.data},
            {Name: 'Grouped', value: this.mailOptions.GroupByWageType},
        ];

        this.modalService.open(UniPreviewModal, {data: report});
    }

    private updateSaveActions() {
        this.saveActions = this.getSaveActions(this.checkedEmps && !!this.checkedEmps.length);
    }

    private getSaveActions(isActive: boolean): ComboButtonAction[] {
        return [
            {
                label: 'Send e-post/Skriv ut',
                action: () => this.handlePaychecks(),
                disabled: !isActive
            },
            {
                label: 'Skriv ut alle valgte',
                action: () => this.handlePaychecks(true),
                disabled: !isActive
            }
        ];
    }

    public close() {
        this.onClose.next(true);
    }

    public onSelectedEmps(event: Employee[]) {
        this.checkedEmps = event;
        this.updateSaveActions();
    }

    public onEmailOptions(event: IPaycheckEmailInfo) {
        this.mailOptions = event;
    }

    public onPrintReport(event: ReportDefinition) {
        this.report = event;
    }

    public setBusy(event: boolean) {
        this.busy = event;
    }
}
