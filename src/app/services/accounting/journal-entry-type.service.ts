import { Injectable } from '@angular/core';
export enum JournalEntryTypes {
    PaymentIn = 1,
    PaymentOut = 2,
    Invoice = 3,
    Creditnote = 4,
    Reminder = 5,
    SupplierInvoice = 6,
    SupplierInvoicePayment = 7,
    CustomerInvoice = 8,
    CustomerInvoicePayment = 9,
    CustomerInvoiceReminder = 10,
    CustomerInvoiceCreditNote = 11,
    CustomerInvoiceReminderPayment = 12,
    CustomerInvoiceAccounting = 13,
    SupplierInvoiceCreditNote = 14,
    SupplierInvoiceAccounting = 15,
    VatReport = 16,
    VatReportPayment = 17,
    TaxReport = 18,
    TaxReportPayment = 19,
    AgaReport = 20,
    AgaReportPayment = 21,
    SAFTimport = 22,
    SystemCorrection = 23,
    Asset = 24,
    IncomingBalance = 25,
    OpeningBalance = 26,
}
@Injectable()
export class JournalEntryTypeService {

    constructor() { }
}
