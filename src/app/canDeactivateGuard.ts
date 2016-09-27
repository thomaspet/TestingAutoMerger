import {CanDeactivate} from '@angular/router';

export class CanDeactivateGuard implements CanDeactivate<any> {

    public canDeactivate(target: any) {
        if (target.canDeactivate) {
            return target.canDeactivate();
        }

        return true;
    }
}
