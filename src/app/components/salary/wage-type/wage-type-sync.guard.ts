import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { FinancialYearService } from '@app/services/services';
import { UniModalService } from '@uni-framework/uni-modal';
import { SyncWagetypesModalComponent } from '@app/components/salary/shared/components/sync-wagetypes-modal/sync-wagetypes-modal.component';
import { switchMap } from 'rxjs/operators';
import { SalaryYearService } from '@app/components/salary/shared/services/salary-year/salary-year.service';

@Injectable()
export class WagetypeSyncGuard implements CanActivate {
    constructor(
        private yearService: FinancialYearService,
        private modalService: UniModalService,
        private salaryYearService: SalaryYearService,
    ) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const activeYear = this.yearService.getActiveYear();
        return this.salaryYearService
            .hasYear()
            .pipe(
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
