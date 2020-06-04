import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {EmployeeService} from '@app/services/services';
import {Observable} from 'rxjs';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';

@Injectable()
export class EmployeeGuard implements CanActivate {
    constructor(
        private employeeService: EmployeeService,
        private router: Router,
        private modalService: UniModalService
    ) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        return this.employeeService
            .canAccesssEmployee(route.params.id)
            .switchMap(canEdit => canEdit ? Observable.of(canEdit) : this.showRerouteModal());
    }

    private showRerouteModal(): Observable<boolean> {
        return this.modalService
            .confirm({
                header: 'Mangler info',
                message: 'Du må registrere organisasjonsnummer og virksomhet før du kan legge til ansatte',
                buttonLabels: {
                    accept: 'Ok'
                }
            })
            .onClose
            .do((result: ConfirmActions) => {
                if (result !== ConfirmActions.ACCEPT) {
                    return;
                }
                this.router.navigate(['/settings/company']);
            })
            .map(() => false);
    }
}
