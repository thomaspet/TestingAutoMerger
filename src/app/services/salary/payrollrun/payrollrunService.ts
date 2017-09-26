import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {
    PayrollRun, TaxDrawFactor, EmployeeCategory,
    Employee, SalaryTransaction, Tracelink, Payment
} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../common/errorService';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {SalaryTransactionService} from '../salarytransaction/salaryTransactionService';
import {StatisticsService} from '../../common/statisticsService';
import {YearService} from '../../common/yearService';
import {ITag} from '../../../components/common/toolbar/tags';
enum StatusCodePayment {
    Queued = 44001,
    TransferredToBank = 44002, //Note: NOT in Use yet
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

@Injectable()
export class PayrollrunService extends BizHttp<PayrollRun> {

    readonly payStatusProp = '_payStatus';

    public payStatusTable: any = [
        { ID: null, text: 'Opprettet' },
        { ID: 0, text: 'Opprettet' },
        { ID: 1, text: 'Avregnet' },
        { ID: 2, text: 'Godkjent' },
        { ID: 3, text: 'Sendt til utbetaling' },
        { ID: 4, text: 'Utbetalt' },
        { ID: 5, text: 'Bokført' },
        { ID: 6, text: 'Slettet' }
    ];

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private salaryTransactionService: SalaryTransactionService,
        private toastService: ToastService,
        private statisticsService: StatisticsService,
        private yearService: YearService
    ) {
        super(http);
        // Anders 26.09
        // Disabling BizHttp's cache for now.
        // Done because actions in this service are written using UniHttp instead
        // of using the PutAction method we inherit from BizHttp.
        // Because of this BizHttp is never notified that an action is ran, and cache is not invalidated
        // Don't want to start messing with these requests so close to launch,
        // but they should be re-written to use the request helpers we inherit from BizHttp
        super.disableCache();
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
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=latestperiod&currYear=${yr}`)
            .send()
            .map(response => response.json());
    }

    public getPrevious(ID: number) {
        let year = this.getYear();
        return super.GetAll(`filter=ID lt ${ID}${year ? ' and year(PayDate) eq ' + year : ''}&top=1&orderBy=ID DESC`)
            .map(resultSet => resultSet[0]);
    }

    public getNext(ID: number) {
        let year = this.getYear();
        return super.GetAll(`filter=ID gt ${ID}${year ? ' and year(PayDate) eq ' + year : ''}&top=1&orderBy=ID ASC`)
            .map(resultSet => resultSet[0]);
    }

    public getLatest() {
        let year = this.getYear();
        return super.GetAll(`filter=ID gt 0${year ? ' and year(PayDate) eq ' + year : ''}&top=1&orderBy=ID DESC`)
            .map(resultSet => resultSet[0]);
    }

    public getEarliestOpenRun(setYear: number = undefined): Observable<PayrollRun> {
        return Observable
            .of(setYear)
            .switchMap(year => year
                ? Observable.of(year)
                : this.yearService.getActiveYear())
            .switchMap(year => super.GetAll(
                `filter=(StatusCode eq null or StatusCode le 1) and year(PayDate) eq ${year}`
                + `&top=1`
                + `&orderby=PayDate ASC`))
            .map(result => result[0]);
    }

    public getLatestSettledRun(year: number = undefined): Observable<PayrollRun> {
        return super.GetAll(`filter=StatusCode ge 1 ${year
            ? 'and year(PayDate) eq ' + year
            : ''}&top=1&orderby=PayDate DESC`)
            .map(resultSet => resultSet[0]);
    }

    public getEarliestOpenRunOrLatestSettled(setYear: number = undefined): Observable<PayrollRun> {
        let currYear = setYear;
        return Observable
            .of(setYear)
            .switchMap(year => year
                ? Observable.of(year)
                : this.yearService.getActiveYear())
            .do((year) => currYear = year)
            .switchMap(year => this.getEarliestOpenRun(year))
            .switchMap(run => run
                ? Observable.of(run)
                : this.getLatestSettledRun(currYear));
    }

    public getYear(): number {
        let financialYear = JSON.parse(localStorage.getItem('activeFinancialYear'));
        return financialYear && financialYear.Year ? financialYear.Year : undefined;
    }

    public runSettling(ID: number, done: (message: string) => void = null) {
        return this.salaryTransactionService
            .GetAll(`filter=PayrollRunID eq ${ID}`)
            .do(transes => {
                this.validateTransesOnRun(transes, done);
            })
            .filter((trans: SalaryTransaction[]) => !!trans.length)
            .switchMap(transes => this.http
                .asPUT()
                .usingBusinessDomain()
                .withEndPoint(this.relativeURL + '/' + ID + '?action=calculate')
                .send())
            .map(response => response.json());
        /*return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=calculate')
            .send()
            .map(response => response.json());*/
    }

    public controlPayroll(ID) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=control')
            .send()
            .map(response => response.json());
    }

    public resetSettling(ID: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=resetrun')
            .send()
            .map(response => response.json());
    }

    public getPaymentList(ID: number) {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '/' + ID)
            .send({ action: 'paymentlist' })
            .map(response => response.json());
    }

    public sendPaymentList(payrollrunID: number) {
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withEndPoint(this.relativeURL + '/' + payrollrunID)
            .send({ action: 'sendpaymentlist' })
            .map(response => response.json());
    }

    public getPostingsummary(ID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=postingsummary')
            .send()
            .map(response => response.json());
    }

    public postTransactions(ID: number, report: string = null) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=book')
            .withBody(report)
            .send()
            .map(response => response.json());
    }

    public saveCategoryOnRun(id: number, category: EmployeeCategory): Observable<EmployeeCategory> {
        if (id && category) {
            let saveObs = category.ID ? this.http.asPUT() : this.http.asPOST();
            return saveObs
                .usingBusinessDomain()
                .withEndPoint(this.relativeURL + '/' + id + '/category/' + category.ID)
                .withBody(category)
                .send()
                .map(response => response.json());
        }
        return Observable.of(null);
    }

    public savePayrollTag(runID, category: EmployeeCategory): Observable<ITag> {
        return this.saveCategoryOnRun(runID, category)
            .filter(cat => !!cat)
            .map(cat => { return { title: cat.Name, linkID: cat.ID }; });
    }

    public deleteCategoryOnRun(id: number, catID: number): Observable<boolean> {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + id + '/category/' + catID)
            .send();
    }

    public deletePayrollTag(runID, tag: ITag): Observable<boolean> {
        return ((tag && tag.linkID)
            ? this.deleteCategoryOnRun(runID, tag.linkID)
            : Observable.of(false));
    }

    public getCategoriesOnRun(id: number) {
        return id
            ? this.http
                .asGET()
                .usingBusinessDomain()
                .withEndPoint(this.relativeURL + `/${id}/category`)
                .send()
                .map(response => response.json())
            : Observable.of([]);
    }

    public getEmployeesOnPayroll(id: number, expands: string[]) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=employeesonrun&expand=${expands.join(',')}`)
            .send()
            .map(response => response.json());
    }

    public emailPaychecks(emps: Employee[], runID: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + runID + '?action=email-paychecks')
            .withBody(emps)
            .send();
    }


    public getPaymentsOnPayrollRun(id: number): Observable<Payment[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${id}?action=payments-on-runs`)
            .send()
            .map(response => response.json());
    }

    public validateTransesOnRun(transes: SalaryTransaction[], done: (message: string) => void = null) {
        if (!transes.length) {
            this.toastService
                .addToast(
                'Avregning avbrutt',
                ToastType.bad,
                ToastTime.medium,
                'Ingen lønnsposter i lønnsavregning');
            if (done) {
                done('Avregning avbrutt');
            }
        }
    }
    public setPaymentStatusOnPayroll(payrollRun: PayrollRun): Observable<PayrollRun> {
        return this.getPaymentsOnPayrollRun(payrollRun.ID)
            .map(payments => this.markPaymentStatus(payrollRun, payments));
    }
    public getAll(queryString: string, includePayments: boolean = false): Observable<PayrollRun[]> {
        return this.yearService
            .selectedYear$
            .asObservable()
            .take(1)
            .switchMap(year => {
                let queryList = queryString.split('&');
                let filter = queryList.filter(x => x.toLowerCase().includes('filter'))[0] || '';
                queryList = queryList.filter(x => !x.toLowerCase().includes('filter'));
                if (!filter.toLowerCase().includes('year(paydate)')) {
                    filter = (filter ? `(${filter}) and ` : 'filter=')
                        + `(year(PayDate) eq ${year})`;
                }

                queryList.push(filter);
                if (includePayments) {
                    queryList.push('includePayments=true');
                }
                return this.GetAll(queryList.join('&'));
            })
            .map(payrollRuns => this.setPaymentStatusOnPayrollList(payrollRuns));
    }
    public setPaymentStatusOnPayrollList(payrollRuns: PayrollRun[]): PayrollRun[] {
        return payrollRuns
            ? payrollRuns
                .map(run => this.markPaymentStatus(run))
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

    public deletePayrollRun(id: number): Observable<boolean> {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + id)
            .send()
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .map(res => res.json());
    }

    private markPaymentStatus(payrollRun: PayrollRun, payments: Payment[] = undefined): PayrollRun {
        payments = payments || payrollRun['Payments'] || [];
        if (payments.length <= 0) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.None;
        } else if (!payments.some(pay => pay.StatusCode === StatusCodePayment.Completed)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.SentToPayment;
        } else if (payments.some(pay => pay.StatusCode !== StatusCodePayment.Completed)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.PartlyPaid;
        } else {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.Paid;
        }
        return payrollRun;
    }

    private getTaxHelpText() {
        let halfTax = 'Halv skatt(desember): Vil gi halv skatt på lønnsavregninger med månedslønn' +
        ' og ikke skatt på lønnsavregninger med 14-dagerslønn.' +
        ' Eventuelle unntak fra dette håndteres ut fra oppgitt skattekort.';
        let noTax =  'Ikke skatt: Systemet vil ikke beregne forskuddstrekk.' +
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
                    Legend: 'Lønnsavregning',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_ID',
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'Description',
                    FieldType: FieldType.TEXT,
                    Label: 'Beskrivelse',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_description',
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
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
                    HelpText: this.getTaxHelpText(),
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_taxdrawfactor',
                    Options: {
                        source: [
                            { Indx: TaxDrawFactor.Standard, Name: 'Full skatt' },
                            { Indx: TaxDrawFactor.Half, Name: 'Halv skatt(desember)' },
                            { Indx: TaxDrawFactor.None, Name: 'Ikke skatt' }],
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
                            { Indx: 0, Name: 'Vanlig' },
                            { Indx: 1, Name: 'Ferielønn (+1/26)' },
                            { Indx: 2, Name: 'Ferielønn (-1/26)' },
                            { Indx: 1, Name: 'Ferielønn (-4/26)' },
                            { Indx: 2, Name: 'Ferielønn (-3/22)' }],
                        displayProperty: 'Name',
                        valueProperty: 'Indx'
                    },
                    Validations: [
                        {
                            ErrorMessage: 'should be a valid date',
                            Operator: 'DATE',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    EntityType: 'payrollrun',
                    Property: '_IncludeRecurringPosts',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Inkluder faste poster/trekk',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_excludeRecurringPosts',
                    Validations: [
                        {
                            ErrorMessage: 'should be a valid date',
                            Operator: 'DATE',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
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
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: 'should be a valid date',
                            Operator: 'DATE',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'FromDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fra dato',
                    FieldSet: 2,
                    Legend: 'Datoer og fritekst',
                    Section: 0,
                    Classes: 'payrollDetails_fromDate',
                    Validations: [
                        {
                            ErrorMessage: 'should be a valid date',
                            Operator: 'DATE',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'ToDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Til dato',
                    FieldSet: 2,
                    Section: 0,
                    Classes: 'payrollDetails_toDate',
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: 'should be a valid date',
                            Operator: 'DATE',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'PayDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Utbetalingsdato',
                    FieldSet: 2,
                    Section: 0,
                    Classes: 'payrollDetails_payDate',
                    Validations: [
                        {
                            ErrorMessage: 'should be a valid date',
                            Operator: 'DATE',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
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
                },
            ]
        }]);
    }
}
