import {Component, OnInit, ViewChild, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {IUniSaveAction} from '../../../../framework/save/save';
import {FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {SubEntityList} from './subEntityList';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {GrantModal} from './modals/grantModal';
import {FreeAmountModal} from './modals/freeamountModal';
import {Observable} from 'rxjs';
import {UniSearchAccountConfig} from '../../../services/common/uniSearchConfig/uniSearchAccountConfig';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '@uni-framework/ui/unitable/index';
import {
    CompanySalary,
    Account,
    SubEntity,
    AGAZone,
    AGASector,
    CompanySalaryPaymentInterval,
    LocalDate,
    CompanyVacationRate
} from '../../../unientities';
import {
    CompanySalaryService,
    AccountService,
    SubEntityService,
    AgaZoneService,
    ErrorService,
    PageStateService,
    VacationpayLineService,
    CompanyVacationRateService,
    FinancialYearService
} from '../../../services/services';
import {VacationPaySettingsModal} from '../../common/modals/vacationpay/vacationPaySettingsModal';
import {VacationPayModal} from '@app/components/common/modals/vacationpay/vacationPayModal';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';
declare var _;

@Component({
    selector: 'aga-and-subentities-settings',
    templateUrl: './agaAndSubEntitySettings.html'
})

export class AgaAndSubEntitySettings implements OnInit {
    @ViewChild(SubEntityList) public subEntityList: SubEntityList;
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;

    public showSubEntities: boolean = true;
    public isDirty: boolean = false;

    private agaSoneOversiktUrl: string = 'https://www.skatteetaten.no/no/Tabeller-og-satser/Arbeidsgiveravgift/';

    fields$= new BehaviorSubject<UniFieldLayout[]>([]);
    fields$2 = new BehaviorSubject<UniFieldLayout[]>([]);

    specialFields = new BehaviorSubject<UniFieldLayout[]>([]);
    specialFields2 = new BehaviorSubject<UniFieldLayout[]>([]);

    accountfields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    accountfields$2 = new BehaviorSubject<UniFieldLayout[]>([]);

    vacationfields$ = new BehaviorSubject<UniFieldLayout[]>([]);

    tableConfig: UniTableConfig;
    activeYear: number;

    companySalary$: BehaviorSubject<CompanySalary> = new BehaviorSubject(null);

    accounts: Account[] = [];
    mainOrganization$: BehaviorSubject<SubEntity> = new BehaviorSubject(null);

    private agaZones: AGAZone[] = [];
    private agaRules: AGASector[] = [];

    actions: any[] = [
        { label: 'Hent inn virksomheter fra enhetsregisteret', action: () => this.subEntityList.addSubEntitiesFromExternal() },
        { label: 'Legg til virksomhet manuelt', action: () => this.subEntityList.addNewSubEntity() }
    ];

    activeIndex: number = 0;
    vacationRates: any[] = [];
    stdCompVacRate: CompanyVacationRate;
    tabs = [
        {name: 'Juridisk enhet'},
        {name: 'Virksomheter'},
        {name: 'Kontoer og lønn'},
        {name: 'Feriepenger'},
        {name: 'Spesielle innstillinger'}
    ];

    saveActions: IUniSaveAction[] = [{
        label: 'Lagre innstillinger',
        action: this.saveAgaAndSubEntities.bind(this),
        main: true,
        disabled: false
    }];

    public busy: boolean;

    constructor(
        private companySalaryService: CompanySalaryService,
        private accountService: AccountService,
        private subentityService: SubEntityService,
        private agazoneService: AgaZoneService,
        private errorService: ErrorService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private modalService: UniModalService,
        private toastService: ToastService,
        private tabService: TabService,
        private pageStateService: PageStateService,
        private route: ActivatedRoute,
        private router: Router,
        private vacationpayLineService: VacationpayLineService,
        private companyVacationRateService: CompanyVacationRateService,
        private financialYearService: FinancialYearService
    ) { }

    ngOnInit() {

        this.activeYear = this.financialYearService.getActiveYear();

        this.route.queryParams.subscribe(params => {
            const index = +params['index'];
            if (!isNaN(index) && index >= 0 && index < this.tabs.length) {
                this.activeIndex = index;
            }
            this.updateTabAndUrl();
        });
        this.getDataAndSetupForm();
    }

    ngOnDestroy() {
    this.fields$.complete();
    this.fields$2.complete();
    this.specialFields.complete();
    this.specialFields2.complete();
    this.accountfields$.complete();
    this.accountfields$2.complete();
    this.vacationfields$.complete();
    this.companySalary$.complete();
    }

    updateTabAndUrl() {
        this.pageStateService.setPageState('index', this.activeIndex + '');
        this.tabService.addTab({
            name: 'Innstillinger - Lønn',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.SubSettings,
            active: true
       });
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.companySalary$.getValue() || (!this.isDirty && !this.companySalary$.getValue()['isDirty'])) {
           return true;
        }

        const modalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har endringer i innstillingene som ikke er lagret. Ønsker du å lagre disse før du fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.saveAgaAndSubEntities().then(res => true).catch(res => false);
            }
            return Observable.of(confirm !== ConfirmActions.CANCEL);
        });
    }

    private getDataAndSetupForm() {
        this.busy = true;
        this.buildForms();
        Observable.forkJoin(
            this.companySalaryService.getCompanySalary(),
            this.subentityService.getMainOrganization(),
            this.agazoneService.GetAll(''),
            this.agazoneService.getAgaRules(),
            this.companyVacationRateService.GetAll(''),
            this.companyVacationRateService.getCurrentRates(this.activeYear)
        ).finally(() => this.busy = false).subscribe(
            (dataset: any) => {
                const [companysalary, mainOrg, zones, rules, rates, currentRates] = dataset;

                if (!companysalary) {
                    this.toastService.addToast('En feil oppstod', ToastType.warn, 10, 'Systemet klarte ikke finne innstillinger for lønn. Prøv å last inn bilde på nytt. Hvis feil vedvarer, ta kontakt med support');
                    this.router.navigateByUrl('/settings');
                    return;
                }

                companysalary['_TaxFreeOrgHelp'] = 'https://support.unimicro.no/kundestotte/lonn/rapportering/a-ordningen/'
                + 'a-meldingen/grense-for-oppgaveplikt-or-skattefrie-selskaper-foreninger-og-institusjoner';
                companysalary['_baseOptions'] = this.companySalaryService.getBaseOptions(companysalary);
                this.companySalary$.next(companysalary);
                this.agaZones = zones;
                this.agaRules = rules;
                this.vacationRates = rates;
                this.stdCompVacRate = currentRates;

                this.buildForms();
                this.setTableConfig();

                mainOrg[0]['_AgaSoneLink'] = this.agaSoneOversiktUrl;
                this.mainOrganization$.next(mainOrg[0]);
            },
            err => this.errorService.handle(err)
            );
    }

    private buildForms() {
        const mainOrgName = new UniFieldLayout();
        mainOrgName.Label = 'Firmanavn';
        mainOrgName.EntityType = 'mainOrganization';
        mainOrgName.Property = 'BusinessRelationInfo.Name';
        mainOrgName.FieldType = FieldType.TEXT;
        mainOrgName.ReadOnly = true;

        const mainOrgOrg = new UniFieldLayout();
        mainOrgOrg.Label = 'Orgnummer';
        mainOrgOrg.EntityType = 'mainOrganization';
        mainOrgOrg.Property = 'OrgNumber';
        mainOrgOrg.FieldType = FieldType.TEXT;
        mainOrgOrg.ReadOnly = true;

        const mainOrgFreeAmount = new UniFieldLayout();
        mainOrgFreeAmount.Label = 'Totalt fribeløp for juridisk enhet';
        mainOrgFreeAmount.EntityType = 'mainOrganization';
        mainOrgFreeAmount.Property = 'freeAmount';
        mainOrgFreeAmount.FieldType = FieldType.NUMERIC;

        const mainOrgZone = new UniFieldLayout();
        mainOrgZone.Label = 'Sone';
        mainOrgZone.EntityType = 'mainOrganization';
        mainOrgZone.Property = 'AgaZone';
        mainOrgZone.FieldType = FieldType.DROPDOWN;
        mainOrgZone.Options = {
            source: this.agaZones,
            valueProperty: 'ID',
            displayProperty: 'ZoneName',
            debounceTime: 500
        };

        const mainOrgRule = new UniFieldLayout();
        mainOrgRule.Label = 'Beregningsregel aga';
        mainOrgRule.EntityType = 'mainOrganization';
        mainOrgRule.Property = 'AgaRule';
        mainOrgRule.FieldType = FieldType.DROPDOWN;
        mainOrgRule.Options = {
            source: this.agaRules,
            valueProperty: 'SectorID',
            displayProperty: 'Sector',
            debounceTime: 500
        };

        const agaSoneLink = new UniFieldLayout();
        agaSoneLink.Label = '';
        agaSoneLink.HelpText = 'Oversikt over arbeidsgiveravgift soner';
        agaSoneLink.EntityType = 'mainOrganization';
        agaSoneLink.Property = '_AgaSoneLink';
        agaSoneLink.FieldType = FieldType.HYPERLINK;
        agaSoneLink.Classes = 'info-box-link';
        agaSoneLink.Options = {
            description: 'Arbeidsgiveravgift soner',
            target: '_blank',
            icon: 'info_outlinee'
        };

        const freeAmountBtn = new UniFieldLayout();
        freeAmountBtn.Label = 'Oversikt fribeløp';
        freeAmountBtn.EntityType = 'mainOrganization';
        freeAmountBtn.Property = 'FreeAmountBtn';
        freeAmountBtn.FieldType = FieldType.BUTTON;
        freeAmountBtn.Classes = 'uni-aga-settings-buttons';
        freeAmountBtn.Options = {
            click: (event) => {
                this.openFreeamountModal();
            },
            class: ''
        };

        const grantBtn = new UniFieldLayout();
        grantBtn.Label = 'Tilskudd';
        grantBtn.EntityType = 'mainOrganization';
        grantBtn.Property = 'TilskuddBtn';
        grantBtn.FieldType = FieldType.BUTTON;
        grantBtn.Classes = 'uni-aga-settings-buttons';
        grantBtn.Options = {
            click: (event) => {
                this.openGrantsModal();
            }
        };

        // Vacation pay cose
        const mainAccountCostVacation = new UniFieldLayout();
        const companysalaryModel = this.companySalary$.getValue();
        const cosVacAccountObs: Observable<Account> = companysalaryModel && companysalaryModel.MainAccountCostVacation
            ? this.accountService.GetAll(
                `filter=AccountNumber eq ${companysalaryModel.MainAccountCostVacation}` + '&top=1'
            )
            : Observable.of([{ AccountName: '', AccountNumber: null }]);
        mainAccountCostVacation.Label = 'Kostnad feriepenger';
        mainAccountCostVacation.Property = 'MainAccountCostVacation';
        mainAccountCostVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountCostVacation.Options = {
            getDefaultData: () => cosVacAccountObs,
            search: (query: string) => this.accountService.GetAll(
                `filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`
            ),
            displayProperty: 'AccountName',
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        // Vacation pay saved
        const mainAccountAllocatedVacation = new UniFieldLayout();
        const allVacAccountObs: Observable<Account> = companysalaryModel
            && companysalaryModel.MainAccountAllocatedVacation
                ? this.accountService.GetAll(
                    `filter=AccountNumber eq ${companysalaryModel.MainAccountAllocatedVacation}` + '&top=1'
                )
                : Observable.of([{ AccountName: '', AccountNumber: null }]);
        mainAccountAllocatedVacation.Label = 'Avsatt feriepenger';
        mainAccountAllocatedVacation.Property = 'MainAccountAllocatedVacation';
        mainAccountAllocatedVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountAllocatedVacation.Options = {
            getDefaultData: () => allVacAccountObs,
            search: (query: string) => this.accountService.GetAll(
                `filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`
            ),
            displayProperty: 'AccountName',
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        const mainAccountAlocatedAga = new UniFieldLayout();
        mainAccountAlocatedAga.Label = 'Konto for avsatt arbeidsgiveravgift';
        mainAccountAlocatedAga.EntityType = 'CompanySalary';
        mainAccountAlocatedAga.Property = 'MainAccountAllocatedAGA';
        mainAccountAlocatedAga.FieldType = FieldType.UNI_SEARCH;
        mainAccountAlocatedAga.Options = {
            valueProperty: 'AccountNumber',
            source: model => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountAllocatedAGA}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const mainAccountCostAga = new UniFieldLayout();
        mainAccountCostAga.Label = 'Konto for kostnad til arbeidsgiveravgift';
        mainAccountCostAga.EntityType = 'CompanySalary';
        mainAccountCostAga.Property = 'MainAccountCostAGA';
        mainAccountCostAga.FieldType = FieldType.UNI_SEARCH;
        mainAccountCostAga.Options = {
            valueProperty: 'AccountNumber',
            source: model => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountCostAGA}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const mainAccountAllocatedAgaVacation = new UniFieldLayout();
        mainAccountAllocatedAgaVacation.EntityType = 'CompanySalary';
        mainAccountAllocatedAgaVacation.Label = 'Konto for avsatt arbeidsgiveravgift av feriepenger';
        mainAccountAllocatedAgaVacation.Property = 'MainAccountAllocatedAGAVacation';
        mainAccountAllocatedAgaVacation.FieldType = FieldType.UNI_SEARCH;
        mainAccountAllocatedAgaVacation.Options = {
            valueProperty: 'AccountNumber',
            source: model => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountAllocatedAGAVacation}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const mainAccountCostAgaVacation = new UniFieldLayout();
        mainAccountCostAgaVacation.EntityType = 'CompanySalary';
        mainAccountCostAgaVacation.Label = 'Konto for kostnad arbeidsgiveravgift av feriepenger';
        mainAccountCostAgaVacation.Property = 'MainAccountCostAGAVacation';
        mainAccountCostAgaVacation.FieldType = FieldType.UNI_SEARCH;
        mainAccountCostAgaVacation.Options = {
            valueProperty: 'AccountNumber',
            source: model => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountCostAGAVacation}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const postTax = new UniFieldLayout();
        postTax.Label = 'Poster skattetrekk automatisk';
        postTax.EntityType = 'CompanySalary';
        postTax.Property = 'PostToTaxDraw';
        postTax.FieldType = FieldType.CHECKBOX;
        postTax.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'PostToTaxDraw'
        };

        const paymentInterval = new UniFieldLayout();
        paymentInterval.EntityType = 'CompanySalary';
        paymentInterval.Label = 'Lønnsintervall';
        paymentInterval.Property = 'PaymentInterval';
        paymentInterval.FieldType = FieldType.DROPDOWN;
        paymentInterval.Options = {
            source: [
                { value: CompanySalaryPaymentInterval.Monthly, name: 'Måned' },
                { value: CompanySalaryPaymentInterval.Pr14Days, name: '14-dager' },
                { value: CompanySalaryPaymentInterval.Weekly, name: 'Uke' }
            ],
            valueProperty: 'value',
            displayProperty: 'name'
        };

        const otpExportActive = new UniFieldLayout();
        otpExportActive.EntityType = 'CompanySalary';
        otpExportActive.Label = 'Benytte OTP-eksport';
        otpExportActive.Property = 'OtpExportActive';
        otpExportActive.FieldType = FieldType.CHECKBOX;

        const postGarnishmentToTaxAccount = new UniFieldLayout();
        postGarnishmentToTaxAccount.EntityType = 'CompanySalary';
        postGarnishmentToTaxAccount.Label = 'Utleggstrekk skatt til skattetrekkskonto';
        postGarnishmentToTaxAccount.Property = 'PostGarnishmentToTaxAccount';
        postGarnishmentToTaxAccount.FieldType = FieldType.CHECKBOX;
        postGarnishmentToTaxAccount.Tooltip = {
            Text: 'Kryss av for at Utleggstrekk Skatt som trekkes av ansatte overføres ' +
            'til bankkonto for skattetrekk når lønnsavregningen utbetales. Husk at Skattetrekkskonto ' +
            'må fylles ut, og bør være ulik Lønnskonto/Driftskonto.'
        };

        const hourFTEs = new UniFieldLayout();
        hourFTEs.EntityType = 'CompanySalary';
        hourFTEs.Label = 'Timer pr årsverk';
        hourFTEs.Property = 'HourFTEs';
        hourFTEs.FieldType = FieldType.TEXT;

        const calculateFinancial = new UniFieldLayout();
        calculateFinancial.Label = 'Finansskatt';
        calculateFinancial.EntityType = 'CompanySalary';
        calculateFinancial.Property = 'CalculateFinancialTax';
        calculateFinancial.FieldType = FieldType.CHECKBOX;
        calculateFinancial.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'CalculateFinancialTax'
        };

        const rateFinancialTax = new UniFieldLayout();
        rateFinancialTax.Label = 'Sats finansskatt';
        rateFinancialTax.EntityType = 'CompanySalary';
        rateFinancialTax.Property = 'RateFinancialTax';
        rateFinancialTax.FieldType = FieldType.TEXT;

        const financial = new UniFieldLayout();
        financial.EntityType = 'CompanySalary';
        financial.Label = 'Avsatt finansskatt';
        financial.Property = 'MainAccountAllocatedFinancial';
        financial.FieldType = FieldType.UNI_SEARCH;
        financial.Options = {
            valueProperty: 'AccountNumber',
            source: (model: CompanySalary) => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountAllocatedFinancial}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const costFinancial = new UniFieldLayout();
        costFinancial.EntityType = 'CompanySalary';
        costFinancial.Label = 'Kostnad finansskatt';
        costFinancial.Property = 'MainAccountCostFinancial';
        costFinancial.FieldType = FieldType.UNI_SEARCH;
        costFinancial.Options = {
            valueProperty: 'AccountNumber',
            source: (model: CompanySalary) => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountCostFinancial}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const financialVacation = new UniFieldLayout();
        financialVacation.EntityType = 'CompanySalary';
        financialVacation.Label = 'Avsatt finansskatt av feriepenger';
        financialVacation.Property = 'MainAccountAllocatedFinancialVacation';
        financialVacation.FieldType = FieldType.UNI_SEARCH;
        financialVacation.Options = {
            valueProperty: 'AccountNumber',
            source: (model: CompanySalary) => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountAllocatedFinancialVacation}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const costFinancialVacation = new UniFieldLayout();
        costFinancialVacation.EntityType = 'CompanySalary';
        costFinancialVacation.Label = 'Kostnad finansskatt av feriepenger';
        costFinancialVacation.Property = 'MainAccountCostFinancialVacation';
        costFinancialVacation.FieldType = FieldType.UNI_SEARCH;
        costFinancialVacation.Options = {
            valueProperty: 'AccountNumber',
            source: (model: CompanySalary) => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountCostFinancialVacation}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const taxRule1 = new UniFieldLayout();
        taxRule1.Label = 'Særskilt fradrag for sjøfolk';
        taxRule1.EntityType = 'CompanySalary';
        taxRule1.Property = 'Base_SpesialDeductionForMaritim';
        taxRule1.FieldType = FieldType.CHECKBOX;
        taxRule1.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'Base_SpesialDeductionForMaritim'
        };

        const taxRule2 = new UniFieldLayout();
        taxRule2.Label = 'Netto lønn';
        taxRule2.EntityType = 'CompanySalary';
        taxRule2.Property = 'Base_NettoPayment';
        taxRule2.FieldType = FieldType.CHECKBOX;
        taxRule2.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'Base_NettoPayment'
        };

        const taxRule3 = new UniFieldLayout();
        taxRule3.Label = 'Kildeskatt for pensjonister';
        taxRule3.EntityType = 'CompanySalary';
        taxRule3.Property = 'Base_PayAsYouEarnTaxOnPensions';
        taxRule3.FieldType = FieldType.CHECKBOX;
        taxRule3.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'Base_PayAsYouEarnTaxOnPensions'
        };

        const taxRule4 = new UniFieldLayout();
        taxRule4.Label = 'Netto lønn for sjøfolk';
        taxRule4.EntityType = 'CompanySalary';
        taxRule4.Property = 'Base_NettoPaymentForMaritim';
        taxRule4.FieldType = FieldType.CHECKBOX;
        taxRule4.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'Base_NettoPaymentForMaritim'
        };

        const taxRule5 = new UniFieldLayout();
        taxRule5.Label = 'Skattefri organisasjon';
        taxRule5.EntityType = 'CompanySalary';
        taxRule5.Property = 'Base_TaxFreeOrganization';
        taxRule5.FieldType = FieldType.CHECKBOX;
        taxRule5.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'Base_TaxFreeOrganization'
        };

        const taxRuleHelper = new UniFieldLayout();
        taxRuleHelper.Label = '';
        taxRuleHelper.HelpText = 'Hjelp skattefri organisasjon';
        taxRuleHelper.EntityType = 'CompanySalary';
        taxRuleHelper.Property = '_TaxFreeOrgHelp';
        taxRuleHelper.FieldType = FieldType.HYPERLINK;
        taxRuleHelper.Classes = 'info-box-link';
        taxRuleHelper.Options = {
            description: 'Hjelp skattefri organisasjon',
            target: '_blank',
            icon: 'info_outlinee'
        };


        // VACATION PAY SETTINGS
        this.vacationfields$.next([
            <UniFieldLayout> {
                Label: 'Trekk i fastlønn i feriemåned',
                EntityType: 'CompanySalary',
                Property: 'WageDeductionDueToHoliday',
                FieldType: FieldType.DROPDOWN,
                Options: {
                    source: this.vacationpayLineService.WageDeductionDueToHolidayArray,
                    displayProperty: 'name',
                    valueProperty: 'id'
                }
            },
            <UniFieldLayout> {
                Label: 'Ignorer grunnbeløp',
                Property: 'AllowOver6G',
                FieldType: FieldType.CHECKBOX
            }
        ]);

        this.fields$.next([ mainOrgName, mainOrgOrg, mainOrgFreeAmount ]);

        this.fields$2.next([mainOrgZone, mainOrgRule, agaSoneLink, freeAmountBtn, grantBtn]);

        this.accountfields$.next([

            // HERE
            mainAccountCostVacation, mainAccountAllocatedVacation, mainAccountAlocatedAga, mainAccountCostAga,
            mainAccountAllocatedAgaVacation, mainAccountCostAgaVacation, postTax, postGarnishmentToTaxAccount
        ]);

        this.accountfields$2.next([hourFTEs, paymentInterval, otpExportActive]);

        this.specialFields.next([
            calculateFinancial, rateFinancialTax, financial, costFinancial, financialVacation, costFinancialVacation
        ]);

        this.specialFields2.next([taxRule1, taxRule2, taxRule3, taxRule4, taxRule5, taxRuleHelper]);
    }

    private setTableConfig() {
        const rateCol = new UniTableColumn('Rate', 'Feriepengesats', UniTableColumnType.Percent);
        const rate60Col = new UniTableColumn('Rate60', 'Tilleggssats over 60 år', UniTableColumnType.Percent);
        const dateCol = new UniTableColumn('FromDate', 'Gjelder fra opptjeningsår', UniTableColumnType.Text)
            .setTemplate((rowModel) => {
                return rowModel.FromDate ? moment(rowModel.FromDate).format('YYYY') : '';
            });

        this.tableConfig = new UniTableConfig('salary.payrollrun.vacationpaySettingModalContent', true)
            .setColumns([rateCol, rate60Col, dateCol])
            .setPageable(this.vacationRates.length > 10)
            .setCopyFromCellAbove(false)
            .setDeleteButton(true)
            .setChangeCallback((event) => {
                const row = event.rowModel;
                if (event.field === 'FromDate') {
                    row.FromDate = row.FromDate
                    ? new LocalDate(moment(row.FromDate).format('YYYY') + '-01-01')
                    : new LocalDate(this.activeYear - 1 + '-01-01');
                    if (this.table.getTableData()
                        .some(x => moment(x.FromDate).format('YYYY') === moment(row.FromDate).format('YYYY') && x.ID !== row.ID)) {
                        this.toastService.addToast('Like år', ToastType.bad, ToastTime.medium,
                            `Sats for år ${moment(row.FromDate).format('YYYY')} finnes fra før`);
                    }
                }
                if (event.field === 'Rate60') {
                    row.Rate60 = row.Rate60 ? row.Rate60 : this.stdCompVacRate.Rate60;
                }
                if (event.field === 'Rate') {
                    row.Rate = row.Rate ? row.Rate : this.stdCompVacRate.Rate;
                }
                return row;
            });
    }

    public openGrantsModal() {
        this.modalService.open(GrantModal);
    }

    public openFreeamountModal() {
        this.modalService.open(FreeAmountModal);
    }

    public openVacationSettingsModal() {
        this.modalService.open(VacationPaySettingsModal, {data: {}});
    }

    public openVacationPayModal() {
        this.modalService.open(VacationPayModal);
    }

    public saveAgaAndSubEntities(done?) {
        const companySalary = this.companySalary$.getValue();

        return new Promise(res => {
            const saveObs: Observable<any>[] = [];

            if (!companySalary['RateFinancialTax']) {
                companySalary['RateFinancialTax'] = 0;
            }
            if (companySalary) {
                let companySaveObs: Observable<CompanySalary>;
                companySaveObs = companySalary['_isDirty']
                ? this.companySalaryService.Put(companySalary.ID, companySalary)
                : Observable.of(companySalary);

                saveObs.push(companySaveObs);
            }


            if (this.subEntityList) {
                saveObs.push(this.subEntityList.saveSubEntity());
            }
            const mainOrganization = this.mainOrganization$.getValue();
            if (mainOrganization) {
                let mainOrgSave: Observable<SubEntity> = null;

                if (mainOrganization['_isDirty']) {
                    mainOrgSave = mainOrganization.ID
                        ? this.subentityService.Put(mainOrganization.ID, mainOrganization)
                        : this.subentityService.Post(mainOrganization);
                } else {
                    mainOrgSave = Observable.of(mainOrganization);
                }

                saveObs.push(mainOrgSave);
            }

            this.vacationRates.filter(rate => rate._isDirty && !rate._isEmpty).forEach(vacationRate => {
                if (vacationRate.ID > 0) {
                    saveObs.push(this.companyVacationRateService.Put(vacationRate.ID, vacationRate));
                } else {
                    saveObs.push(this.companyVacationRateService.Post(vacationRate));
                }
            });


            Observable.forkJoin(saveObs).subscribe((response: any) => {
                this.isDirty = false;
                if (done) {
                    done('Lagret');
                    this.getDataAndSetupForm();
                }
                res(true);
            },
            err => {
                this.errorService.handle(err);
                if (done) {
                    done('');
                }
                res(false);
            });
        });
    }

    public toggleShowSubEntities() {
        this.showSubEntities = !this.showSubEntities;
    }

    public companySalarychange(event: SimpleChanges) {
        const value = this.companySalary$.getValue();

        if (event['CalculateFinancialTax']) {
            if ((!value['RateFinancialTax'] || value['RateFinancialTax'] === 0)
                && event['CalculateFinancialTax'].currentValue === true) {
                    value['RateFinancialTax'] = 5;
            }
        }

        if (event['_baseOptions']) {
            this.companySalaryService.setBaseOptions(value, event['_baseOptions'].currentValue);
        }

        value['_isDirty'] = true;
        this.isDirty = true;
        this.companySalary$.next(value);
    }

    companySalaryChange() {
        const companySalary = this.companySalary$.getValue();
        companySalary['_isDirty'] = true;
        this.companySalary$.next(companySalary);
    }

    mainOrgChange(event) {
        const value = this.mainOrganization$.getValue();

        if (event['AgaRule']) {
            if (value['freeAmount'] === null && event['AgaRule'].currentValue === 1) {
                value['freeAmount'] = 500000;
            }
        }

        value['_isDirty'] = true;
        this.isDirty = true;
        this.mainOrganization$.next(value);
    }

    onRowDeleted(rowModel: CompanyVacationRate) {
        if (rowModel['_isEmpty']) {
            return;
        }
        if (isNaN(rowModel.ID)) {
            return;
        }

        this.modalService.confirm({
            header: 'Slette sats',
            message: `Er du sikker på at du vil slette sats for år ${moment(rowModel.FromDate).format('YYYY')}`,
            buttonLabels: {
                accept: 'Ja, slett sats',
                reject: 'Nei, behold sats'
            }
        })
        .onClose
        .switchMap((result: ConfirmActions) => result === ConfirmActions.ACCEPT
            ? this.companyVacationRateService.Remove(rowModel.ID)
            : Observable.of(result))
        .switchMap((result: ConfirmActions) => {
            if (result === ConfirmActions.REJECT) {
                this.companyVacationRateService.invalidateCache();
                return this.companyVacationRateService.GetAll('');
            }
            return Observable.of(this.vacationRates);
        })
        .subscribe((result: CompanyVacationRate[]) => {
            this.vacationRates = result.filter(x => x.Deleted === false);
            if (this.vacationRates.length === 1) {
                this.vacationRates = [];
            }
        });
    }
}
