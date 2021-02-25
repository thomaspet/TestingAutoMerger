import {Injectable} from '@angular/core';
import {
    SupplierInvoiceService,
    SupplierService,
    StatisticsService,
    BankService,
    BankAccountService,
    UniFilesService,
    EHFService,
    NumberFormat,
} from '@app/services/services';
import {OcrValuables, IOcrServiceResult} from '@app/models/accounting/ocr';
import {SupplierInvoice, LocalDate, Supplier, File, BankAccount, BusinessRelation} from '@uni-entities';
import {Observable, of} from 'rxjs';
import {safeDec} from '@app/components/common/utils/utils';
import {ConfirmActions, UniModalService} from '@uni-framework/uni-modal';
import {switchMap, map, catchError} from 'rxjs/operators';

import * as moment from 'moment';

@Injectable()
export class OCRHelperClass {
    supplierExpandOptions: Array<string> = [
        'Info',
        'Info.BankAccounts',
        'Info.DefaultBankAccount'
    ];

    constructor(
        private uniFilesService: UniFilesService,
        private supplierInvoiceService: SupplierInvoiceService,
        private supplierService: SupplierService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private bankService: BankService,
        private ehfService: EHFService,
        private bankAccountService: BankAccountService,
        private numberFormat: NumberFormat,
    ) {}

    runOcr(file, invoice: SupplierInvoice, ignoreSupplier: boolean = false) {
        return this.uniFilesService.runOcr(file.StorageReference).pipe(
            switchMap((result: IOcrServiceResult) => {
                const ocrData = new OcrValuables(result);

                const getLocalDate = (date: string | Date) => date && new LocalDate(moment(date).toDate());

                invoice.PaymentID = ocrData.PaymentID;
                invoice.InvoiceNumber = ocrData.InvoiceNumber;
                invoice.TaxInclusiveAmountCurrency = +safeDec(ocrData.TaxInclusiveAmount).toFixed(2);
                invoice.InvoiceDate = ocrData.InvoiceDate ? getLocalDate(ocrData.InvoiceDate) : new LocalDate(new Date());
                invoice.DeliveryDate = ocrData.InvoiceDate ? getLocalDate(ocrData.InvoiceDate) : new LocalDate(new Date());
                invoice.PaymentDueDate = ocrData.PaymentDueDate ? getLocalDate(ocrData.PaymentDueDate) : new LocalDate(new Date());

                if (ocrData.Orgno && !ignoreSupplier) {
                    return this.getOrCreateSupplier(ocrData, invoice).pipe(
                        catchError(err => {
                            console.error(err);
                            return of(null);
                        }),
                        switchMap((supplier: Supplier) => {
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

                            return of(invoice);
                        })
                    );
                } else {
                    return of(invoice);
                }
            })
        );
    }

    getOCRCount() {
        return this.uniFilesService.getOcrStatistics();
    }

    private getOrCreateSupplier(ocrData: OcrValuables, invoice: SupplierInvoice): Observable<Supplier> {
        const orgNumber = ocrData.Orgno;

        if (!ocrData && !invoice) {
            return of(null);
        }

        // Query statistics to see if the supplier already exists or if we need to create it
        return this.statisticsService.GetAllUnwrapped(
            `model=Supplier&select=ID as ID,StatusCode as StatusCode&filter=StatusCode ne 90001 and contains(OrgNumber,'${orgNumber}')`
        ).pipe(switchMap(res => {
            const existingSupplier = res && res[0];
            if (existingSupplier?.ID) {
                // If supplier exists already we return that one
                return this.getSupplier(existingSupplier.ID, ocrData);
            } else {
                if (!invoice.SupplierID && invoice.Supplier) { 
                    if (invoice.Supplier?.Info?.BankAccounts && invoice.Supplier.Info.DefaultBankAccount) {
                        invoice.Supplier.Info.BankAccounts = invoice.Supplier.Info.BankAccounts.filter(b =>
                            (b?.AccountNumber !== invoice.Supplier.Info.DefaultBankAccount.AccountNumber) ||
                            (b?.IBAN !== invoice.Supplier.Info.DefaultBankAccount.IBAN)
                        );
                    }
                    return this.confirmSupplierCreation(null, invoice).pipe(switchMap(canCreate => {
                        if (canCreate) {
                            return this.createEHFSupplier(invoice.Supplier);
                        } else {
                            return of(null);
                        }
                    }));
                } else {
                    // If not we try creating it with data from br-reg
                    return this.getBrRegData(ocrData.Orgno).pipe(switchMap(brRegData => {
                        // Ask user if they want to create the supplier
                        return this.confirmSupplierCreation(brRegData).pipe(switchMap(canCreate => {
                            if (canCreate) {
                                return this.createSupplier(ocrData, brRegData);
                            } else {
                                return of(null);
                            }
                        }));
                    }));
                }   
            }
        }));
    }

    private getSupplier(supplierID: number, ocrData: OcrValuables): Observable<Supplier> {
        return this.supplierService.Get(supplierID, this.supplierExpandOptions).pipe(
            switchMap(supplier => {
                const missingBankAccount = ocrData.BankAccount && !supplier.Info?.BankAccounts?.some(account => {
                    return account.AccountNumber === ocrData.BankAccount;
                });

                if (missingBankAccount) {
                    return this.createBankAccount(ocrData.BankAccount, supplier).pipe(
                        switchMap(account => {
                            if (account) {
                                supplier.Info.BankAccounts.push(account);
                            }

                            return of(supplier);
                        })
                    );
                } else {
                    return of(supplier);
                }
            })
        );
    }

