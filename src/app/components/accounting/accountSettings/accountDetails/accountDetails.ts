import {Component, Input, Output, EventEmitter, SimpleChange, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {
    Account, VatType, AccountGroup, VatDeductionGroup, CostAllocation,
    DimensionSettings, AccountManatoryDimension
} from '../../../../unientities';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';

import {
    ErrorService,
    AccountGroupService,
    VatTypeService,
    CurrencyCodeService,
    AccountService,
    VatDeductionGroupService,
    CostAllocationService,
    AccountManatoryDimensionService
} from '../../../../services/services';
import { DimensionSettingsService } from '@app/services/common/dimensionSettingsService';
import * as _ from 'lodash';
import { getNewGuid } from '@app/components/common/utils/utils';

@Component({
    selector: 'account-details',
    templateUrl: './accountDetails.html'
})
export class AccountDetails implements OnInit {
    @Input() public inputAccount: Account;
    @Output() public accountSaved: EventEmitter<Account> = new EventEmitter<Account>();
    @Output() public changeEvent: EventEmitter<Account> = new EventEmitter<Account>();

    public account$: BehaviorSubject<Account> = new BehaviorSubject(null);
    public dimensions$: BehaviorSubject<any> = new BehaviorSubject({});
    private currencyCodes: Array<any> = [];
    private vattypes: Array<any> = [];
    private accountGroups: AccountGroup[];
    private vatDeductionGroups: VatDeductionGroup[];
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject(this.getComponentLayout().Fields);
    public dimensionsConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public dimensionsFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    constructor(
        private accountService: AccountService,
        private currencyCodeService: CurrencyCodeService,
        private vatTypeService: VatTypeService,
        private accountGroupService: AccountGroupService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private vatDeductionGroupService: VatDeductionGroupService,
        private costAllocationService: CostAllocationService,
        private dimensionSettingsService: DimensionSettingsService,
        private accountMandatoryDimensionService: AccountManatoryDimensionService
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
                this.setDimensionsForm();
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
                    this.setDimensionsForm();
                },
                err => this.errorService.handle(err)
            );
        }
    }

    public onChange(event) {
        this.changeEvent.emit(event);
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
        costAllocation.Options = this.costAllocationService.getCostAllocationOptions(this.account$.asObservable());

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
                    const currentAccount = this.account$.getValue();
                    if (
                        (!currentAccount.ID || currentAccount.ID === 0 || !currentAccount.AccountGroupID)
                        && currentAccount.AccountNumber && currentAccount.AccountNumber.toString().length > 3
                    ) {
                        const expectedAccountGroupNo =  currentAccount.AccountNumber.toString().substring(0, 3);

                        const defaultAccountGroup = this.accountGroups.find(
                            x => x.GroupNumber === expectedAccountGroupNo
                        );

                        if (defaultAccountGroup) {
                            currentAccount.AccountGroupID = defaultAccountGroup.ID;
                        } else {
                            const defAccountGroup =
                                this.accountGroups
                                    .concat()
                                    .sort((a, b) => b.GroupNumber.localeCompare(a.GroupNumber))
                                    .find(x => x.GroupNumber < expectedAccountGroupNo);
                            if (defAccountGroup) {
                                currentAccount.AccountGroupID = defAccountGroup.ID;
                            }
                        }

                        this.account$.next(currentAccount);
                    }
                }
            }
        };
        this.setSynchronizeVisibility(account, fields);
        this.fields$.next(fields);
    }

    public setDimensionsForm() {
        this.dimensionSettingsService.GetAll('filter=isActive eq true').subscribe((dimensionSettings: DimensionSettings[]) => {
            const defaultFields = [
                <UniFieldLayout> {
                    FieldSet: 1,
                    Legend: 'Påkrevde dimensjoner',
                    Property: 'dim1',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Prosjekt',
                    Options: {
                        hideDeleteButton: true,
                        searchable: false,
                        valueProperty: 'ID',
                        displayProperty: 'Name',
                        source: [
                            {ID: 0, Name: 'Ikke satt'},
                            {ID: 1, Name: 'Påkrevd'},
                            {ID: 2, Name: 'Advarsel'}
                        ]
                    }
                },
                <UniFieldLayout> {
                    FieldSet: 1,
                    Legend: 'Påkrevde dimensjoner',
                    Property: 'dim2',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Avdeling',
                    Options: {
                        hideDeleteButton: true,
                        searchable: false,
                        valueProperty: 'ID',
                        displayProperty: 'Name',
                        source: [
                            {ID: 0, Name: 'Ikke satt'},
                            {ID: 1, Name: 'Påkrevd'},
                            {ID: 2, Name: 'Advarsel'}
                        ]
                    }
                }
            ];
            const fields = defaultFields.concat(dimensionSettings.map(dimensionSetting => {
                return <UniFieldLayout> {
                        FieldSet: 1,
                        Legend: 'Påkrevde dimensjoner',
                        Property: 'dim' + dimensionSetting.Dimension,
                        FieldType: FieldType.DROPDOWN,
                        Label: dimensionSetting.Label,
                        Options: {
                            hideDeleteButton: true,
                            searchable: false,
                            valueProperty: 'ID',
                            displayProperty: 'Name',
                            source: [
                                {ID: 0, Name: 'Ikke satt'},
                                {ID: 1, Name: 'Påkrevd'},
                                {ID: 2, Name: 'Advarsel'}
                            ]
                        }
                    };
            }));
            this.dimensionsFields$.next(fields);
            if (this.account$.getValue()) {
                const dimensions = {};
                this.account$.getValue().ManatoryDimensions.forEach(md => {
                    dimensions['dim' + md.DimensionNo] = md.ManatoryType;
                });
                this.dimensions$.next(dimensions);
            } else {
                this.dimensions$.next({});
            }

        });
    }

    public onDimensionsChange(change: SimpleChange) {
        const dimensions = this.dimensions$.getValue();
        const account = this.account$.getValue();
        const key = _.keys(change)[0];
        if (change[key].currentValue !== 0) {
            this.accountService.checkLinkedBankAccountsAndPostPost(account.AccountNumber).subscribe(hasLinkedBankAccounts => {
                if (hasLinkedBankAccounts || this.account$.getValue().UsePostPost === true) {
                    this.toastService.addToast(
                        'En eller flere hovedbokskontoer er knyttet mot enten PostPost eller bankkonto.',
                        ToastType.warn,
                        ToastTime.medium,
                        'Vi anbefaler at du ikke har påkrevd dimensjon på disse kontoene.'
                    );
                }
            });
        }
        _.each(dimensions, (value, property) => {
            const dim = parseInt(property.split('dim')[1], 10);
            const manatoryDimensions = account.ManatoryDimensions;
            const manatoryDimension = _.find(manatoryDimensions, (md: AccountManatoryDimension) => md.DimensionNo === dim);
            if (manatoryDimension) {
                manatoryDimension.ManatoryType = value;
            } else {
                const newManatoryDimension = new AccountManatoryDimension();
                newManatoryDimension._createguid = getNewGuid();
                newManatoryDimension.ManatoryType = value;
                newManatoryDimension.DimensionNo = dim;
                newManatoryDimension.AccountID = account.ID;
                account.ManatoryDimensions.push(newManatoryDimension);
            }
        });
    }

    private setSynchronizeVisibility(account: Account, fields) {
        if (!account) {
            return;
        }
        const doSynchronize: UniFieldLayout = fields.find(x => x.Property === 'DoSynchronize');
        if (account.AccountSetupID) {
            doSynchronize.Hidden = false;
        } else {
            doSynchronize.Hidden = true;
        }
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
                'Dimensions.Department',
                'ManatoryDimensions'
            ]);
    }

    public save(done?: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
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
                if (done) { done('Lagring feilet'); }   // completeEvent('Lagring feilet');
                resolve(false);
                return;
            }

            if (account.ID && account.ID > 0) {
                this.accountService
                    .Put(account.ID, account)
                    .subscribe(
                        (response) => {
                            // completeEvent('Lagret');
                            resolve(true);
                            this.accountSaved.emit(account);
                            this.checkRecurringInvoices(account.ID);
                        },
                        (err) => {
                            // completeEvent('Feil ved lagring');
                            resolve(false);
                            this.errorService.handle(err);
                        }
                    );
            } else {
                this.accountService
                    .Post(account)
                    .subscribe(
                        (response) => {
                            // completeEvent('Lagret');
                            resolve(true);
                            this.accountSaved.emit(account);
                        },
                        (err) => {
                            // completeEvent('Feil ved lagring');
                            resolve(false);
                            this.errorService.handle(err);
                        }
                    );
            }
            return;
        });

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
                        this.checkRecurringInvoices(account.ID);
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

    private checkRecurringInvoices(accountID: number) {
        this.accountMandatoryDimensionService.checkRecurringInvoices(accountID).subscribe((res) => {
            if (res) {
                this.toastService.toast({
                    title: 'Repeterende faktura(er) mangler dimensjon(er)',
                    message: res,
                    type: ToastType.warn,
                    duration: 5
                });
            }
        });
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
