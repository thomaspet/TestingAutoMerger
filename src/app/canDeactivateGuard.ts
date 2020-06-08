import {CanDeactivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {UniModalService, ChangingCompanyWarning} from '@uni-framework/uni-modal';
import {map} from 'rxjs/operators';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<any> {
    constructor(private modalService: UniModalService) {}

    public canDeactivate(component, currentRoute, currentState, nextState) {
        if (nextState.url.startsWith('/init')) {
            return true;
        }

        if (component?.canDeactivate) {
            const routeToActivate = nextState && nextState.url;
            if (nextState.url === '/reload') {
                const showWarningDialog = !localStorage.getItem('changing_company_warning_hidden');
                return !showWarningDialog || this.modalService.open(ChangingCompanyWarning).onClose.pipe(map(res => {
                    if (res) {
                        if (res.hideWarning) {
                            localStorage.setItem('changing_company_warning_hidden', 'true');
                        }

                        return res.canChangeCompany;
                    }

                    return false;
                }));
            } else {
                return component.canDeactivate(routeToActivate);
            }
        }

        return true;
    }
}
