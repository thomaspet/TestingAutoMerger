import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { CompanySettings } from '@app/unientities';
import { UniModalService } from '../../modalService';

@Component({
    selector: 'uni-brunoaccountsconfig-modal',
    templateUrl: './bank-accounts-config-modal.html',
    styleUrls: ['./bank-accounts-config-modal.sass']
})
export class ConfigBankAccountsModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Input() modalService: UniModalService;
    @Output() onClose = new EventEmitter();

    constructor(
        private companySettingsService: CompanySettingsService,
        private statisticsService: StatisticsService
    ) { }

    busy: boolean = true;
    setupFinished: boolean = false;
    errorMsg: string = '';

    SelectConfig: ISelectConfig;

    companySettings: CompanySettings;

    accountsReceived: number;
    initialBankAccounts: string[];
    availableAccounts: string[];

    standardAccount: string;
    standardAccountAllreadyUsed: boolean;

    hasSalary: boolean = false;
    taxAccount: string;
    taxAccountAllreadyUsed: boolean;

    salaryAccount: string;

    public ngOnInit() {
        this.SelectConfig = {
            template: (item) => typeof item === 'string' ? item.toString() : item,
            searchable: false,
            placeholder: 'velg konto'
        };

        this.initialBankAccounts = this.options.data;
        this.accountsReceived = this.initialBankAccounts.length;
        this.checkForExistingCompanyAccounts();
    }

    private checkForExistingCompanyAccounts() {
        this.companySettingsService.getCompanySettings()
            .subscribe((settings) => {
                this.companySettings = settings;

                this.standardAccount = this.companySettings?.CompanyBankAccount?.AccountNumber;
                this.taxAccount = this.companySettings?.TaxBankAccount?.AccountNumber;
                this.salaryAccount = this.companySettings?.SalaryBankAccount?.AccountNumber;

                Observable.forkJoin(
                    this.bankAccountIsUsed(this.standardAccount),
                    this.bankAccountIsUsed(this.taxAccount),
                    this.bankAccountIsUsed(this.salaryAccount)
                ).subscribe(([standardAccountIsUsed, taxAccountIsUsed, salaryAccountIsUsed]) => {
                    if (this.standardAccount) {
                        if (standardAccountIsUsed) {
                            this.standardAccountAllreadyUsed = true;
                            this.removeUsedAccount(this.standardAccount);
                        } else if (!this.initialBankAccounts.find(y => y === this.standardAccount)) {
                            this.initialBankAccounts.push(this.standardAccount);
                        }
                    }
                    if (this.taxAccount) {
                        if (taxAccountIsUsed) {
                            this.standardAccountAllreadyUsed = true;
                            this.removeUsedAccount(this.taxAccount);
                        } else if (!this.initialBankAccounts.find(y => y === this.taxAccount)) {
                            this.initialBankAccounts.push(this.taxAccount);
                        }
                    }
                    if (this.salaryAccount) {
                        if (salaryAccountIsUsed) {
                            this.removeUsedAccount(this.salaryAccount);
                        } else if (!this.initialBankAccounts.find(y => y === this.salaryAccount)) {
                            this.initialBankAccounts.push(this.salaryAccount);
                        }
                    }

                    const otherCompanyAccounts = this.companySettings.BankAccounts
                        .filter(x =>
                            x.AccountNumber !== this.standardAccount &&
                            x.AccountNumber !== this.taxAccount &&
                            x.AccountNumber !== this.salaryAccount
                        );

                    for (let x = 0; x < otherCompanyAccounts.length; x++) {
                        if ((!this.initialBankAccounts.find(y => y === otherCompanyAccounts[x].AccountNumber))) {
                            this.initialBankAccounts.push(otherCompanyAccounts[x].AccountNumber);
                        }
                    }

                    this.updateForm();
                    this.busy = false;
                });
            });
    }

    private removeUsedAccount(accountMuber: string) {
        this.initialBankAccounts = this.initialBankAccounts
            .filter(y => y !== accountMuber);
    }

    private bankAccountIsUsed(AccountNumber: string): Observable<boolean> {
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

    public close(emitValue?: boolean) {
        const nonConfigedAccounts = this.availableAccounts;
        let res: any[];
        if (emitValue) {
            res = [
                {
                    item1: this.standardAccount,
                    item2: 1920
                }
            ];
            if (this.taxAccount) {
                res.push(
                    {
                        item1: this.taxAccount,
                        item2: 1950
                    }
                );
            }
            nonConfigedAccounts.forEach(x => res.push({
                item1: x,
                item2: 0
            }))
            this.onClose.emit(res);
        } else {
            this.onClose.emit(null);
        }
    }

    public updateForm() {
        this.updateAvailableAccounts();
        this.setupFinished = !this.hasSalary || (this.hasSalary && !!this.taxAccount);
    }

    private updateAvailableAccounts(): void {
        this.availableAccounts = this.initialBankAccounts
            .filter(x => x !== this.standardAccount && x !== this.taxAccount);
    }

    toggleTaxAccountField(show: boolean) {
        this.hasSalary = show;
        if (!show && !this.taxAccountAllreadyUsed) {
            this.taxAccount = this.companySettings?.TaxBankAccount?.AccountNumber;
        }
        this.updateForm();
    }
}
