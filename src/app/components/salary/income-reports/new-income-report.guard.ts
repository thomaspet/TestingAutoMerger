import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { UniModalService } from '@uni-framework/uni-modal';
import { of } from 'rxjs';
import { IncomeReportModal } from './income-report-modal/income-report-modal';

@Injectable()
export class NewIncomeReportGuard implements CanActivate {
    constructor(
        private router: Router,
        private modalService: UniModalService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (Number(route.params.id) === 0) {
            this.modalService.open(IncomeReportModal).onClose.subscribe(incomereportdata => {
                if (incomereportdata) {
                    this.router.navigateByUrl('/salary/incomereports/' + incomereportdata.ID);
                }
                return of(false);
            });
        } else {
            return of(true);
        }
    }
}
