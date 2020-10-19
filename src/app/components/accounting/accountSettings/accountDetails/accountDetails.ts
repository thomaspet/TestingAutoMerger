import {Component, Input, Output, EventEmitter, SimpleChange, OnInit} from '@angular/core';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {
    Account, VatType, AccountGroup, VatDeductionGroup,
    DimensionSettings, AccountMandatoryDimension, SaftMappingAccount
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
    AccountMandatoryDimensionService
} from '../../../../services/services';
import { DimensionSettingsService } from '@app/services/common/dimensionSettingsService';
import {getNewGuid} from '@app/components/common/utils/utils';
import {RequestMethod} from '@uni-framework/core/http';

import * as _ from 'lodash';
import {theme, THEMES} from 'src/themes/theme';
import {FeaturePermissionService} from '@app/featurePermissionService';

@Component({
    selector: 'account-details',
    templateUrl: './accountDetails.html'
})
export class AccountDetails implements OnInit {
    @Input() public inputAccount: Account;
    @Output() public accountSaved = new EventEmitter<Account>();
    @Output() public changeEvent = new EventEmitter<Account>();

    account$ = new BehaviorSubject(null);
    dimensions$ = new BehaviorSubject({});
    private currencyCodes: Array<any> = [];
    private vattypes: Array<any> = [];
    private accountGroups: AccountGroup[];
    private vatDeductionGroups: any[];
    private saftMappingAccounts: SaftMappingAccount[];

    fields$ = new BehaviorSubject(this.getFormFields());

    dimensionsFormVisible: boolean;
    dimensionsFields$ = new BehaviorSubject([]);

    invalidateDimensionsCache = false;
    canDeleteAccount: boolean;

    constructor(
        private permissionService: FeaturePermissionService,
        private accountService: AccountService,
        private currencyCodeService: CurrencyCodeService,
        private vatTypeService: VatTypeService,
        private accountGroupService: AccountGroupService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private vatDeductionGroupService: VatDeductionGroupService,
        private costAllocationService: CostAllocationService,
        private dimensionSettingsService: DimensionSettingsService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
    ) {}

    public ngOnInit() {
        this.setup();
    }

    ngOnDestroy() {
        this.account$.complete();
        this.dimensions$.complete();
        this.fields$.complete();
        this.dimensionsFields$.complete();
    }

