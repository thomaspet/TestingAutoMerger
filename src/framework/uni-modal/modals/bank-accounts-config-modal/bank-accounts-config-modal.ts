import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { CompanySettings, BankAccount } from '@app/unientities';
import { ErrorService } from '@app/services/common/errorService';
import { BankAccountService } from '@app/services/accounting/bankAccountService';
import { NumberFormat } from '@app/services/common/numberFormatService';
import { BrowserStorageService } from '@uni-framework/core/browserStorageService';

@Component({
    selector: 'uni-brunoaccountsconfig-modal',
    templateUrl: './bank-accounts-config-modal.html',
    styleUrls: ['./bank-accounts-config-modal.sass']
})
export class ConfigBankAccountsModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();

    busy: boolean = true;
    setupFinished: boolean = false;
    showSalarySection: boolean = false;

    selectConfig: ISelectConfig;
    accountsReceivedCount: number;
    companySettings: CompanySettings;

    accounts: BankAccount[];
    unassignedAccounts: BankAccount[];

    standardAccount: BankAccount;
    taxAccount: BankAccount;

    standardAccountAlreadyUsed: boolean;
    taxAccountAlreadyUsed: boolean;

    isPopUp: boolean;
    notShowPopUpAgain: boolean;

    constructor(
        private numberFormatter: NumberFormat,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private statisticsService: StatisticsService,
        private bankAccountService: BankAccountService,
        private browserStorage: BrowserStorageService
    ) {}

    public ngOnInit() {
        this.selectConfig = {
            template: (item) => this.numberFormatter.asBankAcct(item.AccountNumber),
            searchable: false,
        };

        this.accounts = this.options.data?.accounts;
        this.isPopUp = this.options.data?.isPopUp;
        this.accountsReceivedCount = this.accounts.length;
        this.checkForExistingCompanyAccounts();
    }

    private checkForExistingCompanyAccounts() {
        this.companySettingsService.getCompanySettings().subscribe(settings => {
            this.companySettings = settings;

            this.standardAccount = this.companySettings?.CompanyBankAccount;
            this.taxAccount = this.companySettings?.TaxBankAccount;
            const salaryAccount = this.companySettings?.SalaryBankAccount;

            Observable.forkJoin(
                this.isBankAccountInUse(this.standardAccount?.AccountNumber),
                this.isBankAccountInUse(this.taxAccount?.AccountNumber),
                this.isBankAccountInUse(salaryAccount?.AccountNumber)
            ).subscribe(([standardAccountIsUsed, taxAccountIsUsed, salaryAccountIsUsed]) => {

                if (this.standardAccount) {
                    if (standardAccountIsUsed) {
                        this.standardAccountAlreadyUsed = true;
                        this.removeAccountFromList(this.standardAccount.AccountNumber);
                    } else {
                        this.addAccountToList(this.standardAccount);
                    }
                }

                if (this.taxAccount) {
                    if (taxAccountIsUsed) {
                        this.taxAccountAlreadyUsed = true;
                        this.removeAccountFromList(this.taxAccount.AccountNumber);
                    } else {
                        this.addAccountToList(this.taxAccount);
                    }
                }

                if (salaryAccount) {
                    if (salaryAccountIsUsed) {
                        this.removeAccountFromList(salaryAccount.AccountNumber);
                    } else {
                        this.addAccountToList(salaryAccount);
                    }
                }

                const otherCompanyAccounts = this.companySettings.BankAccounts.filter(account => {
                    return account.AccountNumber !== this.standardAccount?.AccountNumber
                        && account.AccountNumber !== this.taxAccount?.AccountNumber
                        && account.AccountNumber !== salaryAccount?.AccountNumber;
                });

                otherCompanyAccounts.forEach(account => this.addAccountToList(account));

                this.updateUnassignedAccounts();
                this.busy = false;
            });
        });
    }

    save() {
        const body = [{
            item1: this.standardAccount.AccountNumber,
            item2: 1920,
            item3: this.standardAccount['ServiceSettings'] || this.standardAccount['IntegrationSettings']
        }];

        if (this.taxAccount) {
            body.push({
                item1: this.taxAccount.AccountNumber,
                item2: 1950,
                item3: this.taxAccount['ServiceSettings'] || this.taxAccount['IntegrationSettings']
            });
        }

        this.unassignedAccounts.forEach(account => {
            body.push({
                item1: account.AccountNumber,
                item2: 0,
                item3: account['ServiceSettings'] || account['IntegrationSettings']
            });
        });

        this.busy = true;

        this.bankAccountService.createBankAccounts(body).subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    public onPopUpSelectionChange(notShowPopUpAgain) {
        notShowPopUpAgain.checked ?
        this.browserStorage.setItemOnCompany('notShowConnectAccoutsPopUpModal', true) : this.browserStorage.setItemOnCompany('notShowConnectAccoutsPopUpModal', false);
    }

    updateUnassignedAccounts() {
        this.unassignedAccounts = this.accounts.filter(account => {
            return account.AccountNumber !== this.standardAccount?.AccountNumber
                && account.AccountNumber !== this.taxAccount?.AccountNumber;
        });
    }

    toggleTaxAccountField(show: boolean) {
        this.showSalarySection = show;

        // Reset taxAccount to companySettings value when hiding.
        // (in case the user changed dropdown value before hiding the taxAccount section)
        if (!show && !this.taxAccountAlreadyUsed) {
            this.taxAccount = this.companySettings?.TaxBankAccount;
        }

        this.updateUnassignedAccounts();
    }

    private addAccountToList(account: BankAccount) {
        if (!this.accounts.some(a => a.AccountNumber === account.AccountNumber)) {
            this.accounts.push(account);
        }
    }

    private removeAccountFromList(accountNumber: string) {
        this.accounts = this.accounts.filter(a => a.AccountNumber !== accountNumber);
    }

    private isBankAccountInUse(AccountNumber: string): Observable<boolean> {
        if (AccountNumber) {
            return this.statisticsService.GetAll(
                'model=BankAccount' +
                '&select=count(Payment.Id)' +
                `&filter=AccountNumber eq '${AccountNumber}'` +
                '&join=BankAccount.Id eq Payment.FromBankAccountid' +
                '&top=1'
            ).map((data) => data.Data[0].countPaymentId > 0 ? true : false);
        }
        return Observable.of(false);
    }
}
