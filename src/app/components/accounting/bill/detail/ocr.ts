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
    OcrRawData: string;
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
    // tslint:disable
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
    // tslint:enable

    private _report: IOcrServiceResult;

    public getReport(): IOcrServiceResult {
        return this._report;
    }

    constructor(result) {
        this._report = result;
        if (result && result.InterpretedProperties) {
            let props = result.InterpretedProperties;

            this.Orgno = this.getProposedValue(props, OcrPropertyType.OfficialNumber)
                .replace('MVA', '').replace('N0', '').replace('NO', '');

            if (this.Orgno && this.Orgno.length > 9) {
                let tmpOrgNo = this.Orgno.replace(/[^0-9]/g, '');
                if (tmpOrgNo.length === 9) {
                    this.Orgno = tmpOrgNo;
                }
            }

            this.PaymentID = this.getProposedValue(props, OcrPropertyType.CustomerIdentificationNumber);
            this.BankAccount =  this.getProposedValue(props, OcrPropertyType.BankAccountNumber);
            this.BankAccountCandidates = this.BankAccount && this.BankAccount !== '' ? [this.BankAccount] : [];
            this.InvoiceDate = this.getProposedValue(props, OcrPropertyType.InvoiceDate);
            this.PaymentDueDate =  this.getProposedValue(props, OcrPropertyType.DueDate);
            this.TaxInclusiveAmount = this.getProposedValue(props, OcrPropertyType.TotalAmount);
            this.InvoiceNumber = this.getProposedValue(props, OcrPropertyType.InvoiceNumber);
            this.Amount = +this.TaxInclusiveAmount;
        }
    }

    private getProposedValue(props, propType): string {
        let prop = props.find(x => x.OcrProperty.PropertyType === propType);

        if (prop && prop.ProposedCandidate) {
            return prop.ProposedCandidate.Value;
        }

        return '';
    }
}

export enum OcrPropertyType {
    OfficialNumber = 1,
    IbanNumber = 2,
    BankAccountNumber = 3,
    CustomerIdentificationNumber = 4,
    InvoiceNumber = 5,
    TotalAmount = 6,
    InvoiceDate = 7,
    DueDate = 8
}
