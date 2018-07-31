import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {URLSearchParams, ResponseContentType, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
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

    public GetDataByUrlSearchParams<T>(params: URLSearchParams): Observable<StatisticsResponse> {
        return this.GetAllByUrlSearchParams(params).map(response => response.json());
    }

    public GetDataByUrlSearchParamsForCompany<T>(params: URLSearchParams, companyKey?: string): Observable<StatisticsResponse> {
        return this.GetAllByUrlSearchParams(params, false, companyKey).map(response => response.json());
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
                const obj = response.json();
                if (!obj.Success) {
                    throw new Error(obj.Message);
                }
                return obj;
            });
    }

    public GetAllUnwrapped(queryString: string): Observable<[any]> {
        return this.GetAll(queryString)
            .map(response => response.Data);
    }

    public GetAllByUrlSearchParams<T>(params: URLSearchParams, distinct = false, companyKey?: string): Observable<Response> {
        // use default orderby for service if no orderby is specified
        if (!params.get('orderby') && this.DefaultOrderBy !== null) {
            params.set('orderby', this.DefaultOrderBy);
        }

        // use default expands for service if no expand is specified
        if (!params.get('expand') && this.defaultExpand) {
            params.set('expand', this.defaultExpand.join());
        }

        // remove empty filters, causes problem on backend
        if (params.get('filter') === '') {
            params.delete('filter');
        }

        params.set('distinct', distinct ? 'true' : 'false');

        if (companyKey) { this.http.appendHeaders({ CompanyKey: companyKey}); }

        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint(this.relativeURL)
            .send({}, params, !companyKey)
            .map(response => {
                const body = response.json();
                if (!body.Success) {
                    throw new Error(body.Message);
                }
                return response;
            });
    }

    public GetExportedExcelFile<T>(model: string, selects: string, filters: string, expands: string, headings: string, joins: string): Observable<any> {

        const params: URLSearchParams = new URLSearchParams();

        params.set('model', model);
        params.set('select', selects);
        params.set('expand', expands);
        params.set('headings', headings);

        // remove empty filters, causes problem on backend
        if (filters && filters !== '') {
            params.set('filter', filters);
        }

        if (joins) {
            params.set('join', joins);
        }

        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint('exportstatistics')
            .send({responseType: ResponseContentType.Blob}, params)
            .map(res => new Blob([res._body], { type: 'text/csv' }));
    }

    public checkShouldShowField(field: string) {

        if (field.toLowerCase() === 'id') {
            return true;
        }

        // normally all relation ids are not so interesting
        if (field.toLowerCase().endsWith('id')) {
            return false;
        }

        if (this.notSoImportantFields.find(x => x === field)) {
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
