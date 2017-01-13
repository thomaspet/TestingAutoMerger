import {Injectable} from '@angular/core';
import {Account, VatType, Dimensions, FinancialYear} from '../../unientities';
import {JournalEntryData} from '../../models/accounting/journalentrydata';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntry, ValidationResult, ValidationMessage, ValidationLevel} from '../../unientities';
import {StatisticsService} from '../common/StatisticsService';
import {BrowserStorageService} from '../BrowserStorageService';
import {UniHttp} from '../../../framework/core/http/http';
import {JournalEntrySimpleCalculationSummary} from '../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryAccountCalculationSummary} from '../../models/accounting/JournalEntryAccountCalculationSummary';
import {AccountBalanceInfo} from '../../models/accounting/AccountBalanceInfo';

declare const _; // lodash

class JournalEntryLineCalculation {
    amountGross: number;
    amountNet: number;
    outgoingVatAmount: number;
    incomingVatAmount: number;
}

export class JournalEntrySettings {
    public AttachmentsVisible: boolean;
    public DefaultVisibleFields: string[];
}

declare var moment;

@Injectable()
export class JournalEntryService extends BizHttp<JournalEntry> {
    private JOURNALENTRYMODE_LOCALSTORAGE_KEY: string = 'PreferredJournalEntryMode';
    private JOURNAL_ENTRIES_SESSIONSTORAGE_KEY: string = 'JournalEntryDrafts';
    private JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY: string = 'JournalEntrySettings';

    constructor(http: UniHttp, private storageService: BrowserStorageService, private statisticsService: StatisticsService) {
        super(http);
        this.relativeURL = JournalEntry.RelativeUrl;
        this.entityType = JournalEntry.EntityType;
        this.DefaultOrderBy = null;
    }

    public getJournalEntryMode(): string {
        let mode = this.storageService.get(this.JOURNALENTRYMODE_LOCALSTORAGE_KEY);

        if (!mode) {
            mode = 'PROFESSIONAL';
        }

        if (mode !== 'SIMPLE' && mode !== 'PROFESSIONAL') {
            mode = 'PROFESSIONAL';
        }

        return mode;
    }

    public setJournalEntryMode(newMode: string) {
        this.storageService.save(this.JOURNALENTRYMODE_LOCALSTORAGE_KEY, newMode);
    }

    public getJournalEntrySettings(): JournalEntrySettings {
        let settingsJson = this.storageService.get(this.JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY);
        let settings: JournalEntrySettings;

        if (!settingsJson) {
            settings = new JournalEntrySettings();
            settings.AttachmentsVisible = false;
        } else {
            settings = JSON.parse(settingsJson);
        }

        return settings;
    }

    public setJournalEntrySettings(settings: JournalEntrySettings) {
        this.storageService.save(this.JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY, JSON.stringify(settings));
    }

    public getSessionData(mode: number): Array<JournalEntryData> {
        let previousSessionData = this.storageService.sessionGet(`${this.JOURNAL_ENTRIES_SESSIONSTORAGE_KEY}_${mode}`, true);

        if (previousSessionData) {
            let data = JSON.parse(previousSessionData);
            return data;
        }

        return null;
    }

