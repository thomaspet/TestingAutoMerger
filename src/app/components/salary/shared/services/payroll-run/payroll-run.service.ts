import { BizHttp, UniHttp, RequestMethod } from '@uni-framework/core/http';
import { PayrollRun, LocalDate, WorkItemToSalary, EmployeeCategory, Employee } from '@uni-entities';
import { Observable } from 'rxjs';
import {
    ErrorService, SalarybalanceService, SalaryBalanceLineService, SalaryTransactionService,
    StatisticsService, SalaryBookingType, BrowserStorageService
} from '@app/services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { tap, filter, switchMap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ITag } from '@app/components/common/toolbar/tags';
import { Injectable } from '@angular/core';

export enum PayrollRunPaymentStatus {
    None = 0,
    SentToPayment = 1,
    PartlyPaid = 2,
    Paid = 3
}

export interface IPaycheckReportSetup {
    EmpIDs: number[];
    Mail: IPaycheckEmailInfo;
}

export interface IPaycheckEmailInfo {
    ReportID?: number;
    Subject?: string;
    Message?: string;
    GroupByWageType?: boolean;
    Localization?: string;
}

@Injectable()
export class PayrollRunService extends BizHttp<PayrollRun> {

    readonly payStatusProp = '_payStatus';

    public payStatusTable: any = [
        {ID: null, text: 'Opprettet'},
        {ID: 0, text: 'Opprettet'},
        {ID: 1, text: 'Avregnet'},
        {ID: 2, text: 'Godkjent'},
        {ID: 3, text: 'Sendt til utbetaling'},
        {ID: 4, text: 'Utbetalt'},
        {ID: 5, text: 'Bokført'},
        {ID: 6, text: 'Slettet'}
    ];

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private salaryBalanceService: SalarybalanceService,
        private salaryBalanceLineService: SalaryBalanceLineService,
        private toastService: ToastService,
        private salaryTransactionService: SalaryTransactionService,
        private statisticsService: StatisticsService,
        private browserStorage: BrowserStorageService,
    ) {
        super(http);
        super.relativeURL = PayrollRun.RelativeUrl;
    }

    public get(id: number | string, expand: string[] = null) {
        if (id === 0) {
            if (expand) {
                return super.GetNewEntity(expand);
            }
            return super.GetNewEntity([''], this.relativeURL);
        } else {
            if (expand) {
                return super.Get(id, expand);
            }
            return super.Get(id);
        }
    }

    public getOTPExportData(payrollIDs: string, otpPeriode: number, otpYear: number, asXml: boolean = false) {
        return super.GetAction(null, 'otp-export', `runs=${payrollIDs}&month=${otpPeriode}&year=${otpYear}&&asXml=${asXml}`);
    }

    public getTimeToTransfer(id: number, todate?: LocalDate): Observable<WorkItemToSalary> {
        return super.GetAction(id, 'time-to-salary-selection', todate ? `toDate=${todate}` : '');
    }

    public createTimeTransactions(payrun: number, timeList: number[]) {
        super.invalidateCache();
        this.salaryTransactionService.invalidateCache();
        return super.ActionWithBody(payrun, timeList, 'work-items-to-transes');
    }

    public getPrevious(ID: number) {
        const year = this.getYear();
        return super.GetAll(`filter=ID lt ${ID}${year ? ' and year(PayDate) eq ' + year : ''}&top=1&orderBy=ID DESC`)
            .map(resultSet => resultSet[0]);
    }

    public getNext(ID: number) {
        const year = this.getYear();
        return super.GetAll(`filter=ID gt ${ID}${year ? ' and year(PayDate) eq ' + year : ''}&top=1&orderBy=ID ASC`)
            .map(resultSet => resultSet[0]);
    }

    public getLatest() {
        const year = this.getYear();
        return super.GetAll(`filter=ID gt 0${year ? ' and year(PayDate) eq ' + year : ''}&top=1&orderBy=ID DESC`)
            .map(resultSet => resultSet[0]);
    }

    public getYear(): number {
        const financialYear = this.browserStorage.getItemFromCompany('activeFinancialYear');
        return financialYear && financialYear.Year ? financialYear.Year : undefined;
    }

    public controlPayroll(ID): Observable<boolean> {
        return super.PutAction(ID, 'control').pipe(map(() => true));
    }

    public recalculateTax(ID: number) {
        return super.PutAction(ID, 'recalculatetax');
    }

    public sendPaymentList(payrollrunID: number) {
        return super.PostAction(payrollrunID, 'sendpaymentlist');
    }

    public generateDraft(ID: number, bookingType: SalaryBookingType) {
        return super.PutAction(ID, 'rebuildpostings', `bookingType=${bookingType}`);
    }

    public postTransactions(ID: number, date: LocalDate = null, numberseriesID: number = null) {
        return super.PutAction(
            ID,
            'book',
            `accountingDate=${date}&numberseriesID=${numberseriesID}`);
    }

    public saveCategoryOnRun(id: number, category: EmployeeCategory): Observable<EmployeeCategory> {
        if (id && category) {
            this.invalidateCache();
            const saveObs = category.ID ? this.http.asPUT() : this.http.asPOST();
            return saveObs
                .usingBusinessDomain()
                .withEndPoint(this.relativeURL + '/' + id + '/category/' + category.ID)
                .withBody(category)
                .send()
                .map(response => response.body);
        }
        return Observable.of(null);
    }

    public savePayrollTag(runID, category: EmployeeCategory): Observable<ITag> {
        return this.saveCategoryOnRun(runID, category)
            .filter(cat => !!cat)
            .map(cat => {
                return {title: cat.Name, linkID: cat.ID};
            });
    }

    public deleteCategoryOnRun(id: number, catID: number): Observable<boolean> {
        return super.Remove(`${id}/category/${catID}`);
    }

    public deletePayrollTag(runID, tag: ITag): Observable<boolean> {
        return ((tag && tag.linkID)
            ? this.deleteCategoryOnRun(runID, tag.linkID)
            : Observable.of(false));
    }

    public getCategoriesOnRun(id: number) {
        return id
            ? super.Get(`${id}/category`)
            : Observable.of([]);
    }

    public getEmployeesOnPayroll(id: number, expands: string[]): Observable<Employee[]> {
        return super.GetAction(id, 'employeesonrun', `expand=${expands.join(',')}`);
    }

    public emailPaychecks(runID: number, setup: IPaycheckReportSetup) {
        return super.ActionWithBody(runID, setup, 'email-paychecks', RequestMethod.Put);
    }

    public deletePayrollRun(payrollRunID: number): Observable<any> {
        return super.Remove(payrollRunID)
            .do(() => this.clearRelatedCaches())
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public resetSettling(ID: number) {
        return super.PutAction(ID, 'resetrun').do(() => this.clearRelatedCaches());
    }

    public runSettling(ID: number, done: (message: string) => void = null) {
        return this.validateBeforeCalculation(ID)
            .pipe(
                tap(validates => {
                    if (validates || !done) {
                        return;
                    }
                    done('Avregning avbrutt');
                }),
                filter((validates: boolean) => validates),
                switchMap(() => super.PutAction(ID, 'calculate')),
                tap(() => this.clearRelatedCaches()),
            );
    }

    public savePayrollRun(payrollRun: PayrollRun): Observable<PayrollRun> {
        return payrollRun.ID
            ? super.Put(payrollRun.ID, payrollRun)
            : super.Post(payrollRun);
    }

    public GetPaymentStatusText(payrollRun: PayrollRun) {
        const status: PayrollRunPaymentStatus = payrollRun[this.payStatusProp];
        switch (status) {
            case PayrollRunPaymentStatus.SentToPayment:
                return 'Sendt til utbetaling';
            case PayrollRunPaymentStatus.PartlyPaid:
                return 'Delbetalt';
            case PayrollRunPaymentStatus.Paid:
                return 'Utbetalt';
            default:
                return '';
        }
    }

    public validateBeforeCalculation(runID: number): Observable<boolean> {
        return forkJoin(
            this.validateRunHasTranses(runID),
            this.validateAccountsOnTranses(runID),
        )
        .pipe(
            map(result => result.reduce((acc, curr) => acc && curr, true))
        );
    }

    public getStatus(payrollRun: PayrollRun) {
        if (payrollRun) {
            return this.payStatusTable.find(x => x.ID === payrollRun.StatusCode);
        } else {
            return this.payStatusTable.find(x => x.ID === null);
        }
    }

    public getLatestSettledPeriod(id: number, yr: number) {
        return super.GetAction(id, 'latestperiod', `currYear=${yr}`);
    }

    private validateAccountsOnTranses(runID: number): Observable<boolean> {
        return this.statisticsService
            .GetAllUnwrapped(
                `SELECT=EmployeeNumber as EmployeeNumber,ID as ID,WageTypeNumber as WageTypeNumber,Text as Text&` +
                `MODEL=SalaryTransaction&` +
                `FILTER=Account eq 0 and PayrollRunID eq ${runID} and Sum ne 0`
            )
            .pipe(
                tap(transes => {
                    if (!transes.length) {
                        return;
                    }
                    const emps: {[empNumber: number]: any[]} = {};
                    transes.forEach(trans => {
                        if (!emps[trans.EmployeeNumber]) {
                            emps[trans.EmployeeNumber] = [];
                        }
                        emps[trans.EmployeeNumber].push(trans);
                    });
                    const text = Object
                        .keys(emps)
                        .map(key => {
                            const transGroup = emps[key];
                            return `<dt>Ansatt nr ${key}</dt>`
                                + transGroup.map(trans =>
                                    `<dd>`
                                    + `Lønnsart: ${trans.WageTypeNumber}<br>`
                                    + `Tekst: '${trans.Text}'`
                                    + `</dd>`
                                ).join('<br>');
                        }).join('<br>');
                    this.toastService
                        .addToast('Konto mangler',
                            ToastType.bad,
                            ToastTime.forever,
                            `<dl>${text}</dl>`);

                }),
                map(transes => !transes.length),
            );
    }

    private validateRunHasTranses(runID: number): Observable<boolean> {
        return this.statisticsService
            .GetAllUnwrapped(
                `SELECT=count(ID) as count&` +
                `MODEL=SalaryTransaction&` +
                `FILTER=PayrollRunID eq ${runID}`
            )
            .pipe(
                map(data => !!data[0].count),
                tap(hasTranses => {
                    if (hasTranses) {
                        return;
                    }
                    this.toastService
                        .addToast(
                            'Avregning avbrutt',
                            ToastType.bad,
                            ToastTime.medium,
                            'Ingen lønnsposter i lønnsavregning');
                })
            );
    }

    private clearRelatedCaches(): void {
        this.salaryBalanceLineService.invalidateCache();
        this.salaryBalanceService.invalidateCache();
        this.salaryTransactionService.invalidateCache();
    }


}
