import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {KpiCompany} from './kpiCompanyModel';

@Injectable()
export class BureauCurrentCompanyService {
    public currentCompany: ReplaySubject<KpiCompany> = new ReplaySubject(1);

    public getCurrentCompany(): Observable<KpiCompany> {
        return this.currentCompany;
    }

    public setCurrentCompany(company: KpiCompany) {
        this.currentCompany.next(company);
    }
}
