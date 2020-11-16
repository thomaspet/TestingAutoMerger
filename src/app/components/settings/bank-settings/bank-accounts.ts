import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { UniModalService, IModalOptions, ConfirmActions, UniConfirmModalV2 } from '@uni-framework/uni-modal';
import { BankAccount, BankIntegrationAgreement, CompanySettings, StatusCodeBankIntegrationAgreement } from '@uni-entities';
import { CompanyBankAccountModal } from '../../common/modals/bank-account-modal/company-bank-account-modal';
import { trigger, transition, style, animate } from '@angular/animations';
import { BankAccountService, BrunoOnboardingService, BankService } from '@app/services/services';
import { theme, THEMES } from 'src/themes/theme';
import { UniNumberFormatPipe } from '@uni-framework/pipes/uniNumberFormatPipe';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable/config/unitableColumn';
import { BrunoBankOffboardingModal } from '@uni-framework/uni-modal/modals/bruno-bank-offboarding-modal/bruno-bank-offboarding-modal';
import {UniAccountTypePipe} from '@uni-framework/pipes/uniAccountTypePipe';

@Component({
    selector: 'bank-setttings-accountlist',
    templateUrl: './bank-accounts.html',
    styleUrls: ['./bank-accounts.sass'],
    animations: [
        trigger(
          'inOutAnimation',
          [
            transition(
              ':enter',
              [
                style({ width: 0, opacity: 0 }),
                animate('.3s ease-out',  style({ width: '36rem', opacity: 1 }))
              ]
            ),
            transition(
              ':leave',
              [
                style({ width: '36rem', opacity: 1 }),
                animate('.3s ease-in', style({ width: 0, opacity: 0 }))
              ]
            )
          ]
        )
      ]
})

export class BankSettingsAccountlist {

    @Input()
    companySettings: CompanySettings;

    @Input()
    agreements: any[];

    @Output()
    changeAccount = new EventEmitter();

    @Output()
    orderedIntegration = new EventEmitter();

    uniTableConfig: UniTableConfig;
    tabs = [ {name: 'Kontodetaljer'}, {name: 'Kobling mot bank'} ];

    orderIntegrationButtonText: string;
    isExt02Environment: boolean = theme.theme === THEMES.EXT02;
    hasPendingAgreement: boolean;
    bankAccount: BankAccount;
    activeIndex: number = 0;
    busy = false;

    constructor (
        private modalService: UniModalService,
        private cdr: ChangeDetectorRef,
        private toast: ToastService,
        private bankAccountService: BankAccountService,
        private brunoOnboardingService: BrunoOnboardingService,
        private bankService: BankService,
        private bankAccountPipe: UniNumberFormatPipe,
        private uniAccountTypePipe: UniAccountTypePipe,
    ) { }

    ngOnChanges() {
        this.setupUniTable();
    }

    setupUniTable() {
        this.orderIntegrationButtonText = this.getOrderIntegrationButtonText();
        this.hasPendingAgreement  = this.agreements ? this.agreementIsPending(this?.agreements[0]) : false;

        this.uniTableConfig = new UniTableConfig('settings.bank.accounts', false, false)
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setDeleteButton(false)
            .setColumns([
                new UniTableColumn('Label', 'Navn', UniTableColumnType.Text),
                new UniTableColumn('AccountNumber', 'Kontonr', UniTableColumnType.Text)
                    .setTemplate(row => {
                        const value = row.AccountNumber;
                        if (value && value.length === 11) {
                            const match = /(\d{4})(\d{2})(\d{5})/.exec(value);
                            if (match) {
                                return match.splice(1).join(' ');
                            }
                        }
                        return value;
                    }).setWidth('5rem'),
                new UniTableColumn('Account.AccountName', 'Hovedbokskonto', UniTableColumnType.Text)
                    .setTemplate(row => row.Account?.AccountNumber + ' - ' + row.Account?.AccountName),
                new UniTableColumn('BankAccountType', 'Type', UniTableColumnType.Text)
                    .setTemplate( (row) => this.uniAccountTypePipe.transform(row.BankAccountType))
                    .setAlignment('center')
                    .setWidth('4rem'),
                new UniTableColumn('_isStandard', 'Status', UniTableColumnType.Text)
                    .setTemplate( (row) => this.getIsStandardText(row))
                    .setCls('colored-pill-class')
                    .setAlignment('center')
                    .setWidth('5rem'),
                new UniTableColumn('IntegrationStatus', 'Kobling mot bank', UniTableColumnType.Link)
                    .setAlignment('center')
                    .setWidth('5rem')
                    .setCls('bank-integration-class')
                    .setTemplate( (row) => this.getIntegrationStatusText(row))
            ])
            .setContextMenu([
                {
                    action: (row) => { this.deleteAccount(row); },
                    label: 'Slett konto',
                    disabled: (row) => row._count
                },
                {
                    action: (row) => { this.setAsStandard(1, row); },
                    label: 'Sett som standard drift'
                },
                {
                    action: (row) => { this.setAsStandard(2, row); },
                    label: 'Sett som standard lønn',
                    disabled: (row) => row.ID === this.companySettings.SalaryBankAccountID
                },
                {
                    action: (row) => { this.removeStandard(2, row); },
                    label: 'Fjern som standard lønn',
                    disabled: (row) => row.ID !== this.companySettings.SalaryBankAccountID
                },
                {
                    action: (row) => { this.setAsStandard(3, row); },
                    label: 'Sett som standard skatt',
                    disabled: (row) => row.ID === this.companySettings.TaxBankAccountID
                },
                {
                    action: (row) => { this.removeStandard(3, row); },
                    label: 'Fjern som standard skatt',
                    disabled: (row) => row.ID !== this.companySettings.TaxBankAccountID
                },
            ]);
    }

