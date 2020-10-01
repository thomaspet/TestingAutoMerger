import {Injectable} from '@angular/core';
import {BehaviorSubject, of, forkJoin} from 'rxjs';
import {SalaryTransactionService} from '@app/services/salary/salaryTransaction/salaryTransactionService';
import {Observable} from 'rxjs';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { take, switchMap, map, catchError } from 'rxjs/operators';
import { ElsaPurchaseService } from '@app/services/elsa/elsaPurchasesService';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { WageType, LimitType, SpecialTaxAndContributionsRule, CompanySalary, Account } from '@uni-entities';
import { AccountService } from '@app/services/accounting/accountService';
import { CompanySalaryService } from '@app/services/salary/companySalary/companySalaryService';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { ErrorService } from '@app/services/common/errorService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { FinancialYearService } from '@app/services/accounting/financialYearService';

export enum WageTypeBaseOptions {
    VacationPay = 0,
    AGA = 1
}
const WAGETYPE_TRANSLATION_KEY = '_Translation';

@Injectable()
export class WageTypeService extends BizHttp<WageType> {
    private readOnlyProps: string[] = [
        '_baseOptions',
        'Base_Payment',
        'SpecialAgaRule',
        'taxtype',
        'StandardWageTypeFor'
    ];
    private defaultExpands: any = [
        'SupplementaryInformations'
    ];

    private limitTypes: {Type: LimitType, Name: string}[] = [
        {Type: LimitType.None, Name: 'Ingen'},
        {Type: LimitType.Amount, Name: 'Antall'},
        {Type: LimitType.Sum, Name: 'Beløp'}
    ];

    private specialTaxAndContributionsRule: { ID: SpecialTaxAndContributionsRule, Name: string }[] = [
        { ID: SpecialTaxAndContributionsRule.Standard, Name: 'Standard/ingen valgt' },
        { ID: SpecialTaxAndContributionsRule.SpesialDeductionForMaritim, Name: 'Særskilt fradrag for sjøfolk'},
        { ID: SpecialTaxAndContributionsRule.Svalbard, Name: 'Svalbard' },
        { ID: SpecialTaxAndContributionsRule.JanMayenAndBiCountries, Name: 'Jan Mayen og bilandene' },
        { ID: SpecialTaxAndContributionsRule.NettoPayment, Name: 'Netto lønn' },
        { ID: SpecialTaxAndContributionsRule.NettoPaymentForMaritim, Name: 'Nettolønn for sjøfolk' },
        { ID: SpecialTaxAndContributionsRule.PayAsYouEarnTaxOnPensions, Name: 'Kildeskatt for pensjonister' },
        { ID: SpecialTaxAndContributionsRule.TaxFreeOrganization, Name: 'Skattefri organisasjon'}
    ];

    constructor(
        protected http: UniHttp,
        private accountService: AccountService,
        private errorService: ErrorService,
        private salaryTransactionService: SalaryTransactionService,
        private toastService: ToastService,
        private companySalaryService: CompanySalaryService,
        private elsaPurchaseService: ElsaPurchaseService,
        private statisticsService: StatisticsService,
        private yearService: FinancialYearService,
    ) {
        super(http);
        this.relativeURL = WageType.RelativeUrl;
        this.entityType = WageType.EntityType;
    }

    public getLimitTypes() {
        return Observable.of(this.limitTypes);
    }

