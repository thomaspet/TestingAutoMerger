import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {
    Employment, TypeOfEmployment, RemunerationType,
    WorkingHoursScheme, Department, Project, CompanySalary,
    ShipTypeOfShip, ShipRegistry, ShipTradeArea, SubEntity,
    RegulativeGroup, RegulativeStep, Regulative, EmploymentHistoryRecord
} from '@uni-entities';
import {Observable, ReplaySubject, forkJoin, of} from 'rxjs';
import {FieldType, UniFieldLayout, UniFormError, UniField} from '../../../../framework/ui/uniform/index';
import {CompanySalaryService} from '../companySalary/companySalaryService';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { SubEntityService } from '@app/services/common/subEntityService';
import { map, tap, take, switchMap } from 'rxjs/operators';

@Injectable()
export class EmploymentService extends BizHttp<Employment> {

    private allSubEntities$: ReplaySubject<SubEntity[]> = new ReplaySubject(1);
    private availableSubEntities$: ReplaySubject<SubEntity[]> = new ReplaySubject(1);
    private projects$: ReplaySubject<Project[]> = new ReplaySubject(1);
    private departments$: ReplaySubject<Department[]> = new ReplaySubject(1);
    private employment$: ReplaySubject<Employment> = new ReplaySubject(1);
    private regulativeGroups$: ReplaySubject<RegulativeGroup[]> = new ReplaySubject(1);

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
        private statisticsService: StatisticsService,
        private subEntityService: SubEntityService,
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
        this.availableSubEntities$ = new ReplaySubject(1);
        this.allSubEntities$ = new ReplaySubject(1);
        this.departments$ = new ReplaySubject(1);
        this.projects$ = new ReplaySubject(1);
        this.employment$ = new ReplaySubject(1);
    }

    public getAllAndCacheSubEntities(expand: string[]): Observable<SubEntity[]> {
        return this.subEntityService
            .GetAll(null, expand)
            .pipe(
                tap(subEntities => this.allSubEntities$.next(subEntities)),
                map((subEntities: SubEntity[]) => subEntities.length > 1
                        ? subEntities.filter(x => x.SuperiorOrganizationID > 0)
                        : subEntities),
                tap(subEntities => this.availableSubEntities$.next(subEntities))
            );
    }

    public setDepartments(departments: Department[]) {
        this.departments$.next(departments);
    }

    public setProjects(projects: Project[]) {
        this.projects$.next(projects);
    }

    public setRegulativeGroups(regulativeGroups: RegulativeGroup[]) {
        this.regulativeGroups$.next(regulativeGroups);
    }

    public clearRegulativeCache(): void {
        this.regulativeGroups$.complete();
        this.regulativeGroups$ = new ReplaySubject(1);
    }

    public getRegulativeStepsOnEmployment(): Observable<RegulativeStep[]> {
        return this.regulativeGroups$
            .pipe(
                take(1),
                switchMap(groups => this.getStepsOnEmployment(groups))
            );
    }

    private getStepsOnEmployment(regulativeGroups: RegulativeGroup[]): Observable<RegulativeStep[]> {
        return this.employment$
            .pipe(
                take(1),
                map((employment) => {
                    if (!employment.RegulativeGroupID || !regulativeGroups.length) {
                        return [];
                    }
                    const regulatives =  regulativeGroups
                        .filter(g => g.ID === employment.RegulativeGroupID)
                        .reduce((acc: Regulative[], curr: RegulativeGroup) => [...acc, ...curr.Regulatives], [])
                        .sort((regA: Regulative, regB: Regulative) => {
                                const checkDate = regA.StartDate === regB.StartDate ? 'CreatedAt' :  'StartDate';
                                return regA[checkDate] > regB[checkDate] ? -1 : 1;
                        });
                    return regulatives.length ? regulatives[0].Steps : [];
                })
            );
    }

    public updateDefaults(employment: Employment) {
        employment['_yearlyRate'] = employment.MonthRate * 12;
        this.employment$.next(employment);
    }

    public getHistory(employmentID: number): Observable<EmploymentHistoryRecord[]> {
        return super.GetAction(employmentID, 'history');
    }

    public layout(layoutID: string, hasEndDate: boolean) {
        return this.companySalaryService
            .getCompanySalary()
            .pipe(
                switchMap(compSal => forkJoin([
                        this.getStandardFields(compSal, hasEndDate),
                        this.getRegulativeFields(compSal),
                        this.getShipFields(compSal),
                    ])
                ),
                map(fieldLists => fieldLists.reduce((acc, curr) => [...acc, ...curr], []))
            )
            .map(fields => {return {
                Name: layoutID,
                BaseEntity: 'Employment',
                Fields: fields,
            };
        });
    }

    private getStandardFields(compSal: CompanySalary, hasEndDate: boolean): Observable<UniFieldLayout[]> {
        return of(<UniFieldLayout[]>[
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
            (hasEndDate) ?
            {
                EntityType: 'Employment',
                Property: 'EndDateReason',
                FieldType: FieldType.DROPDOWN,
                Label: 'Årsak til sluttdato',
                FieldSet: 1,
                Section: 0,
                Options: {
                    source: [
                        { ID: 0, Name: 'Ikke valgt' },
                        { ID: 1, Name: 'Arbeidsforholdet skulle aldri vært rapportert' },
                        { ID: 2, Name: 'Arbeidsgiver har sagt opp arbeidstaker' },
                        { ID: 3, Name: 'Arbeidstaker har sagt opp selv' },
                        { ID: 4, Name: 'Byttet lønnsystem eller regnskapsfører' },
                        { ID: 5, Name: 'Endring i organisasjonsstruktur eller byttet jobb internt' },
                        { ID: 6, Name: 'Kontrakt, engasjement eller vikariat er utløpt' },
                    ],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                },
                hasLineBreak: true

            } : {},
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
                        .switchMap(model => Observable.forkJoin(Observable.of(model), this.allSubEntities$.take(1)))
                        .map((result: [Employment, SubEntity[]]) => result[1].filter(x => x.ID === result[0].SubEntityID)),
                    search: (query: string) => this.availableSubEntities$
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
                Property: 'EmploymentType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Ansettelsesform',
                FieldSet: 2,
                Section: 0,
                Options: {
                    source: [
                        { ID: 0, Name: 'Ikke valgt' },
                        { ID: 1, Name: 'Fast' },
                        { ID: 2, Name: 'Midlertidig' },
                    ],
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                },
                hasLineBreak: true
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
                    decimalLength: 2,
                    decimalSeparator: ',',
                    thousandSeparator: ' ',
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
                    decimalLength: 2,
                    decimalSeparator: ',',
                    thousandSeparator: ' '
                }
            },
            {
                EntityType: 'Employment',
                Property: '_yearlyRate',
                FieldType: FieldType.NUMERIC,
                Label: 'Årslønn',
                FieldSet: 3,
                Section: 0,
                ReadOnly: true,
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ',',
                    thousandSeparator: ' ',
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
            }]);
    }

    private getRegulativeFields(compSal: CompanySalary): Observable<UniFieldLayout[]> {
        return this.regulativeGroups$
            .pipe(
                take(1),
                map(res => {
                    if (!res || !res.length) {
                        return [];
                    }

                    return <UniFieldLayout[]>[
                        {
                            EntityType: 'Employment',
                            Property: 'RegulativeGroupID',
                            FieldType: FieldType.AUTOCOMPLETE,
                            Label: 'Regulativnavn',
                            FieldSet: 5,
                            Legend: 'Regulativ',
                            Section: 0,
                            Classes: !compSal.Base_SpesialDeductionForMaritim ? 'less-than-half' : '',
                            Options: {
                                valueProperty: 'ID',
                                template: (regulativeGroup: RegulativeGroup) => regulativeGroup ? `${regulativeGroup.ID} - ${regulativeGroup.Name}` : '',
                                getDefaultData: () => this.employment$
                                    .switchMap(model => Observable.forkJoin(Observable.of(model), this.regulativeGroups$.take(1)))
                                    .map((result: [Employment, RegulativeGroup[]]) =>
                                        result[1].filter(reg => reg.ID === result[0].RegulativeGroupID)),
                                search: (query: string) => this.regulativeGroups$
                                    .map(
                                        regulativeGroup => regulativeGroup.filter(reg =>
                                            reg.Name.toLowerCase().includes(query.toLowerCase()) ||
                                            reg.ID.toString().startsWith(query)
                                        )
                                    )
                            },
                        },
                        {
                            EntityType: 'Employment',
                            Property: 'RegulativeStepNr',
                            FieldType: FieldType.AUTOCOMPLETE,
                            Label: 'Lønnstrinn',
                            FieldSet: 5,
                            Section: 0,
                            Classes: !compSal.Base_SpesialDeductionForMaritim ? 'less-than-half' : '',
                            Options: {
                                valueProperty: 'Step',
                                template: (step: RegulativeStep) => step
                                    ? `${step.Step}`
                                    : '',
                                getDefaultData: () => this.employment$
                                    .switchMap(model => Observable.forkJoin(Observable.of(model), this.getRegulativeStepsOnEmployment()))
                                    .map((result: [Employment, RegulativeStep[]]) =>
                                        result[1].filter(reg => reg.Step === result[0].RegulativeStepNr)),
                                search: (query: string) => this.getRegulativeStepsOnEmployment()
                                    .map(steps => steps.filter(step => step.Step.toString().startsWith(query)))
                            }
                        },
                        {
                            Property: '_History',
                            Label: 'Historikk',
                            FieldSet: 5,
                            Section: 0,
                            FieldType: FieldType.BUTTON,
                        }
                    ];
                }),
            );
    }

    private getShipFields(compSal: CompanySalary): Observable<UniFieldLayout[]> {
        if (!compSal.Base_SpesialDeductionForMaritim) {
            return of([]);
        }
        return of(<UniFieldLayout[]>[
            {
                EntityType: 'Employment',
                Property: 'ShipReg',
                FieldType: FieldType.DROPDOWN,
                Label: 'SkipsRegister',
                Legend: 'Fartøysopplysninger',
                FieldSet: 6,
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
                FieldSet: 6,
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
                FieldSet: 6,
                Section: 0,
                Options: {
                    source: this.tradeArea,
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                },
            },
        ]);
    }

    public searchEmployments(query: string, employeeID?: number): Observable<{ID: number, JobName: string}[]> {
        let statisticsQuery = `startswith(ID,'${query}') or contains(JobName,'${query}')`;
        if (employeeID) {
            statisticsQuery = `EmployeeID eq ${employeeID} and ( ${statisticsQuery} )`;
        }
        return this.statisticsService.GetAllUnwrapped(`select=ID as ID,JobName as JobName&filter=${statisticsQuery}&model=Employment`);
    }
}
