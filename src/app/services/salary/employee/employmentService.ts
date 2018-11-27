import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {
    Employment, TypeOfEmployment, RemunerationType,
    WorkingHoursScheme, Department, Project, Company, CompanySalary,
    ShipTypeOfShip, ShipRegistry, ShipTradeArea, SubEntity,
} from '../../../unientities';
import {Observable, ReplaySubject} from 'rxjs';
import {FieldType, UniFieldLayout, UniFormError} from '../../../../framework/ui/uniform/index';
import {CompanySalaryService} from '../companySalary/companySalaryService';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';

@Injectable()
export class EmploymentService extends BizHttp<Employment> {

    private subEntities$: ReplaySubject<SubEntity[]> = new ReplaySubject(1);
    private projects$: ReplaySubject<Project[]> = new ReplaySubject(1);
    private departments$: ReplaySubject<Department[]> = new ReplaySubject(1);
    private employment$: ReplaySubject<Employment> = new ReplaySubject(1);

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

    private shipType: {ID: number, Name: string}[] = [
        {ID: ShipTypeOfShip.notSet, Name: 'Ikke valgt'},
        {ID: ShipTypeOfShip.Other, Name: '1 - Annet'},
        {ID: ShipTypeOfShip.DrillingPlatform, Name: '2 - Boreplattform'},
        {ID: ShipTypeOfShip.Tourist, Name: '3 - Turist'}
    ];

    private shipReg: {ID: number, Name: string}[] = [
        {ID: ShipRegistry.notSet, Name: 'Ikke valgt'},
        {ID: ShipRegistry.NorwegianInternationalShipRegister, Name: '1 - Norsk Internasjonalt skipsregister (NIS)'},
        {ID: ShipRegistry.NorwegianOrdinaryShipRegister, Name: '2 - Norsk ordinært skipsregister (NOR)'},
        {ID: ShipRegistry.ForeignShipRegister, Name: '3 - Utenlandsk skipsregister (UTL)'}
    ];

    private tradeArea: {ID: number, Name: string}[] = [
        {ID: ShipTradeArea.notSet, Name: 'Ikke valgt'},
        {ID: ShipTradeArea.Domestic, Name: '1 - Innenriks'},
        {ID: ShipTradeArea.Foreign, Name: '2 - Utenriks'}
    ];

    constructor(
        protected http: UniHttp,
        private companySalaryService: CompanySalaryService,
        private toastService: ToastService,
        ) {
        super(http);
        this.relativeURL = Employment.RelativeUrl;
        this.entityType = Employment.EntityType;
    }

    public getStandardEmployment(empID: number): Observable<Employment> {
        return super.GetAll(`filter=Standard eq 'true' and EmployeeID eq ${empID}&top=1`)
            .map(result => result[0]);

    }

    private requiredValidation(warn: boolean = false): (value, field: UniFieldLayout) =>  UniFormError {
        return (value: any, field: UniFieldLayout) => {
            if (!!value) {
                return;
            }

            return {
                field: field,
                value: value,
                errorMessage: `${field.Label} ${warn ? 'er påkrevd' : 'mangler'}`,
                isWarning: warn,
            };
        };
    }

    public checkTypeOfEmployment(typeOfEmployment: TypeOfEmployment) {
        if (typeOfEmployment !== TypeOfEmployment.MaritimeEmployment) {
            return;
        }
        this.companySalaryService
            .getCompanySalary()
            .filter(compSal => !compSal.Base_SpesialDeductionForMaritim)
            .subscribe(() => this.toastService
                .addToast(
                        'Advarsel',
                        ToastType.warn,
                        ToastTime.long,
                        'Firmaet må settes opp med skatte- og avgiftsregelen "Særskilt fradrag for sjøfolk"'
                        + ' for å kunne sette opp arbeidsforholdet korrekt'));
    }
    public clearCache() {
        this.subEntities$ = new ReplaySubject(1);
        this.departments$ = new ReplaySubject(1);
        this.projects$ = new ReplaySubject(1);
        this.employment$ = new ReplaySubject(1);
    }

    public setSubEntities(subEntities: SubEntity[]) {
        this.subEntities$.next(subEntities);
    }

    public setDepartments(departments: Department[]) {
        this.departments$.next(departments);
    }
    public setProjects(projects: Project[]) {
        this.projects$.next(projects);
    }

