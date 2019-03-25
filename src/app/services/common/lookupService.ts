import {UniHttp} from '../../../framework/core/http/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class Lookupservice {

    constructor(
        private http: UniHttp) {

        }

    public statQuery<T>(model: string, params: string): Observable<T> {
        return this.GET(`?model=${model}&${params}`, undefined, true );
    }

    private GET(route: string, params?: any, useStatistics = false ): Observable<any> {
        if (useStatistics) {
            return this.http.asGET().usingStatisticsDomain()
            .withEndPoint(route).send(params)
            .map(response => response.json().Data);
        }
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params)
        .map(response => response.json());
    }
}
