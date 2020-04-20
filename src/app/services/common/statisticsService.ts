import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {HttpParams, HttpResponse} from '@angular/common/http';

import {Observable} from 'rxjs';
import {StatisticsResponse} from '../../models/StatisticsResponse';

@Injectable()
export class StatisticsService extends BizHttp<string> {
    // tslint:disable:max-line-length
    private notSoImportantFields: Array<string> = ['createdat', 'createdby', 'updatedat', 'updatedby', 'deleted'];
    private notSoImportantEntities: Array<string> = ['AccountAlias', 'AccountGroupSet', 'Accrual', 'Address', 'Altinn', 'AltinnCorrespondanceReader', 'CompanySalary', 'CompanySettings',
    'ComplexValidationRule', 'ComponentLayout', 'CustomField', 'Email', 'EmployeeCategoryLink', 'EntityValidationRule', 'FieldLayout', 'FileEntityLink', 'FinancialYear', 'JournalEntryMode',
    'JournalEntrySourceSerie', 'NumberSeries', 'NumberSeriesInvalidOverlap', 'NumberSeriesType', 'Phone', 'PostPost', 'ProductCategoryLink', 'TraceLink', 'TreeStructure', 'UserAuthorization',
    'VatReportArchivedSummary', 'VatReportReference'];

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = 'statistics';
        this.entityType = null;
        this.DefaultOrderBy = null;
    }

    public GetWrappedDataByHttpParams<T>(params: HttpParams): Observable<HttpResponse<any>> {
        return this.GetAllByHttpParams(params);
    }

    public GetDataByHttpParams<T>(params: HttpParams): Observable<StatisticsResponse> {
        return this.GetAllByHttpParams(params).map(response => response.body);
    }

    public GetDataByHttpParamsForCompany<T>(params: HttpParams, companyKey?: string): Observable<StatisticsResponse> {
        return this.GetAllByHttpParams(params, false, companyKey).map(response => response.body);
    }

    public GetAll(queryString: string): Observable<StatisticsResponse> {
        return this.GetAllForCompany(queryString);
    }

    public GetAllForCompany(queryString: string, companyKey?: string): Observable<StatisticsResponse> {
        if (companyKey) { this.http.appendHeaders({ CompanyKey: companyKey}); }
        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '?' + queryString)
            .send({}, undefined, !companyKey)
            .map(response => {
                const obj = response.body;
                if (!obj.Success) {
                    throw new Error(obj.Message);
                }
                return obj;
            });
    }

    public GetHttp(): UniHttp {
        return this.http;
    }

    public GetAllUnwrapped(queryString: string): Observable<any[]> {
        return this.GetAll(queryString)
            .map(response => response.Data);
    }

    public GetAllByHttpParams<T>(params: HttpParams, distinct = false, companyKey?: string): Observable<HttpResponse<any>> {
        // use default orderby for service if no orderby is specified
        if (!params.get('orderby') && this.DefaultOrderBy !== null) {
            params = params.set('orderby', this.DefaultOrderBy);
        }

        // use default expands for service if no expand is specified
        if (!params.get('expand') && this.defaultExpand) {
            params = params.set('expand', this.defaultExpand.join());
        }

        // remove empty filters, causes problem on backend
        if (params.get('filter') === '') {
            params = params.delete('filter');
        }

        params = params.set('distinct', distinct ? 'true' : 'false');

        if (companyKey) { this.http.appendHeaders({ CompanyKey: companyKey}); }

        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint(this.relativeURL)
            .send({}, params, !companyKey)
            .map(response => {
                const body = response.body;
                if (!body.Success) {
                    throw new Error(body.Message);
                }
                return response;
            });
    }

    public GetExportedExcelFile<T>(model: string, selects: string, filters: string, expands: string, headings: string, joins: string, distinct: boolean): Observable<any> {
        let params = new HttpParams()
            .set('model', model)
            .set('select', selects)
            .set('expand', expands)
            .set('headings', headings)
            .set('distinct', (distinct || false).toString());

        // remove empty filters, causes problem on backend
        if (filters && filters !== '') {
            params = params.set('filter', filters);
        }

        if (joins) {
            params = params.set('join', joins);
        }

        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint('exportstatistics')
            .send({responseType: 'blob'}, params);
    }

    public GetExportedExcelFileFromUrlParams(params: HttpParams) {
        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint('exportstatistics')
            .send({responseType: 'blob'}, params);
    }

    public checkShouldShowField(field: string) {
        if (field.toLowerCase() === 'id') {
            return true;
        }

        // normally all relation ids are not so interesting
        if (field.toLowerCase().endsWith('id')) {
            return false;
        }

        if (this.notSoImportantFields.find(x => x === field.toLowerCase())) {
            return false;
        }

        return true;
    }

    public checkShouldShowEntity(entity: string) {

        if (this.notSoImportantEntities.find(x => x === entity)) {
            return false;
        }

        return true;
    }
}
