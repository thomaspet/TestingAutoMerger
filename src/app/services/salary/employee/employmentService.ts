import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import {
    Employment, TypeOfEmployment, RemunerationType,
    WorkingHoursScheme, Department, Project
} from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import {FieldType} from '../../../../framework/ui/uniform/index';

@Injectable()
export class EmploymentService extends BizHttp<Employment> {

    public subEntities: any[];

    private typeOfEmployment: { ID: number, Name: string }[] = [
        { ID: 0, Name: 'Ikke valgt' },
        { ID: TypeOfEmployment.OrdinaryEmployment, Name: '1 - Ordinært arbeidsforhold' },
        { ID: TypeOfEmployment.MaritimeEmployment, Name: '2 - Maritimt arbeidsforhold' },
        { ID: TypeOfEmployment.FrilancerContratorFeeRecipient, Name: '3 - Frilanser, oppdragstager, honorar' },
        { ID: TypeOfEmployment.PensionOrOtherNonEmployedBenefits, Name: '4 - Pensjon og annet uten ansettelse' }
    ];

    private remunerationType: { ID: number, Name: string }[] = [
        { ID: 0, Name: 'Ikke valgt' },
        { ID: RemunerationType.FixedSalary, Name: '1 - Fast lønnet' },
        { ID: RemunerationType.HourlyPaid, Name: '2 - Timelønnet' },
        { ID: RemunerationType.PaidOnCommission, Name: '3 - Provisjonslønnet' },
        { ID: RemunerationType.OnAgreement_Honorar, Name: '4 - Honorar' },
        { ID: RemunerationType.ByPerformance, Name: '5 - Akkord' }
    ];

    private workingHoursScheme: { ID: number, Name: string }[] = [
        { ID: 0, Name: 'Ikke valgt' },
        { ID: WorkingHoursScheme.NonShift, Name: '1 - Ikke skiftarbeid' },
        { ID: WorkingHoursScheme.OffshoreWork, Name: '2 - Arbeid offshore' },
        { ID: WorkingHoursScheme.ContinousShiftwork336, Name: '3 - Helkontinuerlig skiftarbeid' },
        { ID: WorkingHoursScheme.DayAndNightContinous355, Name: '4 - Døgnkontinuerlig skiftarbeid' },
        { ID: WorkingHoursScheme.ShiftWork, Name: '5 - skiftarbeid' }
    ];

    // private shipType: {ID: number, Name: string}[] = [
    //     {ID: 0, Name: 'Udefinert'},
    //     {ID: 1, Name: '1 - Annet'},
    //     {ID: 2, Name: '2 - Boreplattform'},
    //     {ID: 3, Name: '3 - Turist'}
    // ];

    // private shipReg: {ID: number, Name: string}[] = [
    //     {ID: 0, Name: 'Udefinert'},
    //     {ID: 1, Name: '1 - Norsk Internasjonalt skipsregister'},
    //     {ID: 2, Name: '2 - Norsk ordinært skipsregister'},
    //     {ID: 3, Name: '3 - Utenlandsk skipsregister'}
    // ];

    // private tradeArea: {ID: number, Name: string}[] = [
    //     {ID: 0, Name: 'Udefinert'},
    //     {ID: 1, Name: '1 - Innenriks'},
    //     {ID: 2, Name: '2 - Utenriks'}
    // ];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Employment.RelativeUrl;
        this.entityType = Employment.EntityType;
    }

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employment',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'JobCode',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Stillingskode',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Legend: 'Stillingsinformasjon',
                    Section: 0,
                    Placeholder: 'Stillingskode',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                },
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
                    FieldSet: 1,
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
                    FieldSet: 1,
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
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'StartDate',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Startdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
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
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sluttdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
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
                    Property: 'SubEntityID',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Virksomhet',
                    Description: null,
                    HelpText: '',
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Options: null
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'Standard',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Standard',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
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
                    Property: 'TypeOfEmployment',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Arbeidsforhold',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Legend: 'A-meldingsinformasjon',
                    Placeholder: null,
                    Options: {
                        source: this.typeOfEmployment,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: null,
                    IsLookUp: false,
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'RemunerationType',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Avlønningstype',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        source: this.remunerationType,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'WorkingHoursScheme',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Arbeidstid',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        source: this.workingHoursScheme,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'HoursPerWeek',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Timer pr uke full stilling',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        decimalLength: 1
                    },
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
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Ansiennitet',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
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
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Lønnsjustering',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
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
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sist endret %',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
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
                    Property: 'MonthRate',
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Månedslønn',
                    Legend: 'Ytelser',
                    Description: null,
                    HelpText: null,
                    FieldSet: 3,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'money'
                    },
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
                    FieldSet: 3,
                    Section: 0,
                    Sectionheader: '',
                    Placeholder: '',
                    Options: {
                        format: 'money'
                    },
                    LineBreak: null,
                    IsLookUp: false,
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
                    FieldSet: 3,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'money'
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'LedgerAccount',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedbokskonto',
                    Description: null,
                    HelpText: null,
                    FieldSet: 3,
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
                    Property: 'Dimensions.ProjectID',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Prosjekt',
                    Description: null,
                    HelpText: null,
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        valueProperty: 'ID',
                        template: (project: Project) => project ? `${project.ProjectNumber} - ${project.Name}` : ''
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'Dimensions.DepartmentID',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Avdeling',
                    Description: null,
                    HelpText: null,
                    FieldSet: 4,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        valueProperty: 'ID',
                        template: (department: Department) => department
                            ? `${department.DepartmentNumber} - ${department.Name}`
                            : ''
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                }
            ]
        }]);
    }
}