    getIntegrationStatusText(row: BankAccount): string {
        if (!this.isExt02Environment) {
            if (row['HasIncoming'] || row['HasOutgoing'] || row['HasStatements']) {
                return '<i class="material-icons">check_circle_outline<i>';
            }
            return 'Ingen kobling';
        } else {
            if (!row['IntegrationStatus']) {
                return '';
            }

            if (row['IntegrationStatus'] === StatusCodeBankIntegrationAgreement.Active) {
                return '<i class="material-icons">check_circle_outline<i>';
            }

            if (row['IntegrationStatus'] === StatusCodeBankIntegrationAgreement.Pending) {
                return 'Avventer';
            }

            if (row['IntegrationStatus'] === StatusCodeBankIntegrationAgreement.Canceled) {
                return 'Kansellert';
            }
        }

        return '';
    }

    removeStandard(index: number, row: BankAccount) {
        if (index === 2) {
            this.companySettings.SalaryBankAccountID = null;
            this.companySettings.SalaryBankAccount = null;
        } else if (index === 3) {
            this.companySettings.TaxBankAccountID = null;
            this.companySettings.TaxBankAccount = null;
        }

        this.changeAccount.emit();

        this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];
        this.toast.addToast('Standardkonto endret', ToastType.info, 8, 'Standard konto fjernet fra bankinnstillinger. Husk å lagre innstillinger.');
    }

    setAsStandard(index: number, row: BankAccount) {

        if (row.ID === this.companySettings.CompanyBankAccountID) {
            this.toast.addToast('Konto er allerede standard', ToastType.info, 12, 'Denne konto er allerede standard driftskonto. Standard driftskonto brukes som standard for skatt og lønn også, om ikke de er definert.');
            return;
        }

        if (index === 1) {
            this.companySettings.CompanyBankAccountID = row.ID;
        } else if (index === 2) {
            this.companySettings.SalaryBankAccountID = row.ID;
        } else if (index === 3) {
            this.companySettings.TaxBankAccountID = row.ID;
        }

        this.changeAccount.emit();

        this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];
        this.toast.addToast('Standardkonto endret', ToastType.info, 8, 'Standard konto endret på bankinnstillinger. Husk å lagre innstillinger.');
    }

    deleteAccount(row) {
        if (!row.IntegrationStatus) {
            this.bankAccountService.Remove(row.ID).subscribe(() => {
                this.companySettings.BankAccounts.splice(this.companySettings.BankAccounts.findIndex(ba => ba.ID === row.ID), 1);
                this.toast.addToast('Bankkonto slettet', ToastType.good, 5);
                this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];
            }, err => {
                this.toast.addToast('Sletting feilet', ToastType.bad, 10, 'Kunne ikke slette konto. Pass på at konto ikke er standard.');
            });
        } else {
            const options: IModalOptions = {
                header: 'Slette konto',
                message: `Konto ${this.bankAccountPipe.transform(row.AccountNumber, 'bankacct')} ` +
                `er koblet mot bank. For å slette denne kontoen må koblingen avsluttes først. Ønsker du å avslutte kobling?`,
                buttonLabels: {
                    accept: 'Avslutt kobling',
                    reject: 'Avbryt'
                }
            };

            this.modalService.open(UniConfirmModalV2, options).onClose.subscribe((response) => {
                if (response === ConfirmActions.ACCEPT) {
                    this.cancelBankIntegration(row, true);
                }
            });
        }
    }

    public getOrderIntegrationButtonText(): string {
        if (this?.agreements[0]) {
            switch (this.agreements[0].StatusCode) {
                case StatusCodeBankIntegrationAgreement.Active: {
                    return 'Endre kobling mot bank';
                }
                case StatusCodeBankIntegrationAgreement.Pending: {
                    return ' Bestill kobling på nytt';
                }
            }
        } else {
            return 'Bestill kobling mot bank';
        }
        this.cdr.markForCheck();
    }

    public agreementIsPending(agreement: BankIntegrationAgreement) {
        return agreement ?
        agreement?.StatusCode === StatusCodeBankIntegrationAgreement.Pending || agreement?.HasOrderedIntegrationChange : false;
    }

    cancelBankIntegration(bankAccount: BankAccount, deleteAccount: boolean = false) {
        this.brunoOnboardingService.cancelBankIntegration(bankAccount, deleteAccount, BrunoBankOffboardingModal)
        .subscribe((bankAccounts: BankAccount[]) => {
            if (bankAccounts) {
                this.bankAccount = null;
                this.companySettings.BankAccounts = bankAccounts;

                if (deleteAccount) {
                    bankAccount.IntegrationStatus = null;
                    this.deleteAccount(bankAccount);
                }

                this.toast.addToast('Koblingen mot bank er oppdatert', ToastType.good, 5);
            }
        });
    }

    makeChangesToBankIntegration() {
        this.brunoOnboardingService.getAgreement().subscribe((agreement) => {
            if (agreement) {
                switch (agreement.StatusCode) {
                    case StatusCodeBankIntegrationAgreement.Active: {
                        this.brunoOnboardingService.RequestBankintegrationChange(agreement).subscribe((orderedChange) => {
                            if (orderedChange) {
                                this.agreements[0].HasOrderedIntegrationChange = true;
                                this.orderedIntegration.emit();
                            }
                        });
                        break;
                    }
                    case StatusCodeBankIntegrationAgreement.Pending: {
                        this.hasPendingAgreement = this.agreementIsPending(agreement);
                        this.brunoOnboardingService.restartOnboarding(agreement);
                        this.orderedIntegration.emit();
                        break;
                    }
                }
            }
        });
    }

    initiateBankIntegration() {
        this.brunoOnboardingService.getAgreement().subscribe((agreement) => {
            if (!agreement) {
                this.brunoOnboardingService.createAgreement().subscribe((createdAgreement: BankIntegrationAgreement) => {
                    if (createdAgreement) {
                        this.hasPendingAgreement = this.agreementIsPending(createdAgreement);
                        this.agreements = [ createdAgreement ];
                        this.orderedIntegration.emit();
                        this.orderIntegrationButtonText = this.getOrderIntegrationButtonText();
                    }
                });
            } else if (this.agreementIsPending(agreement)) {
                this.hasPendingAgreement = true;
                this.brunoOnboardingService.restartOnboarding(agreement);
                this.orderedIntegration.emit();
            }
        });
    }

    openBankAccountEditModal(bankaccount: BankAccount = new BankAccount) {

        bankaccount.BankAccountType = 'company';

        this.modalService.open(CompanyBankAccountModal, {
            data: { bankAccount: bankaccount },
            header: bankaccount?.ID ? 'Rediger bankkonto' : 'Legg til bankkonto',
            closeOnClickOutside: false
        }).onClose.subscribe((response) => {
            if (response) {
                this.companySettings.BankAccounts.push(response);

                if (response['_isStandard']) {
                    const index = response.BankAccountType === 'company' ? 1 : response.BankAccountType === 'salary' ? 2 : 3;
                    this.setAsStandard(index, response);
                } else {
                    this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];
                }
            }
        });
    }

    getIsStandardText(row): string {
        if (row.ID === this.companySettings.CompanyBankAccountID) {
            return 'Standard drift';
        } else if (row.ID === this.companySettings.SalaryBankAccountID) {
            return 'Standard lønn';
        } else if (row.ID === this.companySettings.TaxBankAccountID) {
            return 'Standard skatt';
        }

        return '';
    }

    onRowClick(row) {
        row['_isStandard'] = this.isStandard(row.ID);
        this.bankAccount = {...row};
    }

    setBusy(busy) {
        this.busy = busy;
    }

    savedFromSidemenu(response) {
        if (response) {
            const index = this.bankAccount['_originalIndex'];
            response = this.bankService.mapBankIntegrationValues(response, this.agreements);
            this.companySettings.BankAccounts.splice(index, 1, response);
            this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];

            const i = response.BankAccountType === 'company' ? 1 : response.BankAccountType === 'salary' ? 2 : 3;
            if (response['_hasChangedStandard'] && response['_isStandard']) {
                this.setAsStandard(i, response);
            } else if (response['_hasChangedStandard'] && this.isStandard(response.ID)) {
                this.removeStandard(i, response);
            }
            this.bankAccount = null;
        } else {
            this.bankAccount = null;
        }
    }

    isStandard(ID: number) {
        return ID === this.companySettings.CompanyBankAccountID ||
            ID === this.companySettings.SalaryBankAccountID ||
            ID === this.companySettings.TaxBankAccountID;
    }
}
