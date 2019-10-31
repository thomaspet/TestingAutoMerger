import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {WageType, Account, LimitType, SpecialTaxAndContributionsRule, CompanySalary, TaxType, StdWageType} from '../../../unientities';
import {BehaviorSubject} from 'rxjs';
import {AccountService} from '../../accounting/accountService';
import {SalaryTransactionService} from '../salaryTransaction/salaryTransactionService';
import {ErrorService} from '../../common/errorService';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {Observable} from 'rxjs';
import 'rxjs';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import {CompanySalaryService} from '../companySalary/companySalaryService';

export enum WageTypeBaseOptions {
    VacationPay = 0,
    AGA = 1
}

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

    private taxType: {ID: TaxType, Name: string}[] = [
        { ID: TaxType.Tax_None, Name: 'Ingen' },
        { ID: TaxType.Tax_Table, Name: 'Tabelltrekk' },
        { ID: TaxType.Tax_Percent, Name: 'Prosenttrekk' },
        { ID: TaxType.Tax_0, Name: 'Trekkplikt uten skattetrekk' }
    ];

    private stdWageType: {ID: StdWageType, Name: string}[] = [
        { ID: StdWageType.None, Name: 'Ingen' },
        { ID: StdWageType.TaxDrawTable, Name: 'Tabelltrekk' },
        { ID: StdWageType.TaxDrawPercent, Name: 'Prosenttrekk' },
        { ID: StdWageType.HolidayPayWithTaxDeduction, Name: 'Feriepenger med skattetrekk' },
        { ID: StdWageType.HolidayPayThisYear, Name: 'Feriepenger i år' },
        { ID: StdWageType.HolidayPayLastYear, Name: 'Feriepenger forrige år' },
        { ID: StdWageType.HolidayPayEarlierYears, Name: 'Feriepenger tidligere år' },
        { ID: StdWageType.AdvancePayment, Name: 'Forskudd' },
        { ID: StdWageType.Contribution, Name: 'Bidragstrekk' },
        { ID: StdWageType.Garnishment, Name: 'Utleggstrekk skatt' },
        { ID: StdWageType.Outlay, Name: 'Utleggstrekk' },
        { ID: StdWageType.SourceTaxPension, Name: 'Forskuddstrekk kildeskatt på pensjon' }
    ];

    constructor(
        protected http: UniHttp,
        private accountService: AccountService,
        private errorService: ErrorService,
        private salaryTransactionService: SalaryTransactionService,
        private toastService: ToastService,
        private companySalaryService: CompanySalaryService,
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

    public getNameForTaxType(type: TaxType): string {
        const ret = this.taxType.find(t => t.ID === type);
        return ret && ret.Name;
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
                            Label: 'Utbetales med tillegg i prosent',
                            FieldSet: 2,
                            Section: 0,
                            Options: {format: 'percent'}
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

    public GetNameForStandardWageTypeFor(type: StdWageType) {
        const ret = this.stdWageType.find(t => t.ID === type);
        return ret && ret.Name;
    }

    public getNameForSpecialTaxAndContributionRule(rule: SpecialTaxAndContributionsRule) {
        const ret = this.specialTaxAndContributionsRule.find(r => r.ID === rule);
        return ret && ret.Name;
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
            .take(1)
            .map(response => {
                const [wagetypes, compSal] = response;
                return {
                Name: layoutID,
                BaseEntity: 'wagetype',
                Fields: [
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
                        Label: 'UE lønnsart',
                        Tooltip: {
                            Text: `Kobling mot Uni Economy standard lønnsartregister for
                             automatisk vedlikehold av lønnsarten fra systemleverandør.`,
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
                    ...this.getShipFields(compSal)
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
                EntityType: 'WageType',
                Property: 'DaysOnBoard',
                FieldType: FieldType.CHECKBOX,
                Label: 'Antall døgn ombord',
                Legend: 'Særskilt fradrag for sjøfolk',
                FieldSet: 3,
                Section: 0,
            },
        ];
    }
}
