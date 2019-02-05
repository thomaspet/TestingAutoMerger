import {Component, Input, Output, EventEmitter, SimpleChange, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {Account, VatType, AccountGroup, VatDeductionGroup, CostAllocation} from '../../../../unientities';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';

import {
    ErrorService,
    AccountGroupService,
    VatTypeService,
    CurrencyCodeService,
    AccountService,
    VatDeductionGroupService,
    CostAllocationService
} from '../../../../services/services';

@Component({
    selector: 'account-details',
    templateUrl: './accountDetails.html'
})
export class AccountDetails implements OnInit {
    @Input() public inputAccount: Account;
    @Output() public accountSaved: EventEmitter<Account> = new EventEmitter<Account>();
    @Output() public changeEvent: EventEmitter<Account> = new EventEmitter<Account>();

    public account$: BehaviorSubject<Account> = new BehaviorSubject(null);
    private currencyCodes: Array<any> = [];
    private vattypes: Array<any> = [];
    private accountGroups: AccountGroup[];
    private vatDeductionGroups: VatDeductionGroup[];
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject(this.getComponentLayout().Fields);

    constructor(
        private accountService: AccountService,
        private currencyCodeService: CurrencyCodeService,
        private vatTypeService: VatTypeService,
        private accountGroupService: AccountGroupService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private vatDeductionGroupService: VatDeductionGroupService,
        private costAllocationService: CostAllocationService
    ) {}

    public ngOnInit() {
        this.setup();
    }

    private setup() {

        Observable.forkJoin(
            this.currencyCodeService.GetAll(null),
            this.vatTypeService.GetAll(null),
            this.accountGroupService.GetAll('orderby=GroupNumber'),
            this.vatDeductionGroupService.GetAll(null)
        ).subscribe(
            (dataset) => {
                this.currencyCodes = dataset[0];
                this.vattypes = dataset[1];
                this.accountGroups = dataset[2].filter(
                    x => x.GroupNumber !== null && x.GroupNumber.toString().length === 3
                );
                this.vatDeductionGroups = dataset[3];

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
            this.getAccount(this.inputAccount.ID).subscribe(
                dataset => {
                    this.account$.next(dataset);
                    this.extendFormConfig();
                },
                err => this.errorService.handle(err)
            );
        }
    }

    private extendFormConfig() {
        const fields = this.fields$.getValue();
        const currencyCode: UniFieldLayout = fields.find(x => x.Property === 'CurrencyCodeID');
        currencyCode.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayProperty: 'Code',
            debounceTime: 200
        };

        const account = this.account$.getValue();
        const costAllocation: UniFieldLayout = fields.find(x => x.Property === 'CostAllocationID');
        costAllocation.Options = this.costAllocationService.getCostAllocationOptions(account ? account.CostAllocationID : 0);

        const vattype: UniFieldLayout = fields.find(x => x.Property === 'VatTypeID');
        vattype.Options = {
            source: this.vattypes,
            valueProperty: 'ID',
            template: (vt: VatType) => vt ? `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` : ''
        };

        const vatDeductionGroup: UniFieldLayout = fields.find(x => x.Property === 'UseVatDeductionGroupID');
        vatDeductionGroup.Options = {
            source: this.vatDeductionGroups,
            valueProperty: 'ID',
            template: (vdg: VatDeductionGroup) => vdg ? vdg.Name : ''
        };

        const accountGroup: UniFieldLayout = fields.find(x => x.Property === 'AccountGroupID');
        accountGroup.Options = {
            source: this.accountGroups,
            template: (data: AccountGroup) => `${data.GroupNumber} - ${data.Name}`,
            valueProperty: 'ID'
        };

        const accountNumber: UniFieldLayout = fields.find(x => x.Property === 'AccountNumber');
        accountNumber.Options = {
            events: {
                blur: () => {
                    const account = this.account$.getValue();
                    if (
                        (!account.ID || account.ID === 0 || !account.AccountGroupID)
                        && account.AccountNumber && account.AccountNumber.toString().length > 3
                    ) {
                        const expectedAccountGroupNo =  account.AccountNumber.toString().substring(0, 3);

                        const defaultAccountGroup = this.accountGroups.find(
                            x => x.GroupNumber === expectedAccountGroupNo
                        );

                        if (defaultAccountGroup) {
                            account.AccountGroupID = defaultAccountGroup.ID;
                        } else {
                            const defAccountGroup =
                                this.accountGroups
                                    .concat()
                                    .sort((a, b) => b.GroupNumber.localeCompare(a.GroupNumber))
                                    .find(x => x.GroupNumber < expectedAccountGroupNo);
                            if (defAccountGroup) {
                                account.AccountGroupID = defAccountGroup.ID;
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
        const account = this.account$.getValue();
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
                    FieldType: FieldType.DROPDOWN,
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
                    Property: 'CostAllocationID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Fordelingsnøkkel'
                },
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'Account',
                    Property: 'DoSynchronize',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Synkronisér'
                },
                // Fieldset 3 (vatdeduction)
                {
                    FieldSet: 3,
                    Legend: 'Forholdsmessig fradrag MVA',
                    EntityType: 'Account',
                    Property: 'UseVatDeductionGroupID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Bruk satsgruppe',
                },
                // Fieldset 4 (valid)
                {
                    FieldSet: 4,
                    Legend: 'Gyldig',
                    EntityType: 'Account',
                    Property: 'Visible',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Synlig',
                },
                {
                    FieldSet: 4,
                    Legend: 'Gyldig',
                    EntityType: 'Account',
                    Property: 'Locked',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Sperret',
                },
                {
                    FieldSet: 4,
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
