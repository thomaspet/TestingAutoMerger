import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {
    Employment, TypeOfEmployment, RemunerationType,
    WorkingHoursScheme, Department, Project
} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';

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
        { ID: RemunerationType.FixedSalary , Name: '1 - Fast lønnet' },
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

    public getStandardEmployment(empID: number): Observable<Employment> {
        return super.GetAll(`filter=Standard eq 'true' and EmployeeID eq ${empID}&top=1`)
            .map(result => result[0]);

    }

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employment',
            Fields: [
                {
                    EntityType: 'Employment',
                    Property: 'JobCode',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Stillingskode',
                    FieldSet: 1,
                    Legend: 'Stillingsinformasjon',
                    Section: 0,
                    Placeholder: 'Stillingskode',
                    Validations: [
                        (value: number, field: UniFieldLayout) => {
                            if (!!value) {
                                return;
                            }

                            return {
                                field: field,
                                value: value,
                                errorMessage: 'Stillingskode er påkrevd',
                                isWarning: false
                            };
                        }
                    ]
                },
                {
                    EntityType: 'Employment',
                    Property: 'JobName',
                    FieldType: FieldType.TEXT,
                    Label: 'Stillingsnavn',
                    FieldSet: 1,
                    Section: 0,
                    Validations: [
                        (value: number, field: UniFieldLayout) => {
                            if (!!value) {
                                return;
                            }

                            return {
                                field: field,
                                value: value,
                                errorMessage: 'Stillingsnavn er påkrevd',
                                isWarning: false
                            };
                        }
                    ]
                },
                {
                    EntityType: 'Employment',
                    Property: 'WorkPercent',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Stillingsprosent',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'StartDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Startdato',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'EndDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Sluttdato',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'SubEntityID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Virksomhet',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'Standard',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Standard',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'TypeOfEmployment',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Arbeidsforhold',
                    FieldSet: 2,
                    Section: 0,
                    Legend: 'A-meldingsinformasjon',
                    Options: {
                        source: this.typeOfEmployment,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    hasLineBreak: true
                },
                {
                    EntityType: 'Employment',
                    Property: 'RemunerationType',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Avlønningstype',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        source: this.remunerationType,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    }
                },
                {
                    EntityType: 'Employment',
                    Property: 'WorkingHoursScheme',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Arbeidstid',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        source: this.workingHoursScheme,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    hasLineBreak: true
                },
                {
                    EntityType: 'Employment',
                    Property: 'HoursPerWeek',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Timer pr uke full stilling',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        decimalLength: 1
                    }
                },
                {
                    EntityType: 'Employment',
                    Property: 'SeniorityDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Ansiennitet',
                    FieldSet: 2,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'LastSalaryChangeDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Lønnsjustering',
                    FieldSet: 2,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'LastWorkPercentChangeDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Sist endret %',
                    FieldSet: 2,
                    Section: 0,
                    openByDefault: true
                },
                {
                    EntityType: 'Employment',
                    Property: 'MonthRate',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Månedslønn',
                    Legend: 'Ytelser',
                    FieldSet: 3,
                    Section: 0,
                    Options: {
                        format: 'money'
                    }
                },
                {
                    EntityType: 'Employment',
                    Property: 'HourRate',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Timelønn',
                    FieldSet: 3,
                    Section: 0,
                    Options: {
                        format: 'money'
                    }
                },
                {
                    EntityType: 'Employment',
                    Property: 'UserDefinedRate',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Fri sats',
                    FieldSet: 3,
                    Section: 0,
                    Options: {
                        format: 'money'
                    }
                },
                {
                    EntityType: 'Employment',
                    Property: 'LedgerAccount',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Hovedbokskonto',
                    FieldSet: 3,
                    Section: 0
                },
                {
                    EntityType: 'Employment',
                    Property: 'Dimensions.ProjectID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Prosjekt',
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    Section: 0,
                    Options: {
                        valueProperty: 'ID',
                        template: (project: Project) => project ? `${project.ProjectNumber} - ${project.Name}` : ''
                    }
                },
                {
                    EntityType: 'Employment',
                    Property: 'Dimensions.DepartmentID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Avdeling',
                    FieldSet: 4,
                    Section: 0,
                    Options: {
                        valueProperty: 'ID',
                        template: (department: Department) => department
                            ? `${department.DepartmentNumber} - ${department.Name}`
                            : ''
                    }
                }
            ]
        }]);
    }
}