    public updateDefaults(employment: Employment) {
        this.employment$.next(employment);
    }

    public layout(layoutID: string) {
        return this.companySalaryService
            .getCompanySalary()
            .map(compSal => {return {
                Name: layoutID,
                BaseEntity: 'Employment',
                Fields: [
                    {
                        EntityType: 'Employment',
                        Property: 'JobCode',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Yrkeskode',
                        FieldSet: 1,
                        Legend: 'Arbeidsforhold',
                        Section: 0,
                        Placeholder: 'Yrkeskode',
                        Validations: [this.requiredValidation()]
                    },
                    {
                        EntityType: 'Employment',
                        Property: 'JobName',
                        FieldType: FieldType.TEXT,
                        Label: 'Yrkestittel',
                        FieldSet: 1,
                        Section: 0,
                        Validations: [this.requiredValidation()]
                    },
                    {
                        EntityType: 'Employment',
                        Property: 'WorkPercent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Stillingsprosent',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            decimalLength: 2
                        }
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
                        Section: 0,
                        Options: {
                            valueProperty: 'ID',
                            debounceTime: 200,
                            getDefaultData: () => this.employment$
                                .switchMap(model => Observable.forkJoin(Observable.of(model), this.subEntities$.take(1)))
                                .map((result: [Employment, SubEntity[]]) => result[1].filter(x => x.ID === result[0].SubEntityID)),
                            search: (query: string) => this.subEntities$
                                .map(subs =>
                                    subs.filter(sub =>
                                        sub.BusinessRelationInfo.Name.toLowerCase().includes(query.toLowerCase()) ||
                                        sub.OrgNumber.startsWith(query))),
                            template: (obj: SubEntity) =>
                                obj && obj.BusinessRelationInfo
                                ?
                                obj.BusinessRelationInfo.Name
                                    ? `${obj.OrgNumber} - ${obj.BusinessRelationInfo.Name}`
                                    : `${obj.OrgNumber}`
                                : ''
                        }
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
                            template: (project: Project) => project ? `${project.ProjectNumber} - ${project.Name}` : '',
                            getDefaultData: () => this.employment$
                                .switchMap(model => Observable.forkJoin(Observable.of(model), this.projects$.take(1)))
                                .map((result: [Employment, Project[]]) =>
                                    result[1].filter(p => result[0].Dimensions && p.ID === result[0].Dimensions.ProjectID)),
                            search: (query: string) => this.projects$
                                .map(projects =>
                                    projects.filter(p =>
                                        p.Name.toLowerCase().includes(query.toLowerCase()) ||
                                        p.ProjectNumber.startsWith(query)))
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
                                : '',
                                getDefaultData: () => this.employment$
                                .switchMap(model => Observable.forkJoin(Observable.of(model), this.departments$.take(1)))
                                .map((result: [Employment, Department[]]) =>
                                    result[1].filter(d => result[0].Dimensions && d.ID === result[0].Dimensions.DepartmentID)),
                                search: (query: string) => this.departments$
                                    .map(deps =>
                                        deps.filter(dep =>
                                            dep.Name.toLowerCase().includes(query.toLowerCase()) ||
                                            dep.DepartmentNumber.startsWith(query)))
                        }
                    },
                    ...this.getShipFields(compSal),
                ]
            };
        });
    }

    private getShipFields(compSal: CompanySalary): any[] {
        if (!compSal.Base_SpesialDeductionForMaritim) {
            return [];
        }
        return [
            {
                EntityType: 'Employment',
                Property: 'ShipReg',
                FieldType: FieldType.DROPDOWN,
                Label: 'SkipsRegister',
                Legend: 'Fartøysopplysninger',
                FieldSet: 5,
                Section: 0,
                Options: {
                    source: this.shipReg,
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                },
            },
            {
                EntityType: 'Employment',
                Property: 'ShipType',
                FieldType: FieldType.DROPDOWN,
                Label: 'SkipsType',
                FieldSet: 5,
                Section: 0,
                Options: {
                    source: this.shipType,
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                },
            },
            {
                EntityType: 'Employment',
                Property: 'TradeArea',
                FieldType: FieldType.DROPDOWN,
                Label: 'Fartsområde',
                FieldSet: 5,
                Section: 0,
                Options: {
                    source: this.tradeArea,
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                },
            },
        ];
    }
}
