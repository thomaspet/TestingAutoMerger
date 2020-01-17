import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Municipal} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable, of} from 'rxjs';

@Injectable()
export class MunicipalService extends BizHttp<Municipal> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Municipal.RelativeUrl;
        this.entityType = Municipal.EntityType;
        this.DefaultOrderBy = null;
    }

    public search(query: string): Observable<Municipal[]> {
        const filter = this.ignoreRetired(`startswith(MunicipalityNo,'${query}') or contains(MunicipalityName,'${query}')`);
        return super.GetAll(`filter=${filter}`);
    }

    public getAll(query: string, expands: string[] = []) {
        query = query || '';
        let filter = '';
        let params = query.split('&').filter(x => !!x);
        params.forEach(param => {
            if (!param.toLowerCase().startsWith('filter')) {
                return;
            }
            filter = param.split('=')[1];
        });
        params = [
            'filter=' + this.ignoreRetired(filter),
            ...params.filter(param => !param.toLowerCase().startsWith('filter'))
        ];
        return super.GetAll(params.join('&'), expands);
    }

    public getByNumber(municipalityNo: string): Observable<Municipal[]> {
        if (!municipalityNo) {
            return of([]);
        }
        return this.GetAll(`filter=MunicipalityNo eq ${municipalityNo}`);
    }

    private ignoreRetired(filter: string): string {
        const ignoreFilter = '(Retired ne true)';
        if (!filter) {
            return ignoreFilter;
        }
        return `(${filter}) and ${ignoreFilter}`;
    }
}
