import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {Observable} from 'rxjs/Observable';
import {WageTypeService} from '../../../../services/services';
import {WageType} from '../../../../unientities';

@Injectable()
export class WageTypeViewService {

    private url: string = '/salary/wagetypes/';

    constructor(
        private wageTypeService: WageTypeService,
        private modalService: UniModalService,
        private router: Router
    ) { }

    public deleteWageType(wagetype: WageType): void {
        let id = wagetype.ID;
        this.modalService
            .confirm({
                header: 'Sletting av lønnsart',
                message: `Er du sikker på at du vil slette lønnsart ${wagetype.WageTypeNumber}?`,
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei'
                }
            })
            .onClose
            .switchMap((result: ConfirmActions) => result === ConfirmActions.ACCEPT
                ? this.wageTypeService.deleteWageType(id).map(() => result)
                : Observable.of(result))
            .subscribe((result) => {
                if (result !== ConfirmActions.ACCEPT) {
                    return;
                }
                this.router.navigateByUrl(this.url + 0);
            });
    }
}
