import {Injectable} from '@angular/core';
import {BizHttp, UniHttp} from '@uni-framework/core/http';
import {of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {annualSettlementRoutes} from '@app/components/accounting/annual-settlement/annual-settlement.routes';
import {HttpClient} from '@angular/common/http';

export enum StatusCodeReconcile {
    NotBegun = 36000,
    InProgress = 36005,
    Completed = 36010
}

@Injectable()
export class AnnualSettlementService extends BizHttp<any> {

    public relativeURL = 'annualsettlement';
    protected entityType = 'AnnualSettlement';
    baseUrl = environment.BASE_URL + environment.API_DOMAINS.BUSINESS;
    httpClient: HttpClient;

    constructor(protected http: UniHttp) {
        super(http);
        this.httpClient = this.http.http;
    }

    getAnnualSettlements() {
        return this.GetAll();
    }

    getAnnualSettlement(id) {
        return this.Get(id, ['AnnualSettlementCheckList', 'Reconcile', 'Reconcile.Account']);
    }

    createFinancialYear(year: number) {
        return this.Post({
            _createguid: this.getNewGuid(),
            AccountYear: year
        });
    }

    checkMvaMelding(financialYear) {
        return this.httpClient.get(
            this.baseUrl + 'vatreports?action=validate-vatreports-for-financialyear&financialYear=' + financialYear
        ).pipe(
            map((result: any[]) => (result && result.length === 0))
        );
    }

    checkAmelding(financialYear) {
        return this.http.http.get(
            this.baseUrl + 'amelding?action=validate-periods&year=' + financialYear
        ).pipe(
            map((result: any[]) => (result && result.length === 0))
        );
    }

    checkLastyear(financialYear) {
        return this.http.http.get(
            this.baseUrl + 'annualsettlement?action=get-account-balance&fromAccountNumber=1000&toAccountNumber=2999&toFinancialYear=' + financialYear
        ).pipe(
            map((result: number) => result > -1 && result < 1)
        );
    }

    checkStocksCapital(financialYear) {
        return this.http.http.get(
            this.baseUrl + 'annualsettlement?action=get-account-balance&fromAccountNumber=1000&toAccountNumber=1299&toFinancialYear=' + financialYear
        ).pipe(
            map((result: number) => result < 30000)
        );
    }

    checkList(as) {
        // MVA Melding - isVatReportOK - api/biz/vatreports?action=validate-vatreports-for-financialyear&financialYear=<year>
        // Salary - IsAmeldingOK - api/biz/ameling?action=validate-periods
        // Last year - AreAllPreviousYearsEndedAndBalances - annualsettlement/get-account-balance?fromAccountNumber=1000&toAccountNumber=2999&toFinancialYear=2019
        // Stocks-capital - IsSharedCapitalOK - annualsettlement/get-account-balance?fromAccountNumber=2000&toAccountNumber=2000&toFinancialYear=2019
        // Appendix - IsAllJournalsDone - ???
        // Customer Invoices - IsAllCustomersInvoicesPaid - ???
        // Supplier Invoices IsAllSupplierInvoicesPaid - ???
        // Items/Products - ??? - ???
        // Assets - ???
        const checkList = Object.assign({}, as.AnnualSettlementCheckList);
        return this.checkMvaMelding(as.AccountYear)
            .pipe(
                tap(resultMvaMelding => checkList.IsMvaMeldingOK = resultMvaMelding),
                switchMap(() => this.checkAmelding(as.AccountYear)),
                tap(resultAmelding => checkList.IsAmeldingOK = resultAmelding),
                switchMap(() => this.checkLastyear(as.AccountYear)),
                tap(resultAmelding => checkList.AreAllPreviousYearsEndedAndBalances = resultAmelding),
                switchMap(() => this.checkStocksCapital(as.AccountYear)),
                tap(resultStocksCapital => checkList.IsSharedCapitalOK = resultStocksCapital),
                map(() => checkList)
            );
    }

    moveFromStep1ToStep2(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'OneToStepTwo' );
    }

    startReconcile(annualSettlement) {
        if (annualSettlement.StatusCode === StatusCodeReconcile.NotBegun) {
            return this.httpClient.get(this.baseUrl + 'reconcile?action=begin-reconcile');
        }
        return of(annualSettlement);
    }
}
