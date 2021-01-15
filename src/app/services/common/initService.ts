import {Injectable} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http';
import {map, catchError, tap} from 'rxjs/operators';
import {of, Observable} from 'rxjs';
import {ElsaContract} from '@app/models';
import {theme, THEMES} from 'src/themes/theme';

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

    getCompanyTemplate(isEnk: boolean, includeVat: boolean, includeSalary: boolean) {
        return this.getTemplates().pipe(
            map(templates => {
                return (templates || []).find(template => {
                    if (template.IsTest || !template.IsGlobalTemplate) {
                        return false;
                    }

                    const name = template.Name || '';

                    if (isEnk && name.includes('MAL AS')) {
                        return false;
                    }

                    if (!isEnk && name.includes('MAL ENK')) {
                        return false;
                    }

                    if (includeVat && name.includes('uten mva')) {
                        return false;
                    }

                    if (!includeVat && name.includes('med mva')) {
                        return false;
                    }

                    if (includeSalary && name.includes('uten lønn')) {
                        return false;
                    }

                    if (!includeSalary && name.includes('med lønn')) {
                        return false;
                    }

                    return true;
                });
            }),
            catchError(() => of(null))
        );
    }

    createCompany(body, contractType?: number, isBureauCustomer = false) {
        let endpoint = 'create-company';

        // set to pending if SR, not test, not bureau contract and not bureau customer
        if (theme.theme === THEMES.SR && !(body?.IsTest) && contractType !== 11 && !isBureauCustomer) {
            endpoint += '?licenseStatus=3';
        }

        return this.uniHttp
            .asPOST()
            .usingInitDomain()
            .withEndPoint(endpoint)
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

    getBicFromAccountNumber(accountNumber: string) {
        return this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('bic-from-bankaccount?accountNumber=' + accountNumber)
            .send()
            .pipe(map(res => res.body));
    }
}
