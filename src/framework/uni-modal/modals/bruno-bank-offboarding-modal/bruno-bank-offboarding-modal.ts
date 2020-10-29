import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { BankAccount, CompanySettings } from '@uni-entities';
import { theme, THEMES } from 'src/themes/theme';
import { AuthService } from '@app/authService';
import { NumberFormat } from '@app/services/common/numberFormatService';
import { BankService } from '@app/services/accounting/bankService';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable/config/unitableColumn';


@Component({
    selector: 'bruno-bank-offboarding-modal',
    templateUrl: './bruno-bank-offboarding-modal.html',
    styleUrls: ['./bruno-bank-offboarding-modal.sass']
})
export class BrunoBankOffboardingModal implements IUniModal {
    @Input()
    options: IModalOptions = {};

    @Output()
    onClose = new EventEmitter();

    busy: boolean = true;

    isExt02Environment: boolean = theme.theme === THEMES.EXT02;

    allBankAccountsWithIntergration: BankAccount[] = [];

    bankAccount: BankAccount;
    deleteAccount: boolean;
    integrationSettingsToCancel: number = 0;

    cancelIngoing: boolean;
    cancelOutgoing: boolean;
    cancelStatements: boolean;

    mailForReceipt: string;

    tableConfig: UniTableConfig;

    constructor(
        private bankService: BankService,
        private authService: AuthService,
        private companySettingsService: CompanySettingsService,
        private numberFormat: NumberFormat) {}

    ngOnInit() {
        this.mailForReceipt = this.authService.currentUser.Email;
        this.bankAccount = this.options?.data?.account;
        this.deleteAccount = this.options?.data?.deleteAccount;

        if (this.deleteAccount) {
            this.cancelIngoing = this.bankAccount['HasIncoming'];
            this.cancelOutgoing = this.bankAccount['HasOutgoing'];
            this.cancelStatements = this.bankAccount['HasStatements'];
        }

        if (this.bankAccount) {
            this.bankAccount = this.bankService.mapBankIntegrationValues(this.bankAccount);
            this.busy = false;
        } else {
            this.companySettingsService.getCompanySettings().subscribe((companySettings: CompanySettings) => {
                companySettings.BankAccounts.forEach(bankAccount => {
                    if (bankAccount.IntegrationStatus) {
                        this.allBankAccountsWithIntergration.push(this.bankService.mapBankIntegrationValues(bankAccount));
                    }
                });
                this.setupTableConfig();
                this.busy = false;
            });
        }
    }

    confirmCancelation() {
        if (this.bankAccount) {
            this.integrationSettingsToCancel = this.cancelIngoing ?
                this.integrationSettingsToCancel + 1 : this.integrationSettingsToCancel;
            this.integrationSettingsToCancel = this.cancelOutgoing ?
                this.integrationSettingsToCancel + 2 : this.integrationSettingsToCancel;
            this.integrationSettingsToCancel = this.cancelStatements ?
                this.integrationSettingsToCancel + 4 : this.integrationSettingsToCancel;

            this.onClose.emit([this.bankAccount.ID, this.integrationSettingsToCancel, this.mailForReceipt]);
        } else {
            this.onClose.emit([null, null, this.mailForReceipt]);
        }
    }

    setupTableConfig() {
        this.tableConfig = new UniTableConfig('bruno-offborading-list-modal', false, true, 15)
        .setColumns([
            new UniTableColumn('BankAccountNumber', 'Konto', UniTableColumnType.Text)
                .setWidth('10rem')
                .setTemplate( (row) => this.numberFormat.asBankAcct(row.AccountNumber)),
            new UniTableColumn('BankStatementIntegration', 'Avstemming', UniTableColumnType.Text)
                .setAlignment('center')
                .setWidth('6rem')
                .setCls('bank-integration-class')
                .setTemplate( (row) => this.getIntegrationStatus(row, 'HasStatements')),
            new UniTableColumn('InboundIntegration', 'Innbet/KID', UniTableColumnType.Text)
                .setAlignment('center')
                .setWidth('6rem')
                .setCls('bank-integration-class')
                .setTemplate( (row) => this.getIntegrationStatus(row, 'HasIncoming')),
            new UniTableColumn('OutboundIntegration', 'Utbetaling', UniTableColumnType.Text)
                .setAlignment('center')
                .setWidth('6rem')
                .setCls('bank-integration-class')
                .setTemplate( (row) => this.getIntegrationStatus(row, 'HasOutgoing')),
        ])
        .setColumnMenuVisible(false)
        .setRowDraggable(false);
    }

    getIntegrationStatus(row: BankAccount, setting: string): string {
        if (row[setting]) {
            return '<i class="material-icons">check_circle_outline<i>';
        }
        return '-';
    }
}
