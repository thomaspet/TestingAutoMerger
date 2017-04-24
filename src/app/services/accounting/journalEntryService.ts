import {Injectable} from '@angular/core';
import {Account, VatType, Dimensions, FinancialYear, VatDeduction} from '../../unientities';
import {JournalEntryData, JournalEntryExtended} from '../../models/models';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntry, ValidationLevel, CompanySettings, JournalEntryLineDraft, LocalDate} from '../../unientities';
import {ValidationMessage, ValidationResult} from '../../models/validationResult';
import {UniHttp} from '../../../framework/core/http/http';
import {JournalEntrySimpleCalculationSummary} from '../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryAccountCalculationSummary} from '../../models/accounting/JournalEntryAccountCalculationSummary';
import {AccountBalanceInfo} from '../../models/accounting/AccountBalanceInfo';
import {BrowserStorageService} from '../common/browserStorageService';
import {StatisticsService} from '../common/statisticsService';
import {JournalEntryLineDraftService} from './journalEntryLineDraftService';


class JournalEntryLineCalculation {
    amountGross: number;
    amountGrossCurrency: number;
    amountNet: number;
    amountNetCurrency: number;
    taxBasisAmount: number;
    outgoingVatAmount: number;
    incomingVatAmount: number;
}

export class JournalEntrySettings {
    public AttachmentsVisible: boolean;
    public DefaultVisibleFields: string[];
}

