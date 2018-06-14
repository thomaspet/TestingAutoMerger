import {Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniSaveAction} from '../../../../framework/save/save';
import {FieldType, UniForm, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {SubEntityList} from './subEntityList';
import {UniModalService} from '../../../../framework/uni-modal';
import {GrantModal} from './modals/grantModal';
import {FreeAmountModal} from './modals/freeamountModal';
import {Observable} from 'rxjs/Observable';
import {UniSearchAccountConfig} from '../../../services/common/uniSearchConfig/uniSearchAccountConfig';
import {
    CompanySalary,
    Account,
    SubEntity,
    AGAZone,
    AGASector,
    CompanySalaryPaymentInterval
} from '../../../unientities';
import {
    CompanySalaryService,
    AccountService,
    SubEntityService,
    AgaZoneService,
    ErrorService
} from '../../../services/services';
import {SettingsService} from '../settings-service';
import {VacationPaySettingsModal} from '../../../components/salary/payrollrun/modals/vacationpay/vacationPaySettingsModal';
declare var _;

@Component({
    selector: 'aga-and-subentities-settings',
    templateUrl: './agaAndSubEntitySettings.html'
})

export class AgaAndSubEntitySettings implements OnInit {
    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(SubEntityList) public subEntityList: SubEntityList;

    public showSubEntities: boolean = true;
    public isDirty: boolean = false;

    private agaSoneOversiktUrl: string = 'http://www.skatteetaten.no/no/Tabeller-og-satser/Arbeidsgiveravgift/';

    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public accountfields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public accountformConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    public companySalary$: BehaviorSubject<CompanySalary> = new BehaviorSubject(null);
    public accounts: Account[] = [];
    public mainOrganization$: BehaviorSubject<SubEntity> = new BehaviorSubject(null);
    private agaZones: AGAZone[] = [];
    private agaRules: AGASector[] = [];

    public saveaction: IUniSaveAction = {
        label: 'Lagre aga og virksomheter',
        action: this.saveAgaAndSubEntities.bind(this),
        main: true,
        disabled: false
    };

    public busy: boolean;

    constructor(
        private settingsService: SettingsService,
        private companySalaryService: CompanySalaryService,
        private accountService: AccountService,
        private subentityService: SubEntityService,
        private agazoneService: AgaZoneService,
        private errorService: ErrorService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private modalService: UniModalService
    ) {
        this.formConfig$.next({
            sections: {
                1: { isOpen: true }
            }
        });

        this.settingsService.setSaveActions([this.saveaction]);
    }

    public ngOnInit() {
        this.getDataAndSetupForm();
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
           return true;
        }

        return this.modalService.deprecated_openUnsavedChangesModal().onClose;
    }

    private getDataAndSetupForm() {
        this.busy = true;
        Observable.forkJoin(
            this.companySalaryService.getCompanySalary(),
            this.subentityService.getMainOrganization(),
            this.agazoneService.GetAll(''),
            this.agazoneService.getAgaRules()
        ).finally(() => this.busy = false).subscribe(
            (dataset: any) => {
                const [companysalaries, mainOrg, zones, rules] = dataset;
                this.companySalary$.next(companysalaries);
                this.agaZones = zones;
                this.agaRules = rules;

                this.buildForms();

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
        mainOrgName.Section = 0;
        mainOrgName.FieldSet = 1;
        mainOrgName.Legend = 'Juridisk enhet';
        mainOrgName.ReadOnly = true;

        const mainOrgOrg = new UniFieldLayout();
        mainOrgOrg.Label = 'Orgnummer';
        mainOrgOrg.EntityType = 'mainOrganization';
        mainOrgOrg.Property = 'OrgNumber';
        mainOrgOrg.FieldType = FieldType.TEXT;
        mainOrgOrg.Section = 0;
        mainOrgOrg.FieldSet = 1;
        mainOrgOrg.ReadOnly = true;

        const mainOrgFreeAmount = new UniFieldLayout();
        mainOrgFreeAmount.Label = 'Totalt fribeløp for juridisk enhet';
        mainOrgFreeAmount.EntityType = 'mainOrganization';
        mainOrgFreeAmount.Property = 'freeAmount';
        mainOrgFreeAmount.FieldType = FieldType.NUMERIC;
        mainOrgFreeAmount.Section = 0;
        mainOrgFreeAmount.FieldSet = 1;

        const mainOrgZone = new UniFieldLayout();
        mainOrgZone.Label = 'Sone';
        mainOrgZone.EntityType = 'mainOrganization';
        mainOrgZone.Property = 'AgaZone';
        mainOrgZone.FieldType = FieldType.DROPDOWN;
        mainOrgZone.Section = 0;
        mainOrgZone.FieldSet = 2;
        mainOrgZone.Legend = 'Arbeidsgiveravgift';
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
        mainOrgRule.Section = 0;
        mainOrgRule.FieldSet = 2;
        mainOrgRule.Options = {
            source: this.agaRules,
            valueProperty: 'SectorID',
            displayProperty: 'Sector',
            debounceTime: 500
        };

        const agaSoneLink = new UniFieldLayout();
        agaSoneLink.Label = 'AGA soner';
        agaSoneLink.HelpText = 'Oversikt over arbeidsgiveravgift soner';
        agaSoneLink.EntityType = 'mainOrganization';
        agaSoneLink.Property = '_AgaSoneLink';
        agaSoneLink.FieldType = FieldType.HYPERLINK;
        agaSoneLink.Section = 0;
        agaSoneLink.FieldSet = 2;
        agaSoneLink.Options = {
            description: 'Arbeidsgiveravgift soner',
            target: '_blank'
        };

        const freeAmountBtn = new UniFieldLayout();
        freeAmountBtn.Label = 'Oversikt fribeløp';
        freeAmountBtn.EntityType = 'mainOrganization';
        freeAmountBtn.Property = 'FreeAmountBtn';
        freeAmountBtn.FieldType = FieldType.BUTTON;
        freeAmountBtn.Section = 0;
        freeAmountBtn.FieldSet = 2;
        freeAmountBtn.Options = {
            click: (event) => {
                this.openFreeamountModal();
            }
        };

        const grantBtn = new UniFieldLayout();
        grantBtn.Label = 'Tilskudd';
        grantBtn.EntityType = 'mainOrganization';
        grantBtn.Property = 'TilskuddBtn';
        grantBtn.FieldType = FieldType.BUTTON;
        grantBtn.Section = 0;
        grantBtn.FieldSet = 2;
        grantBtn.Options = {
            click: (event) => {
                this.openGrantsModal();
            }
        };



        const mainAccountAlocatedAga = new UniFieldLayout();
        mainAccountAlocatedAga.Label = 'Konto avsatt aga';
        mainAccountAlocatedAga.EntityType = 'CompanySalary';
        mainAccountAlocatedAga.Property = 'MainAccountAllocatedAGA';
        mainAccountAlocatedAga.FieldType = FieldType.UNI_SEARCH;
        mainAccountAlocatedAga.Section = 2;
        mainAccountAlocatedAga.Sectionheader = 'Lønnsoppsett';
        mainAccountAlocatedAga.FieldSet = 1;
        mainAccountAlocatedAga.Legend = 'Hovedbokskontoer';
        mainAccountAlocatedAga.Options = {
            valueProperty: 'AccountNumber',
            source: model => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountAllocatedAGA}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const mainAccountCostAga = new UniFieldLayout();
        mainAccountCostAga.Label = 'Konto kostnad aga';
        mainAccountCostAga.EntityType = 'CompanySalary';
        mainAccountCostAga.Property = 'MainAccountCostAGA';
        mainAccountCostAga.FieldType = FieldType.UNI_SEARCH;
        mainAccountCostAga.Section = 2;
        mainAccountCostAga.FieldSet = 1;
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
        mainAccountAllocatedAgaVacation.Label = 'Avsatt aga av feriepenger';
        mainAccountAllocatedAgaVacation.Property = 'MainAccountAllocatedAGAVacation';
        mainAccountAllocatedAgaVacation.FieldType = FieldType.UNI_SEARCH;
        mainAccountAllocatedAgaVacation.Section = 2;
        mainAccountAllocatedAgaVacation.FieldSet = 1;
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
        mainAccountCostAgaVacation.Label = 'Kostnad aga feriepenger';
        mainAccountCostAgaVacation.Property = 'MainAccountCostAGAVacation';
        mainAccountCostAgaVacation.FieldType = FieldType.UNI_SEARCH;
        mainAccountCostAgaVacation.Section = 2;
        mainAccountCostAgaVacation.FieldSet = 1;
        mainAccountCostAgaVacation.Options = {
            valueProperty: 'AccountNumber',
            source: model => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.MainAccountCostAGAVacation}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const interrimRemit = new UniFieldLayout();
        interrimRemit.EntityType = 'CompanySalary';
        interrimRemit.Label = 'Hovedbokskonto netto utbetalt';
        interrimRemit.Property = 'InterrimRemitAccount';
        interrimRemit.FieldType = FieldType.UNI_SEARCH;
        interrimRemit.Section = 2;
        interrimRemit.FieldSet = 1;
        interrimRemit.Options = {
            valueProperty: 'AccountNumber',
            source: model => this.accountService
                .GetAll(`filter=AccountNumber eq ${model.InterrimRemitAccount}`)
                .map(results => results[0])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
        };

        const postTax = new UniFieldLayout();
        postTax.Label = 'Poster skattetrekk automatisk';
        postTax.EntityType = 'CompanySalary';
        postTax.Property = 'PostToTaxDraw';
        postTax.FieldType = FieldType.CHECKBOX;
        postTax.ReadOnly = false;
        postTax.Hidden = false;
        postTax.Section = 2;
        postTax.FieldSet = 2;
        postTax.Legend = 'Andre innstillinger';
        postTax.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'PostToTaxDraw'
        };

        const paymentInterval = new UniFieldLayout();
        paymentInterval.EntityType = 'CompanySalary';
        paymentInterval.Label = 'Lønnsintervall';
        paymentInterval.Property = 'PaymentInterval';
        paymentInterval.FieldType = FieldType.DROPDOWN;
        paymentInterval.Section = 2;
        paymentInterval.FieldSet = 2;
        paymentInterval.Sectionheader = 'Lønnsintervall';
        paymentInterval.Options = {
            source: [
                { value: CompanySalaryPaymentInterval.Monthly, name: 'Måned' },
                { value: CompanySalaryPaymentInterval.Pr14Days, name: '14-dager' },
                { value: CompanySalaryPaymentInterval.Weekly, name: 'Uke' }
            ],
            valueProperty: 'value',
            displayProperty: 'name'
        };

        const vacationSettingsBtn = new UniFieldLayout();
        vacationSettingsBtn.Label = 'Innstillinger feriepenger';
        vacationSettingsBtn.EntityType = 'mainOrganization';
        vacationSettingsBtn.Property = '_VacationSettingsBtn';
        vacationSettingsBtn.FieldType = FieldType.BUTTON;
        vacationSettingsBtn.Section = 2;
        vacationSettingsBtn.FieldSet = 2;
        vacationSettingsBtn.Options = {
            click: (event) => {
                this.openVacationSettingsModal();
            }
        };

        this.fields$.next([
            mainOrgName,
            mainOrgOrg,
            mainOrgFreeAmount,
            mainOrgZone,
            mainOrgRule,
            agaSoneLink,
            freeAmountBtn,
            grantBtn
        ]);

        this.accountfields$.next([
            mainAccountAlocatedAga,
            mainAccountCostAga,
            mainAccountAllocatedAgaVacation,
            mainAccountCostAgaVacation,
            interrimRemit,
            paymentInterval,
            postTax,
            vacationSettingsBtn
        ]);
    }

    public openGrantsModal() {
        this.modalService.open(GrantModal);
    }

    public openFreeamountModal() {
        this.modalService.open(FreeAmountModal);
    }

    public openVacationSettingsModal() {
        this.modalService.open(VacationPaySettingsModal);
    }

    public saveButtonIsDisabled(isDisabled: boolean) {
        this.saveaction.disabled = isDisabled;
        this.settingsService.setSaveActions([this.saveaction]);
    }

    public saveAgaAndSubEntities(done) {
        const saveObs: Observable<any>[] = [];
        const companySalary = this.companySalary$.getValue();
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
        Observable.forkJoin(saveObs)
            .finally(() => {
                this.saveaction.disabled = false;
                this.settingsService.setSaveActions([this.saveaction]);
            })
            .subscribe((response: any) => {
                this.companySalary$.next(response[0]);
                this.mainOrganization$.next(response[2]);
                this.isDirty = false;
                done('Sist lagret: ');
            },
            err => {
                this.errorService.handle(err);
                done('');
            });
    }

    public toggleShowSubEntities() {
        this.showSubEntities = !this.showSubEntities;
    }

    public log(title: string, err) {
        if (!title) {
            title = '';
        }
        if (err._body) {
            alert(title + ' ' + err._body);
        } else {
            alert(title + ' ' + JSON.stringify(err));
        }

    }

    public companySalarychange(event) {
        const value = this.companySalary$.getValue();
        value['_isDirty'] = true;
        this.companySalary$.next(value);
    }

    public mainOrgChange(event) {
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
}
