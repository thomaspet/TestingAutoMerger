import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employment, FieldType, TypeOfEmployment, RenumerationType, WorkingHoursScheme} from '../../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class EmploymentService extends BizHttp<Employment> {

    public subEntities: any[];

    private typeOfEmployment: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Ikke valgt'},
        {ID: TypeOfEmployment.OrdinaryEmployment, Name: '1 - Ordinært arbeidsforhold'},
        {ID: TypeOfEmployment.MaritimeEmployment, Name: '2 - Maritimt arbeidsforhold'},
        {ID: TypeOfEmployment.FrilancerContratorFeeRecipient, Name: '3 - Frilanser, oppdragstager, honorar'},
        {ID: TypeOfEmployment.PensionOrOtherNonEmployedBenefits, Name: '4 - Pensjon og annet uten ansettelse'}
    ];

    private renumerationType: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Ikke valgt'},
        {ID: RenumerationType.Salaried, Name: '1 - Fast lønnet'},
        {ID: RenumerationType.HourlyPaid, Name: '2 - Timelønnet'},
        {ID: RenumerationType.PaidOnCommission, Name: '3 - Provisjonslønnet'},
        {ID: RenumerationType.Fees, Name: '4 - Honorar'},
        {ID: RenumerationType.Piecework, Name: '5 - Akkord'}
    ];

    private workingHoursScheme: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Ikke valgt'},
        {ID: WorkingHoursScheme.NonShift, Name: '1 - Ikke skiftarbeid'},
        {ID: WorkingHoursScheme.OffshoreWork, Name: '2 - Arbeid offshore'},
        {ID: WorkingHoursScheme.SemiContinousShiftAndRotaWork, Name: '3 - Helkontinuerlig skiftarbeid'},
        {ID: WorkingHoursScheme.ContinuousShiftAndOtherSchemes, Name: '4 - Døgnkontinuerlig skiftarbeid'},
        {ID: WorkingHoursScheme.ShiftWork, Name: '5 - skiftarbeid'}
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
                    FieldSet: 0,
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
                {
                     ComponentLayoutID: 1,
                     EntityType: 'Employment',
                     Property: 'Standard',
                     Placement: 4,
                     Hidden: false,
                     FieldType: 5,
                     ReadOnly: false,
                     LookupField: false,
                     Label: 'Standard',
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
                    EntityType: 'Employment',
                    Property: 'SubEntityID',
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
                        valueProperty: 'ID',
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
                    Property: 'TypeOfEmployment',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Arbeidsforhold',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: {
                        source: this.typeOfEmployment,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'A-meldingsinformasjon',
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
                    Property: 'RenumerationType',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Avlønningstype',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: {
                        source: this.renumerationType,
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
                    FieldSet: 0,
                    Section: 1,
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
                    Label: 'Timer pr uke',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: {
                        decimals: 1
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'A-meldingsinformasjon',
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
                }
            ]
        }]);
    }
}