    private getBrRegData(orgNumber: string) {
        return this.supplierInvoiceService.fetch(
            'business-relations/?action=search-data-hotel&searchText=' + orgNumber
        ).pipe(map(res => res && res.Data && res.Data.entries && res.Data.entries[0]));
    }

    private createEHFSupplier(supplier) {
        return this.supplierService.Post(supplier).pipe(
            switchMap(savedSupplier => this.supplierService.Get(savedSupplier.ID, this.supplierExpandOptions))
        );
    }

    private createSupplier(ocrData: OcrValuables, brRegData): Observable<Supplier> {
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

        return this.validateAndGetBankAccount(ocrData.BankAccount).pipe(
            // Add account to supplier and save
            switchMap(account => {
                supplier.Info.DefaultBankAccount = account;
                return this.supplierService.Post(supplier);
            }),
            // Load saved supplier with correct expands
            switchMap(savedSupplier => this.getSupplier(savedSupplier.ID, ocrData))
        );
    }

    private validateAndGetBankAccount(accountNumber) {
        if (!accountNumber) {
            return of(null);
        }

        const ocrValueIsIBAN = isNaN(Number(accountNumber));
        const bankData$ = ocrValueIsIBAN
            ? this.bankService.validateIBANUpsertBank(accountNumber)
            : this.bankService.getIBANUpsertBank(accountNumber);

        return bankData$.pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            }),
            map(bankData => {
                if (bankData) {
                    return <BankAccount> {
                        AccountNumber: ocrValueIsIBAN ? bankData.IBAN : accountNumber,
                        IBAN: bankData.IBAN,
                        BankAccountType: 'supplier',
                        BankID: bankData.Bank.ID
                    };
                } else {
                    return null;
                }
            })
        );
    }

    private confirmSupplierCreation(brRegData, invoice?): Observable<boolean> {

        if (!brRegData && !invoice) {
            return of(false);
        }
        let supplierInfo;
        let title;

        if (invoice) {
            title = `Opprette ny leverandør '${invoice.InvoiceReceiverName}' ?`;
            supplierInfo = `${invoice.InvoiceAddressLine1 || ''} ${invoice.InvoicePostalCode || ''} ${invoice.InvoiceCity || ''}.`
                + ` Organisasjonsnr: ${invoice.Supplier.OrgNumber}`;
        } else {
            title = `Opprette ny leverandør '${brRegData.navn}' ?`;
            supplierInfo = `${brRegData.forretningsadr || ''} ${brRegData.forradrpostnr || ''} `
            + `${brRegData.forradrpoststed || ''}. Organisasjonsnr: ${brRegData.orgnr}`;
        }
        

        return this.modalService.confirm({
            header: title,
            message: supplierInfo,
            buttonLabels: {
                accept: 'Opprett leverandør',
                cancel: 'Avbryt'
            }
        }).onClose.pipe(map(res => res === ConfirmActions.ACCEPT));
    }

    private createBankAccount(accountNumber: string, supplier: Supplier): Observable<BankAccount> {
        return this.modalService.confirm({
            header: `Vil du opprette bankkonto ${this.numberFormat.asBankAcct(accountNumber)}?`,
            message: `Kontonr er ikke registrert på leverandøren ${supplier.Info.Name}`,
            buttonLabels: {
                accept: 'Opprett konto',
                cancel: 'Ikke opprett konto'
            }
        }).onClose.pipe(switchMap(response => {
            if (response === ConfirmActions.ACCEPT) {
                return this.validateAndGetBankAccount(accountNumber).pipe(
                    switchMap(account => {
                        account.BusinessRelationID = supplier.BusinessRelationID;
                        return this.bankAccountService.Post(account);
                    }),
                    catchError(err => {
                        console.error(err);
                        return of(null);
                    })
                );
            } else {
                return of(null);
            }
        }));
    }

    runEHFParse(file: File, ignoreSupplier: boolean): Observable<SupplierInvoice> {
        return this.ehfService.GetAction(null, 'parse', `fileID=${file.ID}`).pipe(
            switchMap((invoice: SupplierInvoice) => {
                return this.handleEHF(invoice, ignoreSupplier);
        }));
    }

   handleEHF(invoice: SupplierInvoice, ignoreSupplier: boolean): Observable<SupplierInvoice> {
        const handler = invoice.BankAccount && !invoice.BankAccount.AccountNumber && invoice.BankAccount.IBAN
            ? this.bankService.validateIBANUpsertBank(invoice.BankAccount.IBAN)
            : Observable.of(null);
        return handler.pipe(switchMap((bankaccount: BankAccount) => {
            if (bankaccount) {
                invoice.BankAccount.AccountNumber = bankaccount.AccountNumber;
                invoice.BankAccount.BankID = bankaccount.Bank.ID;
                invoice.Supplier.Info.BankAccounts.forEach(b => {
                    if (b.IBAN === bankaccount.IBAN) {
                        b = invoice.BankAccount;
                        if (invoice?.Supplier?.Info?.DefaultBankAccount?.IBAN === bankaccount.IBAN) {
                            invoice.Supplier.Info.DefaultBankAccount = b;
                        }
                    }
                });
            }

            const ocrData = <OcrValuables>{
                Orgno: invoice?.Supplier?.OrgNumber,
                BankAccount: invoice?.BankAccount?.AccountNumber
            };

            if (ignoreSupplier) {
                invoice.Supplier = null;
                invoice.SupplierID = null;
                return of(invoice);
            } else {
                return this.getOrCreateSupplier(ocrData, invoice).pipe(
                    catchError(err => {
                        console.error(err);
                        return of(null);
                    }),
                    switchMap((supplier: Supplier) => {
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

                        return of(invoice);
                    })
                );
            }
        }));
    }
}
