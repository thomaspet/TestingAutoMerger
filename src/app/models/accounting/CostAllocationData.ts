import { LocalDate } from "@uni-entities";

export class CostAllocationData {
    CurrencyAmount: number;
    CurrencyCodeID: number;
    ExchangeRate: number;
    FinancialDate: LocalDate;
    VatDate: LocalDate;
}