export class DebitCreditEntry {
    public FinancialDate: Date;

    public Debet: IAccount;
    public DebetVatTypeID?: number;
    public DebetAccountID: number;

    public Credit: IAccount;
    public CreditVatTypeID?: number;
    public CreditAccountID: number;

    public Description: string;
    public VatType?: IVatType;

    public Department?: any;
    public Project?: any;

    public Amount: number;
    public InvoiceNumber: string;
    public active = false;

    constructor(date?: Date) {
        if (date) { this.FinancialDate = date; }
    }

}

export interface IAccount {
    ID: number;
    AccountNumber: number;
    AccountName: string;
    VatTypeID: number;
    superLabel?: string;
}

export interface IVatType {
    ID: number;
    VatCode: string;
    VatPercent: number;
    Name: string;
    OutputVat: boolean;
    superLabel?: string;
}

export interface INumberSerie {
    ID: number;
    DisplayName: string;
    Name: string;
}

export interface IJournal {
    Description?: string;
    DraftLines: Array<any>;
    NumberSeriesID?: number;
    NumberSeriesTaskID?: number;
    FileIDs?: Array<number>;
    Payments?: Array<any>;
}

export interface IDraft {
    FileIDs?: Array<any>;
    DebitAccount: IAccount;
    CreditAccount: IAccount;
    FinancialDate: Date;
    JournalEntryDraftIDs?: Array<number>;
    JournalEntryPaymentData?: Array<any>;
}

export enum PaymentMode {
    None = 0,
    PrepaidWithCompanyBankAccount = 1,
    PrepaidByEmployee = 2
}

export class PaymentInfo {
    private _paymentDate: Date;

    public Mode: PaymentMode = PaymentMode.None;
    public PaidWith: IAccount;
    public get PaymentDate(): Date { return this._paymentDate; }
    public set PaymentDate(value: Date) { this._paymentDate = value; }
    public PaymentTo: IAccount;
    public PaymentAccount: string;
}