    private setup() {
        forkJoin(
            this.currencyCodeService.GetAll(null),
            this.vatTypeService.GetAll(null),
            this.accountGroupService.GetAll('orderby=GroupNumber'),
            this.vatDeductionGroupService.GetAll(null),
            this.accountService.getSaftMappingAccounts()
        ).subscribe(
            (dataset) => {
                this.currencyCodes = dataset[0];
                this.vattypes = dataset[1];
                this.accountGroups = dataset[2].filter(
                    x => x.GroupNumber !== null && x.GroupNumber.toString().length === 3
                );
                this.vatDeductionGroups = dataset[3];
                this.saftMappingAccounts = dataset[4];

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
            this.updateFieldVisibility();
        } else {
            this.getAccount(this.inputAccount.ID).subscribe(
                dataset => {
                    this.account$.next(dataset);
                    this.extendFormConfig();
                    this.setDimensionsForm();
                    this.updateFieldVisibility();

                    if (this.permissionService.canShowUiFeature('ui.accounting.advanced-account-settings')) {
                        this.accountService.Action(
                            this.inputAccount.ID, 'is-account-used', null, RequestMethod.Get
                        ).subscribe(used =>  {
                            this.canDeleteAccount = !used;
                        });

                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    updateFieldVisibility() {
        const account = this.account$.value;
        const fields = this.fields$.value || [];

        // Bruno wants some fields readonly, but they still need to be editable when creating new accounts
        if (theme.theme === THEMES.EXT02) {
            const accountNumberField = fields.find(f => f.Property === 'AccountNumber');
            const vatCodeField = fields.find(f => f.Property === 'VatTypeID');

            accountNumberField.ReadOnly = account?.ID > 0;
            vatCodeField.ReadOnly = account?.ID > 0;
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

        const saftMappingAccount: UniFieldLayout = fields.find(x => x.Property === 'SaftMappingAccountID');
        saftMappingAccount.Options = {
            source: this.saftMappingAccounts,
            template: (data: SaftMappingAccount) => `${data.AccountID} - ${data.Description}`,
            valueProperty: 'ID'
        };

        this.setSynchronizeVisibility(account, fields);
        this.fields$.next(fields);
    }

    public setDimensionsForm() {
        if (!this.permissionService.canShowUiFeature('ui.dimensions')) {
            return;
        }

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

            this.dimensionsFormVisible = true;
            this.dimensionsFields$.next(fields);
            if (this.account$.getValue()) {
                const dimensions = {};
                this.account$.getValue().MandatoryDimensions.forEach(md => {
                    dimensions['dim' + md.DimensionNo] = md.MandatoryType;
                });
                this.dimensions$.next(dimensions);
            } else {
                this.dimensions$.next({});
            }

        });
    }

    public onDimensionsChange(event /*change: SimpleChange*/) {
        const change = event as SimpleChange;
        this.invalidateDimensionsCache = true;
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
            const mandatoryDimensions = account.MandatoryDimensions;
            const mandatoryDimension = _.find(mandatoryDimensions, (md: AccountMandatoryDimension) => md.DimensionNo === dim);
            if (mandatoryDimension) {
                mandatoryDimension.MandatoryType = value;
            } else {
                const newMandatoryDimension = new AccountMandatoryDimension();
                newMandatoryDimension._createguid = getNewGuid();
                newMandatoryDimension.MandatoryType = value;
                newMandatoryDimension.DimensionNo = dim;
                newMandatoryDimension.AccountID = account.ID;
                account.MandatoryDimensions.push(newMandatoryDimension);
            }
        });
        this.changeEvent.next();
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
                'MandatoryDimensions'
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
                            if (this.invalidateDimensionsCache) {
                                this.accountMandatoryDimensionService.invalidateMandatoryDimensionsCache();
                                this.invalidateDimensionsCache = false;
                            }
                            this.account$.next(response);
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
                            if (this.invalidateDimensionsCache) {
                                this.accountMandatoryDimensionService.invalidateCache();
                                this.invalidateDimensionsCache = false;
                            }
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
                        if (this.invalidateDimensionsCache) {
                            this.accountMandatoryDimensionService.invalidateMandatoryDimensionsCache();
                            this.invalidateDimensionsCache = false;
                        }
                        this.account$.next(response);
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
                        if (this.invalidateDimensionsCache) {
                            this.accountMandatoryDimensionService.invalidateMandatoryDimensionsCache();
                            this.invalidateDimensionsCache = false;
                        }
                        this.account$.next(response);
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
                    title: 'SALES.RECURRING_INVOICE.MISSING_DIM_TOAST_TITLE',
                    message: res,
                    type: ToastType.warn,
                    duration: 5
                });
            }
        });
    }

    private getFormFields() {
        const fields: any[] = [
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
                FeaturePermission: 'ui.accounting.advanced-account-settings',
            },
            {
                FieldSet: 1,
                Legend: 'Konto',
                EntityType: 'Account',
                Property: 'SaftMappingAccountID',
                FieldType: FieldType.DROPDOWN,
                Label: 'SAF-T kobling',
                Tooltip: {
                    Text: 'Kobler kontoen til saf-t standard konto'
                },
                FeaturePermission: 'ui.accounting.advanced-account-settings',
            },
            // Fieldset 2 (details)
            {
                FieldSet: 2,
                Legend: 'Detaljer',
                EntityType: 'Account',
                Property: 'SystemAccount',
                FieldType: FieldType.CHECKBOX,
                Label: 'Systemkonto',
                FeaturePermission: 'ui.accounting.advanced-account-settings',
            },
            {
                FieldSet: 2,
                Legend: 'Detaljer',
                EntityType: 'Account',
                Property: 'UsePostPost',
                FieldType: FieldType.CHECKBOX,
                Label: 'PostPost',
                FeaturePermission: 'ui.accounting.advanced-account-settings',
            },
            {
                FieldSet: 2,
                Legend: 'Detaljer',
                EntityType: 'Account',
                Property: 'CostAllocationID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Fordelingsnøkkel',
                FeaturePermission: 'ui.accounting.costallocation',
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
                FeaturePermission: 'ui.accounting.vat-deduction-settings',
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
            },
            {
                FieldSet: 5,
                Legend: 'Kontohjelp',
                EntityType: 'Account',
                Property: 'Keywords',
                FieldType: FieldType.TEXT,
                Label: 'Søkeord',
                Tooltip: {
                    Text: 'Kommaseparert liste med ord som kan søkes på for å finne denne kontoen'
                },
            },
            {
                FieldSet: 5,
                Legend: 'Kontohjelp',
                EntityType: 'Account',
                Property: 'Description',
                FieldType: FieldType.TEXTAREA,
                MaxLength: 255,
                Label: 'Beskrivelse',
            }
        ];

        return fields;
    }

    deleteAccount(): void {
        const account = this.account$.getValue();
        this.accountService
            .Remove(account.ID).subscribe((response) => {
                this.toastService.addToast('Konto ble slettet', ToastType.good, 5);
                this.account$.next(response);
                this.accountSaved.emit(account);
                this.dimensions$.next({});
            },
            (error) => {
                this.errorService.handle(error);
            });
    }

}