import * as moment from 'moment';
import {CompanySettingsService} from '../common/companySettingsService';
import {ErrorService} from '../common/errorService';
import {UniMath} from '../../../framework/core/uniMath';
import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class JournalEntryService extends BizHttp<JournalEntry> {
    private JOURNAL_ENTRIES_SESSIONSTORAGE_KEY: string = 'JournalEntryDrafts';
    private JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY: string = 'JournalEntrySettings';
    private companySettings: CompanySettings;

    constructor(
        http: UniHttp,
        private storageService: BrowserStorageService,
        private statisticsService: StatisticsService,
        private journalEntryLineDraftService: JournalEntryLineDraftService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private authService: AuthService
    ) {
        super(http);
        this.relativeURL = JournalEntry.RelativeUrl;
        this.entityType = JournalEntry.EntityType;
        this.DefaultOrderBy = null;

        this.populateCache();
        this.authService.authentication$.subscribe(() => this.populateCache());
    }

    private populateCache() {
        this.companySettings = <any>{};
        this.companySettingsService.Get(1, ['BaseCurrencyCode']).subscribe(
            companySettings => this.companySettings = companySettings,
            err => this.errorService.handle(err)
        );
    }

    public getJournalEntrySettings(mode: number): JournalEntrySettings {
        let settingsJson = this.storageService.get(`${this.JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY}_${mode}`);
        let settings: JournalEntrySettings;

        if (!settingsJson) {
            settings = new JournalEntrySettings();
            settings.AttachmentsVisible = false;
        } else {
            settings = JSON.parse(settingsJson);
        }

        return settings;
    }

    public setJournalEntrySettings(settings: JournalEntrySettings, mode: number) {
        this.storageService.save(`${this.JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY}_${mode}`, JSON.stringify(settings));
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

    public postJournalEntryData(journalEntryData: Array<JournalEntryData>): Observable<any> {
        // TODO: User should also be able to change dimensions for existing entries
        // so consider changing to filtering for dirty rows (and only allow the
        // unitable to edit the dimension fields for existing rows)
        let journalEntryDataNew = journalEntryData.filter(x => !x.StatusCode);

        let journalEntryDataWithJournalEntryID =
            journalEntryDataNew.filter(x => x.JournalEntryID && x.JournalEntryID > 0);
        let existingJournalEntryIDs: Array<number> = [];
        journalEntryDataWithJournalEntryID.forEach(line => {
            existingJournalEntryIDs.push(line.JournalEntryID);
        });

        if (existingJournalEntryIDs.length) {
            return this.GetAll('filter=ID eq ' + existingJournalEntryIDs.join(' or ID eq '))
                .flatMap(existingJournalEntries => {
                    let journalEntries = this.createJournalEntryObjects(journalEntryDataNew, existingJournalEntries);
                    return this.bookJournalEntries(journalEntries);
                });
        } else {
            let journalEntries = this.createJournalEntryObjects(journalEntryDataNew, []);
            return this.bookJournalEntries(journalEntries);
        }
    }

    private bookJournalEntries(journalEntries: Array<JournalEntry>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntries)
            .withEndPoint(this.relativeURL + '?action=book-journal-entries')
            .send()
            .map(response => response.json());
    }

    private createJournalEntryObjects(data: Array<JournalEntryData>, existingJournalEntries: Array<any>): Array<JournalEntryExtended> {
        let previousJournalEntryNo: string = null;
        let journalEntries: Array<JournalEntryExtended> = [];

        let je: JournalEntryExtended;

        // create new journalentries and journalentrylines for the inputdata
        let sortedJournalEntryData =
            data.sort((a, b) => a.JournalEntryID - b.JournalEntryID)
                .sort((a, b) => a.JournalEntryNo.localeCompare(b.JournalEntryNo));

        sortedJournalEntryData.forEach(line => {
            if (line.JournalEntryID && line.JournalEntryID > 0) {
                if (!je || (je && je.ID && je.ID.toString() !== line.JournalEntryID.toString())) {
                    let journalEntry = journalEntries.find(x => x.ID.toString() === line.JournalEntryID.toString());
                    if (journalEntry) {
                        // we have already got this journalentry in our collection, so use that
                        je = journalEntry;
                    } else {
                        // we have set a journalentryid, but it has not been used yet - so
                        // look in the existingJournalEntries retrieved from the server and
                        // set some extra properties on that
                        let existingJournalEntry =
                            existingJournalEntries.find(x => x.ID.toString() === line.JournalEntryID.toString());

                        if (existingJournalEntry) {
                            je = existingJournalEntry;
                            je.DraftLines = [];
                            je.FileIDs = line.FileIDs;
                            je.Payments = [];
                            journalEntries.push(je);
                        } else {
                            // this shouldnt happen, so just throw an exception here
                            throw 'No journalentry found for ID ' + line.JournalEntryID;
                        }
                    }
                }
            } else if (!previousJournalEntryNo || previousJournalEntryNo !== line.JournalEntryNo) {
                // for each new number in line.JournalEntryNo, create a new journalentry
                je = new JournalEntryExtended();

                je.DraftLines = [];

                je.FileIDs = line.FileIDs;
                je.Payments = [];

                journalEntries.push(je);

                previousJournalEntryNo = line.JournalEntryNo;
                line.JournalEntryID = je.ID;
            }

            if (line.JournalEntryPaymentData && line.JournalEntryPaymentData.PaymentData) {
                je.Payments.push(line.JournalEntryPaymentData.PaymentData);
            }

            // For each line, create a journalentrylinedraft for debit and credit. These are used
            // to perform the actual booking
            let draftLines = this.createJournalEntryDraftLines(line, je);

            draftLines.forEach(draftLine => {
                je.DraftLines.push(draftLine);
            });
        });

        return journalEntries;
    }

    private createJournalEntryDraftLines(journalEntryData: JournalEntryData, je: JournalEntryExtended): Array<JournalEntryLineDraft> {
        let lines = new Array<JournalEntryLineDraft>();

        let hasDebitAccount: boolean = journalEntryData.DebitAccountID ? true : false;
        let hasCreditAccount: boolean = journalEntryData.CreditAccountID ? true : false;

        let amount: number = journalEntryData.Amount;
        let amountCurrency: number = journalEntryData.AmountCurrency;

        if (hasDebitAccount) {
            let debitAccount = journalEntryData.DebitAccount;
            let debitVatType = journalEntryData.DebitVatTypeID ? journalEntryData.DebitVatType : null;

            let draftLine: JournalEntryLineDraft = new JournalEntryLineDraft();

            draftLine.Account = debitAccount;
            draftLine.AccountID = debitAccount.ID;
            draftLine.Amount = amount;
            draftLine.AmountCurrency = amountCurrency;
            draftLine.CurrencyExchangeRate = journalEntryData.CurrencyExchangeRate;
            draftLine.CurrencyCode = journalEntryData.CurrencyCode;
            draftLine.CurrencyCodeID = journalEntryData.CurrencyCode.ID;
            draftLine.Description = journalEntryData.Description;
            draftLine.Dimensions = journalEntryData.Dimensions;
            draftLine.FinancialDate = journalEntryData.FinancialDate;
            draftLine.InvoiceNumber = journalEntryData.InvoiceNumber;
            draftLine.RegisteredDate = new LocalDate(Date());
            draftLine.VatDate = journalEntryData.FinancialDate;
            draftLine.VatTypeID = journalEntryData.DebitVatTypeID;
            draftLine.VatType = debitVatType;
            draftLine.CustomerOrderID = journalEntryData.CustomerOrderID;
            draftLine.VatDeductionPercent = journalEntryData.VatDeductionPercent && debitAccount.UseDeductivePercent
                                    ? journalEntryData.VatDeductionPercent
                                    : 0;

            if (journalEntryData.JournalEntryDataAccrual
                && debitAccount.TopLevelAccountGroup
                && debitAccount.TopLevelAccountGroup.GroupNumber >= 3) {
                draftLine.Accrual = journalEntryData.JournalEntryDataAccrual;
            }

            // Add connection to invoice(s) if the account relates to a postpost account.
            // This will enable automatic postpost marking later in the booking process
            if (draftLine.Account.UsePostPost) {
                draftLine.PostPostJournalEntryLineID = journalEntryData.PostPostJournalEntryLineID;
                draftLine.CustomerInvoiceID = journalEntryData.CustomerInvoiceID;
                draftLine.SupplierInvoiceID = journalEntryData.SupplierInvoiceID;
            }

            lines.push(draftLine);
        }

        if (hasCreditAccount) {
            let creditAccount = journalEntryData.CreditAccount;
            let creditVatType = journalEntryData.CreditVatType;

            let draftLine: JournalEntryLineDraft = new JournalEntryLineDraft();

            draftLine.Account = creditAccount;
            draftLine.AccountID = creditAccount.ID;
            draftLine.Amount =  journalEntryData.Amount * -1;
            draftLine.AmountCurrency = journalEntryData.AmountCurrency * -1;
            draftLine.CurrencyExchangeRate = journalEntryData.CurrencyExchangeRate;
            draftLine.CurrencyCodeID = journalEntryData.CurrencyID;
            draftLine.CurrencyCode = journalEntryData.CurrencyCode;
            draftLine.Description = journalEntryData.Description;
            draftLine.Dimensions = journalEntryData.Dimensions;
            draftLine.FinancialDate = journalEntryData.FinancialDate;
            draftLine.InvoiceNumber = journalEntryData.InvoiceNumber;
            draftLine.RegisteredDate = new LocalDate(Date());
            draftLine.VatDate = journalEntryData.FinancialDate;
            draftLine.VatTypeID = journalEntryData.CreditVatTypeID;
            draftLine.VatType = creditVatType;
            draftLine.CustomerOrderID = journalEntryData.CustomerOrderID;
            draftLine.VatDeductionPercent = journalEntryData.VatDeductionPercent && creditAccount.UseDeductivePercent
                                    ? journalEntryData.VatDeductionPercent
                                    : 0;

            if (journalEntryData.JournalEntryDataAccrual
                && creditAccount.TopLevelAccountGroup
                && creditAccount.TopLevelAccountGroup.GroupNumber >= 3) {
                draftLine.Accrual = journalEntryData.JournalEntryDataAccrual;
            }

            // Add connection to invoice(s) if the account relates to a postpost account.
            // This will enable automatic postpost marking later in the booking process
            if (draftLine.Account.UsePostPost) {
                draftLine.PostPostJournalEntryLineID = journalEntryData.PostPostJournalEntryLineID;
                draftLine.CustomerInvoiceID = journalEntryData.CustomerInvoiceID;
                draftLine.SupplierInvoiceID = journalEntryData.SupplierInvoiceID;
            }

            lines.push(draftLine);
        }

        return lines;
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

    public validateJournalEntryDataLocal(journalDataEntries: Array<JournalEntryData>, currentFinancialYear: FinancialYear, financialYears: Array<FinancialYear>, companySettings: CompanySettings): ValidationResult {
        let result: ValidationResult = new ValidationResult();
        result.Messages = [];

        let DblPaymentsInvoiceNo: Set<string> = new Set();
        journalDataEntries.forEach(row => {
            if (journalDataEntries.filter(entry => entry.InvoiceNumber === row.InvoiceNumber && entry.InvoiceNumber).length > 1) {
                DblPaymentsInvoiceNo.add(row.InvoiceNumber);
            }
        });

        if (DblPaymentsInvoiceNo.size > 0) {
            let invPaymValidation = new ValidationMessage();
            let subMsg: string = '';
            DblPaymentsInvoiceNo.forEach(invoiceNo => {
                subMsg += invoiceNo + ', ';
            });

            invPaymValidation.Level = ValidationLevel.Warning;
            let subNoMsg = DblPaymentsInvoiceNo.size > 1 ? ' numrene ' : ' nr ';

            invPaymValidation.Message = 'Faktura ' + subNoMsg +
                subMsg.substring(0, subMsg.length - 2) + ' har flere betalinger.';

            result.Messages.push(invPaymValidation);
        }


        let invalidRows = journalDataEntries.filter(x => !x.Amount || !x.FinancialDate || (!x.CreditAccountID && !x.DebitAccountID));

        if (invalidRows.length > 0) {
            let message = new ValidationMessage();
            message.Level = ValidationLevel.Error;
            message.Message = 'Dato, beløp og enten debet eller kreditkonto må fylles ut på alle radene';
            result.Messages.push(message);
        }

        let rowsWithInvalidAccounts =
            journalDataEntries.filter(x =>
                (x.DebitAccount && (x.DebitAccount.Locked || x.DebitAccount.LockManualPosts))
                || (x.CreditAccount && (x.CreditAccount.Locked || x.CreditAccount.LockManualPosts))
            );

        if (rowsWithInvalidAccounts.length > 0) {
            rowsWithInvalidAccounts.forEach(row => {
                let errorMsg = 'Kan ikke føre bilag på kontonr ';
                if (row.DebitAccount && (row.DebitAccount.Locked || row.DebitAccount.LockManualPosts)) {
                    errorMsg += row.DebitAccount.AccountNumber;
                    errorMsg += ', kontoen er sperret' + (row.DebitAccount.LockManualPosts ? ' for manuelle føringer' : '');
                } else if (row.CreditAccount && (row.CreditAccount.Locked || row.CreditAccount.LockManualPosts)) {
                    errorMsg += row.CreditAccount.AccountNumber;
                    errorMsg += ', kontoen er sperret' + (row.CreditAccount.LockManualPosts ? ' for manuelle føringer' : '');
                }

                // only notify once about each locked account
                if (!result.Messages.find(x => x.Message === errorMsg)) {
                    let message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    message.Message = errorMsg;
                    result.Messages.push(message);
                }
            });
        }

        if (companySettings && companySettings.AccountingLockedDate) {
            let invalidDates = journalDataEntries.filter(x => !x.StatusCode && x.FinancialDate
                && moment(x.FinancialDate).isSameOrBefore(moment(companySettings.AccountingLockedDate)));

            if (invalidDates.length > 0) {
                let message = new ValidationMessage();
                message.Level = ValidationLevel.Error;
                message.Message = `Regnskapet er låst til ${moment(companySettings.AccountingLockedDate).format('L')}, ${invalidDates.length} linje${invalidDates.length > 1 ? 'r' : ''} har dato tidligere enn dette`;
                result.Messages.push(message);
            }
        }
        if (companySettings && companySettings.VatLockedDate) {

            let invalidVatDates = journalDataEntries.filter(x => !x.StatusCode && x.FinancialDate && (x.DebitVatType || x.CreditVatType)
                && moment(x.FinancialDate).isSameOrBefore(moment(companySettings.VatLockedDate)));

            if (invalidVatDates.length > 0) {
                let message = new ValidationMessage();
                message.Level = ValidationLevel.Error;
                message.Message = `MVA er låst til ${moment(companySettings.VatLockedDate).format('L')}, ${invalidVatDates.length} linje${invalidVatDates.length > 1 ? 'r' : ''} har dato tidligere enn dette`;
                result.Messages.push(message);
            }
        }

        let sortedJournalEntries = journalDataEntries.sort((a, b) => a.JournalEntryNo > b.JournalEntryNo ? 1 : 0);

        let lastJournalEntryNo: string = '';
        let currentSumDebit: number = 0;
        let currentSumCredit: number = 0;
        let lastJournalEntryFinancialDate: LocalDate;

        sortedJournalEntries.forEach(entry => {
            if (lastJournalEntryNo !== entry.JournalEntryNo) {
                if (UniMath.round(currentSumDebit, 2) !== UniMath.round(currentSumCredit * -1, 2)) {
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

            if (entry.JournalEntryDataAccrual) {
                let isDebitResultAccount = (entry.DebitAccount && entry.DebitAccount.TopLevelAccountGroup
                    && entry.DebitAccount.TopLevelAccountGroup.GroupNumber >= 3);
                let isCreditResultAccount = (entry.CreditAccount && entry.CreditAccount.TopLevelAccountGroup
                    && entry.CreditAccount.TopLevelAccountGroup.GroupNumber >= 3);

                if ((isDebitResultAccount && isCreditResultAccount) ||
                    (!isDebitResultAccount && !isCreditResultAccount)) {

                    let message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    if (isDebitResultAccount) {
                        message.Message = `Bilag ${lastJournalEntryNo} har en periodisering med 2 resultatkontoer `;
                    } else {
                        message.Message = `Bilag ${lastJournalEntryNo} har en periodisering uten resultatkonto `;
                    }
                    result.Messages.push(message);
                }
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

            if ((entry.DebitAccount && entry.CreditAccount)
                || (entry.DebitAccount && !entry.CreditAccount && entry.Amount > 0)) {
                currentSumDebit += entry.Amount;
            }

            if ((entry.DebitAccount && entry.CreditAccount)
                || (!entry.DebitAccount && entry.CreditAccount)) {
                currentSumCredit -= entry.Amount;
            } else if (entry.DebitAccount && !entry.CreditAccount && entry.Amount < 0) {
                currentSumCredit += entry.Amount;
            }

            lastJournalEntryFinancialDate = entry.FinancialDate;
        });

        if (UniMath.round(currentSumDebit, 2) !== UniMath.round(currentSumCredit * -1, 2)) {
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

    public getJournalEntryDataByJournalEntryID(journalEntryID: number): Observable<JournalEntryData[]> {
        return Observable.forkJoin(this.journalEntryLineDraftService.GetAll(
            `filter=JournalEntryID eq ${journalEntryID}&orderby=JournalEntryID,ID`,
            ['Account.TopLevelAccountGroup', 'VatType', 'Dimensions.Department', 'Dimensions.Project', 'Accrual', 'CurrencyCode']),
            this.statisticsService.GetAll(`model=FileEntityLink&filter=EntityType eq 'JournalEntry' and EntityID eq ${journalEntryID}&select=FileID`)
        ).map(responses => {
            let draftLines: Array<JournalEntryLineDraft> = responses[0];
            let fileList: Array<any> = responses[1].Data ? responses[1].Data : [];

            let journalEntryDataObjects: Array<JournalEntryData> = [];

            // map journalentrydraftlines to journalentrydata objects - these are easier to work for the
            // components, because this is the way the user wants to see the data
            draftLines.forEach(line => {
                let jed = journalEntryDataObjects.find(
                   x => x.JournalEntryID === line.JournalEntryID
                        && x.FinancialDate === line.FinancialDate
                        && x.Amount === line.Amount * -1
                        && x.AmountCurrency === line.AmountCurrency * -1
                        && x.JournalEntryDraftIDs.length === 1
                        && line.StatusCode === x.StatusCode
                        && !(x.JournalEntryDataAccrualID && line.AccrualID));

                if (!jed) {
                    jed = this.getJournalEntryDataFromJournalEntryLineDraft(line, jed);
                    journalEntryDataObjects.push(jed);
                } else {
                    this.getJournalEntryDataFromJournalEntryLineDraft(line, jed);
                }
            });

            // make the amounts absolute - we are setting debit/credit accounts
            // based on positive/negative amounts, so the actual amount should be positive
            journalEntryDataObjects.forEach(entry => {
                if (entry.Amount < 0) {
                    entry.Amount = Math.abs(entry.Amount);
                }
            });

            // make the AmountCurrencys absolute - we are setting debit/credit accounts
            // based on positive/negative AmountCurrencys, so the actual AmountCurrency should be positive
            journalEntryDataObjects.forEach(entry => {
                if (entry.AmountCurrency < 0) {
                    entry.AmountCurrency = Math.abs(entry.AmountCurrency);
                }
            });

            // add fileids if any files are connected to the journalentries
            let fileIdList = [];
            if (fileList) {
                fileList.forEach(x => {
                    fileIdList.push(x.FileEntityLinkFileID);
                });
            }

            journalEntryDataObjects.forEach(entry => {
                entry.FileIDs = fileIdList;
            });

            return JSON.parse(JSON.stringify(journalEntryDataObjects));
        });
    }

    private getJournalEntryDataFromJournalEntryLineDraft(line: JournalEntryLineDraft, jed: JournalEntryData): JournalEntryData {
        if (!jed) {
            jed = new JournalEntryData();
            jed.FinancialDate = line.FinancialDate;
            jed.Amount = line.Amount;
            jed.InvoiceNumber = line.InvoiceNumber;
            jed.AmountCurrency = line.AmountCurrency;
            jed.CurrencyID = line.CurrencyCodeID;
            jed.CurrencyCode = line.CurrencyCodeID ? line.CurrencyCode : null;
            jed.CurrencyExchangeRate = line.CurrencyExchangeRate;
            jed.JournalEntryID = line.JournalEntryID;
            jed.JournalEntryNo = line.JournalEntryNumber;
            jed.Description = line.Description;
            jed.CustomerInvoiceID = line.CustomerInvoiceID;
            jed.SupplierInvoiceID = line.SupplierInvoiceID;
            jed.StatusCode = line.StatusCode;
            jed.JournalEntryDraftIDs = [];
            jed.JournalEntryDrafts = [];
            jed.CurrencyID = line.CurrencyCodeID;
            jed.CurrencyCode = line.CurrencyCode;
        }

        if (jed.Dimensions == null && line.Dimensions != null) {
            jed.Dimensions = line.Dimensions;
        }

        jed.JournalEntryDraftIDs.push(line.ID);
        jed.JournalEntryDrafts.push(line);

        if (line.AccrualID) {
            jed.JournalEntryDataAccrualID = line.AccrualID;
            jed.JournalEntryDataAccrual = line.Accrual;
        }

        if (line.Amount > 0 || line.AmountCurrency > 0) {
            jed.DebitAccountID = line.AccountID;
            jed.DebitAccount = line.AccountID ? line.Account : null;
            jed.DebitVatTypeID = line.VatTypeID;
            jed.DebitVatType = line.VatTypeID ? line.VatType : null;
            jed.CustomerInvoiceID = line.CustomerInvoiceID;
            jed.SupplierInvoiceID = line.SupplierInvoiceID;
            jed.VatDeductionPercent = jed.VatDeductionPercent
                ? jed.VatDeductionPercent
                : line.VatDeductionPercent;
        } else {
            jed.CreditAccountID = line.AccountID;
            jed.CreditAccount = line.AccountID ? line.Account : null;
            jed.CreditVatTypeID = line.VatTypeID;
            jed.CreditVatType = line.VatTypeID ? line.VatType : null;
            jed.CustomerInvoiceID = line.CustomerInvoiceID;
            jed.SupplierInvoiceID = line.SupplierInvoiceID;
            jed.VatDeductionPercent = jed.VatDeductionPercent
                ? jed.VatDeductionPercent
                : line.VatDeductionPercent;
        }

        if (jed.CreditAccountID && jed.DebitAccountID && jed.Amount < 0) {
            jed.Amount = jed.Amount * -1;
            jed.AmountCurrency = jed.AmountCurrency * -1;
        }

        if (jed.CreditAccountID && jed.DebitAccountID && jed.AmountCurrency < 0) {
            jed.Amount = jed.Amount * -1;
            jed.AmountCurrency = jed.AmountCurrency * -1;
        }

        return jed;
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
                `and (( isnull(TopLevelAccountGroup.GroupNumber\,0) le 2 and Period.AccountYear le ${currentFinancialYear.Year}) or (TopLevelAccountGroup.GroupNumber ge 3 and Period.AccountYear eq ${currentFinancialYear.Year} ))`;

        return this.statisticsService.GetAll(`model=JournalEntryLine` +
            `&expand=Account.TopLevelAccountGroup,SubAccount,Period` +
            `&filter=${filter}` +
            `&select=sum(JournalEntryLine.AmountCurrency) as SumAmountCurrency,JournalEntryLine.AccountID as AccountID,JournalEntryLine.SubAccountID as SubAccountID`)
            .map(data => {
                let accountBalances: Array<AccountBalanceInfo> = previousList;

                if (data.Data) {
                    data.Data.forEach(row => {
                        let accountBalance: AccountBalanceInfo = new AccountBalanceInfo();
                        accountBalance.accountID = row.SubAccountID ? row.SubAccountID : row.AccountID;
                        accountBalance.balance = row.SumAmountCurrency;

                        accountBalances.push(accountBalance);
                    });
                }

                return accountBalances;
            });
    }

    public calculateJournalEntryAccountSummaryLocal(journalDataEntries: Array<JournalEntryData>, accountBalances: Array<AccountBalanceInfo>, vatdeductions: Array<VatDeduction>, currentLine: JournalEntryData): JournalEntryAccountCalculationSummary {
        let sum: JournalEntryAccountCalculationSummary = {
            debitAccount: currentLine ? currentLine.DebitAccount : null,
            debitOriginalBalance: 0,
            debitNetChange: 0,
            debitNetChangeSubstractOriginal: 0,
            debitNetChangeCurrentLine: 0,
            debitIncomingVatCurrentLine: 0,
            debitOutgoingVatCurrentLine: 0,
            debitNewBalance: 0,
            creditAccount: currentLine ? currentLine.CreditAccount : null,
            creditOriginalBalance: 0,
            creditNetChange: 0,
            creditNetChangeSubstractOriginal: 0,
            creditNetChangeCurrentLine: 0,
            creditIncomingVatCurrentLine: 0,
            creditOutgoingVatCurrentLine: 0,
            creditNewBalance: 0,
            deductionPercent: 0
        };

        let accountsToCheck: Array<number> = [];

        if (!currentLine) {
            return sum;
        } else {
            sum.deductionPercent = currentLine.VatDeductionPercent;
        }

        // get opening balance for the debit / credit account, and set the currentline net change
        if (currentLine.DebitAccount) {
            let originalBalance = accountBalances.find(x => x.accountID === sum.debitAccount.ID);
            sum.debitOriginalBalance = originalBalance ? originalBalance.balance : 0;

            if (currentLine.DebitVatTypeID) {
                sum.debitNetChangeCurrentLine += currentLine.NetAmount;

                var lineCalc =
                    this.calculateJournalEntryData(
                        currentLine.DebitAccount,
                        currentLine.DebitVatType,
                        currentLine.AmountCurrency,
                        null,
                        currentLine
                    );

                sum.debitIncomingVatCurrentLine = lineCalc.incomingVatAmount;
                sum.debitOutgoingVatCurrentLine = lineCalc.outgoingVatAmount;
            } else {
                sum.debitNetChangeCurrentLine += currentLine.Amount;
            }

            accountsToCheck.push(currentLine.DebitAccount.ID);
        }

        if (currentLine.CreditAccount) {
            let originalBalance = accountBalances.find(x => x.accountID === sum.creditAccount.ID);
            sum.creditOriginalBalance = originalBalance ? originalBalance.balance : 0;

            if (currentLine.CreditVatTypeID) {
                sum.creditNetChangeCurrentLine += currentLine.NetAmount * -1;

                var lineCalc =
                    this.calculateJournalEntryData(
                        currentLine.CreditAccount,
                        currentLine.CreditVatType,
                        currentLine.AmountCurrency,
                        null,
                        currentLine
                    );

                sum.creditIncomingVatCurrentLine = lineCalc.incomingVatAmount * -1;
                sum.creditOutgoingVatCurrentLine = lineCalc.outgoingVatAmount * -1;
            } else {
                sum.creditNetChangeCurrentLine += currentLine.Amount * -1;
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
            let debitNetChange = 0;

            if (entry.DebitAccount && currentLine.DebitAccount
                && entry.DebitAccount.ID === currentLine.DebitAccount.ID) {
                if (entry.DebitVatTypeID) {
                    debitNetChange += entry.NetAmount;
                } else {
                    debitNetChange += entry.Amount;
                }
            } else if (entry.CreditAccount && currentLine.DebitAccount
                && entry.CreditAccount.ID === currentLine.DebitAccount.ID) {
                if (entry.CreditVatTypeID) {
                    debitNetChange += entry.NetAmount * -1;
                } else {
                    debitNetChange += entry.Amount * -1;
                }
            }

            let creditNetChange = 0;

            if (entry.CreditAccount && currentLine.CreditAccount
                && entry.CreditAccount.ID === currentLine.CreditAccount.ID) {
                if (entry.CreditVatTypeID) {
                    creditNetChange += entry.NetAmount * -1;
                } else {
                    creditNetChange += entry.Amount * -1;
                }
            } else if (entry.DebitAccount && currentLine.CreditAccount
                && entry.DebitAccount.ID === currentLine.CreditAccount.ID) {
                if (entry.DebitVatTypeID) {
                    creditNetChange += entry.NetAmount;
                } else {
                    creditNetChange += entry.Amount;
                }
            }
            sum.debitNetChange += debitNetChange;
            sum.creditNetChange += creditNetChange;

            if (entry.StatusCode) {
                sum.debitNetChangeSubstractOriginal += debitNetChange;
                sum.creditNetChangeSubstractOriginal += creditNetChange;
            }
        });

        // amounts for existing/saved journalentries should not be calculated twice, so lines that have
        // previously been journaled are first "removed" from the original balance before readding it
        // to show the effect this journalentry had on the new balance
        if (sum.debitNetChangeSubstractOriginal !== 0) {
            sum.debitOriginalBalance = sum.debitOriginalBalance - sum.debitNetChangeSubstractOriginal;
        }
        if (sum.creditNetChangeSubstractOriginal !== 0) {
            sum.creditOriginalBalance = sum.creditOriginalBalance - sum.creditNetChangeSubstractOriginal;
        }

        // set new balance based on the original balance and the total net change for the account
        // (not the change in the current line)
        sum.debitNewBalance = sum.debitOriginalBalance + sum.debitNetChange;
        sum.creditNewBalance = sum.creditOriginalBalance + sum.creditNetChange;

        return sum;
    }

    public getVatDeductionPercent(vatdeductions: Array<VatDeduction>, account: Account, date: LocalDate): number {
        if (!account || !account.UseDeductivePercent || !date) {
            return 0;
        }

        if (!vatdeductions) {
            return 0;
        }

        let validdeduction =
            vatdeductions.find(x => moment(date).isSameOrAfter(moment(x.ValidFrom))
                && (!x.ValidTo || moment(date).isBefore(moment(x.ValidTo)))
            );

        return validdeduction ? validdeduction.DeductionPercent : 0;
    }

    public calculateJournalEntrySummaryLocal(journalDataEntries: Array<JournalEntryData>, vatdeductions: Array<VatDeduction>): JournalEntrySimpleCalculationSummary {
        let sum: JournalEntrySimpleCalculationSummary = {
            IncomingVat: 0,
            OutgoingVat: 0,
            SumCredit: 0,
            SumCreditNet: 0,
            SumDebet: 0,
            SumDebetNet: 0,
            Differance: 0,
            IsOnlyCompanyCurrencyCode: journalDataEntries
                .every(x => x.CurrencyID === this.companySettings.BaseCurrencyCodeID),
            BaseCurrencyCodeCode: this.companySettings.BaseCurrencyCode && this.companySettings.BaseCurrencyCode.Code
        };

        if (journalDataEntries) {
            journalDataEntries.forEach(entry => {
                let debitData = this.calculateJournalEntryData(
                    entry.DebitAccount,
                    entry.DebitVatType,
                    entry.AmountCurrency,
                    null,
                    entry
                );
                let creditData =  this.calculateJournalEntryData(
                    entry.CreditAccount,
                    entry.CreditVatType,
                    entry.AmountCurrency * -1,
                    null,
                    entry
                );

                // normally a user will use the debit field for positive amounts and credit field
                // for negative amounts. However if they use the debit field and a negative amount,
                // that is the same as using the credit field and a positive amount. Therefore we
                // add the sum to the correct sum (this will also be done automatically in the
                // API, because there we have no concept of debit/credit, just +/-)
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
        sum.Differance = UniMath.round(sum.SumDebet - sum.SumCredit);

        return sum;
    }

    public calculateJournalEntryData(account: Account, vattype: VatType, grossAmountCurrency: number, netAmountCurrency: number, journalEntryData: JournalEntryData): JournalEntryLineCalculation {
        // grossAmountCurrency == med moms, netAmout == uten moms
        let res: JournalEntryLineCalculation = {
            amountGross: 0,
            amountGrossCurrency: 0,
            amountNet: 0,
            amountNetCurrency: 0,
            taxBasisAmount: 0,
            incomingVatAmount: 0,
            outgoingVatAmount: 0
        };

        if (!grossAmountCurrency && !netAmountCurrency) {
            return res;
        }

        let incomingVatAmountCurrency = 0;
        let outgoingVatAmountCurrency = 0;
        let taxBasisAmountCurrency = 0;
        if (account) {
            if (vattype && !vattype.DirectJournalEntryOnly) {
                let deductionpercent =
                    journalEntryData.VatDeductionPercent &&
                    (journalEntryData.StatusCode || account.UseDeductivePercent)
                    ? journalEntryData.VatDeductionPercent
                    : 0;

                // if no deductions exist, assume we get deduction for the entire amounts, i.e. 100%
                // because this simplifies the expressions further down in this function
                if (deductionpercent === 0) {
                    deductionpercent = 100;
                }

                if (grossAmountCurrency) {
                    res.amountGrossCurrency = grossAmountCurrency;

                    res.amountNetCurrency =
                        vattype.ReversedTaxDutyVat ?
                            vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                                (res.amountGrossCurrency * deductionpercent / 100)
                                : (res.amountGrossCurrency * (1 + vattype.VatPercent / 100)) * deductionpercent / 100
                            : res.amountGrossCurrency * deductionpercent / 100 / (1 + vattype.VatPercent / 100);

                    if (deductionpercent !== 100) {
                        res.amountNetCurrency += vattype.ReversedTaxDutyVat ?
                            res.amountGrossCurrency * (100 - deductionpercent) / 100 + (res.amountGrossCurrency * vattype.VatPercent / 100) * ((100 - deductionpercent) / 100)
                                        : res.amountGrossCurrency - res.amountNetCurrency - res.amountNetCurrency * vattype.VatPercent / 100;
                    }
                } else if (netAmountCurrency) {
                    res.amountNetCurrency = netAmountCurrency;

                    if (deductionpercent > 0 && deductionpercent < 100) {
                        console.error('calculateJournalEntryData called for netAmountCurrency with deduction percent set, this is not supported');
                    }

                    res.amountGrossCurrency = vattype.ReversedTaxDutyVat ?
                        vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                            res.amountNetCurrency
                            : res.amountNetCurrency / (1 + (vattype.VatPercent / 100))
                        : res.amountNetCurrency * (1 + (vattype.VatPercent / 100));
                }

                let taxBasisAmount =
                    vattype.ReversedTaxDutyVat ?
                            res.amountGrossCurrency
                            : res.amountGrossCurrency / (1 + vattype.VatPercent / 100);

                if (vattype.ReversedTaxDutyVat) {
                    if (vattype.OutgoingAccountID) {
                        outgoingVatAmountCurrency += -1 * (taxBasisAmount * vattype.VatPercent / 100);
                    } else if (vattype.IncomingAccountID) {
                        incomingVatAmountCurrency += (-1 * (taxBasisAmount * vattype.VatPercent / 100)) * (deductionpercent / 100);
                    }
                }

                if (!(vattype.ReversedTaxDutyVat && !vattype.IncomingAccountID)) {
                    if (vattype.IncomingAccountID) {
                        incomingVatAmountCurrency += ((taxBasisAmount * vattype.VatPercent) / 100) * (deductionpercent / 100);
                    } else if (vattype.OutgoingAccountID) {
                        outgoingVatAmountCurrency += (taxBasisAmount * vattype.VatPercent) / 100;
                    }
                }
            } else {
                if (grossAmountCurrency) {
                    res.amountGrossCurrency = grossAmountCurrency;
                    res.amountNetCurrency = grossAmountCurrency;
                } else if (netAmountCurrency) {
                    res.amountGrossCurrency = netAmountCurrency;
                    res.amountNetCurrency = netAmountCurrency;
                }

                if (vattype && vattype.DirectJournalEntryOnly) {
                    if (vattype.IncomingAccountID) {
                        res.incomingVatAmount += res.amountGross;
                        res.amountNet -= res.amountNet;
                    } else if (vattype.OutgoingAccountID) {
                        res.outgoingVatAmount -= res.amountGross;
                        res.amountNet -= res.amountNet;
                    }
                }
            }
        }

        res.incomingVatAmount = incomingVatAmountCurrency * journalEntryData.CurrencyExchangeRate;
        res.outgoingVatAmount = outgoingVatAmountCurrency * journalEntryData.CurrencyExchangeRate;
        res.taxBasisAmount = taxBasisAmountCurrency * journalEntryData.CurrencyExchangeRate;
        res.amountGross = UniMath.round(res.amountGrossCurrency * journalEntryData.CurrencyExchangeRate);
        res.amountNet = UniMath.round(res.amountNetCurrency * journalEntryData.CurrencyExchangeRate);

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

    public getPreviousJournalEntry(journalEntryYear, journalEntryNumber): Observable<any> {
        let filterNumber = journalEntryNumber ? `and JournalEntryNumberNumeric lt ${journalEntryNumber}` : '';

        return this.statisticsService.GetAll(`model=JournalEntry&select=ID,JournalEntryNumber as JournalEntryNumber,JournalEntryNumberNumeric&orderby=JournalEntryNumberNumeric desc&top=1&expand=FinancialYear&filter=FinancialYear.Year eq ${journalEntryYear} and isnull(JournalEntryNumberNumeric,0) ne 0 ${filterNumber}`)
            .map(data => data.Data);
    }

    public getNextJournalEntry(journalEntryYear, journalEntryNumber): Observable<any> {
        let filterNumber = journalEntryNumber ? `and JournalEntryNumberNumeric gt ${journalEntryNumber}` : '';

        return this.statisticsService.GetAll(`model=JournalEntry&select=ID,JournalEntryNumber as JournalEntryNumber,JournalEntryNumberNumeric&orderby=JournalEntryNumberNumeric asc&top=1&expand=FinancialYear&filter=FinancialYear.Year eq ${journalEntryYear} and isnull(JournalEntryNumberNumeric,0) ne 0 ${filterNumber}`)
            .map(data => data.Data);
    }
}

