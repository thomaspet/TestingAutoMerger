import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Bank, BankRule, BankAccount, BankIntegrationAgreement} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {BankData} from '@app/models';
import {StatisticsService} from '../common/statisticsService';
import {theme, THEMES} from 'src/themes/theme';

@Injectable()
export class BankService extends BizHttp<Bank> {

    BANK_ACCOUNT_TYPES = [
        { label: 'Drift', value: 'company', suggestion: 1920 },
        { label: 'Skatt', value: 'tax', suggestion: 1950 },
        { label: 'Lønn', value: 'salary', suggestion: null },
        // { label: 'Kreditt', value: 'credit', suggestion: 1920 },
        // { label: 'Utenlandsbetaling', value: 'foreign', suggestion: 1920 }
    ];

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        this.relativeURL = Bank.RelativeUrl;

        this.entityType = Bank.EntityType;

        this.DefaultOrderBy = null;
    }

    public validateIBANUpsertBank(iban: string): Observable<BankData> {
        return super.GetAction(null, `verify-iban-upsert-bank&iban=${iban}`);
    }

    public validateIBAN(iban: string): Observable<BankData> {
        return super.GetAction(null, `verify-iban&iban=${iban}`);
    }

    public getIBANUpsertBank(bankAccountNumber: string): Observable<BankData> {
        return super.GetAction(null, `get-iban-upsert-bank&bankaccountnumber=${bankAccountNumber}`);
    }

    public getBankFromAccountNumberLookup(bankAccountNumber: string): Observable<Bank> {
        return super.GetAction(null, `get-bank-from-accountnumber-lookup&bankaccountnumber=${bankAccountNumber}`);
    }

    public getIBANFromAccountNumberLookup(bankAccountNumber: string): Observable<String> {
        return super.GetAction(null, `get-iban-from-accountnumber-lookup&bankaccountnumber=${bankAccountNumber}`);
    }

    public getCompanyBankAccount(endpoint: string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(endpoint)
            .send()
            .map(res => res.body);
    }

    public postCompanyBankAccount(body) {
        return this.http
        .asPOST()
        .withBody(body)
        .usingBusinessDomain()
        .withEndPoint('companybankaccounts')
        .send();
    }

    public putCompanyBankAccount(body) {
        return this.http
        .asPUT()
        .withBody(body)
        .usingBusinessDomain()
        .withEndPoint('companybankaccounts/' + body.ID)
        .send();
    }

    public deleteCompanyBankAccount(id: number) {
        return this.http
        .asDELETE()
        .usingBusinessDomain()
        .withEndPoint('companybankaccounts/' + id)
        .send();
    }

    public createAutobankAgreement(agreementDetails: any) {
        return this.http
        .asPOST()
        .withBody(agreementDetails)
        .usingBusinessDomain()
        .withEndPoint('bank-agreements?action=create-integration')
        .send()
        .map(res => res.body);
    }

    public getDirectBankAgreement(serviceProvider: number) {
        return this.http
        .asGET()
        .usingBusinessDomain()
        .withEndPoint(`bank-agreements?action=get-direct-bank-agreement&serviceprovider=${serviceProvider}`)
        .send()
        .map(res => res.body);
    }

    public setBankIntegrationChangeAgreement(hasPendingOrder: boolean) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`bank-agreements?action=order-bank-integration-change&hasPendingOrder=${hasPendingOrder}`)
            .send()
            .map(res => res.body);
    }

    public updateAutobankAgreementStatus(id: any, password: string) {
        return this.http
            .asPUT()
            .withBody(password)
            .usingBusinessDomain()
            .withEndPoint(`bank-agreements/${id}?action=update-status`)
            .send()
            .map(res => res.body);
    }

    public updateAutobankAgreement(id: any, payload: any) {
        return this.http
            .asPUT()
            .withBody(payload)
            .usingBusinessDomain()
            .withEndPoint(`bank-agreements/${id}?action=update-bank-properties`)
            .send()
            .map(res => res.body);
    }

    public validateAutobankPassword(password: string) {
        return this.http
            .asPOST()
            .withBody(password)
            .usingBusinessDomain()
            .withEndPoint('bank-agreements?action=validate-password')
            .send()
            .map(res => res.body);
    }

    public getBankPayments(id: number): Observable<any> {
        return this.statisticsService.GetAllUnwrapped(`model=Tracelink`
        + `&select=payment.Id as ID,payment.businessrelationid as BusinessRelationID,`
        + `payment.amount as Amount,payment.amountCurrency as AmountCurrency,`
        + `payment.description as Description,businessrelation.name as Name,`
        + `payment.paymentID as PaymentID,`
        + `payment.statusCode as StatusCode,payment.paymentdate as PaymentDate,`
        + `payment.paymentCodeId as PaymentCodeID,journalEntry.JournalEntryNumber as JournalEntryNumber,`
        + `payment.JournalEntryID as JournalEntryID,CurrencyCode.Code as CurrencyCode`
        + `&filter=SourceEntityName eq 'SupplierInvoice' and `
        + `SourceInstanceID eq ${id} and Payment.ID gt 0 and Payment.BusinessRelationID eq Supplier.BusinessRelationID `
        + `&join=Tracelink.DestinationInstanceId eq Payment.ID and Tracelink.SourceInstanceID eq SupplierInvoice.ID and `
        + `Payment.BusinessRelationID eq BusinessRelation.ID and SupplierInvoice.SupplierID eq Supplier.ID and `
        + `Payment.JournalEntryID eq JournalEntry.ID and Payment.CurrencyCodeID eq CurrencyCode.ID`
        );
    }

    public getRegisteredPayments(id: number): Observable<any> {
        return this.statisticsService.GetAllUnwrapped(`model=Payment`
        + `&select=id,amount as Amount,amountCurrency as AmountCurrency,paymentDate as PaymentDate,`
        + `CurrencyCode.Code as CurrencyCode,statuscode as StatusCode,`
        + `JournalEntry.JournalEntryNumber as JournalEntryNumber`
        + `&filter=SupplierInvoiceID eq ${id}`
        + `&join=Payment.JournalEntryID eq JournalEntry.ID and Payment.CurrencyCodeID eq CurrencyCode.ID`
        );
    }

    public getSumOfPayments(id: number): Observable<any> {
        return this.statisticsService.GetAllUnwrapped(`model=Tracelink`
        + `&select=sum(payment.Amount) as Amount,`
        + `sum(payment.AmountCurrency) as AmountCurrency`
        + `&filter=SourceEntityName eq 'SupplierInvoice' and Payment.ID gt 0 and `
        + `SourceInstanceID eq ${id} and DestinationEntityName eq 'Payment' `
        + `and payment.StatusCode ne 44003 and `
        + `payment.StatusCode ne 44004 and payment.StatusCode ne 44006 and `
        + `payment.StatusCode ne 44010 and payment.StatusCode ne 44012 and `
        + `payment.StatusCode ne 44014 and payment.StatusCode ne 44018`
        + `&join=Tracelink.DestinationInstanceID eq Payment.ID`);
    }

    // This might be temporary
    mapBankIntegrationValues(bankAccount: BankAccount, agreements: any[] = null): BankAccount {
        if (theme.theme === THEMES.EXT02) {
            if (bankAccount['IntegrationSettings']) {
                let bit = (+bankAccount['IntegrationSettings']).toString(2);

                switch (bit.length) {
                    case 1: {
                        bit = '00' + bit;
                        break;
                    }
                    case 2: {
                        bit = '0' + bit;
                        break;
                    }
                }

                if (+bit.substr(0, 1) > 0) {
                    bankAccount['HasStatements'] = true;
                }
                if (+bit.substr(1, 1) > 0) {
                    bankAccount['HasOutgoing'] = true;
                }
                if (+bit.substr(2, 1) > 0) {
                    bankAccount['HasIncoming'] = true;
                }
            }
        // SR always has bank integration
        } else if (theme.theme === THEMES.SR) {
            bankAccount['HasStatements'] = true;
            bankAccount['HasOutgoing'] = true;
            bankAccount['HasIncoming'] = true;
        } else {
            if (agreements) {
                const currentBankAgreement = agreements.find(ag => ag?.BankAccount?.BankID === bankAccount.BankID);

                if (currentBankAgreement) {
                    bankAccount['HasStatements'] = currentBankAgreement.IsBankBalance;
                    bankAccount['HasOutgoing'] = currentBankAgreement.IsOutgoing;
                    bankAccount['HasIncoming'] = currentBankAgreement.IsInbound;
                }
            }
        }

        return bankAccount;
    }

    public getAllRules() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('bankrules?orderby=Priority&expand=Account')
            .send()
            .map(response => response.body);
    }

    public saveRule(rule: BankRule) {
        const request = rule.ID ? this.http.asPUT() : this.http.asPOST();
        const endpoint = `bankrules/${rule.ID ? rule.ID : ''}`;
        return request.usingBusinessDomain()
            .withEndPoint(endpoint)
            .withBody(rule)
            .send()
            .map(response => response.body);

    }

    public deleteRule(ID: number) {
        return this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint('bankrules/' + ID)
            .send()
            .map(response => response.body);
    }

    public getBankAccountsForReconciliation() {
        return this.http.asGET()
            .usingStatisticsDomain()
            .withEndPoint(
                '?model=bankaccount&select=ID as ID,AccountID as AccountID,BankAccountType as BankAccountType,Label as Label,' +
                'Account.AccountNumber as AccountAccountNumber,Account.AccountName as AccountName,AccountNumber as AccountNumber,' +
                'Bank.Name,casewhen(companysettings.id gt 0\,1\,0) as IsDefault,companysettings.id,' +
                'sum(casewhen(be.statuscode eq 48002,1,0)) as closed,sum(casewhen(be.id gt 0,1,0)) as total' +
                '&filter=companysettingsid gt 0&join=bankaccount.id eq companysettings.companybankaccountid and ' +
                'bankaccount.accountid eq bankstatement.accountid and bankstatement.id eq bankstatemententry.bankstatementid as be' +
                '&expand=bank,account&wrap=false&orderby=companysettings.id desc')
            .send()
            .map(response => response.body);
    }

    public getMonthlyReconciliationData(accountID: number) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(`bankstatements?accountid=${accountID}&action=account-status-monthly`)
            .send()
            .map(response => response.body);
    }

    public getIncommingAccountBalance(accountID) {
        return this.http.asGET()
        .usingBusinessDomain()
        .withEndPoint(`bankstatements?action=account-balance&accountid=${accountID}`)
        .send()
        .map(response => response.body);
    }

    public getBankStatementListData() {
        return this.http.asGET()
        .usingStatisticsDomain()
        .withEndPoint('?model=BankStatement&select=FromDate as FromDate,ToDate as ToDate,ID as ID,count(entry.ID) as count,' +
        'Amount as Amount,Account.AccountName as AccountName,Account.AccountNumber as AccountNumber,StatusCode as StatusCode' +
        '&join=BankStatement.ID eq BankStatementEntry.BankStatementID as Entry&Expand=Account,&top=50')
        .send()
        .map(response => response.body);
    }

    public bankStatementActions(id: number, action: string) {
        return this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint(`bankstatements/${id}?action=${action}`)
            .send()
            .map(response => response.body);
    }

    public deleteBankStatement(id: number) {
        return this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`bankstatements/${id}`)
            .send()
            .map(response => response.body);
    }

    public getBankStatementEntriesOnStatement(bankstatementID: number) {
        return this.http.asGET()
            .usingStatisticsDomain()
            .withEndPoint(`?model=BankStatementEntry&select=AmountCurrency as AmountCurrency,BookingDate as BookingDate,` +
            `CurrencyCode as CurrencyCode,Description as Description,ID as ID,OpenAmountCurrency as OpenAmountCurrency,` +
            `StatusCode as StatusCode&filter=BankStatementID eq ${bankstatementID}`)
            .send()
            .map(response => response.body)
            .map(response => response.Data);
    }

    public createInitialAgreement(payload) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('/bank-agreements?action=create-initial-company-and-bank-accounts-agreement')
            .withBody(payload)
            .send()
            .map(response => response.body);
    }

    public orderPreApprovedBankPayments(bankID: number) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('/bank-agreements?action=order-preapprovedbankpayments&bankID=' + bankID)
            .send()
            .map(response => response.body);
    }

    public getDefaultServiceProvider() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('/bank-agreements?action=get-default-service-provider')
            .send()
            .map(response => response.body);
    }

    public updateBankIntegrationAgreement(agreementID: number, agreement: any) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`bank-agreements/${agreementID}`)
            .withBody(agreement)
            .send()
            .map(response => response.body);
    }

    deleteAgreement(agreement: BankIntegrationAgreement) {
        return this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint('/bank-agreements/' + agreement.ID)
            .send();
    }

    cancelBankAccountIntegration(bankAccountId: number, intergrationSettings: number, emailForReceipt: string) {
        return this.http.asPUT()
            .usingBusinessDomain()
            .withEndPoint(`/bank-agreements?action=delete-bankagreements&` +
            `bankAccountID=${bankAccountId}&integrationSettings=${intergrationSettings}&emailAddress=${emailForReceipt}`)
            .send()
            .map(response => response.body);
    }

    cancelAllBankAccountIntegrations(emailForReceipt: string) {
        return this.http.asPUT()
            .usingBusinessDomain()
            .withEndPoint(`/bank-agreements?action=delete-all-bankagreements&emailAddress=${emailForReceipt}`)
            .send()
            .map(response => response.body);
    }
}
