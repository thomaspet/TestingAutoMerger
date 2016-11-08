import {Injectable} from '@angular/core';
import {Account, VatType, Dimensions} from '../../unientities';
import {JournalEntryData} from '../../models/accounting/journalentrydata';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntry, ValidationResult, ValidationMessage} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {JournalEntrySimpleCalculationSummary} from '../../models/accounting/JournalEntrySimpleCalculationSummary';


class JournalEntryLineCalculation {
    amountGross: number;
    amountNet: number;
    outgoingVatAmount: number;
    incomingVatAmount: number;
}

declare var moment;

@Injectable()
export class JournalEntryService extends BizHttp<JournalEntry> {
    private JOURNALENTRYMODE_LOCALSTORAGE_KEY: string;

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = JournalEntry.RelativeUrl;
        this.entityType = JournalEntry.EntityType;
        this.DefaultOrderBy = null;
    }

    public getJournalEntryMode(): string {
        let mode = localStorage.getItem(this.JOURNALENTRYMODE_LOCALSTORAGE_KEY);

        if (!mode) {
            mode = 'PROFESSIONAL';
        }

        if (mode !== 'SIMPLE' && mode !== 'PROFESSIONAL') {
            mode = 'PROFESSIONAL';
        }

        return mode;
    }

    public setJournalEntryMode(newMode: string) {
        localStorage.setItem(this.JOURNALENTRYMODE_LOCALSTORAGE_KEY, newMode);
    }

    public getLastJournalEntryNumber(): Observable<any> {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=journalentryline&select=journalentrynumber,journalentrynumbernumeric&orderby=journalentrynumbernumeric%20desc&top=1')
            .send()
            .map(response => response.json());
    }

    public getNextJournalEntryNumber(journalentry: JournalEntryData): Observable<any> {
        return this.http
            .asPOST()
            .withBody(journalentry)
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=nextjournalentrynumber')
            .send()
            .map(response => response.json());
    }

    public getJournalEntryPeriodData(accountID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=get-journal-entry-period-data&accountID=${accountID}`)
            .send()
            .map(response => response.json());
    }

    public postJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=post-journal-entry-data')
            .send()
            .map(response => response.json());
    }

    public saveJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=save-journal-entry-data')
            .send()
            .map(response => response.json());
    }

    public validateJournalEntryDataLocal(journalDataEntries: Array<JournalEntryData>): ValidationResult {
        let result: ValidationResult = new ValidationResult();
        result.Messages = [];

        let sortedJournalEntries = journalDataEntries.sort((a, b) => a.JournalEntryNo > b.JournalEntryNo ? 1 : 0);

        let lastJournalEntryNo: string = '';
        let currentSumDebit: number = 0;
        let currentSumCredit: number = 0;

        sortedJournalEntries.forEach(entry => {
            if (lastJournalEntryNo !== entry.JournalEntryNo) {
                if (currentSumDebit !== currentSumCredit * -1) {
                    let message = new ValidationMessage();
                    message.Message = `Bilag ${lastJournalEntryNo} går ikke i balanse. Sum debet og sum kredit må være lik`;
                    result.Messages.push(message);
                }

                lastJournalEntryNo = entry.JournalEntryNo;
                currentSumCredit = 0;
                currentSumDebit = 0;
            }

            if (entry.DebitAccount) {
                currentSumCredit += entry.Amount;
            }
            if (entry.CreditAccount) {
                currentSumCredit -= entry.Amount;
            }
        });

        if (currentSumDebit !== currentSumCredit * -1) {
            let message = new ValidationMessage();
            message.Message = `Bilag ${lastJournalEntryNo} går ikke i balanse. Sum debet og sum kredit må være lik`;
            result.Messages.push(message);
        }

        return result;
    }

    public validateJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=validate-journal-entry-data')
            .send()
            .map(response => response.json());
    }

    public getJournalEntryDataBySupplierInvoiceID(supplierInvoiceID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&supplierInvoiceID=' + supplierInvoiceID)
            .send()
            .map(response => response.json());
    }

    public getJournalEntryDataByJournalEntryID(journalEntryID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&journalEntryID=' + journalEntryID)
            .send()
            .map(response => response.json());
    }

    public calculateJournalEntrySummaryLocal(journalDataEntries: Array<JournalEntryData>): JournalEntrySimpleCalculationSummary {
        let sum: JournalEntrySimpleCalculationSummary = {
            IncomingVat: 0,
            OutgoingVat: 0,
            SumCredit: 0,
            SumCreditNet: 0,
            SumDebet: 0,
            SumDebetNet: 0,
            Differance: 0
        };

        if (journalDataEntries) {
            journalDataEntries.forEach(entry => {
                let debitData = this.calculateJournalEntryData(entry.DebitAccount, entry.DebitVatType, entry.Amount, null);
                let creditData =  this.calculateJournalEntryData(entry.CreditAccount, entry.CreditVatType, entry.Amount * -1, null);

                sum.SumDebet += debitData.amountNet;
                sum.SumCredit += creditData.amountNet;

                let incomingVat = debitData.incomingVatAmount + creditData.incomingVatAmount;
                sum.IncomingVat += incomingVat;
                let outgoingVat = debitData.outgoingVatAmount + creditData.outgoingVatAmount;
                sum.OutgoingVat += outgoingVat;

                if (incomingVat > 0) {
                    sum.SumDebet += incomingVat;
                } else {
                    sum.SumCredit += incomingVat;
                }

                if (outgoingVat > 0) {
                    sum.SumDebet += outgoingVat;
                } else {
                    sum.SumCredit += outgoingVat;
                }
            });
        }

        sum.SumCredit = sum.SumCredit * -1;
        sum.OutgoingVat = sum.OutgoingVat * -1;
        sum.Differance = sum.SumDebet - sum.SumCredit;

        return sum;
    }

    public calculateJournalEntryData(account: Account, vattype: VatType, grossAmount: number, netAmount: number): JournalEntryLineCalculation {
        let res: JournalEntryLineCalculation = {
            amountGross: 0,
            amountNet: 0,
            incomingVatAmount: 0,
            outgoingVatAmount: 0
        };

        if (!grossAmount && !netAmount) {
            return res;
        }

        if (account) {
            if (vattype) {
                if (grossAmount) {
                    res.amountGross = grossAmount;

                    res.amountNet = vattype.ReversedTaxDutyVat ?
                        vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                            res.amountGross
                            : res.amountGross * (1 + (vattype.VatPercent / 100))
                        : res.amountGross / (1 + (vattype.VatPercent / 100));
                } else if (netAmount) {
                    res.amountNet = netAmount;

                    res.amountGross = vattype.ReversedTaxDutyVat ?
                        vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                            res.amountNet
                            : res.amountNet / (1 + (vattype.VatPercent / 100))
                        : res.amountNet * (1 + (vattype.VatPercent / 100));
                }

                let taxBasisAmount = vattype.ReversedTaxDutyVat ? res.amountGross : res.amountGross / (1 + (vattype.VatPercent / 100));

                if (vattype.ReversedTaxDutyVat) {
                    if (vattype.OutgoingAccountID) {
                        res.outgoingVatAmount += -1 * (taxBasisAmount * vattype.VatPercent / 100);
                    } else if (vattype.IncomingAccountID) {
                        res.incomingVatAmount += -1 * (taxBasisAmount * vattype.VatPercent / 100);
                    }
                }

                if (!(vattype.ReversedTaxDutyVat && !vattype.IncomingAccountID)) {
                    if (vattype.IncomingAccountID) {
                        res.incomingVatAmount += (taxBasisAmount * vattype.VatPercent) / 100;
                    } else if (vattype.OutgoingAccountID) {
                        res.outgoingVatAmount += (taxBasisAmount * vattype.VatPercent) / 100;
                    }
                }

            } else {
                if (grossAmount) {
                    res.amountGross = grossAmount;
                    res.amountNet = grossAmount;
                } else if (netAmount) {
                    res.amountGross = netAmount;
                    res.amountNet = netAmount;
                }
            }
        }

        return res;
    }


    public calculateJournalEntrySummary(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=calculate-journal-entry-summary')
            .send()
            .map(response => response.json());
    }

    public findJournalNumbersFromLines(journalEntryLines: Array<JournalEntryData>, nextJournalNumber: string = "") {
        var first, last, year;

        if (journalEntryLines && journalEntryLines.length) {
            journalEntryLines.forEach((l: JournalEntryData, i) => {
                if (l.JournalEntryNo) {
                    var parts = l.JournalEntryNo.split('-');
                    var no = parseInt(parts[0]);
                    if (!first || no < first) {
                        first = no;
                    }
                    if (!last || no > last) {
                        last = no;
                    }
                    if (i == 0) {
                        year = parseInt(parts[1]);
                    }
                }
            });

            if (!first) {
                return null;
            }
        } else if(nextJournalNumber && nextJournalNumber.length) {
            var parts = nextJournalNumber.split('-');
            first = parseInt(parts[0]);
            last = first;
            year = parseInt(parts[1]);
        }

        return {
            first: first,
            last: last,
            year: year,
            firstNumber: `${first}-${year}`,
            nextNumber: `${last + (journalEntryLines.length ? 1 : 0)}-${year}`,
            lastNumber: `${last}-${year}`
        };
    }
}

