import {Component, ViewChild} from '@angular/core';
import {IUniSaveAction} from '../../../../framework/save/save';
import {URLSearchParams} from '@angular/http';
import {SettingsService} from '../settings-service';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {BankService, ErrorService, AccountService, BankAccountService} from '../../../services/services';
import {UniModalService, UniConfirmModalV2, ConfirmActions, UniBankAccountModal} from '../../../../framework/uni-modal';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Observable';
import { UnitableAutocomplete } from '@uni-framework/ui/unitable/controls/autocomplete';
import { first } from 'rxjs/operator/first';
import { CompanyBankAccount, BankAccount } from '@uni-entities';

@Component({
    selector: '',
    template: `
        <uni-table
            [attr.aria-busy]="busy"
            [resource]="data"
            [config]="tableConfig"
            (rowDeleted)="deleteSettings($event.rowModel)">
        </uni-table>
    `
})

export class UniBankSettings {

    @ViewChild(UniTable)
    private table: UniTable;

    private tableConfig: UniTableConfig;
    private lookupFunction;
    private data: any = [];
    private suggestedNames = ['Driftskonto', 'Konto for lønn', 'Valutakonto', 'Skattetrekkskonto', 'EURO']; // Backend? Needed?
    private yesno = ['Ja', 'Nei'];
    private accounts;
    private hasUnsavedChanges: boolean = false;
    private busy: boolean = false;
    private isClosing: boolean = false;


    constructor(
        private settingsService: SettingsService,
        private bankService: BankService,
        private errorService: ErrorService,
        private accountService: AccountService,
        private bankAccountService: BankAccountService,
        private toastService: ToastService,
        private modalService: UniModalService
    ) {
        this.setUpTable();
        this.updateSaveActions();
    }

