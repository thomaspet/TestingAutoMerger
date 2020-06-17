import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SalaryTransactionSupplement, Valuetype } from '@uni-entities';
import { StatisticsService, SupplementService, FinancialYearService } from '@app/services/services';
import * as moment from 'moment';
import { HttpParams, HttpResponse } from '@angular/common/http';

export interface ISupplementLine extends SalaryTransactionSupplement {
    _EmployeeNumber?: number;
    _EmployeeName?: string;
    _WageTypeNumber?: number;
    _PayrollRunID?: number;
    _Text?: string;
    _FromDate?: Date;
    _ToDate?: Date;
    _Amount?: number;
    _Sum?: number;
    _Name?: string;
    _Type?: Valuetype;
}

interface IFieldAndAlias {
    field: string;
    alias: string;
}

@Injectable()
export class SalaryTransactionSupplementListService {

    constructor(
        private statisticsService: StatisticsService,
        private supplementService: SupplementService,
        private yearService: FinancialYearService,
    ) { }

    public getDisplayValue(supplement: ISupplementLine): string {
        if (!supplement._Type) {
            return null;
        }
        switch (supplement._Type) {
            case Valuetype.IsBool:
                return supplement.ValueBool ? 'JA' : 'NEI';
            case Valuetype.IsDate:
                return this.displayDate(supplement.ValueDate);
            case Valuetype.IsMoney:
                return supplement.ValueMoney.toString();
            case Valuetype.IsString:
                return supplement.ValueString;
            case Valuetype.Period:
                return `${this.displayDate(supplement.ValueDate)} - ${this.displayDate(supplement.ValueDate2)}`;
        }
    }

    public save(supplement: ISupplementLine): Observable<ISupplementLine> {
        return supplement.ID
            ? this.supplementService.Put(supplement.ID, supplement)
            : this.supplementService.Post(supplement);
    }

    public getAllSupplements(runID: number, params: HttpParams): Observable<HttpResponse<ISupplementLine>> {
        return this.statisticsService
            .GetAllByHttpParams(this.query(runID, this.yearService.getActiveYear(), params));
    }

    private query(runID: number, year: number, params: HttpParams): HttpParams {
        const fieldsAndAliases = this.getFieldAndAliases();
        return params
            .set('select', this.getSelect())
            .set('model', 'PayrollRun')
            .set('expand', 'transactions.Supplements.WageTypeSupplement,transactions.Employee.BusinessRelationInfo')
            .set('filter', this.replaceAliasesWithFields(this.getFilter(runID, year, params.get('filter')), fieldsAndAliases))
            .set('orderby', this.replaceAliasesWithFields(this.handleOrderby(params.get('orderby')), fieldsAndAliases));
    }

    private handleOrderby(orderby: string): string {
        return orderby?.toLowerCase().includes('_value')
            ? ''
            : orderby;
    }

    private replaceAliasesWithFields(text: string, fieldsAndAliases: IFieldAndAlias[]) {
        if (!text) {
            return text || '';
        }
        fieldsAndAliases
            .forEach(fieldAndAlias => text = text.replace(fieldAndAlias.alias, fieldAndAlias.field));
        return text;
    }

    private getSelect(): string {
        return this.getSelects().join(',');
    }

    private getFieldAndAliases(): IFieldAndAlias[] {
        return this.getSelects()
            .filter(select => !select.includes('as ID'))
            .map(select => select.split(' as ').map(text => text.trim()))
            .map(fieldAndAlias => ({field: fieldAndAlias[0], alias: fieldAndAlias[1]}));
    }

    private getSelects(): string[] {
        return [
            'Supplements.ID as ID',
            'Supplements.ValueBool as ValueBool',
            'Supplements.ValueDate as ValueDate',
            'Supplements.ValueDate2 as ValueDate2',
            'Supplements.ValueMoney as ValueMoney',
            'Supplements.ValueString as ValueString',
            'transactions.EmployeeNumber as _EmployeeNumber',
            'BusinessRelationInfo.Name as _EmployeeName',
            'transactions.WageTypeNumber as _WageTypeNumber',
            'ID as _PayrollRunID',
            'transactions.Text as _Text',
            'transactions.FromDate as _FromDate',
            'transactions.ToDate as _ToDate',
            'transactions.Amount as _Amount',
            'transactions.Sum as _Sum',
            `casewhen(isnull(WageTypeSupplement.Description,'') eq '',WageTypeSupplement.Name,WageTypeSupplement.Description) as _Name`,
            'WageTypeSupplement.ValueType as _Type',
            'WageTypeSupplement.GetValueFromTrans as _GetValueFromTrans',
        ];
    }

    private getFilter(runID: number, year: number, existingFilter: string): string {
        let filter = runID
            ? `ID eq ${runID}`
            : `isnull(StatusCode,0) ge 1 and year(PayDate) eq ${year}`;
        filter += ` and isnull(Supplements.ID,0) gt 0 and WageTypeSupplement.GetValueFromTrans eq 'false'`;
        return existingFilter
            ? `${existingFilter} and (${filter})`
            : filter;
    }

    private displayDate(date: Date) {
        return moment(date).format('DD.MM.YYYY');
    }
}
