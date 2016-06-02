import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employment, FieldType} from '../../../unientities';
import { Observable } from 'rxjs/Observable';

export class EmploymentService extends BizHttp<Employment> {
    
    public subEntities: Observable<any>;
    
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Employment.RelativeUrl;
    }
    
    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employment',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'JobName',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Stillingsnavn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'WorkPercent',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Stillingsprosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employment',
                //     Property: 'Standard',
                //     Placement: 4,
                //     Hidden: false,
                //     FieldType: FieldType.CHECKBOX,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Standard',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 0,
                //     Section: 0,
                //     Placeholder: null,
                //     LineBreak: null,
                //     Combo: null,
                //     Sectionheader: '',
                //     IsLookUp: false,
                // },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'StartDate',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Startdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'EndDate',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sluttdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment.SubEntity.BusinessRelationInfo',
                    Property: 'Name',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Virksomhet',
                    Description: null,
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Options: {
                        source: this.subEntities, 
                        valueProperty: 'BusinessRelationInfo.ID',
                        displayProperty: 'BusinessRelationInfo.Name'
                    },
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'MonthRate',
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Månedslønn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'HourRate',
                    Placement: 9,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Timelønn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Sectionheader: '',
                    Placeholder: '',
                    Options: null,
                    LineBreak: null,
                    IsLookUp: false,
                },
                
            ]
        }]);
    }
    
    public layoutSection(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employment',
            Fields: [
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employment',
                //     Property: 'TypeOfEmployment',
                //     Placement: 3,
                //     Hidden: false,
                //     FieldType: FieldType.COMBOBOX,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Arbeidsforhold',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 0,
                //     Section: 1,
                //     Placeholder: null,
                //     Options: {
                //         source: this.typeofEmployment, 
                //         valueProperty: 'ID',
                //         displayProperty: 'Name'
                //     },
                //     LineBreak: null,
                //     Combo: null,
                //     Sectionheader: 'A-meldingsinformasjon',
                //     IsLookUp: false,
                //     hasLineBreak: true,
                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employment',
                //     Property: 'RenumerationType',
                //     Placement: 4,
                //     Hidden: false,
                //     FieldType: FieldType.COMBOBOX,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Avlønningstype',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 0,
                //     Section: 1,
                //     Placeholder: null,
                //     Options: {
                //         source: this.renumertaionType, 
                //         valueProperty: 'ID',
                //         displayProperty: 'Name'
                //     },
                //     LineBreak: null,
                //     Combo: null,
                //     Sectionheader: '',
                //     IsLookUp: false,
                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employment',
                //     Property: 'WorkingHoursScheme',
                //     Placement: 5,
                //     Hidden: false,
                //     FieldType: FieldType.COMBOBOX,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Arbeidstid',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 0,
                //     Section: 1,
                //     Placeholder: null,
                //     Options: {
                //         source: this.workingHoursScheme, 
                //         valueProperty: 'ID',
                //         displayProperty: 'Name'
                //     },
                //     LineBreak: null,
                //     Combo: null,
                //     Sectionheader: '',
                //     IsLookUp: false,
                //     hasLineBreak: true,
                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'HoursPerWeek',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Timer pr uke',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    /*Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]*/
                },
                {
                    ComponentLayoutID: 1,
                     
                    EntityType: 'Employment',
                    Property: 'SeniorityDate',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Ansiennitet',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'LastSalaryChangeDate',
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Lønnsjustering',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    /*Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]*/
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'LastWorkPercentChangeDate',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sist endret %',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    openByDefault: true,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'UserDefinedRate',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fri sats',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'LedgerAccount',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedbokskonto',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                }
            ]
        }]);
    }
}
