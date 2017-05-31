export interface IOcrValue {
    Candidates: Array<any>;
    Value: {
        value: string,
        text: string,
        DateValue: Date
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
    public PaymentID: string = '';
    public BankAccount: string = '';
    public BankAccountCandidates: Array<string> = [];
    public InvoiceDate: string | Date = '';
    public PaymentDueDate: string | Date = '';
    public TaxInclusiveAmount: string = '';
    public InvoiceNumber: string = '';
    public Amount: number = 0;
    public SupplierID: number = 0;

    private _report: IOcrServiceResult;

    public getReport(): IOcrServiceResult {
        return this._report;
    }

    constructor(result: IOcrServiceResult) {
        this._report = result;
        if (result && result.OcrInvoiceReport) {
            let rep = result.OcrInvoiceReport;
            this.Orgno = rep.Orgno.Value ? rep.Orgno.Value.value : '';
            this.PaymentID = rep.Kid.Value ? rep.Kid.Value.value : '';
            this.BankAccount =  rep.BankAccount.Value ? rep.BankAccount.Value.value : '';
            this.BankAccountCandidates =
                rep.BankAccount.Candidates
                    ? rep.BankAccount.Candidates.sort((a, b) => b.Hit - a.Hit).map(x => x.value)
                    : rep.BankAccount.Value ? [rep.BankAccount.Value] : [];
            this.InvoiceDate =  rep.InvoiceDate.Value ? rep.InvoiceDate.Value.DateValue : '';
            this.PaymentDueDate =  rep.DueDate.Value ? rep.DueDate.Value.DateValue : '';
            this.TaxInclusiveAmount =  rep.Amount.Value ? rep.Amount.Value.value : '';
            this.InvoiceNumber =  rep.InvoiceNumber.Value ? rep.InvoiceNumber.Value.value : '';
            this.Amount = rep.Amount ? (+rep.Amount || 0) : 0;
            this.SupplierID =  rep.SupplierID;
        }
    }
}
