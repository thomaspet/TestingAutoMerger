import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { CompanySettings } from '../../unientities';
import { Injectable } from '@angular/core';
import {CompanySettingsService} from './companySettingsService';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TabService} from '../../components/layout/navbar/tabstrip/tabService';
import {Router} from '@angular/router';

@Injectable()
export class YearService {
    private ACTIVE_YEAR: string = 'ActiveYear';
    private activeYear: number;

    public selectedYear$: BehaviorSubject<number>;
    //private tabService : tabService;

    constructor(
        private companySettings: CompanySettingsService, private tabservice: TabService, private router: Router) {
            this.selectedYear$ = new BehaviorSubject<number>(this.activeYear);

            this.getActiveYear().subscribe(val => {
                this.activeYear = val;
                this.selectedYear$.next(this.activeYear);
            });
        }

    public setSelectedYear(year: number): void {
        if(year !== this.getSavedYear()) {
            localStorage.setItem(this.ACTIVE_YEAR, year.toString());
            this.selectedYear$.next(year);
            this.tabservice.removeAllTabs();
            this.router.navigateByUrl('/');
        }
    }

    public getActiveYear(): Observable<number>{
        let val = localStorage.getItem(this.ACTIVE_YEAR);
        if(val) {
             return Observable.of(parseInt(val));
        }
        return this.GetDefaultYear();
    }

    public getSavedYear(): number {
        return parseInt(localStorage.getItem(this.ACTIVE_YEAR));

    }

    public clearActiveYear(): void {
        localStorage.removeItem(this.ACTIVE_YEAR);
    }


     private GetDefaultYear(): Observable<number> {
         return this.companySettings.Get(1).map((x: CompanySettings) => x.CurrentAccountingYear);
     }


}