import { Injectable } from '@angular/core';
import { UniHttp } from '../../../framework/core/http/http'


@Injectable()
export class WidgetDataService {

    constructor(private http: UniHttp) { }

    public getData(endpoint: string) {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(endpoint)
            .send()
            .map(response => response.json());
    }
}