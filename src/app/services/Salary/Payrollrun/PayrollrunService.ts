import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun, FieldType} from '../../../unientities';
import { Observable } from 'rxjs/Observable';

export class PayrollrunService extends BizHttp<PayrollRun> {
    
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PayrollRun.relativeUrl;
    }
    
    public getPrevious(ID: number) {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=previous&RunID=' + ID)
            .send();
    }
    
    public getNext(ID: number) {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=next&RunID=' + ID)
            .send();
    }
    
    public runSettling(ID: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=calculate')
            .send();
    }
    
    public resetSettling(ID: number) {
        return this.http
        .asDELETE()
        .usingBusinessDomain()
        .withEndPoint(this.relativeURL + '/' + ID + '?action=resetrun')
        .send();
    }
    
    public getPaymentList(ID: number) {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '/' + ID)
            .send({action: 'paymentlist'});
    }
    
    public layout(layoutID: string) {
        return Observable.fromArray([{
            Name: layoutID,
            BaseEntity: 'Payrollrun',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Payrollrun',
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
                    Legend: 'Detaljer',
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
                    EntityType: 'Payrollrun',
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
                    EntityType: 'Payrollrun',
                    Property: 'StatusCode',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Status',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    hasLineBreak: true,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Payrollrun',
                    Property: 'PayDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utbetalingsdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    EntityType: 'Payrollrun',
                    Property: 'FromDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fra dato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    EntityType: 'Payrollrun',
                    Property: 'ToDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Til dato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    EntityType: 'Payrollrun',
                    Property: '',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Valg for skattetrekk',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    kendoOptions: {
                        dataSource: [
                            {Indx: 0, Name: 'Ordinært skattetrekk'}, 
                            {Indx: 1, Name: 'Halv skatt'},
                            {Indx: 2, Name: 'Ingen skattetrekk'}],
                        dataTextField: 'Name',
                        dataValueField: 'Indx'
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
                    EntityType: 'Payrollrun',
                    Property: '',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Behandling av fastlønn i feriemåned',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    hasLineBreak: true,
                    kendoOptions: {
                        dataSource: [
                            {Indx: 0, Name: 'Vanlig'}, 
                            {Indx: 1, Name: 'Ferielønn (+1/26)'},
                            {Indx: 2, Name: 'Ferielønn (-1/26)'},
                            {Indx: 1, Name: 'Ferielønn (-4/26)'},
                            {Indx: 2, Name: 'Ferielønn (-3/22)'}],
                        dataTextField: 'Name',
                        dataValueField: 'Indx'
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
                    EntityType: 'Payrollrun',
                    Property: 'Description',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fastlønnsposter utelates',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    EntityType: 'Payrollrun',
                    Property: '1',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Ansatte med negativ lønn utelates',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    EntityType: 'Payrollrun',
                    Property: 'Description',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fritekst til lønnslipp',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: ''
                },
            ]
        }]);
    }
}
