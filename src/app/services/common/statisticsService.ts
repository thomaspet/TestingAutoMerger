import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {URLSearchParams, ResponseContentType} from '@angular/http';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class StatisticsService extends BizHttp<string> {

    private notSoImportantFields: Array<string> = ['createdat', 'createdby', 'updatedat', 'updatedby', 'id', 'deleted'];
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

    public GetDataByUrlSearchParams<T>(params: URLSearchParams): Observable<any> {
        return this.GetAllByUrlSearchParams(params).map(response => response.json());
    }

    public GetAll(filter: string) {
        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '?' + filter)
            .send({})
            .map(response => {
                const body = response.json();
                if (!body.Success) {
                    throw new Error(body.Message);
                }
                return response;
            })
            .map(resp => resp.json());
    }

    public GetAllByUrlSearchParams<T>(params: URLSearchParams): Observable<any> {
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
        } else {
            // this needs to be here because of an issue with the statistics api
            params.set('filter', params.get('filter').replace('))', ') )'));
        }

        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint(this.relativeURL)
            .send({}, params)
            .map(response => {
                const body = response.json();
                if (!body.Success) {
                    throw new Error(body.Message);
                }
                return response;
            });
    }

    public GetExportedExcelFile<T>(model: string, selects: string, filters: string, expands: string, headings: string): Observable<any> {

        let params: URLSearchParams = new URLSearchParams();

        params.set('model', model);
        params.set('select', selects);
        params.set('filter', filters);
        params.set('expand', expands);
        params.set('headings', headings);

        // remove empty filters, causes problem on backend
        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint('exportstatistics')
            .send({responseType: ResponseContentType.Blob}, params)
            .map(res => new Blob([res._body], { type: 'text/csv' }));
    }

    public checkShouldShowField(field: string) {

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
