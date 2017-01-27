import {Account} from '../../unientities';

export class JournalEntryAccountCalculationSummary {
    public debitAccount: Account;
    public debitOriginalBalance: number;
    public debitNetChange: number;
    public debitNetChangeSubstractOriginal: number;
    public debitNetChangeCurrentLine: number;
    public debitIncomingVatCurrentLine: number;
    public debitOutgoingVatCurrentLine: number;
    public debitNewBalance: number;
    public creditAccount: Account;
    public creditOriginalBalance: number;
    public creditNetChange: number;
    public creditNetChangeSubstractOriginal: number;
    public creditNetChangeCurrentLine: number;
    public creditIncomingVatCurrentLine: number;
    public creditOutgoingVatCurrentLine: number;
    public creditNewBalance: number;
}
