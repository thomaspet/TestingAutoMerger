import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {PayrollrunService, ErrorService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';
import {PayrollRun, CompanySalary, LocalDate, CompanySalaryPaymentInterval, PaymentInterval} from '../../../../unientities';
import * as moment from 'moment';

@Injectable()
export class PayrollRunDetailsService {
    private url: string = '/salary/payrollrun/';

    constructor(
        private modalService: UniModalService,
        private payrollRunService: PayrollrunService,
        private errorService: ErrorService,
        private router: Router
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
            lookupFunction: (query) => this.payrollRunService.GetAll(
                `filter=ID ne ${payrollRun.ID} and (startswith(ID, '${query}') `
                + `or contains(Description, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: PayrollRun) => `${item.ID} - `
                + `${item.Description}`,
            initValue: (!payrollRun || !payrollRun.ID)
                ? 'Ny lønnsavregning'
                : `${payrollRun.ID} - ${payrollRun.Description || 'Lønnsavregning'}`,
            onSelect: selected => this.router.navigate(['salary/payrollrun/' + selected.ID])
        };
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
}
