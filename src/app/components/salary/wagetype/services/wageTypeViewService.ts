import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {Observable} from 'rxjs/Observable';
import {WageTypeService, ErrorService} from '../../../../services/services';
import {WageType} from '../../../../unientities';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';

@Injectable()
export class WageTypeViewService {

    private url: string = '/salary/wagetypes/';

    constructor(
        private wageTypeService: WageTypeService,
        private modalService: UniModalService,
        private errorService: ErrorService,
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

    public setupSearchConfig(wageType: WageType): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.wageTypeService.GetAll(
                `filter=ID ne ${wageType.ID} and (startswith(WageTypeNumber, '${query}') `
                + `or contains(WageTypeName, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: WageType) => `${item.WageTypeNumber} - `
                + `${item.WageTypeName}`,
            initValue: (!wageType || !wageType.WageTypeNumber)
                ? 'Ny lønnsart'
                : `${wageType.WageTypeNumber} - ${wageType.WageTypeName || 'Lønnsart'}`,
            onSelect: selected => this.router.navigate(['salary/wagetypes/' + selected.ID])
        };
    }
}
