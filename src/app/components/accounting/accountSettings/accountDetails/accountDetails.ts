import {Component, Input, ViewChild, Output, EventEmitter, SimpleChange, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/forkJoin';
import {UniForm, UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {Account, VatType, AccountGroup} from '../../../../unientities';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';

import {
    ErrorService,
    AccountGroupService,
    VatTypeService,
    CurrencyCodeService,
    AccountService
} from '../../../../services/services';
declare var _;

@Component({
    selector: 'account-details',
    templateUrl: './accountDetails.html'
})
export class AccountDetails implements OnInit {
    @Input() public inputAccount: Account;
    @Output() public accountSaved: EventEmitter<Account> = new EventEmitter<Account>();
    @Output() public changeEvent: EventEmitter<Account> = new EventEmitter<Account>();
    @ViewChild(UniForm) public form: UniForm;

    private account$: BehaviorSubject<Account> = new BehaviorSubject(null);
    private currencyCodes: Array<any> = [];
    private vattypes: Array<any> = [];
    private accountGroups: AccountGroup[];
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject(this.getComponentLayout().Fields);

    constructor(
        private accountService: AccountService,
        private currencyCodeService: CurrencyCodeService,
        private vatTypeService: VatTypeService,
        private accountGroupService: AccountGroupService,
        private errorService: ErrorService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.setup();
    }

    private setup() {

        Observable.forkJoin(
            this.currencyCodeService.GetAll(null),
            this.vatTypeService.GetAll(null),
            this.accountGroupService.GetAll('orderby=GroupNumber')
        ).subscribe(
            (dataset) => {
                this.currencyCodes = dataset[0];
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
            this.account$.next(incomingAccount);
        } else {
            this.getAccount(this.inputAccount.ID)
                .subscribe(
                    dataset => this.account$.next(dataset),
                    err => this.errorService.handle(err)
                );
        }
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();
        let currencyCode: UniFieldLayout = fields.find(x => x.Property === 'CurrencyCodeID');
        currencyCode.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayProperty: 'Code',
            debounceTime: 200
        };

        let vattype: UniFieldLayout = fields.find(x => x.Property === 'VatTypeID');
        vattype.Options = {
            source: this.vattypes,
            valueProperty: 'ID',
            displayProperty: 'VatCode',
            debounceTime: 200,
            search: (searchValue: string = '') => {
                if (!searchValue) {
                    return [this.vattypes];
                } else {
                    return [this.vattypes.filter((vt) => vt.VatCode === searchValue
                        || vt.VatPercent.toString() === searchValue
                        || vt.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)];
                }
            },
            template: (vt: VatType) => vt ? `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` : ''
        };

        let accountGroup: UniFieldLayout = fields.find(x => x.Property === 'AccountGroupID');
        accountGroup.Options = {
            source: this.accountGroups,
            template: (data: AccountGroup) => `${data.GroupNumber} - ${data.Name}`,
            valueProperty: 'ID'
        };

        let accountNumber: UniFieldLayout = fields.find(x => x.Property === 'AccountNumber');
        accountNumber.Options = {
            events: {
                blur: () => {
                    let account = this.account$.getValue();
                    if ((!account.ID || account.ID === 0 || !account.AccountGroupID) && account.AccountNumber && account.AccountNumber.toString().length > 3) {
                        let expectedAccountGroupNo =  account.AccountNumber.toString().substring(0, 3);

                        let defaultAccountGroup = this.accountGroups.find(x => x.GroupNumber === expectedAccountGroupNo);

                        if (defaultAccountGroup) {
                            account.AccountGroupID = defaultAccountGroup.ID;
                        } else {
                            let defaultAccountGroup =
                                this.accountGroups
                                    .concat()
                                    .sort((a, b) => b.GroupNumber.localeCompare(a.GroupNumber))
                                    .find(x => x.GroupNumber < expectedAccountGroupNo);
                            if (defaultAccountGroup) {
                                account.AccountGroupID = defaultAccountGroup.ID;
                            }
                        }

                        this.account$.next(account);
                    }
                }
            }
        };
        this.fields$.next(fields);
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
        let account = this.account$.getValue();
        // Doing this to prevent "Foreignkey does not match parent ID" error:
        if (account.AccountGroup && account.AccountGroupID !== account.AccountGroup.ID) {
            account.AccountGroup = null;
        }

        if (!account.AccountNumber || !account.AccountName || !account.AccountGroupID) {
            this.toastService.addToast(
                'Kan ikke lagre, mangler informasjon',
                ToastType.bad,
                ToastTime.medium,
                'Du må velge minimum kontonummer, navn og velge en kontogruppe før du kan lagre');

            completeEvent('Lagring feilet');
            return;
        }

        if (account.ID && account.ID > 0) {
            this.accountService
                .Put(account.ID, account)
                .subscribe(
                    (response) => {
                        completeEvent('Lagret');
                        this.accountSaved.emit(account);
                    },
                    (err) => {
                        completeEvent('Feil ved lagring');
                        this.errorService.handle(err);
                    }
                );
        } else {
            this.accountService
                .Post(account)
                .subscribe(
                    (response) => {
                        completeEvent('Lagret');
                        this.accountSaved.emit(account);
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
            Fields: [
                // Fieldset 1 (account)
                {
                    FieldSet: 1,
                    Legend: 'Konto',
                    EntityType: 'Account',
                    Property: 'AccountNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Kontonr',
                },
                {
                    FieldSet: 1,
                    Legend: 'Konto',
                    EntityType: 'Account',
                    Property: 'AccountName',
                    FieldType: FieldType.TEXT,
                    Label: 'Kontonavn',
                },
                {
                    FieldSet: 1,
                    Legend: 'Konto',
                    EntityType: 'Account',
                    Property: 'VatTypeID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Mvakode',
                },
                {
                    FieldSet: 1,
                    Legend: 'Konto',
                    EntityType: 'Account',
                    Property: 'AccountGroupID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Kontogruppe',
                },
                {
                    FieldSet: 1,
                    Legend: 'Konto',
                    EntityType: 'Account',
                    Property: 'CurrencyCodeID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Valuta',
                },

                // Fieldset 2 (details)
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'Account',
                    Property: 'Alias',
                    FieldType: FieldType.TEXT,
                    Label: 'Alias',
                },
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'Account',
                    Property: 'SystemAccount',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Systemkonto',
                },
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'Account',
                    Property: 'UsePostPost',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'PostPost',
                },
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'Account',
                    Property: 'UseDeductivePercent',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Forholdsmessig mva',
                },

                // Fieldset 3 (valid)
                {
                    FieldSet: 3,
                    Legend: 'Gyldig',
                    EntityType: 'Account',
                    Property: 'Visible',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Synlig',
                },
                {
                    FieldSet: 3,
                    Legend: 'Gyldig',
                    EntityType: 'Account',
                    Property: 'Locked',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Sperret',
                },
                {
                    FieldSet: 3,
                    Legend: 'Gyldig',
                    EntityType: 'Account',
                    Property: 'LockManualPosts',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Sperre manuelle poster',
                }
            ]
        };
    }
}
