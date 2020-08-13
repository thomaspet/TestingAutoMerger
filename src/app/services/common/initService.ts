import {Injectable} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http';
import {map, catchError, tap} from 'rxjs/operators';
import {of, Observable} from 'rxjs';
import {ElsaContract} from '@app/models';

@Injectable()
export class InitService {
    private templates: any[];

    constructor(private uniHttp: UniHttp) {}

    getContracts(): Observable<ElsaContract[]> {
        return this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('contracts')
            .send()
            .pipe(
                map(res => res.body || []),
                catchError(err => {
                    console.error(err);
                    return of([]);
                }),
            );
    }

    getTemplates() {
        if (this.templates && this.templates.length) {
            return of(this.templates);
        } else {
            return this.uniHttp
                .asGET()
                .usingInitDomain()
                .withEndPoint('template-companies')
                .send()
                .pipe(
                    map(res => res.body || []),
                    catchError(err => {
                        console.error(err);
                        return of([]);
                    }),
                    tap(templates => this.templates = templates)
                );
        }
    }

    createCompany(body) {
        return this.uniHttp
            .asPOST()
            .usingInitDomain()
            .withEndPoint('create-company')
            .withBody(body)
            .send({}, null, false)
            .pipe(map(res => res.body));
    }

    getCompanies() {
        return this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .pipe(
                map(res => res.body),
                catchError(err => {
                    console.error(err);
                    return of([]);
                }),
            );
    }

}
