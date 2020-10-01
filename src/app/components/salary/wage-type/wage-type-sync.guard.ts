import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { StatisticsService, FinancialYearService, WageTypeService } from '@app/services/services';
import { UniModalService } from '@uni-framework/uni-modal';
import { SyncWagetypesModalComponent } from '../shared/components/sync-wagetypes-modal/sync-wagetypes-modal.component';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class WagetypeSyncGuard implements CanActivate {
    constructor(
        private wageTypeService: WageTypeService,
        private yearService: FinancialYearService,
        private modalService: UniModalService
    ) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const activeYear = this.yearService.getActiveYear();
        return this.wageTypeService
            .needSync(activeYear)
            .pipe(
                switchMap(needSync => this.handleModal(needSync, activeYear))
            );
    }

    private handleModal(needSync: boolean, activeYear: number): Observable<boolean> {
        if (!needSync) {
            return of(true);
        }
        return this.modalService
            .open(SyncWagetypesModalComponent, {data: activeYear})
            .onClose;
    }
}
