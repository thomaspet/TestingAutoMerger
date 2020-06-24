import {Injectable} from '@angular/core';
import {BizHttp, UniHttp, RequestMethod} from '@uni-framework/core/http';
import { PayrollRun, LocalDate, WorkItemToSalary, PostingSummaryDraft, EmployeeCategory, Employee, Payment, TaxDrawFactor } from '@uni-entities';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { ITag } from '@app/components/common/toolbar/tags';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { Observable, forkJoin, of } from 'rxjs';
import { tap, filter, switchMap, map } from 'rxjs/operators';
import { SalaryTransactionService } from '@app/services/salary/salaryTransaction/salaryTransactionService';
import { ErrorService } from '@app/services/common/errorService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { FinancialYearService } from '@app/services/accounting/financialYearService';
import { BrowserStorageService, UniTranslationService } from '@app/services/commonServicesModule';
import { SalaryBalanceLineService } from '@app/services/salary/salarybalance/salaryBalanceLineService';
import { SalarybalanceService } from '@app/services/salary/salarybalance/salarybalanceService';

enum StatusCodePayment {
    Queued = 44001,
    TransferredToBank = 44002, // Note: NOT in Use yet
    Failed = 44003,
    Completed = 44004,
    ReadyForTransfer = 44005,
    ReceiptParsed = 44006
}

export enum PayrollRunPaymentStatus {
    None = 0,
    SentToPayment = 1,
    PartlyPaid = 2,
    Paid = 3
}

export enum SalaryBookingType {
    Dimensions = 0,
    DimensionsAndBalance = 1,
    NoDimensions = 2,
}

export interface IPaycheckEmailInfo {
    ReportID?: number;
    Subject?: string;
    Message?: string;
    GroupByWageType?: boolean;
    Localization?: string;
}

export interface IPaycheckReportSetup {
    EmpIDs: number[];
    Mail: IPaycheckEmailInfo;
}

