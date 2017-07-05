import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import {
    PayrollRun, TaxDrawFactor, EmployeeCategory,
    Employee, SalaryTransaction
} from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { ErrorService } from '../../common/errorService';
import { FieldType } from '../../../../framework/ui/uniform/index';
import { ToastService, ToastTime, ToastType } from '../../../../framework/uniToast/toastService';
import { SalaryTransactionService } from '../salarytransaction/salaryTransactionService';
import { ITag } from '../../../components/common/toolbar/tags';

@Injectable()
export class PayrollrunService extends BizHttp<PayrollRun> {

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
        private toastService: ToastService) {
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

    public getLatestSettledRun(year: number = undefined): Observable<PayrollRun> {
        return super.GetAll(`filter=StatusCode ge 1 ${year
            ? 'and year(PayDate) eq ' + year
            : ''}&top=1&orderby=PayDate DESC`)
            .map(resultSet => resultSet[0]);
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
            .map(cat => { return {title: cat.Name, linkID: cat.ID}; });
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

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Payrollrun',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'ID',
                    Placement: 0,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Nummer',
                    Description: null,
                    HelpText: null,
                    Legend: 'Lønnsvregning',
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: '',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    hasLineBreak: false,
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
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'Description',
                    Placement: 0,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Beskrivelse',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Classes: 'payrollDetails_description',
                    Legend: '',
                    hasLineBreak: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'StatusCode',
                    Placement: 1,
                    Hidden: true,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Status',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: true,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'taxdrawfactor',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skattetrekk',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Classes: 'payrollDetails_taxdrawfactor',
                    Legend: '',
                    Options: {
                        source: [
                            { Indx: TaxDrawFactor.Standard, Name: 'Full skatt' },
                            { Indx: TaxDrawFactor.Half, Name: 'Halv skatt' },
                            { Indx: TaxDrawFactor.None, Name: 'Ikke skatt' }],
                        displayProperty: 'Name',
                        valueProperty: 'Indx'
                    }
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: '',
                    Placement: 3,
                    Hidden: true,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Behandling av fastlønn i feriemåned',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
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
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: '_IncludeRecurringPosts',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX, // FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Inkluder faste poster/trekk',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Classes: 'payrollDetails_excludeRecurringPosts',
                    Legend: '',

                    hasLineBreak: false,
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
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'HolidayPayDeduction',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX, // FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Trekk i fastlønn for ferie',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Classes: 'payrollDetails_holidayPayDeduction',
                    Legend: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: '1',
                    Placement: 4,
                    Hidden: true,
                    FieldType: FieldType.CHECKBOX, // FieldType.CHECKBOX,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Ansatte med negativ lønn utelates',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
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
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'FromDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fra dato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Legend: 'Datoer og fritekst',
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Classes: 'payrollDetails_fromDate',
                    hasLineBreak: false,
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
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'ToDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Til dato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Classes: 'payrollDetails_toDate',
                    Legend: '',
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
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'PayDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utbetalingsdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Classes: 'payrollDetails_payDate',
                    Legend: '',
                    hasLineBreak: false,
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
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: 'FreeText',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXTAREA,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fritekst til lønnslipp',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: true,
                    Combo: null,
                    Classes: 'payrollDetails_freeText',
                    Legend: ''
                },
            ]
        }]);
    }
}
