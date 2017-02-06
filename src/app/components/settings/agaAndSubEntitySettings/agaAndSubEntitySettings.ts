import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { IUniSaveAction } from '../../../../framework/save/save';
import { UniForm, UniFieldLayout } from 'uniform-ng2/main';
import { SubEntityList } from './subEntityList';
import {
    FieldType, CompanySalary, Account,
    SubEntity, AGAZone, AGASector, CompanySalaryPaymentInterval } from '../../../unientities';
import { CompanySalaryService, AccountService, SubEntityService, AgaZoneService, ErrorService } from '../../../services/services';
import { GrantsModal } from './modals/grantsModal';
import { FreeamountModal } from './modals/freeamountModal';
declare var _;

@Component({
    selector: 'aga-and-subentities-settings',
    templateUrl: './agaAndSubEntitySettings.html'
})

export class AgaAndSubEntitySettings implements OnInit {
    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(SubEntityList) public subEntityList: SubEntityList;
    @ViewChild(GrantsModal) public grantsModal: GrantsModal;
    @ViewChild(FreeamountModal) public freeamountModal: FreeamountModal;

    public showSubEntities: boolean = true;

    private agaSoneOversiktUrl: string = 'http://www.skatteetaten.no/no/Tabeller-og-satser/Arbeidsgiveravgift/';

    private fields: UniFieldLayout[] = [];
    private accountfields: UniFieldLayout[] = [];
    public formConfig: any = {};
    public accountformConfig: any = {};

