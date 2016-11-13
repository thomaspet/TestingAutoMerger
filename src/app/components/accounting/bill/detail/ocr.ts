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

export class OcrValuables {

    public Orgno: string = '';
    public Kid: string = '';
    public BankAccount: string = '';
    public InvoiceDate: string = '';
    public DueDate: string = '';
    public Amount: string = '';
    public InvoiceNumber: string = '';
    public SupplierID: number = 0;    

    public report: IOcrServiceResult;

    constructor(result: IOcrServiceResult) {
        this.report = result;
        if (result && result.OcrInvoiceReport) {
            let rep = result.OcrInvoiceReport;
            this.Orgno = rep.Orgno.Value ? rep.Orgno.Value.value : '';
            this.Kid = rep.Kid.Value ? rep.Kid.Value.value : '';
            this.BankAccount =  rep.BankAccount.Value ? rep.BankAccount.Value.value : '';
            this.InvoiceDate =  rep.InvoiceDate.Value ? rep.InvoiceDate.Value.value : '';
            this.DueDate =  rep.DueDate.Value ? rep.DueDate.Value.value : '';
            this.Amount =  rep.Amount.Value ? rep.Amount.Value.value : '';
            this.InvoiceNumber =  rep.InvoiceNumber.Value ? rep.InvoiceNumber.Value.value : '';
            this.SupplierID =  rep.SupplierID;
        }        
    }
}
