import {Injectable} from '@angular/core';
import {
    SupplierInvoiceService,
    SupplierService,
    StatisticsService,
    BankService,
    BankAccountService,
} from '@app/services/services';
import {OcrValuables} from '@app/models/accounting/ocr';
import {SupplierInvoice, LocalDate, Supplier, BankAccount, BusinessRelation} from '@uni-entities';
import {safeDec} from '@app/components/common/utils/utils';
import {ConfirmActions, UniModalService} from '@uni-framework/uni-modal';
import {map} from 'rxjs/operators';

import * as moment from 'moment';

/*

This service uses async/await for readability due to the amount of async operations being perfomed.
Please familiarize yourself with the concept if you haven't used it before.
Especially the importance of error handeling!

Uncaught errors on an await statement will result in the function returning a rejected promise,
even if we could have resolved something.

https://javascript.info/async-await#error-handling

*/
@Injectable()
export class OCRHelper {
    supplierExpandOptions: Array<string> = [
        'Info',
        'Info.BankAccounts',
        'Info.DefaultBankAccount'
    ];

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private supplierService: SupplierService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private bankService: BankService,
        private bankAccountService: BankAccountService,
    ) {}

    async runOcr(fileID: number, invoice: SupplierInvoice) {
        const ocrResult = await this.supplierInvoiceService.fetch(`files/${fileID}?action=ocranalyse`).toPromise();
        const ocrData = new OcrValuables(ocrResult);

        const getLocalDate = (date) => date && new LocalDate(moment(date).toDate());
        invoice.PaymentID = ocrData.PaymentID;
        invoice.InvoiceNumber = ocrData.InvoiceNumber;
        invoice.TaxInclusiveAmountCurrency = +safeDec(ocrData.TaxInclusiveAmount).toFixed(2);
        invoice.InvoiceDate = getLocalDate(ocrData.InvoiceDate);
        invoice.DeliveryDate = getLocalDate(ocrData.InvoiceDate);
        invoice.PaymentDueDate = getLocalDate(ocrData.PaymentDueDate);

        if (ocrData.Orgno) {
            const supplier = await this.getOrCreateSupplier(ocrData).catch(() => null);
            if (supplier) {
                invoice.SupplierID = supplier.ID;
                invoice.Supplier = supplier;

                const account = (supplier.Info.BankAccounts || []).find(acc => acc.AccountNumber === ocrData.BankAccount);
                invoice.BankAccount = account || null;
                invoice.BankAccountID = account?.ID || null;
            } else {
                invoice.SupplierID = null;
                invoice.Supplier = null;
            }
        }

        return invoice;
    }

    private async getOrCreateSupplier(ocrData: OcrValuables): Promise<Supplier> {
        const orgNumber = ocrData && ocrData.Orgno;

        if (!orgNumber) {
            return null;
        }

        // Query statistics to see if the supplier already exists or if we need to create it
        const res = await this.statisticsService.GetAllUnwrapped(`model=Supplier&select=ID as ID,StatusCode as StatusCode&filter=StatusCode ne 90001 and contains(OrgNumber,'${orgNumber}')`).toPromise();
        const existingSupplier = res && res[0];

        if (existingSupplier) {
            return this.getSupplier(existingSupplier.ID, ocrData);
        } else {
            const brRegData = await this.getBrRegData(orgNumber).toPromise().catch(() => null);

            // Ask user if they want to create the supplier
            const canCreateSupplier = brRegData && await this.confirmSupplierCreation(brRegData);

            if (canCreateSupplier) {
                return this.createSupplier(ocrData, brRegData);
            } else {
                return null;
            }
        }
    }

    private async getSupplier(supplierID: number, ocrData: OcrValuables) {
        const supplier = await this.supplierService.Get(supplierID, this.supplierExpandOptions).toPromise();

        const missingBankAccount = ocrData.BankAccount && !supplier.Info?.BankAccounts?.some(account => {
            return account.AccountNumber === ocrData.BankAccount;
        });

        if (missingBankAccount) {
            const account = await this.createAccountOnSupplier(ocrData.BankAccount, supplier).catch(() => null);
            if (account) {
                supplier.Info.BankAccounts.push(account);
            }
        }

        return supplier;
    }

    private getBrRegData(orgNumber: string) {
        return this.supplierInvoiceService.fetch(
            'business-relations/?action=search-data-hotel&searchText=' + orgNumber
        ).pipe(map(res => res && res.Data && res.Data.entries && res.Data.entries[0]));
    }

    private async createSupplier(ocrData: OcrValuables, brRegData) {
        const supplier = <Supplier> {};
        supplier.OrgNumber = brRegData.orgnr;
        supplier.Info = <BusinessRelation> {
            Name: brRegData.navn,
            ShippingAddress: {
                AddressLine1: brRegData.forretningsadr || '',
                City: brRegData.forradrpoststed || '',
                PostalCode: brRegData.forradrpostnr || '',
                Country: 'NORGE',
                CountryCode: 'NO'
            }
        };

        const account = await this.validateAndGetBankAccount(ocrData.BankAccount).catch(() => null);
        supplier.Info.DefaultBankAccount = account;

        const savedSupplier = await this.supplierService.Post(supplier).toPromise();

        // Load saved supplier with correct expands
        return this.getSupplier(savedSupplier.ID, ocrData);
    }

    private async validateAndGetBankAccount(accountNumber) {
        if (!accountNumber) {
            return null;
        }

        try {
            const ocrValueIsIBAN = isNaN(Number(accountNumber));
            const bankData = ocrValueIsIBAN
                ? await this.bankService.validateIBANUpsertBank(accountNumber).toPromise()
                : await this.bankService.getIBANUpsertBank(accountNumber).toPromise();

            return bankData && <BankAccount> {
                AccountNumber: ocrValueIsIBAN ? bankData.IBAN : accountNumber,
                IBAN: bankData.IBAN,
                BankAccountType: 'supplier',
                BankID: bankData.Bank.ID
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    private confirmSupplierCreation(brRegData) {
        const dialog = this.modalService.confirm({
            header: `Opprette ny leverandør ${brRegData.navn}?`,
            message: `${brRegData.forretningsadr || ''} ${brRegData.forradrpostnr || ''}`
                + `${brRegData.forradrpoststed || ''}. Organisasjonsnr: ${brRegData.orgnr}`,
            buttonLabels: {
                accept: 'Opprett leverandør',
                cancel: 'Avbryt'
            }
        });

        return dialog.onClose
            .pipe(map(res => res === ConfirmActions.ACCEPT))
            .toPromise();
    }

    private async createAccountOnSupplier(accountNumber: string, supplier: Supplier): Promise<Account> {
        const response = await this.modalService.confirm({
            header: `Vil du opprette bankkonto ${accountNumber}?`,
            message: `Kontonr er ikke registrert på leverandøren ${supplier.Info.Name}`,
            buttonLabels: {
                accept: 'Opprett konto',
                cancel: 'Ikke opprett konto'
            }
        }).onClose.toPromise();

        if (response === ConfirmActions.ACCEPT) {
            const account = await this.validateAndGetBankAccount(accountNumber).catch(() => null);
            if (account) {
                account.BusinessRelationID = supplier.BusinessRelationID;
                return this.bankAccountService.Post(account).toPromise();
            }
        }
    }
}
