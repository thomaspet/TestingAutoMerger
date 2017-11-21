import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {KpiCompany} from './kpiCompanyModel';

@Injectable()
export class BureauCurrentCompanyService {
    private currentCompany: ReplaySubject<KpiCompany> = new ReplaySubject(1);

    public getCurrentCompany(): Observable<KpiCompany> {
        return this.currentCompany;
    }

    public setCurrentCompany(company: KpiCompany) {
        this.currentCompany.next(company);
    }
}
