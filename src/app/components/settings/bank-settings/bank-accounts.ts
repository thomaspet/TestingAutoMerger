import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType, ICellClickEvent } from '@uni-framework/ui/unitable';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import { UniModalService, IModalOptions, ConfirmActions } from '@uni-framework/uni-modal';
import { BankAccount, CompanySettings, StatusCodeBankIntegrationAgreement } from '@uni-entities';
import {CompanyBankAccountModal} from './company-bank-account-modal';
import { trigger, transition, style, animate } from '@angular/animations';
import {BankAccountService} from '@app/services/services';
import { ConfigBankAccountsInfoModal } from '@uni-framework/uni-modal/modals/config-bank-accounts-info-modal/config-bank-accounts-info-modal';


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

    @Output()
    changeAccount = new EventEmitter();

    uniTableConfig: UniTableConfig;

    bankAccount: BankAccount;
    activeIndex: number = 0;
    busy = true;

    constructor (
        private modalService: UniModalService,
        private cdr: ChangeDetectorRef,
        private toast: ToastService,
        private bankAccountService: BankAccountService
    ) { }

    ngOnChanges() {
        this.setupUniTable();
    }

    setupUniTable() {
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
                    .setTemplate(row => row.Account.AccountNumber + ' - ' + row.Account.AccountName),
                new UniTableColumn('BankAccountType', 'Type', UniTableColumnType.Text)
                    .setTemplate( (row) => this.getAccountType(row))
                    .setAlignment('center')
                    .setWidth('4rem'),
                new UniTableColumn('_isStandard', 'Status', UniTableColumnType.Text)
                    .setTemplate( (row) => this.getIsStandardText(row))
                    .setCls('colored-pill-class')
                    .setWidth('5rem'),
                new UniTableColumn('IntegrationStatus', 'Kobling mot bank', UniTableColumnType.Link)
                    .setAlignment('center')
                    .setWidth('5rem')
                    .setTemplate( (row) => this.getIntegrationStatusText(row))
                    .setLinkClick((row) => {
                        this.activeIndex = 1;
                        this.bankAccount = {...row};
                    })

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
                    label: 'Sett som standard lønn'
                },
                {
                    action: (row) => { this.setAsStandard(3, row); },
                    label: 'Sett som standard skatt'
                }
            ]);
    }

    getIntegrationStatusText(row: BankAccount): string {
        if (!row['IntegrationStatus']) {
            return 'Bestill';
        }

        if (row['IntegrationStatus'] === StatusCodeBankIntegrationAgreement.Active) {
            return 'Koblet sammen';
        }

        if (row['IntegrationStatus'] > StatusCodeBankIntegrationAgreement.Active) {
            return 'Avventer';
        }

        if (row['IntegrationStatus'] === StatusCodeBankIntegrationAgreement.Canceled) {
            return 'Kansellert';
        }

        return '';
    }

    setAsStandard(index: number, row: BankAccount) {
        if (index === 1) {
            this.companySettings.CompanyBankAccountID = row.ID;
        } else if (index === 2) {
            this.companySettings.SalaryBankAccountID = row.ID;
        } else if (index === 3) {
            this.companySettings.TaxBankAccountID = row.ID;
        }

        this.changeAccount.emit();

        this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];
        this.toast.addToast('Standardkonto endret', ToastType.info, 8, 'Standard konto endret på bankinnstillinger. Husk å lagre innstillinger.')
    }

    deleteAccount(row) {
        this.bankAccountService.Remove(row.ID).subscribe(() => {
            this.companySettings.BankAccounts.splice(this.companySettings.BankAccounts.findIndex(ba => ba.ID === row.ID), 1);
            this.toast.addToast('Bankkonto slettet', ToastType.good, 5);
            this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];
        }, err => {
            this.toast.addToast('Sletting feilet', ToastType.bad, 10, 'Kunne ikke slette konto. Pass på at konto ikke er standard.');
        });
    }

    makeChanges() {
        const options: IModalOptions = {
            header: 'Endre oppsett på kobling til bank',
            message: 'Endringer i koblingen mot bank må gjøres i nettbanken. Vi sender deg videre til DNB bedrift hvor du kan gjøre de endringene du ønsker.',
            footerCls: 'center',
            buttonLabels: {
                accept: 'Til nettbanken',
                reject: 'Lukk'
            },
            buttonIcons: {
                accept: 'launch'
            },
            icon: 'themes/ext02/ext02-success-accountconfig.svg'
        };

        this.modalService.open(ConfigBankAccountsInfoModal, options).onClose.subscribe((response: ConfirmActions) => {
            if (response === ConfirmActions.ACCEPT) {
                window.open('https://www.dnb.no', '_blank');
            }
        });
    }

    connectBankAndAccounting() {
        const options: IModalOptions = {
            header: 'Koble sammen regnskap og bankkonto',
            message: 'Denne bestillingen må gjøres via nettbanken din i DNB Bedrift. Vi sender deg din TB-kode slik at du kommer rett inn i banken. Der må du velge hvilke konto di vil bestille kobling mot. <br/> <br/>'
            + 'Før vi sender deg videre trenger vi å vite om du ønsker å sette opp KID-avtale og få innbetalingsdata rett inn i regnskapsløsning?',
            footerCls: 'center',
            buttonLabels: {
                accept: 'Bestill',
                reject: 'Lukk'
            },
            checkboxLabel: 'Ja, jeg ønsker innbetalingsavtale/KID',
            buttonIcons: {
                accept: 'launch'
            },
            icon: 'themes/ext02/ext02-success-accountconfig.svg'
        };

        this.modalService.open(ConfigBankAccountsInfoModal, options).onClose.subscribe((response: ConfirmActions) => {
            if (response === ConfirmActions.ACCEPT) {
                window.open('https://www.dnb.no', '_blank');
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
        this.bankAccount = {...row};
    }

    setBusy(busy) {
        this.busy = busy;
    }

    savedFromSidemenu(response) {
        if (response) {
            const index = this.bankAccount['_originalIndex'];
            this.companySettings.BankAccounts.splice(index, 1, response);
            this.companySettings.BankAccounts = [...this.companySettings.BankAccounts];
        } else {
            this.bankAccount = null;
        }
    }

    getAccountType(row: BankAccount): string {
        switch (row.BankAccountType.toLowerCase()) {
            case 'company':
            case 'companysettings':
                return 'Drift';
            case 'tax':
                return 'Skatt';
            case 'salary':
                return 'Lønn';
            case 'credit':
                return 'Kredittkort';
            case 'international':
                return 'Utenlandsbetaling';
            default:
                return '';
        }
    }
}
