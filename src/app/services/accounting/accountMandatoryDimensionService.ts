
import { BizHttp } from '@uni-framework/core/http/BizHttp';
import { AccountMandatoryDimension, Dimensions, SalaryTransaction } from '@uni-entities';
import { UniHttp } from '@uni-framework/core/http/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestMethod } from '@angular/http';
import {StatisticsService} from '../common/statisticsService';
import { tap, map } from 'rxjs/operators';


@Injectable()
export class AccountMandatoryDimensionService extends BizHttp<AccountMandatoryDimension> {

    mandatoryDimensionsCache = [];
    mandatoryDimensionsCacheIsValid = false;

    constructor(
        http: UniHttp,
        private statisticsService: StatisticsService
    ) {
        super(http);
        this.relativeURL = AccountMandatoryDimension.RelativeUrl;
        this.entityType = AccountMandatoryDimension.EntityType;
    }

    getRequiredMessage(mandatoryDimensionLabels, account) {
        return `Konto ${account} krever at dimensjonen(e) ${mandatoryDimensionLabels.join(',')} er satt`;
    }

    getWarningMessage(mandatoryDimensionLabels, account) {
        return `Konto ${account} har forslag om a sette dimensjonene ${mandatoryDimensionLabels.join(',')}`;
    }

    getMandatoryDimensions() {
        if (this.mandatoryDimensionsCacheIsValid) {
            return of(this.mandatoryDimensionsCache);
        }
        return this.statisticsService.GetAll(
            'model=accountmandatorydimension' +
            '&select=AccountMandatoryDimension.DimensionNo as DimensionNo' +
            ',AccountMandatoryDimension.MandatoryType as MandatoryType,' +
            'AccountMandatoryDimension.AccountID as AccountID,' +
            'DimensionSettings.Label as Label' +
            '&filter=MandatoryType gt 0' +
            '&join=accountmandatorydimension.DimensionNo eq DimensionSettings.Dimension'
        ).pipe(
            tap(result => this.mandatoryDimensionsCacheIsValid = true),
            tap(result => this.mandatoryDimensionsCache = result.Data),
            map(result => result.Data),
            map(result => result.map(item => {
                if (item.Label === null) {
                    if (item.DimensionNo === 1) {
                        item.Label = 'Prosjekt';
                    }
                    if (item.DimensionNo === 2) {
                        item.Label = 'Avdeling';
                    }
                }
                return item;
            })),
            tap(result => console.log(result))
        );
    }

    public getMandatoryDimensionsReports(items: any[]): Observable<any> {
        const params: AccountDimension[] = [];
        items.forEach(item => {
            const ad = new AccountDimension();
            ad.AccountID = item.AccountID;
            if (item.DimensionsID && item.DimensionsID > 0) {
                ad.DimensionsID = item.DimensionsID;
            } else {
                ad.Dimensions = item.Dimensions;
            }
            params.push(ad);
        });
        return super.ActionWithBody(null, params, `get-mandatory-dimensions-reports`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReportsForPayroll(salaryTransactions: SalaryTransaction[]): Observable<any> {
        const params: AccountDimension[] = [];
        salaryTransactions
        .forEach(item => {
            const ad = new AccountDimension();
            ad.AccountNumber = item.Account;
            if (item.DimensionsID && item.DimensionsID > 0) {
                ad.DimensionsID = item.DimensionsID;
            } else {
                ad.Dimensions = item.Dimensions;
            }
            if (!params.find(x => x.AccountNumber === ad.AccountNumber && x.DimensionsID === ad.DimensionsID && x.Dimensions === ad.Dimensions)) {
                params.push(ad);
            }
        });
        return super.ActionWithBody(null, params, `get-mandatory-dimensions-reports`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReportByDimension(accountID: number, dimensions: Dimensions): Observable<any> {
        return super.ActionWithBody(null, dimensions, `get-mandatory-dimensions-report-by-dimensions&accountID=${accountID}`, RequestMethod.Put);
    }

    public getMandatoryDimensionsReport(accountID: number, dimensionsID: number): Observable<any> {
        return super.GetAction(null, `get-mandatory-dimensions-report&accountID=${accountID}&dimensionsID=${dimensionsID}`);
    }

    public getCustomerMandatoryDimensionsReport(accountID: number, dimensionsID: number, dimensions: Dimensions = null): Observable<any> {
        if (dimensions) {
            return super.ActionWithBody(null, dimensions, `get-customer-mandatory-dimensions-report-dimensions&customerID=${accountID}&dimensionsID=${dimensionsID}`, RequestMethod.Put);
        }
        return super.GetAction(null, `get-customer-mandatory-dimensions-report-dimensionsID&customerID=${accountID}&dimensionsID=${dimensionsID}`);
    }

    public getSupplierMandatoryDimensionsReport(supplierID: number, dimensionsID: number, dimensions: Dimensions = null): Observable<any> {
        if (dimensions) {
            return super.ActionWithBody(null, dimensions, `get-supplier-mandatory-dimensions-report-dimensions&supplierID=${supplierID}&dimensionsID=${dimensionsID}`, RequestMethod.Put);
        }
        return super.GetAction(null, `get-supplier-mandatory-dimensions-report-dimensionsID&supplierID=${supplierID}&dimensionsID=${dimensionsID}`);
    }

    public GetNumberOfAccountsWithMandatoryDimensions (): Observable<number> {
        return this.statisticsService.GetAll('model=AccountMandatoryDimension&select=count(ID)')
            .map(res => {
                const count = res && res.Data && res.Data[0] && res.Data[0].countID;
                return count || 0;
            });
    }

    public checkRecurringInvoices(accountID: number) : Observable<any> {
        return super.GetAction(null, `check-recurringinvoices&accountID=${accountID}`);
    }
}

//Flytte til?
export class AccountDimension {
    public AccountID: number;
    public AccountNumber: number;
    public DimensionsID: number;
    public Dimensions: Dimensions;
}


