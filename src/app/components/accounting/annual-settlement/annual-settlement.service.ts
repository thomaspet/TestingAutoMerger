import {Injectable} from '@angular/core';
import {BizHttp, UniHttp} from '@uni-framework/core/http';
import {of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';

@Injectable()
export class AnnualSettlementService extends BizHttp<any> {

    public relativeURL = 'annualsettlement';
    protected entityType = 'AnnualSettlement';
    baseUrl = environment.BASE_URL + environment.API_DOMAINS.BUSINESS;

    constructor(protected http: UniHttp) {
        super(http);
    }

    getAnnualSettlements() {
        return this.GetAll();
    }

    getAnnualSettlement(id) {
        return this.Get(id, ['AnnualSettlementCheckList']);
    }

    createFinancialYear(year: number) {
        return this.Post({
            _createguid: this.getNewGuid(),
            AccountYear: year
        });
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
        return of(as).pipe(
            // step 1
            switchMap(x => this.http.http
                    .get(this.baseUrl + 'vatreports?action=validate-vatreports-for-financialyear&financialYear=' + as.AccountYear)
                    .pipe(
                        tap(result => {
                            checkList.isVatReportOK = result;
                        }),
                        map(_ => checkList)
                    )
            ),
            switchMap(x => this.http.http
                    .get(this.baseUrl + 'amelding?action=validate-periods')
                    .pipe(
                        tap(result => {
                            checkList.IsAmeldingOK = result;
                        }),
                        map(_ => checkList)
                    )
            ),
            switchMap(x => this.http.http
                .get(this.baseUrl + 'annualsettlement?action=get-account-balance&fromAccountNumber=1000&toAccountNumber=2999&toFinancialYear=' + as.AccountYear)
                .pipe(
                    tap(result => {
                        checkList.AreAllPreviousYearsEndedAndBalances = result;
                    }),
                    map(_ => checkList)
                )
            )
        );
    }
}
