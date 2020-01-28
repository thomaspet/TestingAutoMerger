interface CompanyInfo {
    name: string;
    orgNumber: string;
    address: {
        addressLine: string;
        city: string;
        postalCode: string;
        country: string;
    };
    email?: string;
    phone?: string;
}

export interface EHFAttachment {
    label: string;
    plaintext?: string;
    externalUrl?: string;
    resourceUrl?: string;
    mimeType?: string;
}

export interface EHFData {
    isCreditNote?: boolean;
    attachments?: EHFAttachment[];

    customerNumber?: string;
    creditNoteNumber?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    currencyCode?: string;
    yourReference?: string;
    ourReference?: string;
    note?: string;
    paymentTerms?: string;
    orderReference?: string;
    customer?: CompanyInfo;
    supplier?: CompanyInfo;

    delivery?: {
        date: string;
        address: {
            addressLine: string;
            city: string;
            postalCode: string;
            country: string;
        }
    };

    paymentInfo?: {
        invoiceNumber?: string;
        invoiceDate?: string;
        dueDate: string;
        accountNumber: string;
        IBAN: string;
        KID: string;
    };

    amountSummary?: {
        taxAmount: string;
        taxExclusiveAmount: string;
        taxInclusiveAmount: string;
        allowanceCharges?: any[];
        prepaidAmount: string;
        payableRoundingAmount?: string;
        payableAmount: string;
    };

    taxSummary?: {
        taxPercent: string;
        taxableAmount: string;
        taxAmount: string;
    }[];

    invoiceLines?: {
        productNumber: string;
        productName: string;
        quantity: string;
        vatPercent: string;
        vatExclusiveAmount: string;
        discount: string;
        description: string;
        note: string;
    }[];

}
