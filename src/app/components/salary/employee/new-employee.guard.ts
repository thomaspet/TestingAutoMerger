import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { StatisticsService } from '@app/services/services';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { switchMap } from 'rxjs/operators';
import { StandardVacationPayModalComponent } from '@app/components/common/modals/standard-vacation-pay-modal/standard-vacation-pay-modal.component';

@Injectable()
export class NewEmployeeGuard implements CanActivate {
    constructor(
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        if (Number(route.params.id) === 0) {
            return this.statisticsService.GetAllUnwrapped('model=CompanyVacationRate').pipe(
                switchMap(x => (!(x[0].countid > 0))
                    ? this.modalService.open(StandardVacationPayModalComponent).onClose
                    : of(ConfirmActions.ACCEPT)),
                    switchMap(res  => {
                        if (res === ConfirmActions.ACCEPT) {
                            return of(true);
                        }
                    return of(false);
                }));
        }
        return of(true);
    }
}
