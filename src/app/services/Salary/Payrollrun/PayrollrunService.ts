import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun, FieldType} from '../../../unientities';
import { Observable } from 'rxjs/Observable';

export class PayrollrunService extends BizHttp<PayrollRun> {
    
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PayrollRun.relativeUrl;
    }
    
    public layout(layoutID: string) {
        return Observable.fromArray([{
            Name: layoutID,
            BaseEntity: 'Payrollrun',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Payrollrun',
                    Property: 'Description',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Nr ',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
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
                    Property: 'Description',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Status',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
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
                    Section: 0,
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
                    Label: 'Datointervall lønnsposter',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
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
                    Label: 'Ta med lønnsposter frem til',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
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
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Valg for skattetrekk',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
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
                    FieldType: FieldType.COMBOBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Behandling av fastlønn i feriemåned',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
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
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fastlønnsposter utelates',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
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
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Ansatte med negativ lønn utelates',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
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
                    Section: 0,
                    Legend: ''
                },
            ]
        }]);
    }
}