    public setSessionData(mode: number, data: Array<JournalEntryData>) {
        this.storageService.sessionSave(`${this.JOURNAL_ENTRIES_SESSIONSTORAGE_KEY}_${mode}`, JSON.stringify(data), true);
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

    public validateJournalEntryDataLocal(journalDataEntries: Array<JournalEntryData>, currentFinancialYear: FinancialYear, financialYears: Array<FinancialYear>): ValidationResult {
        let result: ValidationResult = new ValidationResult();
        result.Messages = [];

        let invalidRows = journalDataEntries.filter(x => !x.Amount || !x.FinancialDate || (!x.CreditAccountID && !x.DebitAccountID));

        if (invalidRows.length > 0) {
            let message = new ValidationMessage();
            message.Level = ValidationLevel.Error;
            message.Message = 'Dato, beløp og enten debet eller kreditkonto må fylles ut på alle radene';
            result.Messages.push(message);
        }

        let sortedJournalEntries = journalDataEntries.sort((a, b) => a.JournalEntryNo > b.JournalEntryNo ? 1 : 0);

        let lastJournalEntryNo: string = '';
        let currentSumDebit: number = 0;
        let currentSumCredit: number = 0;
        let lastJournalEntryFinancialDate: Date;

        sortedJournalEntries.forEach(entry => {
            if (lastJournalEntryNo !== entry.JournalEntryNo) {
                if (currentSumDebit !== currentSumCredit * -1) {
                    let message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    message.Message = `Bilag ${lastJournalEntryNo} går ikke i balanse. Sum debet og sum kredit må være lik`;
                    result.Messages.push(message);
                }

                lastJournalEntryNo = entry.JournalEntryNo;
                currentSumCredit = 0;
                currentSumDebit = 0;
                lastJournalEntryFinancialDate = null;
            }

            let financialYearEntry: FinancialYear;

            if (entry.FinancialDate) {
                financialYearEntry = financialYears.find(x => moment(entry.FinancialDate).isSameOrAfter(moment(x.ValidFrom), 'day') && moment(entry.FinancialDate).isSameOrBefore(moment(x.ValidTo), 'day'));

                if (!financialYearEntry) {
                    let message = new ValidationMessage();
                    message.Level = ValidationLevel.Warning;
                    message.Message = `Bilag ${lastJournalEntryNo} har en dato som ikke finnes i noen eksisterende regnskapsår (${moment(entry.FinancialDate).format('DD.MM.YYYY')}). Et nytt regnskapsår vil bli opprettet ved lagring`;
                    result.Messages.push(message);
                } else if (entry.FinancialDate && moment(entry.FinancialDate).isAfter(currentFinancialYear.ValidTo, 'day')
                    || moment(entry.FinancialDate).isBefore(currentFinancialYear.ValidFrom, 'day')) {
                    let message = new ValidationMessage();
                    message.Level = ValidationLevel.Warning;
                    message.Message = `Bilag ${entry.JournalEntryNo} har en dato som ikke er innenfor regnskapsåret ${currentFinancialYear.Year} (${moment(entry.FinancialDate).format('DD.MM.YYYY')})`;
                    result.Messages.push(message);
                }
            }

            if (lastJournalEntryFinancialDate && entry.FinancialDate) {
                // Find the financialyear for the lastJournalEntryFinancialDate.FinancialDate and log an
                // error if they are not equal. Note that the year of the date might be different without
                // causing an error, e.g. if the financialyear is defined from 01.07.XXXX to 30.06.XXXX+1
                let financialYearLastEntry = financialYears.find(x => moment(lastJournalEntryFinancialDate).isSameOrAfter(moment(x.ValidFrom), 'day') && moment(lastJournalEntryFinancialDate).isSameOrBefore(moment(x.ValidTo), 'day'));

                if (financialYearLastEntry !== financialYearEntry) {
                    let message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    message.Message = `Bilag ${lastJournalEntryNo} er fordelt over flere regnskapsår - dette er ikke lov. Vennligst velg samme år, eller endre bilagsnr på linjene som har forskjellig år`;
                    result.Messages.push(message);
                }
            }

            if (entry.DebitAccount) {
                currentSumCredit += entry.Amount;
            }
            if (entry.CreditAccount) {
                currentSumCredit -= entry.Amount;
            }

            lastJournalEntryFinancialDate = entry.FinancialDate;
        });

        if (currentSumDebit !== currentSumCredit * -1) {
            let message = new ValidationMessage();
            message.Level = ValidationLevel.Error;
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

    public creditJournalEntry(journalEntryNumber: string): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=credit-journal-entry&journalEntryNumber=' + journalEntryNumber)
            .send()
            .map(response => response.json());
    }

    public getAccountBalanceInfo(journalDataEntries: Array<JournalEntryData>, previousList: Array<AccountBalanceInfo>, currentFinancialYear: FinancialYear): Observable<any> {

        let distinctAccountIDs: Array<number> = [];

        journalDataEntries.forEach(row => {
            if (row.DebitAccountID && distinctAccountIDs.indexOf(row.DebitAccountID) === -1) {
                distinctAccountIDs.push(row.DebitAccountID);
            }
            if (row.CreditAccountID && distinctAccountIDs.indexOf(row.CreditAccountID) === -1) {
                distinctAccountIDs.push(row.CreditAccountID);
            }
        });

        let distinctNewAccountIDs: Array<number> =
            distinctAccountIDs.filter(id => !previousList.find(abi => abi.accountID === id));

        if (distinctNewAccountIDs.length === 0) {
            return Observable.from([previousList]);
        }

        let filter = '';

        distinctNewAccountIDs.forEach(id => {
            if (filter !== '') {
                filter += ' or ';
            }
            filter += `( isnull(AccountID\,0) eq ${id} or isnull(SubAccountID\,0) eq ${id} ) `;
        });

        filter = `(${filter}) ` +
                `and (isnull(TopLevelAccountGroup.GroupNumber\,0) le 2 or (TopLevelAccountGroup.GroupNumber ge 3 and Period.AccountYear eq ${currentFinancialYear.Year} ))`;

        return this.statisticsService.GetAll(`model=JournalEntryLine` +
            `&expand=Account.TopLevelAccountGroup,SubAccount,Period` +
            `&filter=${filter}` +
            `&select=sum(JournalEntryLine.Amount) as SumAmount,JournalEntryLine.AccountID as AccountID,JournalEntryLine.SubAccountID as SubAccountID`)
            .map(data => {
                let accountBalances: Array<AccountBalanceInfo> = previousList;

                if (data.Data) {
                    data.Data.forEach(row => {
                        let accountBalance: AccountBalanceInfo = new AccountBalanceInfo();
                        accountBalance.accountID = row.SubAccountID ? row.SubAccountID : row.AccountID;
                        accountBalance.balance = row.SumAmount;

                        accountBalances.push(accountBalance);
                    });
                }

                return accountBalances;
            });
    }

    public calculateJournalEntryAccountSummaryLocal(journalDataEntries: Array<JournalEntryData>, accountBalances: Array<AccountBalanceInfo>, currentLine: JournalEntryData): JournalEntryAccountCalculationSummary {

        let sum: JournalEntryAccountCalculationSummary = {
            debitAccount: currentLine.DebitAccount,
            debitOriginalBalance: 0,
            debitNetChange: 0,
            debitNetChangeCurrentLine: 0,
            debitIncomingVatCurrentLine: 0,
            debitOutgoingVatCurrentLine: 0,
            debitNewBalance: 0,
            creditAccount: currentLine.CreditAccount,
            creditOriginalBalance: 0,
            creditNetChange: 0,
            creditNetChangeCurrentLine: 0,
            creditIncomingVatCurrentLine: 0,
            creditOutgoingVatCurrentLine: 0,
            creditNewBalance: 0
        };

        let accountsToCheck: Array<number> = [];

        // get opening balance for the debit / credit account, and set the currentline net change
        if (currentLine.DebitAccount) {
            let originalBalance = accountBalances.find(x => x.accountID === sum.debitAccount.ID);
            sum.debitOriginalBalance = originalBalance ? originalBalance.balance : 0;

            if (currentLine.DebitVatTypeID) {
                sum.debitNetChangeCurrentLine += currentLine['NetAmount'];

                var lineCalc =
                    this.calculateJournalEntryData(currentLine.DebitAccount, currentLine.DebitVatType, currentLine.Amount, null);

                sum.debitIncomingVatCurrentLine = lineCalc.incomingVatAmount;
                sum.debitOutgoingVatCurrentLine = lineCalc.outgoingVatAmount;
            } else {
                sum.debitNetChangeCurrentLine += currentLine['Amount'];
            }



            accountsToCheck.push(currentLine.DebitAccount.ID);
        }

        if (currentLine.CreditAccount) {
            let originalBalance = accountBalances.find(x => x.accountID === sum.creditAccount.ID);
            sum.creditOriginalBalance = originalBalance ? originalBalance.balance : 0;

            if (currentLine.CreditVatTypeID) {
                sum.creditNetChangeCurrentLine += currentLine['NetAmount'] * -1;

                var lineCalc =
                    this.calculateJournalEntryData(currentLine.CreditAccount, currentLine.CreditVatType, currentLine.Amount, null);

                sum.creditIncomingVatCurrentLine = lineCalc.incomingVatAmount * -1;
                sum.creditOutgoingVatCurrentLine = lineCalc.outgoingVatAmount * -1;
            } else {
                sum.creditNetChangeCurrentLine += currentLine['Amount'] * -1;
            }

            accountsToCheck.push(currentLine.CreditAccount.ID);
        }

        // calculate debit / credit net change for ALL the journal entries based on the
        // accounts used as debit / credit on the current journal entry
        journalDataEntries.forEach(entry => {
            // The current DebitAccount and CreditAccount can have been used both as
            // a debit account and credit account on either of the other journalentries.
            // Calculate the total net  change for the account using the correct amount
            // and correct +/-
            if (entry.DebitAccount && currentLine.DebitAccount
                && entry.DebitAccount.ID === currentLine.DebitAccount.ID) {
                if (entry.DebitVatTypeID) {
                    sum.debitNetChange += entry['NetAmount'];
                } else {
                    sum.debitNetChange += entry['Amount'];
                }
            } else if (entry.CreditAccount && currentLine.DebitAccount
                && entry.CreditAccount.ID === currentLine.DebitAccount.ID) {
                if (entry.CreditVatTypeID) {
                    sum.debitNetChange += entry['NetAmount'] * -1;
                } else {
                    sum.debitNetChange += entry['Amount'] * -1;
                }
            }

            if (entry.CreditAccount && currentLine.CreditAccount
                && entry.CreditAccount.ID === currentLine.CreditAccount.ID) {
                if (entry.CreditVatTypeID) {
                    sum.creditNetChange += entry['NetAmount'] * -1;
                } else {
                    sum.creditNetChange += entry['Amount'] * -1;
                }
            } else if (entry.DebitAccount && currentLine.CreditAccount
                && entry.DebitAccount.ID === currentLine.CreditAccount.ID) {
                if (entry.DebitVatTypeID) {
                    sum.creditNetChange += entry['NetAmount'];
                } else {
                    sum.creditNetChange += entry['Amount'];
                }
            }
        });

        // set new balance based on the original balance and the total net change for the account
        // (not the change in the current line)
        sum.debitNewBalance = sum.debitOriginalBalance + sum.debitNetChange;
        sum.creditNewBalance = sum.creditOriginalBalance + sum.creditNetChange;

        return sum;
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

                // normally a user will use the debit field for positive amounts and credit field for negative amounts.
                // however if they use the debit field and a negative amount, that is the same as using the credit field
                // and a positive amount. Therefore we add the sum to the correct sum (this will also be done automatically
                // in the API, because there we have no concept of debit/credit, just +/-)
                if (debitData.amountNet > 0) {
                    sum.SumDebet += debitData.amountNet;
                } else {
                    sum.SumCredit += debitData.amountNet;
                }
                if (creditData.amountNet < 0) {
                    sum.SumCredit += creditData.amountNet;
                } else {
                    sum.SumDebet += creditData.amountNet;
                }

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