    private companySalary: CompanySalary;
    private accounts: Account[] = [];
    private mainOrganization: SubEntity;
    private agaZones: AGAZone[] = [];
    private agaRules: AGASector[] = [];

    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre aga og virksomheter',
            action: this.saveAgaAndSubEntities.bind(this),
            main: true,
            disabled: false
        }
    ];

    public busy: boolean;

    constructor(
        private companySalaryService: CompanySalaryService,
        private accountService: AccountService,
        private subentityService: SubEntityService,
        private agazoneService: AgaZoneService,
        private errorService: ErrorService
    ) {
        this.formConfig = {
            sections: {
                1: { isOpen: true }
            }
        };
    }

    public ngOnInit() {
        this.getDataAndSetupForm();
    }

    private getDataAndSetupForm() {
        this.busy = true;
        Observable.forkJoin(
            this.companySalaryService.getCompanySalary(),
            this.accountService.GetAll(''),
            this.subentityService.getMainOrganization(),
            this.agazoneService.GetAll(''),
            this.agazoneService.getAgaRules()
        ).finally(() => this.busy = false).subscribe(
            (dataset: any) => {
                let [companysalaries, accounts, mainOrg, zones, rules] = dataset;
                this.companySalary = companysalaries[0];
                this.accounts = accounts;
                this.mainOrganization = mainOrg[0];
                this.agaZones = zones;
                this.agaRules = rules;

                this.buildForms();

                this.mainOrganization['_AgaSoneLink'] = this.agaSoneOversiktUrl;

            },
            err => this.errorService.handle(err)
            );
    }

    private buildForms() {
        var mainOrgName = new UniFieldLayout();
        mainOrgName.Label = 'Firmanavn';
        mainOrgName.EntityType = 'mainOrganization';
        mainOrgName.Property = 'BusinessRelationInfo.Name';
        mainOrgName.FieldType = FieldType.TEXT;
        mainOrgName.Section = 1;
        mainOrgName.Sectionheader = 'Juridisk enhet';

        var mainOrgOrg = new UniFieldLayout();
        mainOrgOrg.Label = 'Orgnr';
        mainOrgOrg.EntityType = 'mainOrganization';
        mainOrgOrg.Property = 'OrgNumber';
        mainOrgOrg.FieldType = FieldType.TEXT;
        mainOrgOrg.Section = 1;

        var mainOrgZone = new UniFieldLayout();
        mainOrgZone.Label = 'Sone';
        mainOrgZone.EntityType = 'mainOrganization';
        mainOrgZone.Property = 'AgaZone';
        mainOrgZone.FieldType = FieldType.DROPDOWN;
        mainOrgZone.Section = 1;
        mainOrgZone.Options = {
            source: this.agaZones,
            valueProperty: 'ID',
            displayProperty: 'ZoneName',
            debounceTime: 500
        };

        var mainOrgRule = new UniFieldLayout();
        mainOrgRule.Label = 'Beregningsregel aga';
        mainOrgRule.EntityType = 'mainOrganization';
        mainOrgRule.Property = 'AgaRule';
        mainOrgRule.FieldType = FieldType.DROPDOWN;
        mainOrgRule.Section = 1;
        mainOrgRule.Options = {
            source: this.agaRules,
            valueProperty: 'SectorID',
            displayProperty: 'Sector',
            debounceTime: 500,
        };

        var mainOrgFreeAmount = new UniFieldLayout();
        mainOrgFreeAmount.Label = 'Totalt fribeløp for juridisk enhet';
        mainOrgFreeAmount.EntityType = 'mainOrganization';
        mainOrgFreeAmount.Property = 'freeAmount';
        mainOrgFreeAmount.FieldType = FieldType.NUMERIC;
        mainOrgFreeAmount.Section = 1;

        var grantBtn = new UniFieldLayout();
        grantBtn.Label = 'Tilskudd';
        grantBtn.EntityType = 'mainOrganization';
        grantBtn.Property = 'TilskuddBtn';
        grantBtn.FieldType = FieldType.COMBOBOX;
        grantBtn.Section = 1;
        grantBtn.Options = {
            click: (event) => {
                this.openGrantsModal();
            }
        };

        var freeAmountBtn = new UniFieldLayout();
        freeAmountBtn.Label = 'Oversikt fribeløp';
        freeAmountBtn.EntityType = 'mainOrganization';
        freeAmountBtn.Property = 'FreeAmountBtn';
        freeAmountBtn.FieldType = FieldType.COMBOBOX;
        freeAmountBtn.Section = 1;
        freeAmountBtn.Options = {
            click: (event) => {
                this.openFreeamountModal();
            }
        };

        var agaSoneLink = new UniFieldLayout();
        agaSoneLink.Label = 'AGA soner';
        agaSoneLink.HelpText = 'Oversikt over arbeidsgiveravgift soner';
        agaSoneLink.EntityType = 'mainOrganization';
        agaSoneLink.Property = '_AgaSoneLink';
        agaSoneLink.FieldType = FieldType.HYPERLINK;
        agaSoneLink.Section = 1;
        agaSoneLink.Options = {
            description: 'Arbeidsgiveravgift soner',
            target: '_blank'
        };

        var mainAccountAlocatedAga = new UniFieldLayout();
        mainAccountAlocatedAga.Label = 'Konto avsatt aga';
        mainAccountAlocatedAga.EntityType = 'CompanySalary';
        mainAccountAlocatedAga.Property = 'MainAccountAllocatedAGA';
        mainAccountAlocatedAga.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountAlocatedAga.Section = 2;
        mainAccountAlocatedAga.Sectionheader = 'Kontooppsett';
        mainAccountAlocatedAga.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        var mainAccountCostAga = new UniFieldLayout();
        mainAccountCostAga.Label = 'Konto kostnad aga';
        mainAccountCostAga.EntityType = 'CompanySalary';
        mainAccountCostAga.Property = 'MainAccountCostAGA';
        mainAccountCostAga.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountCostAga.Section = 2;
        mainAccountCostAga.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        var mainAccountAllocatedAgaVacation = new UniFieldLayout();
        mainAccountAllocatedAgaVacation.EntityType = 'CompanySalary';
        mainAccountAllocatedAgaVacation.Label = 'Avsatt aga av feriepenger';
        mainAccountAllocatedAgaVacation.Property = 'MainAccountAllocatedAGAVacation';
        mainAccountAllocatedAgaVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountAllocatedAgaVacation.Section = 2;
        mainAccountAllocatedAgaVacation.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        var mainAccountCostAgaVacation = new UniFieldLayout();
        mainAccountCostAgaVacation.EntityType = 'CompanySalary';
        mainAccountCostAgaVacation.Label = 'Kostnad aga feriepenger';
        mainAccountCostAgaVacation.Property = 'MainAccountCostAGAVacation';
        mainAccountCostAgaVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountCostAgaVacation.Section = 2;
        mainAccountCostAgaVacation.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        var interrimRemit = new UniFieldLayout();
        interrimRemit.EntityType = 'CompanySalary';
        interrimRemit.Label = 'Mellomkonto remittering';
        interrimRemit.Property = 'InterrimRemitAccount';
        interrimRemit.FieldType = FieldType.AUTOCOMPLETE;
        interrimRemit.Section = 2;
        interrimRemit.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        let paymentInterval = new UniFieldLayout();
        paymentInterval.EntityType = 'CompanySalary';
        paymentInterval.Label = 'Lønnsintervall';
        paymentInterval.Property = 'PaymentInterval';
        paymentInterval.FieldType = FieldType.DROPDOWN;
        paymentInterval.Section = 3;
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

        this.fields = [
            mainOrgName,
            mainOrgOrg,
            mainOrgZone,
            mainOrgRule,
            mainOrgFreeAmount,
            grantBtn,
            freeAmountBtn,
            agaSoneLink
        ];

        this.accountfields = [
            mainAccountAlocatedAga,
            mainAccountCostAga,
            mainAccountAllocatedAgaVacation,
            mainAccountCostAgaVacation,
            interrimRemit,
            paymentInterval
        ];
    }

    public openGrantsModal() {
        this.grantsModal.openGrantsModal();
    }

    public openFreeamountModal() {
        this.freeamountModal.openFreeamountModal();
    }

    public saveButtonIsDisabled(isDisabled: boolean) {
        this.saveactions[0].disabled = isDisabled;
        this.saveactions = _.cloneDeep(this.saveactions);
    }

    public saveAgaAndSubEntities(done) {
        let saveObs: Observable<any>[] = [];

        if (this.companySalary) {
            let companySaveObs: Observable<CompanySalary>;
            companySaveObs = this.companySalary['_isDirty']
            ? this.companySalaryService.Put(this.companySalary.ID, this.companySalary)
            : Observable.of(this.companySalary);

            saveObs.push(companySaveObs);
        }

        if (this.subEntityList) {
            saveObs.push(this.subEntityList.saveSubEntity());
        }

        if (this.mainOrganization) {
            let mainOrgSave: Observable<SubEntity> = null;

            if (this.mainOrganization['_isDirty']) {
                mainOrgSave = this.mainOrganization.ID
                    ? this.subentityService.Put(this.mainOrganization.ID, this.mainOrganization)
                    : this.subentityService.Post(this.mainOrganization);
            } else {
                mainOrgSave = Observable.of(this.mainOrganization);
            }

            saveObs.push(mainOrgSave);
        }
        Observable.forkJoin(saveObs).subscribe((response: any) => {
            this.companySalary = response[0];
            this.mainOrganization = response[2];
            done('Sist lagret: ');
        },
            err => this.errorService.handle(err),
            () => this.saveactions[0].disabled = false);
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
        this.companySalary['_isDirty'] = true;
    }

    public mainOrgChange(event) {
        this.mainOrganization['_isDirty'] = true;
    }

    //#endregion Test data
}
