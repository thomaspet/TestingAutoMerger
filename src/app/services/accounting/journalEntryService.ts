import {Injectable} from '@angular/core';
import {Account, VatType, FinancialYear, VatDeduction, InvoicePaymentData, AccountGroup, JournalEntryType, SupplierInvoice} from '../../unientities';
import {JournalEntryData, JournalEntryExtended} from '@app/models';
import {Observable} from 'rxjs';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntry, ValidationLevel, CompanySettings, JournalEntryLineDraft, LocalDate} from '../../unientities';
import {ValidationMessage, ValidationResult} from '../../models/validationResult';
import {UniHttp} from '../../../framework/core/http/http';
import {JournalEntrySimpleCalculationSummary} from '../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryAccountCalculationSummary} from '../../models/accounting/JournalEntryAccountCalculationSummary';
import {AccountBalanceInfo} from '../../models/accounting/AccountBalanceInfo';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {StatisticsService} from '../common/statisticsService';
import {JournalEntryLineDraftService} from './journalEntryLineDraftService';
import {CompanySettingsService} from '../common/companySettingsService';
import {ErrorService} from '../common/errorService';
import {UniMath} from '../../../framework/core/uniMath';
import {AuthService, IAuthDetails} from '../../authService';
import {CustomerInvoiceService} from '@app/services/sales/customerInvoiceService';
import {NumberFormat} from '@app/services/common/numberFormatService';
import * as moment from 'moment';