@Injectable()
export class PayrollrunService extends BizHttp<PayrollRun> {

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
        private salaryTransactionService: SalaryTransactionService,
        private toastService: ToastService,
        private statisticsService: StatisticsService,
        private financialYearService: FinancialYearService,
        private salaryBalanceService: SalarybalanceService,
        private salaryBalanceLineService: SalaryBalanceLineService,
        private browserStorage: BrowserStorageService,
        private translate: UniTranslationService
    ) {
        super(http);
        this.relativeURL = PayrollRun.RelativeUrl;
        this.entityType = PayrollRun.EntityType;
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

    public getEarliestOpenRun(setYear?: number): Observable<PayrollRun> {

        const year = setYear ? setYear : this.financialYearService.getActiveYear();

        return super.GetAll(
                `filter=(StatusCode eq null or StatusCode le 1) and year(PayDate) eq ${year}`
                + `&top=1`
                + `&orderby=PayDate ASC`)
            .map(result => result[0]);
    }

    public getLatestSettledRun(year?: number): Observable<PayrollRun> {
        return super.GetAll(`filter=StatusCode ge 1 ${
            year ? 'and year(PayDate) eq ' + year
            : ''
            }&top=1&orderby=PayDate DESC`)
            .map(resultSet => resultSet[0]);
    }

    public getEarliestOpenRunOrLatestSettled(setYear?: number): Observable<PayrollRun> {
        const currYear = setYear ? setYear : this.financialYearService.getActiveYear();

        return Observable.of(currYear)
            .switchMap(year => this.getEarliestOpenRun(year))
            .switchMap(run => run
                ? Observable.of(run)
                : this.getLatestSettledRun(currYear));
    }

    public getYear(): number {
        const financialYear = this.browserStorage.getItemFromCompany('activeFinancialYear');
        return financialYear && financialYear.Year ? financialYear.Year : undefined;
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

    public controlPayroll(ID): Observable<boolean> {
        return super.PutAction(ID, 'control').pipe(map(() => true));
    }

    public recalculateTax(ID: number) {
        return super.PutAction(ID, 'recalculatetax');
    }

    public recalulateOnEmp(empID: number, runID: number = null): Observable<boolean> {
        return this.PutAction(runID, 'calculateonemp', `empID=${empID}`);
    }


    public resetSettling(ID: number) {
        return super.PutAction(ID, 'resetrun').do(() => this.clearRelatedCaches());
    }

    public getPaymentList(ID: number) {
        return super.GetAction(ID, 'paymentlist');
    }

    public sendPaymentList(payrollrunID: number) {
        return super.PostAction(payrollrunID, 'sendpaymentlist');
    }

    public generateDraft(ID: number, bookingType: SalaryBookingType) {
        return super.PutAction(ID, 'rebuildpostings', `bookingType=${bookingType}`);
    }

    public getPostingSummaryDraft(ID: number): Observable<PostingSummaryDraft> {
        return super.GetAction(ID, 'postingsummarydraft');
    }

    public getPostingSummary(ID: number, bookingType: SalaryBookingType) {
        return super.GetAction(ID, 'postingsummary', `bookingType=${bookingType}`);
    }

    public getBookingTypeFromDraft(draft: PostingSummaryDraft): SalaryBookingType {
        if (!draft) {
            return SalaryBookingType.Dimensions;
        }
        if (draft.draftBasic) {
            return SalaryBookingType.NoDimensions;
        }
        if (draft.draftWithDimsOnBalance) {
            return SalaryBookingType.DimensionsAndBalance;
        }
        return SalaryBookingType.Dimensions;
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


    public getPaymentsOnPayrollRun(id: number): Observable<Payment[]> {
        return super.GetAction(id, 'payments-on-runs');
    }

    public getOTPExportData(payrollIDs: string, otpPeriode: number, otpYear: number, asXml: boolean = false) {
        return super.GetAction(null, 'otp-export', `runs=${payrollIDs}&month=${otpPeriode}&year=${otpYear}&&asXml=${asXml}`);
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

    public getAll(queryString: string, includePayments: boolean = false): Observable<PayrollRun[]> {
        const year = this.financialYearService.getActiveYear();

        let queryList = queryString.split('&');
        let filter = queryList.filter(x => x.toLowerCase().includes('filter'))[0] || '';
        filter = filter.toLowerCase();
        queryList = queryList.filter(x => !x.toLowerCase().includes('filter'));
        if (!filter.toLowerCase().includes('year(paydate)')) {
            filter = 'filter='
                + (filter ? `(${filter.replace('filter=', '')}) and ` : '')
                + `(year(PayDate) eq ${year})`;
        }

        queryList.push(filter);
        if (includePayments) {
            return this.GetAll(queryList.join('&'))
            .switchMap(runs =>
                runs.length ? forkJoin(
                    of(runs),
                    this.getPaymentsOnRun(runs, year)
                ) : Observable.of([])
            )
            .map((list) => {
                const [runs, payments] = list;
                return this.setPaymentStatusOnPayrollList(runs, payments);
            });
        }

        return this.GetAll(queryList.join('&'))
            .map(payrollRuns => this.setPaymentStatusOnPayrollList(payrollRuns));
    }

    getPaymentsOnRun(runs: PayrollRun[], year: number) {
        return this.statisticsService.GetAll(
            `model=Tracelink`
            + `&select=PayrollRun.ID as ID,Payment.StatusCode as StatusCode,Payment.PaymentDate as PaymentDate,`
            + `sum(casewhen(Payment.StatusCode ne ${StatusCodePayment.Completed},1,0)) as notPaid,`
            + `sum(casewhen(Payment.StatusCode eq ${StatusCodePayment.Completed},1,0)) as paid`
            + `&filter=SourceEntityName eq 'PayrollRun' and DestinationEntityName eq 'Payment' and Payment.PaymentDate le '${year}-12-31T23:59:59Z' `
            + `and Payment.PaymentDate ge '${year}-01-01T00:00:01Z' and (${runs.map(x => 'PayrollRun.ID eq ' + x.ID).join(' or ')})`
            + `&join=Tracelink.DestinationInstanceId eq Payment.ID as Payment and Tracelink.SourceInstanceId eq PayrollRun.ID as PayrollRun`
        ).map(x => x.Data);
    }

    public setPaymentStatusOnPayrollList(payrollRuns: PayrollRun[], payments?: any[]): PayrollRun[] {
        return payrollRuns
            ? payrollRuns
                .map(run => this.markPaymentStatus(run, payments ? payments.filter(p => p.ID === run.ID) : []))
            : [];
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

    private markPaymentStatus(payrollRun: PayrollRun, payments?: any[]): PayrollRun {
        payments = payments || payrollRun['Payments'] || [];
        if (payments.length <= 0) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.None;
        } else if (payments.some(pay => !pay.paid && !!pay.notPaid)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.SentToPayment;
        } else if (payments.some(pay => !!pay.paid && !!pay.notPaid)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.PartlyPaid;
        } else if(payments.some(pay => !!pay.paid && !pay.notPaid)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.Paid;
        }
        return payrollRun;
    }

    public deletePayrollRun(payrollRunID: number): Observable<any> {
        return super.Remove(payrollRunID)
            .do(() => this.clearRelatedCaches())
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public savePayrollRun(payrollRun: PayrollRun): Observable<PayrollRun> {
        return payrollRun.ID
            ? super.Put(payrollRun.ID, payrollRun)
            : super.Post(payrollRun);
    }

    private clearRelatedCaches(): void {
        this.salaryBalanceLineService.invalidateCache();
        this.salaryBalanceService.invalidateCache();
        this.salaryTransactionService.invalidateCache();
    }

    private getTaxHelpText() {
        const halfTax = 'Halv skatt(desember): Vil gi halv skatt på lønnsavregninger med månedslønn' +
            ' og ikke skatt på lønnsavregninger med 14-dagerslønn.' +
            ' Eventuelle unntak fra dette håndteres ut fra oppgitt skattekort.';
        const noTax = 'Ikke skatt: Systemet vil ikke beregne forskuddstrekk.' +
            ' Det er kun poster du taster manuelt som vil bli tatt med.' +
            ' Dette valget bør derfor kun benyttes for historikk og eventuelle korreksjoner.';
        return halfTax + `<br><br>` + noTax;
    }

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Payrollrun',
            Fields: [
                {
                    EntityType: 'payrollrun',
                    Property: 'ID',
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    Label: 'Nummer',
                    Legend: this.translate.translate('NAVBAR.PAYROLL'),
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_ID'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'Description',
                    FieldType: FieldType.TEXT,
                    Label: 'Beskrivelse',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_description',
                    Validations: [(value, field: UniFieldLayout) => {
                        if (!!value) {
                            return;
                        }

                        return {
                            field: field,
                            value: value,
                            errorMessage: `Må fylles ut før lønnspostene kan vises`,
                            isWarning: false,
                        };
                    }]
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'StatusCode',
                    Hidden: true,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    Label: 'Status',
                    FieldSet: 1,
                    Section: 0,
                    hasLineBreak: true,
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'taxdrawfactor',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Skattetrekk',
                    Tooltip: {
                        Text: this.getTaxHelpText(),
                        Alignment: 'bottom'
                    },
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_taxdrawfactor',
                    Options: {
                        source: [
                            {Indx: TaxDrawFactor.Standard, Name: 'Full skatt'},
                            {Indx: TaxDrawFactor.Half, Name: 'Halv skatt(desember)'},
                            {Indx: TaxDrawFactor.None, Name: 'Ikke skatt'}],
                        displayProperty: 'Name',
                        valueProperty: 'Indx'
                    }
                },
                {
                    EntityType: 'payrollrun',
                    Property: '',
                    Hidden: true,
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Behandling av fastlønn i feriemåned',
                    FieldSet: 1,
                    Section: 0,
                    hasLineBreak: true,
                    Options: {
                        source: [
                            {Indx: 0, Name: 'Vanlig'},
                            {Indx: 1, Name: 'Ferielønn (+1/26)'},
                            {Indx: 2, Name: 'Ferielønn (-1/26)'},
                            {Indx: 1, Name: 'Ferielønn (-4/26)'},
                            {Indx: 2, Name: 'Ferielønn (-3/22)'}],
                        displayProperty: 'Name',
                        valueProperty: 'Indx'
                    }
                },
                {
                    EntityType: 'payrollrun',
                    Property: '_IncludeRecurringPosts',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Inkluder faste poster/trekk',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_excludeRecurringPosts'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'HolidayPayDeduction',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Trekk i fastlønn for ferie',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_holidayPayDeduction',
                },
                {
                    EntityType: 'payrollrun',
                    Property: '1',
                    Hidden: true,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: true,
                    Label: 'Ansatte med negativ lønn utelates',
                    FieldSet: 1,
                    Section: 0,
                    hasLineBreak: true
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'FromDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fra dato',
                    FieldSet: 2,
                    Legend: 'Datoer og fritekst',
                    Section: 0,
                    Classes: 'payrollDetails_fromDate'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'ToDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Til dato',
                    FieldSet: 2,
                    Section: 0,
                    Classes: 'payrollDetails_toDate',
                    hasLineBreak: true
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'PayDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Utbetalingsdato',
                    FieldSet: 2,
                    Section: 0,
                    Classes: 'payrollDetails_payDate'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'FreeText',
                    FieldType: FieldType.TEXTAREA,
                    Label: 'Fritekst til lønnslipp',
                    FieldSet: 2,
                    Section: 0,
                    LineBreak: true,
                    Classes: 'payrollDetails_freeText',
                    Options: {
                        rows: 4
                    }
                },
            ]
        }]);
    }
}
