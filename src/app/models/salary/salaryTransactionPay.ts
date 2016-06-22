export class SalaryTransactionPay {
    public PayList: SalaryTransactionPayLine[];
    public Witholding: number;
    public CompanyName: string;
    public CompanyPostalCode: string;
    public CompanyCity: string;
    public CompanyAccount: string;
    public CompanyAddress: string;
    public PaymentDate: Date;
}

export class SalaryTransactionPayLine {
    public EmployeeNumber: number;
    public EmployeeName: string;
    public Account: string;
    public PostalCode: string;
    public City: string;
    public Address: string;
    public NetPayment: number;
    public HasTaxInformation: boolean;
}
