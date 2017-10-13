import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {PayrollrunService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PayrollRunDetailsService {
    private url: string = '/salary/payrollrun/';

    constructor(
        private modalService: UniModalService,
        private payrollRunService: PayrollrunService,
        private router: Router
    ) {}

    public deletePayrollRun(id: number): void {
        this.modalService
            .confirm({
                header: 'Sletting av lønnsavregning',
                message: `Er du sikker på at du vil slette lønnsavregning ${id}?`,
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei'
                }
            })
            .onClose
            .switchMap((result: ConfirmActions) => result === ConfirmActions.ACCEPT
                ? this.payrollRunService.deletePayrollRun(id).map(() => result)
                : Observable.of(result))
            .subscribe((result) => {
                if (result !== ConfirmActions.ACCEPT) {
                    return;
                }
                this.router.navigateByUrl(this.url + 0);
            });
    }
}
