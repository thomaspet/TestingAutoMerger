import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { StatisticsService } from '@app/services/services';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { switchMap } from 'rxjs/operators';
import { StandardVacationPayModalComponent } from '@app/components/common/modals/standard-vacation-pay-modal/standard-vacation-pay-modal.component';

@Injectable()
export class NewPayrollRunGuard implements CanActivate {
    constructor(
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        if (Number(route.params.id) === 0) {
            return this.statisticsService.GetAllUnwrapped('model=Employee').pipe(
                switchMap(x => (Number(x[0].countid) === 0) ? this.redirectUserToEmployees() : of(true))
            );
        }
        return of(true);
    }

    redirectUserToEmployees(): Observable<boolean> {
        return this.modalService.open(StandardVacationPayModalComponent).onClose.pipe(
            switchMap(x  => {
                if (x === ConfirmActions.ACCEPT) {
                    this.router.navigateByUrl('/salary/employees');
                }
                return of(false);
            })
        );
    }
}
