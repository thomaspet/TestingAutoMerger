import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import { ErrorService, FinancialYearService, SharedPayrollRunService } from '@app/services/services';
import {Observable} from 'rxjs';
import {PayrollRun, CompanySalary, LocalDate, CompanySalaryPaymentInterval} from '@uni-entities';
import * as moment from 'moment';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { IToolbarSearchConfig } from '@app/components/common/toolbar/toolbar';
import { PayrollRunService } from '@app/components/salary/shared/services/payroll-run/payroll-run.service';

@Injectable()
export class PayrollRunDetailsService {
    private url: string = '/salary/payrollrun/';

    constructor(
        private modalService: UniModalService,
        private payrollRunService: PayrollRunService,
        private errorService: ErrorService,
        private router: Router,
        private toastService: ToastService,
        private financialYearService: FinancialYearService,
        private sharedPayrollRunService: SharedPayrollRunService,
    ) {}

    public deletePayrollRun(id: number): void {
        this.modalService
            .confirm({
                header: 'Sletting av lønnsavregning',
                message: `Er du sikker på at du vil slette lønnsavregning ${id}?`,
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei'
                }
            })
            .onClose
            .switchMap((result: ConfirmActions) => result === ConfirmActions.ACCEPT
                ? this.payrollRunService.deletePayrollRun(id).map(() => result)
                : Observable.of(result))
            .subscribe((result) => {
                if (result !== ConfirmActions.ACCEPT) {
                    return;
                }
                this.router.navigateByUrl(this.url + 0);
            });
    }

    public setupSearchConfig(payrollRun: PayrollRun): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.lookupPayrollRuns(payrollRun, query),
            itemTemplate: (item: PayrollRun) => `${item.ID} - `
                + `${item.Description}`,
            initValue: (!payrollRun || !payrollRun.ID)
                ? 'SALARY.PAYROLL.NEW'
                : `${payrollRun.ID} - ${payrollRun.Description || 'Lønnsavregning'}`,
            onSelect: selected => this.router.navigate(['salary/payrollrun/' + selected.ID])
        };
    }

    private lookupPayrollRuns(payrollRun: PayrollRun, query: string): Observable<PayrollRun[]> {
        const year = this.financialYearService.getActiveYear();
        const odataQuery = `filter=ID ne ${payrollRun.ID} and (startswith(ID, '${query}') `
        + `or contains(Description, '${query}')) and year(PayDate) eq ${year}`
        + `&top=50&hateoas=false`;

        return this.sharedPayrollRunService.GetAll(odataQuery);
    }

    public suggestFromToDates(latest: PayrollRun, companysalary: CompanySalary, payrollRun: PayrollRun, activeYear: number) {
        const fromDate = latest
            ? new LocalDate(moment(latest.ToDate).clone().add(1, 'days').toDate())
            : new LocalDate(activeYear + '-01-01'); // first payroll

        payrollRun.FromDate = new LocalDate(fromDate.toLocaleString()).toDate();
        payrollRun.ToDate = this.getToDate(fromDate, companysalary && companysalary.PaymentInterval);
    }

    private getToDate(fromDate: LocalDate, paymentInteval: CompanySalaryPaymentInterval): Date {
        let toDate = new LocalDate(moment(fromDate).clone().subtract(1, 'days').toDate());
        const fromDateMoment = moment(fromDate).clone();
        const toDateMoment = moment(toDate).clone();

        switch (paymentInteval) {
            case CompanySalaryPaymentInterval.Pr14Days:
                toDate = new LocalDate(toDateMoment.add(14, 'days').toDate());
                break;

            case CompanySalaryPaymentInterval.Weekly:
                toDate = new LocalDate(toDateMoment.add(7, 'days').toDate());
                break;
            default:
                toDate = new LocalDate(fromDateMoment.endOf('month').toDate());
                break;
        }

        return new LocalDate(toDate.toLocaleString()).toDate();
    }

    public resetRun(payrollrun: PayrollRun): Observable<boolean> {
        if (!payrollrun) {
            return Observable.of(false);
        }

        if (!payrollrun.StatusCode) {
            this.toastService.addToast(
                'Kan ikke nullstille', ToastType.warn, 4,
                'Lønnsavregningen må være avregnet før du kan nullstille den'
            );
            return Observable.of(false);
        }

        return this.modalService
            .confirm({
                message: this.getResetRunMessage(),
                header: 'Nullstille lønnsavregning',
                buttonLabels: {
                    accept: 'Nullstill',
                    cancel: 'Avbryt'
                }
            })
            .onClose
            .switchMap(action => action === ConfirmActions.ACCEPT
                ? this.resetSettling(payrollrun)
                : Observable.of(false))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public routeToTravel(run: PayrollRun) {
        this.router.navigate(['salary/travels'], {queryParams: {runID: run.ID}});
    }

    private getResetRunMessage(): string {
        return '<p>Lønnsavregninger som er bokført og/eller utbetalt bør ikke nullstilles. ' +
        'Vi anbefaler da å lage en ny lønnsavregning hvor man korrigerer lønnspostene som har blitt feil.</p>' +
        '<p>Ved nullstilling vil lønnsposter oppdateres dersom lønnsart og/eller skattekort på ansatt har blitt endret siden ' +
        'lønnsavregningen ble avregnet. Dersom du har bokført må bokføringen korrigeres manuelt. Ønsker du å fortsette?</p>';
    }

    private resetSettling(payrollRun: PayrollRun): Observable<boolean> {
        return this.payrollRunService
                .resetSettling(payrollRun.ID)
                .do(response => {
                    if (!response) {
                        this.errorService.handleWithMessage(
                            response, 'Fikk ikke nullstilt lønnsavregning'
                        );
                    }
                });
    }
}
