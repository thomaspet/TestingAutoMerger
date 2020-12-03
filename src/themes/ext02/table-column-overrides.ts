export const TABLE_COLUMN_OVERRIDES = {
    'uniTicker.invoice_list': [
        { field: 'JournalEntry.JournalEntryNumber', visible: true },
        { field: 'Customer.CustomerNumber', visible: false },
        { field: 'CustomerInvoice.TaxInclusiveAmount', visible: true },
        { field: `getlatestsharingtype('CustomerInvoice',CustomerInvoice.ID)`, visible: false }
    ],
    'uniTicker.bank_list': [
        { field: 'CurrencyCode.Code', visible: true },
        { field: 'Payment.AmountCurrency', visible: true }
    ],
    'uniTicker.payment_list': [
        { field: 'Payment.InvoiceNumber', visible: false },
        { field: 'Payment.PaymentID', visible: false },
        { field: 'Payment.PaymentBatchID', visible: false },
        { field: 'Payment.StatusCode', visible: true }
    ]
};
