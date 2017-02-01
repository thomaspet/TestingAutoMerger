import {Component, Input, ViewChild, Output, EventEmitter, SimpleChange, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {Account, VatType, FieldType, AccountGroup} from '../../../../unientities';
import {
    ErrorService,
    AccountGroupService,
    VatTypeService,
    CurrencyService,
    AccountService
} from '../../../../services/services';

declare const _; // lodash

@Component({
    selector: 'account-details',
    templateUrl: 'app/components/settings/accountSettings/accountDetails/accountDetails.html'
})
export class AccountDetails implements OnInit {
    @Input() public inputAccount: Account;
    @Output() public accountSaved: EventEmitter<Account> = new EventEmitter<Account>();
    @Output() public changeEvent: EventEmitter<Account> = new EventEmitter<Account>();
    @ViewChild(UniForm) public form: UniForm;

    private account: Account = null;
    private currencies: Array<any> = [];
    private vattypes: Array<any> = [];
    private accountGroups: AccountGroup[];
    public config: any = {autofocus: true};
    public fields: any[] = this.getComponentLayout().Fields;

    constructor(
        private accountService: AccountService,
        private currencyService: CurrencyService,
        private vatTypeService: VatTypeService,
        private accountGroupService: AccountGroupService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.setup();
    }

    private setup() {

        Observable.forkJoin(
            this.currencyService.GetAll(null),
            this.vatTypeService.GetAll(null),
            this.accountGroupService.GetAll('orderby=GroupNumber')
        ).subscribe(
            (dataset) => {
                this.currencies = dataset[0];
                this.vattypes = dataset[1];
                this.accountGroups = dataset[2].filter(x => x.GroupNumber != null && x.GroupNumber.toString().length === 3);
                this.extendFormConfig();
            },
            err => this.errorService.handle(err)
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
                    err => this.errorService.handle(err)
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
            template: (data: AccountGroup) => `${data.GroupNumber} - ${data.Name}`,
            valueProperty: 'ID'
        };

        let accountNumber: UniFieldLayout = this.fields.find(x => x.Property === 'AccountNumber');
        accountNumber.Options = {
            events: {
                blur: () => {
                    if ((!this.account.ID || this.account.ID === 0 || !this.account.AccountGroupID) && this.account.AccountNumber.toString().length > 3) {
                        let expectedAccountGroupNo =  this.account.AccountNumber.toString().substring(0, 3);

                        let defaultAccountGroup = this.accountGroups.find(x => x.GroupNumber === expectedAccountGroupNo);

                        if (defaultAccountGroup) {
                            this.account.AccountGroupID = defaultAccountGroup.ID;
                        }

                        this.account = _.cloneDeep(this.account);
                    }
                }
            }
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
        // Doing this to prevent "Foreignkey does not match parent ID" error:
        if (this.account.AccountGroup && this.account.AccountGroupID !== this.account.AccountGroup.ID) {
            this.account.AccountGroup = null;
        }

        if (this.account.ID && this.account.ID > 0) {
            this.accountService
                .Put(this.account.ID, this.account)
                .subscribe(
                    (response) => {
                        completeEvent('Lagret');
                        this.accountSaved.emit(this.account);
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        this.errorService.handle(err);
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
                        this.errorService.handle(err);
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
                {
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
                {
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
                {
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
                {
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
                {
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
                {
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
                {
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
                {
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
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Account',
                    Property: 'UseDeductivePercent',
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
                {
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
                {
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
                {
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
