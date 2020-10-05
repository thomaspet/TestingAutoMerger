
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {Account, AccountMandatoryDimension, Dimensions, SalaryTransaction} from '@uni-entities';
import {UniHttp, RequestMethod} from '@uni-framework/core/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {StatisticsService} from '../common/statisticsService';
import {tap, map} from 'rxjs/operators';

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

    invalidateMandatoryDimensionsCache() {
        this.mandatoryDimensionsCache = [];
        this.mandatoryDimensionsCacheIsValid = false;
    }

    getRequiredMessage(mandatoryDimensionLabels, account) {
        if (!mandatoryDimensionLabels.length) {
            return '';
        }
        return `Konto ${account} krever at dimensjonen(e) ${mandatoryDimensionLabels.join(',')} er satt`;
    }

    getWarningMessage(mandatoryDimensionLabels, account) {
        if (!mandatoryDimensionLabels.length) {
            return '';
        }
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
            }))
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

    public getDimensionName(dimensionNo) {
        if (dimensionNo === 1) {
            return 'Project';
        }
        if (dimensionNo === 2) {
            return 'Department';
        } else {
            return 'Dimension' + dimensionNo;
        }
    }

    public getReport(account: Account, row: any) {
        if (!account) {
            return null;
        }
        const debitMandatoryDimensions = this.mandatoryDimensionsCache.filter(md => md.AccountID === account.ID);
        const debitWarningDimensions = debitMandatoryDimensions.filter(md => {
            const isWarning = md.MandatoryType === 2;
            const hasValue = !!(row?.Dimensions && row?.Dimensions[this.getDimensionName(md.DimensionNo)]);
            return isWarning && !hasValue;
        });
        const debitRequiredDimensions = debitMandatoryDimensions.filter(md => {
            const isRequired = md.MandatoryType === 1;
            const hasValue = !!(row?.Dimensions && row?.Dimensions[this.getDimensionName(md.DimensionNo)]);
            return isRequired && !hasValue;
        });
        const debitWarningDimensionsLabels = debitWarningDimensions.map(md => md.Label);
        const debitRequiredDimensionsLabels = debitRequiredDimensions.map(md => md.Label);
        const arrayToObject = (dimensions) => {
            const obj = {};
            dimensions.forEach(item => {
                obj[item.DimensionNo] = item.Label;
            });
            return obj;
        };
        const report = {
            AccountID: account.ID,
            AccountNumber: account.AccountNumber,
            MissingOnlyWarningsDimensionsMessage: this.getWarningMessage(debitWarningDimensionsLabels, account.AccountNumber),
            MissingRequiredDimensions: debitRequiredDimensions.map(md => md.DimensionNo),
            MissingRequiredDimensionsMessage: this.getRequiredMessage(debitRequiredDimensionsLabels, account.AccountNumber),
            MissingWarningDimensions: debitWarningDimensions.map(md => md.DimensionNo),
            RequiredDimensions: arrayToObject(debitRequiredDimensions),
            WarningDimensions: arrayToObject(debitWarningDimensions)
        };
        return report;
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


