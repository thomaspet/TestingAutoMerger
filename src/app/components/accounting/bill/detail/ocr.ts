export interface IOcrValue {
    Candidates: Array<any>;
    Value: {
        value: string,
        text: string
    };
}

export interface IOcrInvoiceReport {
    Orgno: IOcrValue;
    Kid: IOcrValue;
    BankAccount: IOcrValue;
    InvoiceDate: IOcrValue;
    DueDate: IOcrValue;
    DeliveryDate: IOcrValue;
    Amount: IOcrValue;
    InvoiceNumber: IOcrValue;
    SupplierID: number;
}

export interface IOcrServiceResult {
    OcrInvoiceReport: IOcrInvoiceReport;
    language: string;
    textAngle: number;
    orientation: string;
    regions: Array<any>;
    MaxTop: number;
    MaxWidth: number;
}

export interface IOcrValuables {
    Orgno: string;
    Kid: string;
    BankAccount: string;
    InvoiceDate: string;
    DueDate: string;
    Amount: string;
    InvoiceNumber: string;
    SupplierID: number;    
}