    private setUpTable() {
        this.bankService.getCompanyBankAccount(
            'companybankaccounts?expand=Account,Account.CurrencyCode,BankAccount,BankAccount.Bank')
            .subscribe(res => {
                if (!res.length) {
                    res.push({ IsTax: true, IsIncomming: true, IsOutgoing: true, IsSalary: true });
                }
                this.data = res;
            });

        this.tableConfig = new UniTableConfig('settings.banksettings', true, false)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setColumns([
                new UniTableColumn('Name', 'Navn').setType(UniTableColumnType.Typeahead)
                .setWidth('200px')
                .setOptions({
                    lookupFunction: (searchValue) => {
                        return Observable.of(this.suggestedNames.filter(
                            x => x.indexOf(searchValue) !== -1)
                        );
                    },
                    itemTemplate: (item) => {
                        return item;
                    },
                    itemValue: (item) => {
                        return item;
                    }
                }),
                new UniTableColumn('BankAccount', 'Kontonr', UniTableColumnType.Lookup)
                .setWidth('250px')
                .setDisplayField('BankAccount.AccountNumber')
                .setOptions({
                    itemTemplate: (item) => {
                        if (item && item.Bank) {
                            return (item.AccountNumber + ' - ' + item.Bank.Name);
                        }
                        return item.AccountNumber;
                    },
                    lookupFunction: (query) => {
                        return this.bankAccountService.GetAll(
                            `filter=(startswith(AccountNumber,'${query}'))`
                            + ` and (BankAccountType ne 'Customer' and BankAccountType ne 'Supplier')`
                            + `&expand=Bank,Account,Account.CurrencyCode&top=15`
                        ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                    },
                    addNewButtonVisible: true,
                    addNewButtonText: 'Ny konto',
                    addNewButtonCallback: (res) => {
                        this.modalService.open(UniBankAccountModal,
                            { data: {
                                _ibanAccountSearch : document.getElementsByClassName('uniAutocomplete_input')[0]['value'],
                                _fromBankSettings: true
                            } }
                        ).onClose.subscribe((account) => {
                            if (account) {
                                this.bankAccountService.Post<BankAccount>(account).subscribe((savedAccount: any) => {
                                    this.toastService.addToast('Ny konto lagret', ToastType.good, 4);

                                    const row = this.table.getCurrentRow();
                                    row.BankAccount = savedAccount;
                                    row.BankAccountID = savedAccount.ID;
                                    this.table.updateRow(row._originalIndex, row);
                                }, (err) => { this.toastService.addToast('Kunne ikke lagre konto. Prøv igjen', ToastType.bad); });
                            }
                        });
                    },
                    alwaysShowDropdown: true,
                    showEditOnLine: true,
                    editOnLineCallBack: (acc) => {
                        acc._fromBankSettings = true;
                        this.modalService.open(UniBankAccountModal, { data: acc }).onClose.subscribe((account) => {
                            if (account) {
                                this.bankAccountService.Put<BankAccount>(account.ID, account).subscribe((savedAccount: any) => {
                                    this.toastService.addToast('Ny konto lagret', ToastType.good, 4);

                                    const row = this.table.getCurrentRow();
                                    row.BankAccount = savedAccount;
                                    row.BankAccountID = savedAccount.ID;
                                    this.table.updateRow(row._originalIndex, row);
                                }, (err) => { this.toastService.addToast('Kunne ikke oppdatere konto. Prøv igjen', ToastType.bad); });
                            }
                        });
                    },
                    deleteOnLineCallBack: (acc) => {
                        this.modalService.open(UniConfirmModalV2,
                        {
                            header: 'Slette bankkonto?',
                            message: 'Er du sikker på at du vil slette denne bankkontoen?',
                            buttonLabels: {
                                accept: 'Ja',
                                reject: 'Avbryt'
                            }
                        }).onClose.subscribe((res) => {
                            if (res === ConfirmActions.ACCEPT) {
                                this.bankAccountService.deleteBankAccount(acc.ID).subscribe((response) => {
                                    this.toastService.addToast('Bankkonto slettet', ToastType.good, 3);
                                }, (err) => {
                                    this.toastService.addToast('Sletting feilet', ToastType.bad, 3);
                                    this.errorService.handle(err);
                                });
                            }
                        });
                    }
                }),
                new UniTableColumn('BankAccount.Bank.Name', 'Bank').setEditable(false).setWidth('250px').setCls('unitable_greyed_text'),
                new UniTableColumn('Account', 'Hovedbok', UniTableColumnType.Lookup)
                .setWidth('120px')
                .setDisplayField('Account.AccountNumber')
                .setOptions({
                    itemTemplate: (item) => {
                        return (item.AccountNumber + ' - ' + item.AccountName);
                    },
                    lookupFunction: (query) => {
                        return this.accountService.GetAll(
                            `filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')&expand=CurrencyCode&top=15`
                        ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                    }
                }),
                new UniTableColumn('Account.CurrencyCode.Code', 'Valuta').setEditable(false).setCls('unitable_greyed_text'),
                new UniTableColumn('IsOutgoing', 'Utbet.').setType(UniTableColumnType.Select).setTemplate((row) => {
                    return row.IsOutgoing ? 'Ja' : 'Nei';
                })
                .setOptions({
                    itemTemplate: rowModel => rowModel,
                    resource: this.yesno
                }),
                new UniTableColumn('IsIncomming', 'Innbet.').setType(UniTableColumnType.Select).setTemplate((row) => {
                    return row.IsIncomming ? 'Ja' : 'Nei';
                })
                .setOptions({
                    itemTemplate: rowModel => rowModel,
                    resource: this.yesno
                }),
                new UniTableColumn('IsTax', 'Skattetrekk').setType(UniTableColumnType.Select).setTemplate((row) => {
                    return row.IsTax ? 'Ja' : 'Nei';
                })
                .setOptions({
                    itemTemplate: rowModel => rowModel,
                    resource: this.yesno
                }),
                new UniTableColumn('IsSalary', 'Lønn').setType(UniTableColumnType.Select)
                .setTemplate((row) => {
                    return row.IsSalary ? 'Ja' : 'Nei';
                })
                .setOptions({
                    itemTemplate: rowModel => rowModel,
                    resource: this.yesno
                }),
                new UniTableColumn('', 'Bankint').setWidth('60px'),
                new UniTableColumn('CreditAmount', 'Kreditt', UniTableColumnType.Money),
            ])
            .setDeleteButton(true)
            .setDefaultRowData({ IsTax: false, IsIncomming: false, IsOutgoing: false, IsSalary: false })
            .setChangeCallback(event => this.onEditChange(event));
    }

    private onEditChange(event) {
        this.hasUnsavedChanges = true;
        const row = event.rowModel;
        const allRows = this.table.getTableData();
        let isDuplicate = false;
        if (event.field === 'Account') {
            allRows.forEach((element) => {
                if (row && row.Account && row.Account.ID === element.AccountID) {
                    isDuplicate = true;
                    this.toastService.addToast(
                        'Hovedbokskonto allerede i bruk',
                        ToastType.warn,
                        10,
                        'En hovedkbokskonto kan kun brukes en gang. Vennligst velg en annen konto.'
                    );
                }
            });
            if (isDuplicate) {
                row.AccountID = null;
                row.Account = null;
            } else if (row && row.Account) {
                row.AccountID = row.Account.ID;
            } else {
                row.AccountID = null;
            }
        } else if (event.field === 'BankAccount') {
            if (event.rowModel.BankAccount) {
                allRows.forEach(element => {
                    if (row && row.BankAccount && row.BankAccount.ID === element.BankAccountID) {
                        isDuplicate = true;
                        this.toastService.addToast(
                            'Kontonummer allerede i bruk',
                            ToastType.warn,
                            10,
                            'Et kontonummer kan kun brukes en gang. Vennligst velg et annet.'
                        );
                    }
                });
                if (isDuplicate) {
                    row.BankAccount = null;
                    row.BankAccountID = null;
                } else {
                    row.BankAccountID = event.rowModel.BankAccount.ID;
                    if (event.rowModel.BankAccount.AccountID && event.rowModel.BankAccount.Account) {
                        row.AccountID = event.rowModel.BankAccount.AccountID;
                        row.Account = event.rowModel.BankAccount.Account;
                    }
                }
            }
        } else if (event.field === 'IsSalary' || event.field === 'IsTax' || event.field === 'IsIncomming' || event.field === 'IsOutgoing') {
            this.data = this.table.getTableData();
            this.data = this.data.map((line) => {
                if (line[event.field]) {
                    // Check if the lines has same currency codes
                    let lineCurrencyID = 0;
                    let rowModelCurrencyID = 0;
                    if (line.Account && line.Account.CurrencyCode) {
                        lineCurrencyID = line.Account.CurrencyCode.ID;
                    }

                    if (event.rowModel.Account && event.rowModel.Account.CurrencyCode) {
                        rowModelCurrencyID = event.rowModel.Account.CurrencyCode.ID;
                    }

                    if (lineCurrencyID === rowModelCurrencyID) {
                        line[event.field] = false;
                    }
                }
                return line;
            });

            if (event.originalIndex === this.data.length) {
                this.data.push({});
            }

            if (event.newValue === 'Ja') {
                row[event.field] = true;
                this.data[event.originalIndex][event.field] = true;
            } else {
                row[event.field] = false;
                this.data[event.originalIndex][event.field] = false;
            }
        }
        this.updateSaveActions();
        return row;
    }

    private saveSettings(event) {
        this.accounts = this.table.getTableData();
        let isMissingAccountID: boolean = false;
        // Check to see that all lines have AccountID
        this.accounts.forEach((account: CompanyBankAccount) => {
            if (!account.AccountID) {
                isMissingAccountID = true;
            }
        });
        if (isMissingAccountID) {
            this.toastService.addToast('Kan ikke lagre', ToastType.bad, 5,  'Alle linjer må ha hovedbokskonto');
            event('Ikke lagret, endringer kreves.');
        } else {
            this.busy = true;
            this.saveOneAccount(0, event);
        }
    }

    private saveOneAccount(index: number, event) {
        if (index >= this.accounts.length) {
            this.hasUnsavedChanges = false;
            this.updateSaveActions();
            if (!this.isClosing) {
                this.setUpTable();
                event('Lagring ferdig');
                this.busy = false;
            }
            return;
        }
        if (this.accounts[index].ID) {
            this.bankService.putCompanyBankAccount(this.accounts[index]).subscribe((res) => {
                this.saveOneAccount(++index, event);
            }, (err) => { this.errorService.handle(err); this.busy = false; });
        } else {
            this.bankService.postCompanyBankAccount(this.accounts[index]).subscribe((res) => {
                this.saveOneAccount(++index, event);
           }, (err) => { this.errorService.handle(err); this.busy = false; });
        }
    }

    private deleteSettings(row) {
        if (row.ID) {
            this.bankService.deleteCompanyBankAccount(row.ID).subscribe((res) => {
                this.toastService.addToast('Sletting vellykket', ToastType.good);
            }, (err) => { this.errorService.handle(err); });
        }
    }

    public updateSaveActions() {
        this.settingsService.setSaveActions([{
            label: 'Lagre',
            action: (event) => this.saveSettings(event),
            main: true,
            disabled: !this.hasUnsavedChanges
        }]);
    }

    public canDeactivate(): Observable<boolean> {
        this.isClosing = true;
        return !this.hasUnsavedChanges
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal()
                .onClose
                .map(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.saveSettings(() => {});
                    } else {
                        this.isClosing = false;
                    }
                    return result !== ConfirmActions.CANCEL;
                });
    }
}

