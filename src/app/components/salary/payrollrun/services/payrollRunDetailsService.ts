import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {PayrollrunService, ErrorService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';
import {PayrollRun} from '../../../../unientities';

@Injectable()
export class PayrollRunDetailsService {
    private url: string = '/salary/payrollrun/';

    constructor(
        private modalService: UniModalService,
        private payrollRunService: PayrollrunService,
        private errorService: ErrorService,
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

    public setupSearchConfig(payrollRun: PayrollRun): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.payrollRunService.GetAll(
                `filter=ID ne ${payrollRun.ID} and (startswith(ID, '${query}') `
                + `or contains(Description, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: PayrollRun) => `${item.ID} - `
                + `${item.Description}`,
            initValue: (!payrollRun || !payrollRun.ID)
                ? 'Ny lønnsavregning'
                : `${payrollRun.ID} - ${payrollRun.Description || 'Lønnsavregning'}`,
            onSelect: selected => this.router.navigate(['salary/payrollrun/' + selected.ID])
        };
    }
}