export enum JournalEntryMode {
    Manual,
    Payment,
    SupplierInvoice
}

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
        public authService: AuthService,
        private numberFormat: NumberFormat,
        private invoiceService: CustomerInvoiceService
    ) {
        super(http);
        // Anders 25.09
        // Looks like this service has implemented caching on it's own,
        // and I dont want to mess with this code so close to release..
        // Disabling BizHttp cache to avoid sync issues
        super.disableCache();

        this.relativeURL = JournalEntry.RelativeUrl;
        this.entityType = JournalEntry.EntityType;
        this.DefaultOrderBy = null;

        this.populateCache();
        this.authService.authentication$.subscribe((auth: IAuthDetails) => {
            if (auth && auth.user) {
                this.populateCache();
            }
        });
    }

    private populateCache() {
        this.companySettings = <any>{};
        this.companySettingsService.Get(1, ['BaseCurrencyCode']).subscribe(
            companySettings => this.companySettings = companySettings,
            err => this.errorService.handle(err)
        );
    }

    public getJournalEntrySettings(mode: number): JournalEntrySettings {
        let settings = this.storageService.getItem(`${this.JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY}_${mode}`);

        if (!settings) {
            settings = new JournalEntrySettings();
            settings.AttachmentsVisible = false;
        }

        return settings;
    }

    public setJournalEntrySettings(settings: JournalEntrySettings, mode: number) {
        this.storageService.setItem(`${this.JOURNAL_ENTRY_SETTINGS_LOCALSTORAGE_KEY}_${mode}`, settings);
    }

    public getSessionData(mode: number): Array<JournalEntryData> {
        const previousSessionData = this.storageService.getSessionItemFromCompany(`${this.JOURNAL_ENTRIES_SESSIONSTORAGE_KEY}_${mode}`);

        if (previousSessionData) {
            return previousSessionData;
        }

        return null;
    }

    public getLedgerSuggestions(orgNumber: string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`ledgersuggestions/${orgNumber}`)
            .send()
            .map(res => res.body);
    }

    public getAccountsFromSuggeestions(accountNumberStart) {
        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint('?model=Account' +
            '&select=id as ID,AccountNumber as AccountNumber,AccountName as AccountName,VatTypeID as VatTypeID,Visible as Visible,' +
            `UseVatDeductionGroupID as UseVatDeductionGroupID,TopLevelAccountGroup.GroupNumber,CostAllocationID as CostAllocationID` +
            `&filter=startswith(AccountNumber, '${accountNumberStart}') and ` +
            'isnull(customerid,0) eq 0 and isnull(supplierid,0) eq 0&expand=VatType,TopLevelAccountGroup&orderby=accountnumber&wrap=false')
            .send()
            .map(res => {
                const accounts = res.body;
                return accounts.map(acc => {
                    const account: Account = Object.assign(<Account> {}, acc);
                    account.TopLevelAccountGroup = <AccountGroup> {};
                    account.TopLevelAccountGroup.GroupNumber = acc.TopLevelAccountGroupGroupNumber;
                    return account;
                });
            });
    }

    public getSessionNumberSeries() {
        const numberSeriesID = this.storageService.getSessionItemFromCompany('Numberseries_journalEntry');

        return +numberSeriesID || null;
    }

    public setSessionData(mode: number, data: Array<JournalEntryData>, numberSeriesID?: number) {
        this.storageService.setSessionItemOnCompany(`${this.JOURNAL_ENTRIES_SESSIONSTORAGE_KEY}_${mode}`, data);
        // Remove stored session numberseries when setting empty array
        if (!data) {
            this.setSessionNumberSeries(null);
        } else {
            this.setSessionNumberSeries(numberSeriesID);
        }
    }

    public setSessionNumberSeries(data) {
        this.storageService.setSessionItemOnCompany(`Numberseries_journalEntry`, data);
    }

    public getLastJournalEntryNumber(): Observable<any> {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(
                '/api/statistics?model=journalentryline' +
                '&select=journalentrynumber,journalentrynumbernumeric' +
                '&orderby=journalentrynumbernumeric%20desc&top=1'
            )
            .send()
            .map(response => response.body);
    }

    public getTaxableIncomeLast12Months(toDate: LocalDate): Observable<any> {
        const fromDate = moment(toDate).add('years', -1).format('YYYY-MM-DD');

        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(
                '/api/statistics?model=journalentryline' +
                '&select=sum(JournalEntryLine.Amount) as SumAmount' +
                '&expand=Account.TopLevelAccountGroup,VatType' +
                '&filter=TopLevelAccountGroup.GroupNumber eq 3 and VatType.VatCode eq \'6\' and VatDate ge \'' +
                   `${fromDate.toString()}'`
            )
            .send()
            .map(response => {
                const data = response.body.Data;
                if (data && data.length > 0) {
                    return data[0].SumAmount;
                }
                return 0;
            });
    }

    public getMinDatesForJournalEntry(journalEntryID: number): Observable<any> {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(
                '/api/statistics?model=journalentryline' +
                '&select=JournalEntryNumber as JournalEntryNumber,min(VatDate) as MinVatDate,min(FinancialDate) as MinFinancialDate' +
                '&filter=JournalEntryID eq ' + journalEntryID
            )
            .send()
            .map(response => response.body)
            .map(data => data.Data && data.Data.length > 0 ? data.Data[0] : null);
    }

    public getRelatedAccrualJournalEntries(journalEntryAccrualID: number): Observable<any> {
        if (!journalEntryAccrualID) {
            return Observable.empty();
        }

        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(
                '/api/statistics?model=JournalEntry' +
                '&select=JournalEntryNumber as JournalEntryNumber' +
                '&filter=JournalEntryAccrualID eq ' + journalEntryAccrualID
            )
            .send()
            .map(response => response.body)
            .map(data => data.Data);
    }

    public getNextJournalEntryNumber(journalentry: JournalEntryData): Observable<any> {
        return this.http
            .asPOST()
            .withBody(journalentry)
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=nextjournalentrynumber')
            .send()
            .map(response => response.body);
    }

    public getJournalEntryPeriodData(accountID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=get-journal-entry-period-data&accountID=${accountID}`)
            .send()
            .map(response => response.body);
    }


    public bookJournalEntryAgainstPayment(journalEntryID: number, paymentID: number): Observable<any> {
        return this.http
        .asPOST()
        .usingBusinessDomain()
        .withEndPoint(this.relativeURL + `?action=book-journal-entry-against-payment`
        + `&journalEntryID=${journalEntryID}`
        + `&paymentID=${paymentID}`)
        .send()
        .map(response => response.body);
    }

    public saveJournalEntryDataAsDrafts(journalEntryData: Array<JournalEntryData>, text?: string) {

        // filter out entries with no account or no amount, the user has already approved
        // this in a dialog
        journalEntryData = journalEntryData.filter(x => x.AmountCurrency && (x.DebitAccount || x.CreditAccount));

        const journalEntryDataWithJournalEntryID =
            journalEntryData.filter(x => x.JournalEntryID && x.JournalEntryID > 0);
        const existingJournalEntryIDs: Array<number> = [];
        journalEntryDataWithJournalEntryID.forEach(line => {
            if (!existingJournalEntryIDs.find(x => x === line.JournalEntryID)) {
                existingJournalEntryIDs.push(line.JournalEntryID);
            }
        });

        if (existingJournalEntryIDs.length) {
            return this.GetAll(this.fixInsaneFilter(existingJournalEntryIDs))
                .flatMap(existingJournalEntries => {
                    const journalEntries = this.createJournalEntryObjects(journalEntryData, existingJournalEntries);
                    journalEntries.forEach((je) => {
                        je.Description = text;
                    });

                    return this.saveJournalEntriesAsDraft(journalEntries);
                });
        } else {

            const journalEntries = this.createJournalEntryObjects(journalEntryData, []);
            journalEntries.forEach((je) => {
                je.Description = text;
            });

            return this.saveJournalEntriesAsDraft(journalEntries);
        }
    }

    private fixInsaneFilter(ids: number[]) {
        if (!ids || !ids.length) {
            return;
        }

        if (ids.length === 2) {
            return `filter=ID eq ${ids[0]} or ID eq ${ids[1]}`;
        }

        let previousId;
        let filter = `(ID ge ${ids[0]}`;
        ids.slice(1).forEach(id => {
            if (previousId && id !== previousId + 1) {
                filter += ' and ID le ' + previousId + ')';
                filter += ` or (ID ge ${id}`;
            }

            previousId = id;
        });

        filter += ` AND id le ${ids[ids.length - 1]})`;

        return `filter=${filter}`;
    }

    public postJournalEntryData(journalEntryData: Array<JournalEntryData>): Observable<JournalEntry[]> {
        // TODO: User should also be able to change dimensions for existing entries
        // so consider changing to filtering for dirty rows (and only allow the
        // unitable to edit the dimension fields for existing rows)
        const journalEntryDataNew = journalEntryData.filter(x => !x.StatusCode);

        const existingJournalEntryIDs: Array<number> = [];
        journalEntryDataNew.forEach(line => {
            const journalEntryID = line.JournalEntryID;
            if (journalEntryID && existingJournalEntryIDs.indexOf(journalEntryID) < 0) {
                existingJournalEntryIDs.push(journalEntryID);
            }
        });

        const jeObs = Observable
            .of(journalEntryDataNew.filter(x => !x.CustomerInvoiceID))
            .switchMap(jeData => {
                return existingJournalEntryIDs.length
                    ? Observable.forkJoin(Observable.of(jeData), this.GetAll(this.fixInsaneFilter(existingJournalEntryIDs)))
                    : Observable.forkJoin(Observable.of(jeData), Observable.of([]));
            })
            .map((data: [JournalEntryData[], JournalEntry[]]) => {
                const [jeData, jeList] = data;
                return this.createJournalEntryObjects(jeData, jeList);
            })
            .switchMap(data => data.length
                ? this.bookJournalEntries(data)
                : Observable.of([]));

        const paymentObs = Observable
            .of(journalEntryDataNew.filter(x => x.CustomerInvoiceID && x.DebitAccountID > 0))
            .map(data => this.createInvoicePaymentDataObjects(data))
            .switchMap(data => this.invoiceService.payInvoices(data));

        return Observable
            .forkJoin(jeObs, paymentObs)
            .map((data: [JournalEntry[], JournalEntry[]]) => {
                const [je, jePayments] = data;
                return [...je, ...jePayments];
            });
    }

    public creditAndPostCorrectedJournalEntryData(journalEntryData: Array<JournalEntryData>, journalEntryID: number)
        : Observable<any> {

        // dont post any rows that are already booked, they will be credited with by the action
        const journalEntryDataNew = journalEntryData.filter(x => !x.StatusCode);

        const existingJournalEntryIDs: Array<number> = [];
        journalEntryDataNew.forEach(line => {
            const id = line.JournalEntryID;
            if (id && existingJournalEntryIDs.indexOf(id) < 0) {
                existingJournalEntryIDs.push(id);
            }
        });

        if (existingJournalEntryIDs.length) {
            return this.GetAll(this.fixInsaneFilter(existingJournalEntryIDs))
                .flatMap(existingJournalEntries => {
                    const journalEntries = this.createJournalEntryObjects(journalEntryDataNew, existingJournalEntries);
                    return this.creditAndBookCorrectedJournalEntries(journalEntries, journalEntryID);
                });
        } else {
            const journalEntries = this.createJournalEntryObjects(journalEntryDataNew, []);
            return this.creditAndBookCorrectedJournalEntries(journalEntries, journalEntryID);
        }
    }

    private saveJournalEntriesAsDraft(journalEntries: Array<JournalEntry>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntries)
            .withEndPoint(this.relativeURL + '?action=save-journal-entries-as-draft')
            .send()
            .map(response => response.body);
    }

    public deleteJournalEntryDraftGroup(journalEntryDraftGroup: string): Observable<any> {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=delete-journal-entry-draft-group&journalEntryDraftGroup=' + journalEntryDraftGroup)
            .send();
    }

    public bookJournalEntries(journalEntries: Array<JournalEntry>): Observable<JournalEntry[]> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBodyTrim(journalEntries)
            .withEndPoint(this.relativeURL + '?action=book-journal-entries')
            .send()
            .map(response => response.body);
    }

    private creditAndBookCorrectedJournalEntries(journalEntries: Array<JournalEntry>, journalEntryID: number)
    : Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntries)
            .withEndPoint(
                this.relativeURL + '?action=credit-and-book-journalentry&journalEntryID=' + journalEntryID)
            .send()
            .map(response => response.body);
    }

    public createInvoicePaymentDataObjects(data: JournalEntryData[] ):
    {id: number, payment: InvoicePaymentData, numberSeriesID: number}[] {
        const dataToConvert = data.filter(line => !!line.InvoiceNumber);

        return dataToConvert.map(line => {
            return {
                id: line.CustomerInvoiceID,
                payment: <InvoicePaymentData>{
                    Amount: line.Amount,
                    AmountCurrency: line.AmountCurrency,
                    PaymentDate: line.FinancialDate,
                    CurrencyCodeID: line.CurrencyID,
                    CurrencyExchangeRate: line.CurrencyExchangeRate,
                },
                numberSeriesID: line.NumberSeriesID
            };
        });
    }

    public createJournalEntryObjects(data: Array<JournalEntryData>, existingJournalEntries: Array<any>): Array<JournalEntryExtended> {
        let previousJournalEntryNo: string = null;
        const journalEntries: Array<JournalEntryExtended> = [];
        let je: JournalEntryExtended;

        // create new journalentries and journalentrylines for the inputdata
        const sortedJournalEntryData =
            data.sort((a, b) => a.JournalEntryID - b.JournalEntryID)
                .sort((a, b) => a.JournalEntryNo.localeCompare(b.JournalEntryNo));

        sortedJournalEntryData.forEach(line => {
            if (line.JournalEntryID && line.JournalEntryID > 0) {
                if (!je || (je && je.ID && je.ID.toString() !== line.JournalEntryID.toString())) {
                    const journalEntry = journalEntries.find(x => x.ID.toString() === line.JournalEntryID.toString());
                    if (journalEntry) {
                        // we have already got this journalentry in our collection, so use that
                        je = journalEntry;
                    } else {
                        // we have set a journalentryid, but it has not been used yet - so
                        // look in the existingJournalEntries retrieved from the server and
                        // set some extra properties on that
                        const existingJournalEntry =
                            existingJournalEntries.find(
                                x => (x.ID ? x.ID.toString() : x.JournalEntryID.toString()) === line.JournalEntryID.toString()
                            );

                        if (existingJournalEntry) {
                            je = existingJournalEntry;
                            je.DraftLines = [];
                            je.FileIDs = line.FileIDs;
                            je.Payments = [];
                            journalEntries.push(je);
                        } else {
                            // this shouldnt happen, so just throw an exception here
                            throw Error('No journalentry found for ID ' + line.JournalEntryID);
                        }
                    }
                }
            } else if (!previousJournalEntryNo || previousJournalEntryNo !== line.JournalEntryNo) {
                // for each new number in line.JournalEntryNo, create a new journalentry
                je = new JournalEntryExtended();
                je.NumberSeriesTaskID = line.NumberSeriesTaskID;
                je.NumberSeriesID = line.NumberSeriesID;
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
            const draftLines = this.createJournalEntryDraftLines(line, je);


            draftLines.forEach(draftLine => {
                je.DraftLines.push(draftLine);
            });
        });

        return journalEntries;
    }

    private createJournalEntryDraftLines(journalEntryData: JournalEntryData, je: JournalEntryExtended): Array<JournalEntryLineDraft> {
        const lines = new Array<JournalEntryLineDraft>();

        const hasDebitAccount: boolean = journalEntryData.DebitAccountID ? true : false;
        const hasCreditAccount: boolean = journalEntryData.CreditAccountID ? true : false;

        const amount: number = journalEntryData.Amount;
        const amountCurrency: number = journalEntryData.AmountCurrency;

        if (journalEntryData.Dimensions) {
            delete journalEntryData.Dimensions.ID;
        }

        if (hasDebitAccount) {
            const debitAccount = journalEntryData.DebitAccount;
            const debitVatType = journalEntryData.DebitVatTypeID ? journalEntryData.DebitVatType : null;

            const draftLine: JournalEntryLineDraft = new JournalEntryLineDraft();

            draftLine.Account = debitAccount;
            draftLine.AccountID = debitAccount.ID;
            draftLine.Amount = amount;
            draftLine.AmountCurrency = amountCurrency;
            draftLine.CurrencyExchangeRate = journalEntryData.CurrencyExchangeRate;
            draftLine.CurrencyCode = journalEntryData.CurrencyCode;
            draftLine.CurrencyCodeID = journalEntryData.CurrencyCode ? journalEntryData.CurrencyCode.ID : null;
            draftLine.Description = journalEntryData.Description;
            draftLine.Dimensions = journalEntryData.Dimensions;
            draftLine.FinancialDate = journalEntryData.FinancialDate
                ? journalEntryData.FinancialDate
                : journalEntryData.VatDate;
            draftLine.InvoiceNumber = journalEntryData.InvoiceNumber;
            draftLine.RegisteredDate = new LocalDate(Date());
            draftLine.PaymentID = journalEntryData.PaymentID;
            draftLine.VatDate = journalEntryData.VatDate;
            draftLine.VatTypeID = journalEntryData.DebitVatTypeID;
            draftLine.VatType = debitVatType;
            draftLine.JournalEntryTypeID = journalEntryData.JournalEntryTypeID;
            draftLine.CustomerOrderID = journalEntryData.CustomerOrderID;
            draftLine.VatDeductionPercent = journalEntryData.VatDeductionPercent && !!debitAccount.UseVatDeductionGroupID
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
                draftLine.DueDate = journalEntryData.DueDate;
            }

            lines.push(draftLine);
        }

        if (hasCreditAccount) {
            const creditAccount = journalEntryData.CreditAccount;
            const creditVatType = journalEntryData.CreditVatType;

            const draftLine: JournalEntryLineDraft = new JournalEntryLineDraft();

            draftLine.Account = creditAccount;
            draftLine.AccountID = creditAccount.ID;
            draftLine.Amount =  journalEntryData.Amount * -1;
            draftLine.AmountCurrency = journalEntryData.AmountCurrency * -1;
            draftLine.CurrencyExchangeRate = journalEntryData.CurrencyExchangeRate;
            draftLine.CurrencyCodeID = journalEntryData.CurrencyID;
            draftLine.CurrencyCode = journalEntryData.CurrencyCode;
            draftLine.Description = journalEntryData.Description;
            draftLine.Dimensions = journalEntryData.Dimensions;
            draftLine.FinancialDate = journalEntryData.FinancialDate
                ? journalEntryData.FinancialDate
                : journalEntryData.VatDate;
            draftLine.InvoiceNumber = journalEntryData.InvoiceNumber;
            draftLine.RegisteredDate = new LocalDate(Date());
            draftLine.PaymentID = journalEntryData.PaymentID;
            draftLine.VatDate = journalEntryData.VatDate;
            draftLine.VatTypeID = journalEntryData.CreditVatTypeID;
            draftLine.VatType = creditVatType;
            draftLine.JournalEntryTypeID = journalEntryData.JournalEntryTypeID;
            draftLine.CustomerOrderID = journalEntryData.CustomerOrderID;
            draftLine.VatDeductionPercent = journalEntryData.VatDeductionPercent && !!creditAccount.UseVatDeductionGroupID
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
                draftLine.DueDate = journalEntryData.DueDate;
            }

            lines.push(draftLine);
        }

        return lines;
    }

    public saveJournalEntryData(journalEntries: Array<JournalEntry>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntries)
            .withEndPoint(this.relativeURL + '?action=save-journal-entry-data')
            .send()
            .map(response => response.body);
    }

    public checkInvoiceCreditAccountCombo(invoiceNumber, supplierID) {
        return this.http.asGET()
        .usingStatisticsDomain()
        .withEndPoint('?model=JournalEntryLine&select=count(id)'
        + '&filter=subaccount.supplierID eq '
        + supplierID + ' and InvoiceNumber eq "'
        + invoiceNumber + '" and StatusCode ne 31004&expand=subaccount')
        .send()
        .map(response => response.body);
    }

    public getAccountingLockedDate(): LocalDate {
        if (this.companySettings) {
            return this.companySettings.AccountingLockedDate;
        } else {
            throw new Error('Companysetting is not set in journalEntryService when calling GetAccountingLockedDate');
        }
    }

    public validateJournalEntryDataLocal(
        journalDataEntries: Array<JournalEntryData>,
        currentFinancialYear: FinancialYear,
        financialYears: Array<FinancialYear>,
        companySettings: CompanySettings,
        doValidateBalance: boolean,
        mode: JournalEntryMode
    ): Promise<ValidationResult> {
        const result: ValidationResult = new ValidationResult();
        result.Messages = [];

        return new Promise((resolve, reject) => {

            // if mode is SupplierInvoice, we are always working on just one journalentry, so
            // remove the journalentryno to avoid any problems with incorrect values being set
            // there by journalentryprofessional in some cases
            if (mode === JournalEntryMode.SupplierInvoice) {
                journalDataEntries.forEach(row => {
                    row.JournalEntryNo = '';
                });
            }


            const dblPaymentsInvoiceNo: Array<string> = [];
            journalDataEntries.forEach(row => {
                if (row.InvoiceNumber) {
                    const duplicatePayments = journalDataEntries.filter(entry =>
                        entry.InvoiceNumber === row.InvoiceNumber && entry.InvoiceNumber
                        && ((entry.DebitAccount && entry.DebitAccount.UsePostPost)
                        || (entry.CreditAccount && entry.CreditAccount.UsePostPost))
                    );

                    if (duplicatePayments.length > 1) {
                        if (!dblPaymentsInvoiceNo.find(x => x === row.InvoiceNumber)) {
                            dblPaymentsInvoiceNo.push(row.InvoiceNumber);
                        }
                    }
                }
            });

            if (dblPaymentsInvoiceNo.length > 0) {
                const invPaymValidation = new ValidationMessage();
                let subMsg: string = '';
                dblPaymentsInvoiceNo.forEach(invoiceNo => {
                    subMsg += invoiceNo + ', ';
                });

                invPaymValidation.Level = ValidationLevel.Warning;
                const subNoMsg = dblPaymentsInvoiceNo.length > 1 ? 'numrene ' : 'nr ';

                invPaymValidation.Message =
                    'Faktura' + subNoMsg + subMsg.substring(0, subMsg.length - 2) + ' har flere betalinger.';

                result.Messages.push(invPaymValidation);
            }

            const invalidRows = journalDataEntries.filter(
                x => !x.StatusCode && (!x.Amount || !x.FinancialDate || (!x.CreditAccountID && !x.DebitAccountID))
            );

            if (invalidRows.length > 0) {
                const message = new ValidationMessage();
                message.Level = ValidationLevel.Error;
                message.Message = 'Dato, beløp og enten debet eller kreditkonto må fylles ut på alle radene';
                result.Messages.push(message);
            }

            const rowsWithInvalidAccounts =
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
                        const message = new ValidationMessage();
                        message.Level = ValidationLevel.Error;
                        message.Message = errorMsg;
                        result.Messages.push(message);
                    }
                });
            }

            if (companySettings && companySettings.AccountingLockedDate) {
                const invalidDates = journalDataEntries.filter(
                    x => !x.StatusCode && x.FinancialDate
                        && moment(x.FinancialDate).isSameOrBefore(moment(companySettings.AccountingLockedDate))
                );

                if (invalidDates.length > 0) {
                    const message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    message.Message = `Regnskapet er låst til ${moment(companySettings.AccountingLockedDate).format('L')},` +
                        ` ${invalidDates.length} linje${invalidDates.length > 1 ? 'r' : ''} har dato tidligere enn dette`;
                    result.Messages.push(message);
                }
            }

            if (companySettings && companySettings.VatLockedDate) {
                const invalidVatDates = journalDataEntries.filter(
                    x => !x.StatusCode && x.VatDate
                    && moment(x.VatDate).isSameOrBefore(moment(companySettings.VatLockedDate))
                    && (x.DebitVatType || x.CreditVatType)
                );

                if (invalidVatDates.length > 0) {
                    const message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    message.Message = `MVA er låst til ${moment(companySettings.VatLockedDate).format('L')},` +
                        ` ${invalidVatDates.length} linje${invalidVatDates.length > 1 ? 'r' : ''} har dato tidligere enn dette`;
                    result.Messages.push(message);
                }
            }

            const sortedJournalEntries = journalDataEntries
                .concat()
                .sort((a, b) => {
                    if (a.JournalEntryNo > b.JournalEntryNo) {
                        return 1;
                    } else if (a.JournalEntryNo < b.JournalEntryNo) {
                        return -1;
                    }
                    return 0;
                });

            let lastJournalEntryNo: string = '';
            let currentSumDebit: number = 0;
            let currentSumCredit: number = 0;
            let lastJournalEntryFinancialDate: LocalDate;

            sortedJournalEntries.forEach(entry => {
                if (doValidateBalance) {
                    if (lastJournalEntryNo !== entry.JournalEntryNo) {
                        const diff = UniMath.round(currentSumDebit - (currentSumCredit * -1));
                        if (diff !== 0) {
                            const message = new ValidationMessage();
                            message.Level = ValidationLevel.Error;
                            message.Message = `Bilag ${lastJournalEntryNo || ''} går ikke i balanse.`
                                + ` Sum debet og sum kredit må være lik (differanse: ${diff})`;
                            result.Messages.push(message);
                        }

                        lastJournalEntryNo = entry.JournalEntryNo;
                        currentSumCredit = 0;
                        currentSumDebit = 0;
                        lastJournalEntryFinancialDate = null;
                    }
                }

                if (entry.JournalEntryDataAccrual) {
                    const isDebitResultAccount = (entry.DebitAccount && entry.DebitAccount.TopLevelAccountGroup
                        && entry.DebitAccount.TopLevelAccountGroup.GroupNumber >= 3);
                    const isCreditResultAccount = (entry.CreditAccount && entry.CreditAccount.TopLevelAccountGroup
                        && entry.CreditAccount.TopLevelAccountGroup.GroupNumber >= 3);

                    if ((isDebitResultAccount && isCreditResultAccount) ||
                        (!isDebitResultAccount && !isCreditResultAccount)) {

                        const message = new ValidationMessage();
                        message.Level = ValidationLevel.Error;
                        if (isDebitResultAccount) {
                            message.Message = `Bilag ${lastJournalEntryNo || ''} har en periodisering med 2 resultatkontoer `;
                        } else {
                            message.Message = `Bilag ${lastJournalEntryNo || ''} har en periodisering uten resultatkonto `;
                        }
                        result.Messages.push(message);
                    }
                }

                let financialYearEntry: FinancialYear;

                if (!entry.StatusCode && entry.FinancialDate) {
                    financialYearEntry = financialYears.find(x =>
                            moment(entry.FinancialDate).isSameOrAfter(moment(x.ValidFrom), 'day')
                            && moment(entry.FinancialDate).isSameOrBefore(moment(x.ValidTo), 'day')
                    );

                    if (!financialYearEntry) {
                        const message = new ValidationMessage();
                        message.Level = ValidationLevel.Warning;
                        message.Message = `Bilag ${lastJournalEntryNo || ''} har en dato som ikke finnes i noen eksisterende regnskapsår ` +
                            `(${moment(entry.FinancialDate).format('DD.MM.YYYY')}). Et nytt regnskapsår vil bli opprettet ved lagring`;
                        result.Messages.push(message);
                    } else if (entry.FinancialDate && moment(entry.FinancialDate).year() > currentFinancialYear.Year
                        || moment(entry.FinancialDate).year() < currentFinancialYear.Year) {
                        const message = new ValidationMessage();
                        message.Level = ValidationLevel.Warning;
                        message.Message = `Bilag ${entry.JournalEntryNo || ''} har en dato som ikke er innenfor regnskapsåret ` +
                            `${currentFinancialYear.Year} (${moment(entry.FinancialDate).format('DD.MM.YYYY')})`;
                        result.Messages.push(message);
                    }
                }

                if (lastJournalEntryFinancialDate && entry.FinancialDate && !entry.StatusCode ) {
                    // Find the financialyear for the lastJournalEntryFinancialDate.FinancialDate and log an
                    // error if they are not equal. Note that the year of the date might be different without
                    // causing an error, e.g. if the financialyear is defined from 01.07.XXXX to 30.06.XXXX+1
                    const financialYearLastEntry = financialYears.find(x =>
                        moment(lastJournalEntryFinancialDate).isSameOrAfter(moment(x.ValidFrom), 'day')
                        && moment(lastJournalEntryFinancialDate).isSameOrBefore(moment(x.ValidTo), 'day')
                    );

                    if (financialYearLastEntry !== financialYearEntry) {
                        const message = new ValidationMessage();
                        message.Level = ValidationLevel.Error;
                        message.Message = `Bilag ${lastJournalEntryNo || ''} er fordelt over flere regnskapsår - dette er ikke lov.` +
                            ` Vennligst velg samme år, eller endre bilagsnr på linjene som har forskjellig år`;
                        result.Messages.push(message);
                    }
                }

                if (
                    (entry.DebitAccount && entry.CreditAccount)
                    || (entry.DebitAccount && !entry.CreditAccount && entry.Amount > 0)
                ) {
                    currentSumDebit += entry.Amount;
                    currentSumDebit = parseFloat(currentSumDebit.toFixed(2)); // Because javascript is bad at math
                }

                if ((entry.DebitAccount && entry.CreditAccount)
                    || (!entry.DebitAccount && entry.CreditAccount)) {
                    currentSumCredit -= entry.Amount;
                } else if (entry.DebitAccount && !entry.CreditAccount && entry.Amount < 0) {
                    currentSumCredit += entry.Amount;
                }

                lastJournalEntryFinancialDate = entry.FinancialDate;
            });

            const multipleDates: Array<string> = [];
            journalDataEntries.forEach(row => {
                if (row.FinancialDate) {
                    const otherDate = journalDataEntries.filter(entry =>
                        entry.JournalEntryNo === row.JournalEntryNo
                        && entry.FinancialDate
                        && entry.FinancialDate.toString() !== row.FinancialDate.toString()
                    );

                    if (otherDate.length > 0) {
                        const journalEntryNo = (row.JournalEntryNo || '');

                        if (multipleDates.indexOf(journalEntryNo.toString()) === -1) {
                            multipleDates.push(journalEntryNo);
                        }
                    }
                }
            });

            if (multipleDates.length > 0 && mode !== JournalEntryMode.SupplierInvoice) {
                multipleDates.forEach(journalEntryNo => {
                    const message = new ValidationMessage();
                    message.Level = ValidationLevel.Warning;
                    message.Message = `Bilag ${journalEntryNo || ''} er fordelt på flere regnskapsdatoer`;
                    result.Messages.push(message);
                });
            }

            if (mode === JournalEntryMode.SupplierInvoice) {
                const message = new ValidationMessage();
                message.Level = ValidationLevel.Info;
                message.Message = `Bilagets dato vil settes i henhold til firmainnstilling, og automatisk få faktura- eller leveringsdato ved lagring.`;
                result.Messages.push(message);
            }

            if (doValidateBalance) {
                const diff = UniMath.round(currentSumDebit - (currentSumCredit * -1));
                if (diff !== 0) {
                    const message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    message.Message = `Bilag ${lastJournalEntryNo || ''}
                    går ikke i balanse. Sum debet og sum kredit må være lik (differanse: ${diff})`;
                    result.Messages.push(message);
                }
            }

            // inline function that checks if the sum
            const vatSummaryCheck = () => {
                if (companySettings && companySettings.TaxMandatoryType === 2) {
                    // get sum of items where vatcode is used - if the sum is larger than limit, add warning
                    let sumNewRowsWithVatCode6 = 0;
                    sortedJournalEntries.forEach(x => {
                        if (x.DebitVatType && x.DebitVatType.VatCode === '6') {
                            sumNewRowsWithVatCode6 += x.NetAmount;
                        }
                        if (x.CreditVatType && x.CreditVatType.VatCode === '6') {
                            sumNewRowsWithVatCode6 += (x.NetAmount * -1);
                        }
                    });

                    // get max date from items where vatcode 6 is used and check if
                    let maxDate = null;
                    sortedJournalEntries.forEach(x => {
                        if ((x.DebitVatType && x.DebitVatType.VatCode === '6')
                            || (x.CreditVatType && x.CreditVatType.VatCode === '6')) {
                            if (!maxDate) {
                                maxDate = x.VatDate || x.FinancialDate;
                            } else if (maxDate < (x.VatDate || x.FinancialDate)) {
                                maxDate = x.VatDate || x.FinancialDate;
                            }
                        }
                    });

                    if (maxDate && sumNewRowsWithVatCode6 !== 0) {
                        // get sum for existing rows
                        this.getTaxableIncomeLast12Months(maxDate)
                            .subscribe(existingAmount => {

                                // add sum for the new rows
                                const sumAllIncomeLast12Months = existingAmount + sumNewRowsWithVatCode6;

                                // we are summing income here, so check if the number is less than -50000
                                if (sumAllIncomeLast12Months < (this.companySettings.TaxableFromLimit * -1)) {
                                    const message = new ValidationMessage();
                                    message.Level = ValidationLevel.Warning;
                                    message.Message = `Det er bokført totalt kr ${this.numberFormat.asMoney((existingAmount * -1))} ` +
                                        `med MVA-kode 6 de siste 12 månedene. `;

                                    if (!(existingAmount < (this.companySettings.TaxableFromLimit * -1))) {
                                        message.Message += `Posteringene over gjør at grensen på kr ` +
                                        `${this.numberFormat.asMoney(this.companySettings.TaxableFromLimit)} som er registrert i ` +
                                        `Firmaoppsett passeres. Etter denne bokføringen er det `;
                                    } else {
                                        message.Message += `Dette er over grensen på kr ` +
                                        `${this.numberFormat.asMoney(this.companySettings.TaxableFromLimit)} som er registrert i ` +
                                        `Firmaoppsett. Det er `;
                                    }

                                    // the start of this sentence is set in the if above, it depends on if the current
                                    // journalentries is cause the limit to be reached, or it is previously reached
                                    message.Message += `praktisk å vente med videre fakturering/bokføring av momspliktige ` +
                                    `inntekter til etter mva-registreringen er godkjent og man har lagt inn dato for ` +
                                    `registrering. "Mva.pliktig" skal da endres til "Avgiftspliktig". ` +
                                    `Må man fakturere/bokføre flere salg etter grense er nådd, men før registrering er godkjent, skal ` +
                                    `man etter reglene fakturere uten mva, og deretter etterfakturere mva når godkjenning er mottatt.`;

                                    result.Messages.push(message);
                                    resolve(result);
                                } else {
                                    resolve(result);
                                }
                            });
                    } else {
                        resolve(result);
                    }
                } else {
                    resolve(result);
                }
            };

            // FORKJOIN CHECKS
            const obs = [];
            const indexes = [];
            sortedJournalEntries.forEach((entry, ind) => {
                if (entry.InvoiceNumber &&
                    entry.CreditAccount &&
                    entry.CreditAccount.SupplierID) {
                        indexes.push(ind);
                        obs.push(this.checkInvoiceCreditAccountCombo(
                            entry.InvoiceNumber,
                            entry.CreditAccount.SupplierID));
                    }
            });
            if (obs.length) {
                Observable.forkJoin(obs).subscribe((data) => {
                    data.forEach((res: any, i) => {
                        if (res && res.Data && res.Data[0].countid > 0) {
                            const warning = new ValidationMessage();
                            warning.Level = ValidationLevel.Warning;
                            warning.Message = 'Bilagslinje med fakturanr. '
                            + sortedJournalEntries[indexes[i]].InvoiceNumber + ' og leverandør '
                            + sortedJournalEntries[indexes[i]].CreditAccount.AccountName + ' finnes allerede lagret.';
                            result.Messages.push(warning);
                        }
                    });

                    // run vat summary check (if needed), this resolves the promise
                    vatSummaryCheck();
                }, (err) => { vatSummaryCheck(); });
            } else {
                // run vat summary check (if needed), this resolves the promise
                vatSummaryCheck();
            }
        });
    }

    public validateJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=validate-journal-entry-data')
            .send()
            .map(response => response.body);
    }

    public getJournalEntryDataBySupplierInvoiceID(supplierInvoiceID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&supplierInvoiceID=' + supplierInvoiceID)
            .send()
            .map(response => response.body);
    }

    public getJournalEntryDataByJournalEntryDraftGroup(journalEntryDraftGroup: string): Observable<Array<JournalEntryData>> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&journalEntryDraftGroup=' + journalEntryDraftGroup)
            .send()
            .map(response => response.body);
    }

    public getJournalEntryDataByJournalEntryID(journalEntryID: number, singleRowMode: boolean): Observable<JournalEntryData[]> {
        return Observable.forkJoin(
            this.journalEntryLineDraftService.GetAll(
            `filter=JournalEntryID eq ${journalEntryID}&orderby=JournalEntryID,ID`,
            ['Account.TopLevelAccountGroup', 'VatType', 'JournalEntryType', 'Dimensions.Department', 'Dimensions.Project',
            'Dimensions.Dimension5', 'Dimensions.Dimension6', 'Dimensions.Dimension7', 'Dimensions.Dimension8',
            'Dimensions.Dimension9', 'Dimensions.Dimension10', 'Accrual', 'CurrencyCode', 'Accrual.Periods']),

            this.statisticsService.GetAll(`model=FileEntityLink&filter=EntityType eq 'JournalEntry' `
                + `and EntityID eq ${journalEntryID}&select=FileID`),

            this.statisticsService.GetAll(`model=Tracelink&filter=DestinationEntityName eq 'Payment' `
                + `and SourceEntityName eq 'JournalEntry' and JournalEntry.ID eq ${journalEntryID}`
                + `&join=Tracelink.SourceInstanceId eq JournalEntry.ID and `
                + `Tracelink.DestinationInstanceId eq Payment.ID`
                + `&select=Tracelink.DestinationInstanceId as PaymentId,Payment.StatusCode as StatusCode`)
        ).map(responses => {
            const draftLines: Array<JournalEntryLineDraft> = responses[0];
            const fileList: Array<any> = responses[1].Data ? responses[1].Data : [];
            const paymentIDs: Array<any> = responses[2].Data ? responses[2].Data : [];

            const journalEntryDataObjects: Array<JournalEntryData> = [];
            if (singleRowMode) {
                // map journalentrydraftlines to journalentrydata objects - these are easier to work for the
                // components, because this is the way the user wants to see the data
                draftLines.forEach(line => {
                    const jed = this.getJournalEntryDataFromJournalEntryLineDraft(line, null, singleRowMode);
                    journalEntryDataObjects.push(jed);
                });
            } else {
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
                        jed = this.getJournalEntryDataFromJournalEntryLineDraft(line, jed, singleRowMode);
                        journalEntryDataObjects.push(jed);
                    } else {
                        this.getJournalEntryDataFromJournalEntryLineDraft(line, jed, singleRowMode);
                    }
                });

                // make the amounts absolute - we are setting debit/credit accounts
                // based on positive/negative amounts, so the actual amount should be positive.
                // For singleRowMode, this is not true
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
            }

            // add fileids if any files are connected to the journalentries
            const fileIdList = [];
            if (fileList) {
                fileList.forEach(x => {
                    fileIdList.push(x.FileEntityLinkFileID);
                });
            }

            journalEntryDataObjects.forEach(entry => {
                entry.FileIDs = fileIdList;
            });

            // Partial payment data will be set loaded, this makes the sure the GUI shows that there is a payment connected to this post.
            // We set the payment status to check if the payment is still editable.
            // the complete payment data will be loaded by the addPaymentsModal
            journalEntryDataObjects.forEach(entry => {
                if (paymentIDs.length) {
                    entry.JournalEntryPaymentData = <any> {
                        ID: paymentIDs[0].PaymentId,
                        StatusCode: paymentIDs[0].PaymentId
                    };
                }
            });

            return JSON.parse(JSON.stringify(journalEntryDataObjects));
        });
    }

    private getJournalEntryDataFromJournalEntryLineDraft(
        line: JournalEntryLineDraft, jed: JournalEntryData, singleRowMode: boolean
    ): JournalEntryData {
        if (!jed) {
            jed = new JournalEntryData();
            jed.FinancialDate = line.FinancialDate;
            jed.VatDate = line.VatDate;
            jed.Amount = line.Amount;
            jed.AmountCurrency = line.AmountCurrency;
            jed.CurrencyID = line.CurrencyCodeID;
            jed.CurrencyCode = line.CurrencyCodeID ? line.CurrencyCode : null;
            jed.CurrencyExchangeRate = line.CurrencyExchangeRate;
            jed.JournalEntryID = line.JournalEntryID;
            jed.JournalEntryNo = line.JournalEntryNumber;
            jed.JournalEntryTypeID = line.JournalEntryTypeID;
            jed.JournalEntryType = line.JournalEntryType;
            jed.Description = line.Description;
            jed.StatusCode = line.StatusCode;
            jed.JournalEntryDraftIDs = [];
            jed.JournalEntryDrafts = [];
        }

        if (!jed.CustomerInvoiceID && line.CustomerInvoiceID) {
            jed.CustomerInvoiceID = line.CustomerInvoiceID;
        }

        if (!jed.SupplierInvoiceID && line.SupplierInvoiceID) {
            jed.SupplierInvoiceID = line.SupplierInvoiceID;
        }

        if (!jed.InvoiceNumber && line.InvoiceNumber) {
            jed.InvoiceNumber = line.InvoiceNumber;
        }

        if (!jed.Dimensions && line.Dimensions) {
            jed.Dimensions = line.Dimensions;
        }

        if (!jed.DueDate && line.DueDate) {
            jed.DueDate = line.DueDate;
        }

        if (!jed.PostPostJournalEntryLineID && line.PostPostJournalEntryLineID) {
            jed.PostPostJournalEntryLineID = line.PostPostJournalEntryLineID;
        }

        jed.JournalEntryDraftIDs.push(line.ID);
        jed.JournalEntryDrafts.push(line);

        if (line.AccrualID) {
            jed.JournalEntryDataAccrualID = line.AccrualID;
            jed.JournalEntryDataAccrual = line.Accrual;
        }

        if (line.Amount > 0 || line.AmountCurrency > 0 || singleRowMode) {
            jed.DebitAccountID = line.AccountID;
            jed.DebitAccount = line.AccountID ? line.Account : null;
            jed.DebitVatTypeID = line.VatTypeID;
            jed.DebitVatType = line.VatTypeID ? line.VatType : null;
            if (jed.DebitVatType) {
                jed.DebitVatType.VatPercent = line.VatPercent;
            }
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
            if (jed.CreditVatType) {
                jed.CreditVatType.VatPercent = line.VatPercent;
            }
            jed.CustomerInvoiceID = line.CustomerInvoiceID;
            jed.SupplierInvoiceID = line.SupplierInvoiceID;
            jed.VatDeductionPercent = jed.VatDeductionPercent
                ? jed.VatDeductionPercent
                : line.VatDeductionPercent;
        }

        if (jed.CreditAccountID && jed.DebitAccountID && jed.Amount < 0 && !singleRowMode) {
            jed.Amount = jed.Amount * -1;
            jed.AmountCurrency = jed.AmountCurrency * -1;
        }

        if (jed.CreditAccountID && jed.DebitAccountID && jed.AmountCurrency < 0 && !singleRowMode) {
            jed.Amount = jed.Amount * -1;
            jed.AmountCurrency = jed.AmountCurrency * -1;
        }

        return jed;
    }

    public creditJournalEntry(journalEntryNumber): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(
                this.relativeURL + '?action=credit-journalentry&journalEntryNumber='
                + journalEntryNumber + '&acceptjob=true'
            )
            .send()
            .map(response => response.body);
    }

    public getAccountBalanceInfo(
        journalDataEntries: Array<JournalEntryData>,
        previousList: Array<AccountBalanceInfo>,
        currentFinancialYear: FinancialYear
    ): Observable<any> {

        const distinctAccountIDs: Array<number> = [];

        journalDataEntries.forEach(row => {

            if (row.DebitAccountID && distinctAccountIDs.indexOf(row.DebitAccountID) === -1) {
                distinctAccountIDs.push(row.DebitAccountID);
            }
            if (row.CreditAccountID && distinctAccountIDs.indexOf(row.CreditAccountID) === -1) {
                distinctAccountIDs.push(row.CreditAccountID);
            }
        });

        const distinctNewAccountIDs: Array<number> =
            distinctAccountIDs.filter(id => !previousList.find(abi => abi.accountID === id));

        if (distinctNewAccountIDs.length === 0) {
            return Observable.from([previousList]);
        }

        const filters = [];
        distinctNewAccountIDs.forEach(id => {
            filters.push(`( isnull(AccountID\,0) eq ${id} or isnull(SubAccountID\,0) eq ${id} ) `);
        });

        const requests = [];
        while (filters.length) {
            const firstThirty = filters.splice(0, 30);

            const filter = `(${firstThirty.join(' or ')}) ` +
                `and (( isnull(TopLevelAccountGroup.GroupNumber\,0) le 2 and Period.AccountYear le ${currentFinancialYear.Year}) ` +
                `or (TopLevelAccountGroup.GroupNumber ge 3 and Period.AccountYear eq ${currentFinancialYear.Year} ))`;

            const request = this.statisticsService.GetAll(
                `model=JournalEntryLine` +
                `&expand=Account.TopLevelAccountGroup,SubAccount,Period` +
                `&filter=${filter}` +
                `&select=isnull(sum(JournalEntryLine.AmountCurrency),0) as SumAmountCurrency,JournalEntryLine.AccountID as AccountID,` +
                `JournalEntryLine.SubAccountID as SubAccountID`
            );

            requests.push(request);
        }

        return Observable.forkJoin(requests)
            .catch(() => Observable.of(null))
            .map(res => {
                const accountBalances: Array<AccountBalanceInfo> = previousList;

                if (res && res.length) {
                    const data = [];
                    res.forEach(statisticsResponse => {
                        data.push(...statisticsResponse.Data);
                    });

                    data.forEach(row => {
                        const accountBalance: AccountBalanceInfo = new AccountBalanceInfo();
                        accountBalance.accountID = row.SubAccountID ? row.SubAccountID : row.AccountID;
                        accountBalance.balance = row.SumAmountCurrency;

                        accountBalances.push(accountBalance);
                    });
                }

                return accountBalances;
            });
    }

    public calculateJournalEntryAccountSummaryLocal(
        journalDataEntries: Array<JournalEntryData>,
        accountBalances: Array<AccountBalanceInfo>,
        vatdeductions: Array<VatDeduction>,
        currentLine: JournalEntryData
    ): JournalEntryAccountCalculationSummary {
        const sum: JournalEntryAccountCalculationSummary = {
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

        const accountsToCheck: Array<number> = [];

        if (!currentLine) {
            return sum;
        } else {
            sum.deductionPercent = currentLine.VatDeductionPercent;
        }

        // get opening balance for the debit / credit account, and set the currentline net change
        if (currentLine.DebitAccount) {
            const originalBalance = accountBalances.find(x => x.accountID === sum.debitAccount.ID);
            sum.debitOriginalBalance = originalBalance ? originalBalance.balance : 0;

            if (currentLine.DebitVatTypeID) {
                sum.debitNetChangeCurrentLine += currentLine.NetAmount;

                const lineCalc =
                    this.calculateJournalEntryDataAmount(
                        currentLine.DebitAccount,
                        currentLine.DebitVatType,
                        currentLine.Amount,
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
            const originalBalance = accountBalances.find(x => x.accountID === sum.creditAccount.ID);
            sum.creditOriginalBalance = originalBalance ? originalBalance.balance : 0;

            if (currentLine.CreditVatTypeID) {
                sum.creditNetChangeCurrentLine += currentLine.NetAmount * -1;

                const lineCalc =
                    this.calculateJournalEntryDataAmount(
                        currentLine.CreditAccount,
                        currentLine.CreditVatType,
                        currentLine.Amount,
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
        if (!account || !account.UseVatDeductionGroupID || !date) {
            return 0;
        }

        if (!vatdeductions) {
            return 0;
        }

        const validdeduction =
            vatdeductions.find(x => x.VatDeductionGroupID === account.UseVatDeductionGroupID
                && moment(date).isSameOrAfter(moment(x.ValidFrom))
                && (!x.ValidTo || moment(date).diff(moment(x.ValidTo)) <= 0)
            );

        return validdeduction ? validdeduction.DeductionPercent : 0;
    }

    public calculateJournalEntrySummaryLocal(
        journalDataEntries: Array<JournalEntryData>, vatdeductions: Array<VatDeduction>
    ): JournalEntrySimpleCalculationSummary {
        const sum: JournalEntrySimpleCalculationSummary = {
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
                const debitData = this.calculateJournalEntryDataAmount(
                    entry.DebitAccount,
                    entry.DebitVatType,
                    entry.Amount,
                    null,
                    entry
                );
                const creditData =  this.calculateJournalEntryDataAmount(
                    entry.CreditAccount,
                    entry.CreditVatType,
                    entry.Amount * -1,
                    null,
                    entry
                );

                // normally a user will use the debit field for positive amounts and credit field
                // for negative amounts. However if they use the debit field and a negative amount,
                // that is the same as using the credit field and a positive amount. Therefore we
                // add the sum to the correct sum (this will also be done automatically in the
                // API, because there we have no concept of debit/credit, just +/-)

                // In stead of calculating summary using the netAmount for debi
                // just use the gross amount, to prevent rounding errors, since JS is amazeballs at floating point numbers
                if (debitData.amountGross > 0) {
                    sum.SumDebet += debitData.amountGross;
                } else {
                    sum.SumCredit += debitData.amountGross;
                }
                if (creditData.amountGross < 0) {
                    sum.SumCredit += creditData.amountGross;
                } else {
                    sum.SumDebet += creditData.amountGross;
                }

                const incomingVat = debitData.incomingVatAmount + creditData.incomingVatAmount;
                sum.IncomingVat += incomingVat;
                const outgoingVat = debitData.outgoingVatAmount + creditData.outgoingVatAmount;
                sum.OutgoingVat += outgoingVat;
            });
        }

        sum.SumCredit = sum.SumCredit * -1;
        sum.OutgoingVat = sum.OutgoingVat * -1;
        sum.Differance = UniMath.round(sum.SumDebet - sum.SumCredit);

        return sum;
    }

    public calculateJournalEntryData(
        account: Account, vattype: VatType, grossAmountCurrency: number, netAmountCurrency: number, journalEntryData: JournalEntryData
    ): JournalEntryLineCalculation {
        // grossAmountCurrency == med mva, netAmout == uten mva
        const res: JournalEntryLineCalculation = {
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
        const taxBasisAmountCurrency = 0;
        if (account) {
            if (vattype && !vattype.DirectJournalEntryOnly) {
                let deductionpercent =
                    journalEntryData.VatDeductionPercent &&
                    (journalEntryData.StatusCode || !!account.UseVatDeductionGroupID)
                    ? journalEntryData.VatDeductionPercent
                    : 0;

                // if no deductions exist, assume we get deduction for the entire amounts, i.e. 100%
                // because this simplifies the expressions further down in this function
                if (deductionpercent === 0) {
                    deductionpercent = 100;
                }

                this.setCorrectVatPercent(vattype, journalEntryData);

                const vatPercent = vattype.VatPercent;

                if (grossAmountCurrency) {
                    res.amountGrossCurrency = grossAmountCurrency;

                    if (!vattype.IncomingAccountID && !vattype.OutgoingAccountID) {
                        res.amountNetCurrency = res.amountGrossCurrency;
                    } else {
                        res.amountNetCurrency =
                            vattype.ReversedTaxDutyVat ?
                                vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                                    (res.amountGrossCurrency * deductionpercent / 100)
                                    : (res.amountGrossCurrency * (1 + vatPercent / 100)) * deductionpercent / 100
                                : res.amountGrossCurrency * deductionpercent / 100 / (1 + vatPercent / 100);

                        if (deductionpercent !== 100) {
                            res.amountNetCurrency += vattype.ReversedTaxDutyVat
                                ? res.amountGrossCurrency * (100 - deductionpercent) / 100
                                    + (res.amountGrossCurrency * vatPercent / 100) * ((100 - deductionpercent) / 100)
                                : res.amountGrossCurrency - res.amountNetCurrency - res.amountNetCurrency * vatPercent / 100;
                        }
                    }
                } else if (netAmountCurrency) {
                    res.amountNetCurrency = netAmountCurrency;

                    if (!vattype.IncomingAccountID && !vattype.OutgoingAccountID) {
                        res.amountGrossCurrency = res.amountNetCurrency;
                    } else {
                        if (deductionpercent > 0 && deductionpercent < 100) {
                            console.error(
                                'calculateJournalEntryData called for netAmountCurrency with deduction percent set, this is not supported'
                            );
                        }

                        res.amountGrossCurrency = vattype.ReversedTaxDutyVat ?
                            vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                                res.amountNetCurrency
                                : res.amountNetCurrency / (1 + (vatPercent / 100))
                            : res.amountNetCurrency * (1 + (vatPercent / 100));
                    }
                }

                const taxBasisAmount =
                    vattype.ReversedTaxDutyVat ?
                            res.amountGrossCurrency
                            : res.amountGrossCurrency / (1 + vatPercent / 100);

                if (vattype.ReversedTaxDutyVat) {
                    if (vattype.OutgoingAccountID) {
                        outgoingVatAmountCurrency += -1 * (taxBasisAmount * vatPercent / 100);
                    } else if (vattype.IncomingAccountID) {
                        incomingVatAmountCurrency += (-1 * (taxBasisAmount * vatPercent / 100)) * (deductionpercent / 100);
                    }
                }

                if (!(vattype.ReversedTaxDutyVat && !vattype.IncomingAccountID)) {
                    if (vattype.IncomingAccountID) {
                        incomingVatAmountCurrency += ((taxBasisAmount * vatPercent) / 100) * (deductionpercent / 100);
                    } else if (vattype.OutgoingAccountID) {
                        outgoingVatAmountCurrency += (taxBasisAmount * vatPercent) / 100;
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

    public calculateJournalEntryDataAmount(
        account: Account, vattype: VatType, grossAmount: number, netAmount: number, journalEntryData: JournalEntryData
    ): JournalEntryLineCalculation {
        // grossAmountCurrency == med mva, netAmout == uten mva
        const res: JournalEntryLineCalculation = {
            amountGross: 0,
            amountGrossCurrency: 0,
            amountNet: 0,
            amountNetCurrency: 0,
            taxBasisAmount: 0,
            incomingVatAmount: 0,
            outgoingVatAmount: 0
        };

        if (!grossAmount && !netAmount) {
            return res;
        }

        let incomingVatAmount = 0;
        let outgoingVatAmount = 0;
        let taxBasisAmount = 0;
        if (account) {
            if (vattype && !vattype.DirectJournalEntryOnly) {
                let deductionpercent =
                    journalEntryData.VatDeductionPercent &&
                    (journalEntryData.StatusCode || !!account.UseVatDeductionGroupID)
                    ? journalEntryData.VatDeductionPercent
                    : 0;

                // if no deductions exist, assume we get deduction for the entire amounts, i.e. 100%
                // because this simplifies the expressions further down in this function
                if (deductionpercent === 0) {
                    deductionpercent = 100;
                }

                this.setCorrectVatPercent(vattype, journalEntryData);

                const vatPercent = vattype.VatPercent;

                if (grossAmount) {
                    res.amountGross = grossAmount;

                    if (!vattype.IncomingAccountID && !vattype.OutgoingAccountID) {
                        res.amountNet = res.amountGross;
                    } else {
                        res.amountNet =
                            vattype.ReversedTaxDutyVat ?
                                vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                                    (res.amountGross * deductionpercent / 100)
                                    : (res.amountGross * (1 + vatPercent / 100)) * deductionpercent / 100
                                : res.amountGross * deductionpercent / 100 / (1 + vatPercent / 100);

                        if (deductionpercent !== 100) {
                            res.amountNet += vattype.ReversedTaxDutyVat
                                ? res.amountGross * (100 - deductionpercent) / 100
                                    + (res.amountGross * vatPercent / 100) * ((100 - deductionpercent) / 100)
                                : res.amountGross - res.amountNet - res.amountNet * vatPercent / 100;
                        }
                    }
                } else if (netAmount) {
                    res.amountNet = netAmount;

                    if (!vattype.IncomingAccountID && !vattype.OutgoingAccountID) {
                        res.amountGross = res.amountNet;
                    } else {
                        if (deductionpercent > 0 && deductionpercent < 100) {
                            console.error(
                                'calculateJournalEntryData called for netAmountCurrency with deduction percent set, this is not supported'
                            );
                        }

                        res.amountGross = vattype.ReversedTaxDutyVat ?
                            vattype.IncomingAccountID && vattype.OutgoingAccountID ?
                                res.amountNet
                                : res.amountNet / (1 + (vatPercent / 100))
                            : res.amountNet * (1 + (vatPercent / 100));
                    }
                }

                taxBasisAmount =
                    vattype.ReversedTaxDutyVat ?
                            res.amountGross
                            : res.amountGross / (1 + vatPercent / 100);

                if (vattype.ReversedTaxDutyVat) {
                    if (vattype.OutgoingAccountID) {
                        outgoingVatAmount += -1 * (taxBasisAmount * vatPercent / 100);
                    } else if (vattype.IncomingAccountID) {
                        incomingVatAmount += (-1 * (taxBasisAmount * vatPercent / 100)) * (deductionpercent / 100);
                    }
                }

                if (!(vattype.ReversedTaxDutyVat && !vattype.IncomingAccountID)) {
                    if (vattype.IncomingAccountID) {
                        incomingVatAmount += ((taxBasisAmount * vatPercent) / 100) * (deductionpercent / 100);
                    } else if (vattype.OutgoingAccountID) {
                        outgoingVatAmount += (taxBasisAmount * vatPercent) / 100;
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

        res.incomingVatAmount = incomingVatAmount;
        res.outgoingVatAmount = outgoingVatAmount;
        res.taxBasisAmount = taxBasisAmount * journalEntryData.CurrencyExchangeRate;
        res.amountGross = UniMath.round(res.amountGross);
        res.amountNet = UniMath.round(res.amountNet);

        return res;
    }

    public setCorrectVatPercent(vattype: VatType, journalEntryData: JournalEntryData) {
        // find the correct vatpercentage based on the either vatdate, financialdate or current date,
        // in that order. VatPercent may change between years, so this needs to be checked each time,
        // because changing dates, account, or vattypes may change what vatpercent to use
        
        const cs: CompanySettings = this.companySettingsService.getCompanySettings();

        const vatDate = cs.UseFinancialDateToCalculateVatPercent === true ? 
                moment(journalEntryData.FinancialDate) :
            journalEntryData.VatDate ?
                moment(journalEntryData.VatDate) :
                journalEntryData.FinancialDate ?
                    moment(journalEntryData.FinancialDate) :
                    moment(Date());

        if (vattype && vattype.VatTypePercentages) {
            const validPercentageForVatType =
                vattype.VatTypePercentages.find(y =>
                        (moment(y.ValidFrom) <= vatDate && y.ValidTo && moment(y.ValidTo) >= vatDate)
                        || (moment(y.ValidFrom) <= vatDate && !y.ValidTo));

            const vatPercent = validPercentageForVatType ? validPercentageForVatType.VatPercent : 0;

            // set the correct percentage on the VatType also, this is done to reflect it properly in
            // the UI if changing a date leads to using a different vatpercent
            vattype.VatPercent = vatPercent;
        }
    }

    public calculateJournalEntrySummary(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=calculate-journal-entry-summary')
            .send()
            .map(response => response.body);
    }

    public findJournalNumbersFromLines(journalEntryLines: Array<JournalEntryData>, nextJournalNumber: string = '') {
        let first, last, year;

        if (journalEntryLines && journalEntryLines.length) {
            journalEntryLines.forEach((l: JournalEntryData, i) => {
                if (l.JournalEntryNo) {
                    const parts = l.JournalEntryNo.split('-');
                    const no = parseInt(parts[0], 10);
                    if (!first || no < first) {
                        first = no;
                    }
                    if (!last || no > last) {
                        last = no;
                    }
                    if (i === 0 && parts.length > 1) {
                        year = parseInt(parts[1], 10);
                    }
                }
            });

            if (!first) {
                return null;
            }
        } else if (nextJournalNumber && nextJournalNumber.length) {
            const parts = nextJournalNumber.split('-');
            first = parseInt(parts[0], 10);
            last = first;
            if (parts.length > 1) {
                year = parseInt(parts[1], 10);
            }
        }

        return {
            first: first,
            last: last,
            year: year,
            firstNumber: year ? `${first}-${year}` : `${first}`,
            nextNumber: year ? `${last + (journalEntryLines.length ? 1 : 0)}-${year}` : `${last + (journalEntryLines.length ? 1 : 0)}`,
            lastNumber: year ? `${last}-${year}` : `${last}`
        };
    }

    public getPreviousJournalEntry(journalEntryYear, journalEntryNumber): Observable<any> {
        const filterNumber = journalEntryNumber ? `and JournalEntryNumberNumeric lt ${journalEntryNumber}` : '';

        return this.statisticsService.GetAll(
            `model=JournalEntry` +
            `&select=ID,JournalEntryNumber as JournalEntryNumber,JournalEntryNumberNumeric` +
            `&orderby=JournalEntryNumberNumeric desc` +
            `&top=1&expand=FinancialYear` +
            `&filter=FinancialYear.Year eq ${journalEntryYear} and isnull(JournalEntryNumberNumeric,0) ne 0 ${filterNumber}`
        )
            .map(data => data.Data);
    }

    public getNextJournalEntry(journalEntryYear, journalEntryNumber): Observable<any> {
        const filterNumber = journalEntryNumber ? `and JournalEntryNumberNumeric gt ${journalEntryNumber}` : '';

        return this.statisticsService.GetAll(
            `model=JournalEntry` +
            `&select=ID,JournalEntryNumber as JournalEntryNumber,JournalEntryNumberNumeric` +
            `&orderby=JournalEntryNumberNumeric asc` +
            `&top=1&expand=FinancialYear` +
            `&filter=FinancialYear.Year eq ${journalEntryYear} and isnull(JournalEntryNumberNumeric,0) ne 0 ${filterNumber}`
        )
            .map(data => data.Data);
    }

    public getJournalEntryTypes(): Observable<any> {
        return this.statisticsService.GetAll(`model=JournalEntryType`
        + `&select=ID as ID,Number as Number,DisplayName as DisplayName,Name as Name,ExpectNegativeAmount as ExpectNegativeAmount`
        + `&filter=ID gt 5`).map(data => data.Data);
    }
}

