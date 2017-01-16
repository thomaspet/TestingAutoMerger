import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun, FieldType, VacationPayInfo, TaxDrawFactor} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../common/ErrorService';

@Injectable()
export class PayrollrunService extends BizHttp<PayrollRun> {
    
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
    
    constructor(http: UniHttp, private errorService: ErrorService) {
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
        return super.GetAll(`filter=ID gt 0&top=1&orderBy=ID DESC`).map(resultSet => resultSet[0]);
    }

    public getYear(): number {
        let financialYear = JSON.parse(localStorage.getItem('activeFinancialYear'));
        return financialYear && financialYear.Year ? financialYear.Year : undefined;
    }

    public runSettling(ID: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=calculate')
            .send()
            .map(response => response.json());
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
            .send({action: 'paymentlist'})
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
    
    public postTransactions(ID: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=book')
            .send()
            .map(response => response.json());
    }

    public getVacationpayBasis(year: number, payrun: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + payrun + '?action=vacationpay-list&year=' + year)
            .send()
            .map(response => response.json());
    }

    public createVacationPay(year: number, payrun: number, payList: VacationPayInfo[]) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + payrun + '?action=vacationpay-from-vacationpayinfo-list&year=' + year)
            .withBody(payList)
            .send();
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
                    Label: 'Nr',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: 'La stå tom for neste ledige',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'DETALJER',
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
                    Property: 'Description',
                    Placement: 0,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Beskrivelse',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
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
                    FieldSet: 0,
                    Section: 1,
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
                    Property: 'PayDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utbetalingsdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
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
                    Property: 'FromDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fra dato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
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
                    Property: 'ToDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Til dato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    Property: 'taxdrawfactor',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skattetrekk',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    Options: {
                        source: [
                            {Indx: TaxDrawFactor.Standard, Name: 'Full skatt'}, 
                            {Indx: TaxDrawFactor.Half, Name: 'Halv skatt'},
                            {Indx: TaxDrawFactor.None, Name: 'Ikke skatt'}],
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
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
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
                    Property: 'ExcludeRecurringPosts',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT, // FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fastlønnsposter utelates',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
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
                    FieldType: FieldType.MULTISELECT, // FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Trekk i fastlønn for ferie',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'payrollrun',
                    Property: '1',
                    Placement: 4,
                    Hidden: true,
                    FieldType: FieldType.MULTISELECT, // FieldType.CHECKBOX,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Ansatte med negativ lønn utelates',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    Property: 'FreeText',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXTAREA,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fritekst til lønnslipp',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    Classes: 'half-width'
                },
            ]
        }]);
    }
}
