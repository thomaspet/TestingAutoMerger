﻿import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { IUniSaveAction } from '../../../../framework/save/save';
import { FieldType, UniForm, UniFieldLayout } from 'uniform-ng2/main';
import { SubEntityList } from './subEntityList';
import {
    CompanySalary, Account,
    SubEntity, AGAZone, AGASector, CompanySalaryPaymentInterval 
} from '../../../unientities';
import { 
    CompanySalaryService, AccountService, SubEntityService, 
    AgaZoneService, ErrorService 
} from '../../../services/services';
import { GrantsModal } from './modals/grantsModal';
import { FreeamountModal } from './modals/freeamountModal';

declare var _; // lodash

@Component({
    selector: 'aga-and-subentities-settings',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/agaAndSubEntitySettings.html'
})

export class AgaAndSubEntitySettings implements OnInit {
    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(SubEntityList) public subEntityList: SubEntityList;
    @ViewChild(GrantsModal) public grantsModal: GrantsModal;
    @ViewChild(FreeamountModal) public freeamountModal: FreeamountModal;

    public showSubEntities: boolean = true;

    private agaSoneOversiktUrl: string = 'http://www.skatteetaten.no/no/Tabeller-og-satser/Arbeidsgiveravgift/';

    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private accountfields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public accountformConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    private companySalary$: BehaviorSubject<CompanySalary> = new BehaviorSubject(null);
    private accounts: Account[] = [];
    private mainOrganization$: BehaviorSubject<SubEntity> = new BehaviorSubject(null);
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
        this.formConfig$.next({
            sections: {
                1: { isOpen: true }
            }
        });
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
                this.companySalary$.next(companysalaries[0]);
                this.accounts = accounts;
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
        grantBtn.FieldType = FieldType.BUTTON;
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
        freeAmountBtn.FieldType = FieldType.BUTTON;
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
        interrimRemit.Label = 'Hovedbokskonto netto utbetalt';
        interrimRemit.Property = 'InterrimRemitAccount';
        interrimRemit.FieldType = FieldType.AUTOCOMPLETE;
        interrimRemit.Section = 2;
        interrimRemit.Options = {
            source: this.accounts.filter(x => x.AccountNumber >= 1000 && x.AccountNumber <= 2999),
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        let postTax = new UniFieldLayout();
        postTax.Label = 'Poster skattetrekk automatisk';
        postTax.EntityType = 'CompanySalary';
        postTax.Property = 'PostToTaxDraw';
        postTax.FieldType = FieldType.CHECKBOX;
        postTax.ReadOnly = false;        
        postTax.Hidden = false;
        postTax.Section = 2;        
        postTax.Options = {
            source: this.companySalary$.getValue(),
            valueProperty: 'PostToTaxDraw'
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

        this.fields$.next([
            mainOrgName,
            mainOrgOrg,
            mainOrgZone,
            mainOrgRule,
            mainOrgFreeAmount,
            grantBtn,
            freeAmountBtn,
            agaSoneLink
        ]);

        this.accountfields$.next([
            mainAccountAlocatedAga,
            mainAccountCostAga,
            mainAccountAllocatedAgaVacation,
            mainAccountCostAgaVacation,
            interrimRemit,
            paymentInterval,
            postTax
        ]);
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
        let companySalary = this.companySalary$.getValue();
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
        let mainOrganization = this.mainOrganization$.getValue();
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
        Observable.forkJoin(saveObs).subscribe((response: any) => {
            this.companySalary$.next(response[0]);
            this.mainOrganization$.next(response[2]);
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
        let value = this.companySalary$.getValue();
        value['_isDirty'] = true;
        this.companySalary$.next(value);
    }

    public mainOrgChange(event) {
        let value = this.mainOrganization$.getValue();
        value['_isDirty'] = true;
        this.mainOrganization$.next(value);
    }
}
