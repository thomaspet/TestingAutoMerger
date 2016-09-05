import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {SubEntityList} from './subEntityList';
import {FieldType, CompanySalary, Account} from '../../../unientities';
import {CompanySalaryService, AccountService} from '../../../services/services';

declare var _; // lodash

@Component({
    selector: 'aga-and-subentities-settings',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/agaAndSubEntitySettings.html',
    providers: [
        CompanySalaryService,
        AccountService
    ],
    directives: [UniForm, UniSave, SubEntityList]
})

export class AgaAndSubEntitySettings implements OnInit {
    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(SubEntityList) public subEntityList: SubEntityList;

    public showSubEntities: boolean = true;

    private fields: UniFieldLayout[] = [];
    public formConfig: any = {};

    private companySalary: CompanySalary;
    private accounts: Account[] = [];
    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre aga og virksomheter',
            action: this.saveAgaAndSubEntities.bind(this),
            main: true,
            disabled: false
        }
    ];

    public busy: boolean;

    // TODO Use service instead of Http, Use interfaces!!
    constructor(
        private companySalaryService: CompanySalaryService,
        private accountService: AccountService
    ) {

    }

    public ngOnInit() {
        this.getDataAndSetupForm();
    }

    private getDataAndSetupForm() {
        this.busy = true;
        Observable.forkJoin(
            this.companySalaryService.getCompanySalary(),
            this.accountService.GetAll('')
        ).subscribe(
            (dataset: any) => {
                let [companysalaries, accounts] = dataset;
                this.companySalary = companysalaries[0];
                this.accounts = accounts;
                this.buildForm();
                this.busy = false;
            },
            error => {
                this.log('fikk ikke hentet kontoer: ', error);
                this.busy = false;
            }
            );
    }

    private buildForm() {
        var mainAccountAlocatedAga = new UniFieldLayout();

        mainAccountAlocatedAga.Label = 'Konto avsatt aga';
        mainAccountAlocatedAga.EntityType = 'CompanySalary';
        mainAccountAlocatedAga.Property = 'MainAccountAllocatedAGA';
        mainAccountAlocatedAga.FieldType = FieldType.AUTOCOMPLETE;
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
        mainAccountCostAgaVacation.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        var freeAmount = new UniFieldLayout();

        freeAmount.EntityType = 'CompanySalary';
        freeAmount.Label = 'Fribeløp';
        freeAmount.Property = 'FreeAmount';
        freeAmount.FieldType = FieldType.TEXT;

        var interrimRemit = new UniFieldLayout();

        interrimRemit.EntityType = 'CompanySalary';
        interrimRemit.Label = 'Mellomkonto remittering';
        interrimRemit.Property = 'InterrimRemitAccount';
        interrimRemit.FieldType = FieldType.AUTOCOMPLETE;
        interrimRemit.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        this.fields = [
            mainAccountAlocatedAga,
            mainAccountCostAga,
            mainAccountAllocatedAgaVacation,
            mainAccountCostAgaVacation,
            freeAmount,
            interrimRemit];

    }

    public saveAgaAndSubEntities(done) {
        this.saveactions[0].disabled = true;
        if (!this.companySalary.PaymentInterval) {
            this.companySalary.PaymentInterval = 1;
        }
        let request = this.subEntityList ?
            Observable.forkJoin(this.companySalaryService.Put(this.companySalary.ID, this.companySalary), this.subEntityList.saveSubEntity()) :
            Observable.forkJoin(this.companySalaryService.Put(this.companySalary.ID, this.companySalary));
        done('Lagret innstillinger for aga og virksomheter');
        request.subscribe((response: any) => {
            this.companySalary = response[0];
            if (this.subEntityList) {
                this.subEntityList.refreshList();
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
