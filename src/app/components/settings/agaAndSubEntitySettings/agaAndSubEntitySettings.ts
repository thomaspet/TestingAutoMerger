import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {SubEntityList} from './subEntityList';
import {FieldType, CompanySalary, Account, SubEntity, AGAZone, AGASector} from '../../../unientities';
import {CompanySalaryService, AccountService, SubEntityService, AgaZoneService} from '../../../services/services';

declare var _; // lodash

@Component({
    selector: 'aga-and-subentities-settings',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/agaAndSubEntitySettings.html'
})

export class AgaAndSubEntitySettings implements OnInit {
    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(SubEntityList) public subEntityList: SubEntityList;

    public showSubEntities: boolean = true;

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
        private agazoneService: AgaZoneService
    ) {

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
        ).subscribe(
            (dataset: any) => {
                let [companysalaries, accounts, mainOrg, zones, rules] = dataset;
                this.companySalary = companysalaries[0];
                this.accounts = accounts;
                this.mainOrganization = mainOrg[0];
                this.agaZones = zones;
                this.agaRules = rules;

                this.buildForms();
                this.busy = false;
            },
            error => {
                this.log('fikk ikke hentet kontoer: ', error);
                this.busy = false;
            }
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
        
        var freeAmount = new UniFieldLayout();
        freeAmount.EntityType = 'CompanySalary';
        freeAmount.Label = 'Fribeløp';
        freeAmount.Property = 'FreeAmount';
        freeAmount.FieldType = FieldType.TEXT;
        freeAmount.Section = 1;

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

        this.fields = [
            mainOrgName,
            mainOrgOrg,
            mainOrgZone,
            mainOrgRule
        ];

        this.accountfields = [
            mainAccountAlocatedAga,
            mainAccountCostAga,
            mainAccountAllocatedAgaVacation,
            mainAccountCostAgaVacation,
            interrimRemit,
            freeAmount,
        ];
    }

    public saveButtonIsDisabled(isDisabled: boolean) {
        this.saveactions[0].disabled = isDisabled;
        this.saveactions = _.cloneDeep(this.saveactions);
    }

    public saveAgaAndSubEntities(done) {
        if (!this.companySalary.PaymentInterval) {
            this.companySalary.PaymentInterval = 1;
        }
        let saveObs: Observable<any>[] = [];

        if (this.companySalary) {
            saveObs.push(this.companySalaryService.Put(this.companySalary.ID, this.companySalary));
        }

        if (this.subEntityList) {
            saveObs.push(this.subEntityList.saveSubEntity());
        } 

        if (this.mainOrganization) {
            if (this.mainOrganization.ID) {
                saveObs.push(this.subentityService.Put(this.mainOrganization.ID, this.mainOrganization));
            } else {
                saveObs.push(this.subentityService.Post(this.mainOrganization));
            }
        }
        Observable.forkJoin(saveObs).subscribe((response: any) => {
            this.companySalary = response[0];
            if (this.subEntityList) {
                this.subEntityList.refreshList(true);
            }
            done('Sist lagret: ');
            this.saveactions[0].disabled = false;
        }, error => {
            this.log('Fikk ikke lagret aga og virksomheter: ', error);
            this.saveactions[0].disabled = false;
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

    //#endregion Test data
}