    public getSubEntities() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('subentities')
            .send()
            .map(response => response.body);
    }

    public getTypes() {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint('wagetypes')
            .send()
            .map(response => response.body);
    }

    public needSync(year = this.yearService.getActiveYear()) {
        return this.statisticsService
            .GetAllUnwrapped(`model=SalaryYear&Select=CurrentYear&filter=CurrentYear eq ${year}&top=1`)
            .pipe(
                map(years => !years?.length),
            );
    }

    public syncWagetypes() {
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withEndPoint(this.relativeURL + '/?action=synchronize')
            .send()
            .map(response => response.body);
    }

    public save(wt: WageType): Observable<WageType> {
        const obs = wt.ID ? super.Put(wt.ID, wt) : super.Post(wt);

        return obs.do(() => this.cleanUpCache());
    }

    private cleanUpCache() {
        this.salaryTransactionService.invalidateCache();
    }

    public getWageType(id: number | string, expand: string[] = null): Observable<any> {
        if (id === 0) {
            if (expand) {
                return this.GetNewEntity(expand);
            }
            return this.GetNewEntity(this.defaultExpands);
        } else {
            if (expand) {
                return this.Get(id, expand);
            }
            return this.Get(id, this.defaultExpands);
        }
    }

    public usedInPayrollrun(ID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=used-in-payrollrun')
            .send()
            .map(response => response.body);
    }

    public manageReadOnlyIfCalculated(fields: any[], readOnly: boolean) {
        return fields.map(field => {
            if (this.readOnlyProps.some(prop => prop === field.Property)) {
                field.ReadOnly = readOnly;
            }
            return field;
        });
    }

    public getOrderByWageTypeNumber(filter: string = '', expands: string[] = null, orderby: string = '') {
        return super.GetAll(`${filter}&orderBy=WageTypeNumber${orderby}`,
            expands ? expands : this.defaultExpands);
    }

    public getPrevious(wageTypeNumber: number, expands: string[] = null) {
        return super.GetAll(`filter=WageTypeNumber lt ${wageTypeNumber}&top=1&orderBy=WageTypeNumber desc`,
            expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getNext(wageTypeNumber: number, expands: string[] = null) {
        return super.GetAll(`filter=WageTypeNumber gt ${wageTypeNumber}&top=1&orderBy=WageTypeNumber`,
            expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getRate(wageTypeID: number, employmentID: number, employeeID: number) {

        employmentID = employmentID ? employmentID : 0;
        employeeID = employeeID ? employeeID : 0;

        if (wageTypeID) {
            return this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint(this.relativeURL
                    + `?action=get-rate&wagetypeID=${wageTypeID}&employmentID=${employmentID}&employeeID=${employeeID}`)
                .send()
                .map(response => response.body);
        } else {
            return Observable.of(0);
        }
    }

    private getAccountSearchOptions(wageType$: BehaviorSubject<WageType>, accountProp: string) {
        return {
            getDefaultData: () => {
                return wageType$
                    .asObservable()
                    .take(1)
                    .switchMap(wt => (wt && wt[accountProp])
                        ? this.accountService.GetAll(`filter=AccountNumber eq ${wt[accountProp]}`)
                        : Observable.of([]));
            },
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            debounceTime: 200,
            search: (query: string) => this.accountService
                .GetAll(`top=50&filter=startswith(AccountNumber, '${query}') or contains(AccountName, '${query}')`)
        };
    }

    public deleteWageType(id: number): Observable<boolean> {
        return super.Remove(id)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public washWageType(wt: WageType): WageType {

        wt.AccountNumber = wt.AccountNumber || 0;
        wt.AccountNumber_balance = wt.AccountNumber_balance || 0;
        wt.Rate = wt.Rate || 0;
        wt.RateFactor = wt.RateFactor || 0;
        wt.Limit_newRate = wt.Limit_newRate || 0;
        wt.Limit_value = wt.Limit_value || 0;
        wt.Limit_WageTypeNumber = wt.Limit_WageTypeNumber || 0;

        return wt;
    }

    public wagetypeMaintainanceNotify(wt: WageType) {
        if (wt.Systemtype != null) {
            this.toastService
                .addToast(`Automatisk vedlikehold`,
                    ToastType.warn, ToastTime.medium,
                    `Dersom du lagrer lønnsarten med disse endringene vil ikke systemleverandør oppdatere lønnsarten lenger.`);
        }
    }

    public layout(layoutID: string, wageType$: BehaviorSubject<WageType>) {
        return this.companySalaryService
            .getCompanySalary()
            .map(compSal => {
                return {
                    Name: layoutID,
                    BaseEntity: 'wagetype',
                    Fields: [
                        {
                            EntityType: 'wagetype',
                            Property: 'WageTypeNumber',
                            FieldType: FieldType.NUMERIC,
                            ReadOnly: true,
                            Label: 'Nr',
                            FieldSet: 1,
                            Legend: 'Lønnsart',
                            Section: 0,
                            Placeholder: 'La stå tom for neste ledige',
                            Options: {
                                format: 'integer'
                            }
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'WageTypeName',
                            FieldType: FieldType.TEXT,
                            Label: 'Navn',
                            FieldSet: 1,
                            Section: 0
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'GetRateFrom',
                            FieldType: FieldType.DROPDOWN,
                            Label: 'Sats hentes fra',
                            Legend: 'Sats',
                            FieldSet: 2,
                            Section: 0,
                            Sectionheader: 'Sats'
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'Rate',
                            FieldType: FieldType.NUMERIC,
                            Label: 'Sats',
                            FieldSet: 2,
                            Section: 0,
                            Options: {
                                format: 'money'
                            }
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'RateFactor',
                            FieldType: FieldType.NUMERIC,
                            Label: 'Utbetalt i prosent av sats',
                            FieldSet: 2,
                            Section: 0,
                            Options: {format: 'percent'},
                            Tooltip: {
                                Type: 'info',
                                Text: 'Forklaring til utfylling: ' +
                                    'Utbetales lønn inklusive 50% tillegg, fyll ut 150 i feltet. Utbetales kun tillegg på 50%, fyll ut 50 i feltet.' +
                                    ' Tomt eller 100% i feltet tolkes som vanlig lønn uten tillegg.'
                            },
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'taxtype',
                            FieldType: FieldType.DROPDOWN,
                            LookupField: 'Name',
                            Label: 'Behandlingsregel skattetrekk',
                            FieldSet: 3,
                            Legend: 'Behandling',
                            Section: 0
                        },
                        {
                            EntityType: 'wagetype',
                            Property: '_baseOptions',
                            FieldType: FieldType.CHECKBOXGROUP,
                            Label: 'Med i grunnlag for: ',
                            FieldSet: 3,
                            Section: 0,
                            Options: {
                                multivalue: true,
                                source: [
                                    {ID: WageTypeBaseOptions.VacationPay, Name: 'Feriepenger'},
                                    {ID: WageTypeBaseOptions.AGA, Name: 'Aga'}
                                ],
                                valueProperty: 'ID',
                                labelProperty: 'Name'
                            }
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'AccountNumber',
                            FieldType: FieldType.AUTOCOMPLETE,
                            Label: 'Hovedbokskonto',
                            Legend: 'Regnskapsinnstillinger',
                            FieldSet: 4,
                            Section: 0,
                            Options: this.getAccountSearchOptions(wageType$, 'AccountNumber')
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'Base_Payment',
                            FieldType: FieldType.CHECKBOX,
                            Label: 'Utbetales',
                            FieldSet: 4,
                            Section: 0
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'AccountNumber_balance',
                            FieldType: FieldType.AUTOCOMPLETE,
                            Label: 'Motkonto kredit',
                            FieldSet: 4,
                            Section: 0,
                            Options: this.getAccountSearchOptions(wageType$, 'AccountNumber_balance')
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'IncomeType',
                            FieldType: FieldType.AUTOCOMPLETE,
                            Label: 'Inntektstype',
                            FieldSet: 1,
                            Section: 2,
                            Sectionheader: 'A-meldingsinformasjon',
                            Legend: 'A-meldingsinformasjon',
                            openByDefault: true,
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'Benefit',
                            FieldType: FieldType.AUTOCOMPLETE,
                            Label: 'Fordel',
                            FieldSet: 1,
                            Section: 2
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'Description',
                            FieldType: FieldType.AUTOCOMPLETE,
                            Label: 'Beskrivelse',
                            FieldSet: 1,
                            Section: 2
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'SpecialTaxAndContributionsRule',
                            FieldType: FieldType.DROPDOWN,
                            Label: 'Skatte- og avgiftsregel',
                            FieldSet: 1,
                            Section: 2,
                            Options: {
                                source: this.getSpecialTaxAndContributionRules(compSal),
                                displayProperty: 'Name',
                                valueProperty: 'ID'
                            },
                            Tooltip: {
                                Type: 'info',
                                Text: 'For å få flere skatte- og avgiftsregler må du aktivere skatte- og ' +
                                    'avgiftsregel på Innstillinger - Lønnsinnstillinger'
                            },
                        },
                        {
                            EntityType: 'wagetype',
                            Property: 'SupplementPackage',
                            FieldType: FieldType.DROPDOWN,
                            Label: 'Tilleggsinformasjon pakke',
                            FieldSet: 1,
                            Section: 2
                        },
                        {
                            Property: '_AMeldingHelp',
                            FieldType: FieldType.HYPERLINK,
                            Label: 'Hjelp',
                            Tooltip: {
                                Type: 'info',
                                Text: 'Hjelp til a-ordningen'
                            },
                            FieldSet: 1,
                            Section: 2,
                            Options: {
                                description: 'Veiledning a-ordningen',
                                target: '_blank'
                            },
                            Combo: 0
                        },
                    ]
                };
            });
    }

    private getSpecialTaxAndContributionRules(companySalary: CompanySalary) {
        return [
                this.specialTaxAndContributionsRule.find(x => x.ID === SpecialTaxAndContributionsRule.Standard),
                ...Object
                .keys(companySalary)
                .filter(key => key.startsWith('Base') && companySalary[key])
                .map(key => key.substring(5))
                .map(key => this.specialTaxAndContributionsRule
                    .find(rule => rule.ID === SpecialTaxAndContributionsRule[key]))
            ];
    }

    public specialSettingsLayout(layoutID: string, wageTypes$: Observable<WageType[]>) {
        return Observable
            .forkJoin(wageTypes$, this.companySalaryService.getCompanySalary())
            .pipe(
                take(1),
                switchMap(response => {
                    const [wagetypes, companySalary] = response;
                    return forkJoin(
                        this.getBaseSpecialSettingsFields(wagetypes),
                        this.getShipFields(companySalary),
                        this.getMacroFields(),
                        this.getLanguageFields(),
                    );
                }),
                map(fieldLists => fieldLists.reduce((acc, curr) => [...acc, ...curr], [])),
                map(fields => {
                    return {
                        Name: layoutID,
                        BaseEntity: 'wagetype',
                        Fields: fields
                    };
                })
            );
    }

    private getBaseSpecialSettingsFields(wagetypes: WageType[]): Observable<UniFieldLayout[]> {
        return of(<UniFieldLayout[]>
            [
                {
                    EntityType: 'wagetype',
                    Property: 'FixedSalaryHolidayDeduction',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Trekk i fastlønn for ferie',
                    Tooltip: {
                        Text: `Kryss av dersom du ønsker trekk (negativ post)
                        på lønnsarten når du har krysset av for 'Trekk i fastlønn for ferie' på lønnsavregningen.`,
                    },
                    FieldSet: 1,
                    Legend: 'Innstillinger',
                    Section: 0
                },
                {
                    EntityType: 'wagetype',
                    Property: 'HideFromPaycheck',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Skjul på lønnslipp',
                    Tooltip: {
                        Text: 'Skjul lønnsarten på lønnsslipp. Bare mulig for lønnsarter som ikke fører til en utbetaling.',
                    },
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'wagetype',
                    Property: 'StandardWageTypeFor',
                    FieldType: FieldType.DROPDOWN,
                    LookupField: 'Name',
                    Tooltip: {
                        Text: `Lønnsarter som brukes til spesielle ting, for eksempel skatt,
                        ferie og lignende må settes opp med korrekt type her.`,
                    },
                    Label: 'Systemets lønnsart',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'wagetype',
                    Property: 'SpecialAgaRule',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Type lønnsart',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'wagetype',
                    Property: 'Systemtype',
                    FieldType: FieldType.TEXT,
                    Label: 'Standard lønnsart',
                    Tooltip: {
                        Text: `Kobling mot standard lønnsartregister for automatisk vedlikehold av lønnsarten.`,
                    },
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'wagetype',
                    Property: 'Limit_type',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Grenseverdi type',
                    FieldSet: 2,
                    Legend: 'Grenseverdi',
                    Section: 0,
                    Options: {
                        source: this.limitTypes,
                        valueProperty: 'Type',
                        template: (obj: any) => obj
                            ? `${obj.Type} - ${obj.Name}`
                            : '',
                    }
                },
                {
                    EntityType: 'wagetype',
                    Property: 'Limit_value',
                    FieldType: FieldType.TEXT,
                    Label: 'Grenseverdi',
                    FieldSet: 2,
                    Section: 0
                },
                {
                    EntityType: 'wagetype',
                    Property: 'Limit_newRate',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Ny sats',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        format: 'money'
                    }
                },
                {
                    EntityType: 'wagetype',
                    Property: 'Limit_WageTypeNumber',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Ny lønnsart',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        source: wagetypes,
                        valueProperty: 'WageTypeNumber',
                        template: (wt: WageType) => wt
                            ? `${wt.WageTypeNumber} - ${wt.WageTypeName}`
                            : ''
                    }
                },
            ]
        );
    }

    private getShipFields(companySalary: CompanySalary): Observable<UniFieldLayout[]> {
        if (!companySalary.Base_SpesialDeductionForMaritim) {
            return of([]);
        }
        return of(<UniFieldLayout[]>[
            {
                EntityType: 'WageType',
                Property: 'DaysOnBoard',
                FieldType: FieldType.CHECKBOX,
                Label: 'Antall døgn ombord',
                Legend: 'Særskilt fradrag for sjøfolk',
                FieldSet: 3,
                Section: 0,
            },
        ]);
    }

    private getMacroFields(): Observable<UniFieldLayout[]> {
        return this.elsaPurchaseService
            .getPurchaseByProductName('TAX_MACRO')
            .pipe(
                catchError(() => of(null)),
                map(product => product
                    ? <UniFieldLayout[]>[
                            {
                                EntityType: 'WageType',
                                Legend: 'Makro',
                                FieldType: FieldType.TEXTAREA,
                                Property: 'SpecialTaxHandling',
                                Label: 'Skattebehandling',
                                FieldSet: 4,
                                Section: 0,
                                Tooltip: {
                                    Type: 'info',
                                    Text: `Bør kun brukes i helt spesielle tilfeller`,
                                },
                            }
                        ]
                    : [])
            );
    }

    private getLanguageFields(): Observable<UniFieldLayout[]> {
        return of(<UniFieldLayout[]>[
            {
                EntityType: 'wagetype',
                Property: `${WAGETYPE_TRANSLATION_KEY}.WageTypeName`,
                FieldType: FieldType.TEXT,
                Label: 'Alternativ tekst lønnsart',
                FieldSet: 5,
                Legend: 'Språk',
                Section: 0
            },
        ]);
    }
}
