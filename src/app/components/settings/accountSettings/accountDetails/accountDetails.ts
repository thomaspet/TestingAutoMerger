import {Component, Input, ViewChild, Output, EventEmitter, SimpleChange, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {DimensionList} from '../dimensionList/dimensionList';
import {Account, VatType, FieldType, AccountGroup} from '../../../../unientities';
import {VatTypeService, CurrencyService, AccountService} from '../../../../services/services';
import {AccountGroupService} from '../../../../services/Accounting/AccountGroupService';

@Component({
    selector: 'account-details',
    templateUrl: 'app/components/settings/accountSettings/accountDetails/accountDetails.html'
})
export class AccountDetails implements OnInit {
    @Input() public inputAccount: Account;
    @Output() public accountSaved: EventEmitter<Account> = new EventEmitter<Account>();
    @Output() public onChange: EventEmitter<Account> = new EventEmitter<Account>();
    @ViewChild(UniForm) public form: UniForm;

    private account: Account = null;
    private currencies: Array<any> = [];
    private vattypes: Array<any> = [];
    private accountGroups: AccountGroup[];
    public config: any = {};
    public fields: any[] = this.getComponentLayout().Fields;

    constructor(
        private accountService: AccountService,
        private currencyService: CurrencyService,
        private vatTypeService: VatTypeService,
        private accountGroupService: AccountGroupService
    ) {}

    public ngOnInit() {
        this.setup();
    }

    private setup() {

        Observable.forkJoin(
            this.currencyService.GetAll(null),
            this.vatTypeService.GetAll(null),
            this.accountGroupService.GetAll(null)
         ).subscribe(
                (dataset) => {
                    this.currencies = dataset[0];
                    this.vattypes = dataset[1];
                    this.accountGroups = dataset[2];
                    this.extendFormConfig();
                },
                (error) => console.log(error)
            );
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        const incomingAccount = <Account>changes['inputAccount'].currentValue;
        if (!incomingAccount) {
            return;
        } else if (!incomingAccount.ID) {
            this.account = incomingAccount;
        } else {
            this.getAccount(this.inputAccount.ID)
                .subscribe(
                    dataset => {
                        this.account = dataset;
                    },
                    error => {
                        console.log(error);
                    }
                );
        }
    }

    private change(event) {

    }

    private extendFormConfig() {

        let currency: UniFieldLayout = this.fields.find(x => x.Property === 'CurrencyID');
        currency.Options = {
            source: this.currencies,
            valueProperty: 'ID',
            displayProperty: 'Code',
            debounceTime: 200
        };

        let vattype: UniFieldLayout = this.fields.find(x => x.Property === 'VatTypeID');
        vattype.Options = {
            source: this.vattypes,
            valueProperty: 'ID',
            displayProperty: 'VatCode',
            debounceTime: 200,
            search: (searchValue: string) => Observable.from([this.vattypes.filter((vt) => vt.VatCode === searchValue || vt.VatPercent.toString() === searchValue || vt.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)]),
            template: (vt: VatType) => vt ? `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` : ''
        };

        let accountGroup: UniFieldLayout = this.fields.find(x => x.Property === 'AccountGroupID');
        accountGroup.Options = {
            source: this.accountGroups,
            template: (data: AccountGroup) => data.Name,
            valueProperty: 'ID'
        };
    }

    public getAccount(ID: number) {
        return this.accountService
            .Get(ID, [
                'Alias',
                'Currency',
                'AccountGroup',
                'Dimensions',
                'Dimensions.Project',
                'Dimensions.Region',
                'Dimensions.Responsible',
                'Dimensions.Department'
            ]);
    }


    public saveAccount(completeEvent: any): void {
        if (this.account.ID > 0) {
            this.accountService
                .Put(this.account.ID, this.account)
                .subscribe(
                    (response) => {
                        completeEvent('Lagret');
                        this.accountSaved.emit(this.account);
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        console.log('Save failed: ', err);
                        alert('Feil ved lagring: ' + JSON.stringify(err));
                    }
                );
        } else {
            this.accountService
                .Post(this.account)
                .subscribe(
                    (response) => {
                        completeEvent('Lagret');
                        this.accountSaved.emit(this.account);
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        console.log('Save failed: ', err);
                        alert('Feil ved lagring: ' + JSON.stringify(err));
                    }
                );
        }
    }

    // TODO: change to 'ComponentLayout' when object respects the interface
    private getComponentLayout(): any {
        return {
            Name: 'AccountDetails',
            BaseEntity: 'Account',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'AccountNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontonr',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'AccountGroupID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontogruppe',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'AccountName',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontonavn',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'Alias',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Alias',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'CurrencyID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Valuta',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'VatTypeID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Mvakode',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'SystemAccount',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Systemkonto',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'UsePostPost',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'PostPost',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'UseDeductionPercent',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Forholdsvismoms',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'LockManualPosts',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sperre manuelle poster',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'Locked',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sperret',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                <UniFieldLayout>{
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'Visible',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Synlig',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                }
            ]
        };
    }
}
