export interface AutoBankAgreementDetails {
    DisplayName: string;
    Orgnr: string;
    Email: string;
    Bank: string;
    Phone: string;
    BankAccountID: number;
    BankAcceptance: boolean;
    IsBankBalance: boolean;
    BankApproval: boolean;
    IsBankStatement: boolean;
    IsInbound: boolean;
    IsOutgoing: boolean;
    Password: string;
    BankAccountNumber: number;
    _confirmPassword?: string;
    ServiceProvider: BankAgreementServiceProvider;
}

export enum BankAgreementServiceProvider {
    ZData = 1,
    Bruno = 2,
    Mock = 3
}