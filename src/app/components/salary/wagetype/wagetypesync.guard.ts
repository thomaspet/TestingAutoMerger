import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { StatisticsService, FinancialYearService } from '@app/services/services';
import { UniModalService } from '@uni-framework/uni-modal';
import { SyncWagetypesModalComponent } from '../shared/components/sync-wagetypes-modal/sync-wagetypes-modal.component';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class WagetypeSyncGuard implements CanActivate {
    constructor(
        private statisticsService: StatisticsService,
        private yearService: FinancialYearService,
        private modalService: UniModalService
    ) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const activeYear = this.yearService.getActiveYear();
        return this.statisticsService
            .GetAllUnwrapped(`model=SalaryYear&Select=CurrentYear&filter=CurrentYear eq ${activeYear}&top=1`)
            .pipe(
                map(years => years && !!years.length),
                switchMap(hasYear => this.handleModal(hasYear, activeYear))
            );
    }

    private handleModal(hasYear: boolean, activeYear: number): Observable<boolean> {
        if (hasYear) {
            return of(hasYear);
        }
        return this.modalService
            .open(SyncWagetypesModalComponent, {data: activeYear})
            .onClose;
    }
}
