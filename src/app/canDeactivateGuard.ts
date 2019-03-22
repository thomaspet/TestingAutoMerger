import {CanDeactivate} from '@angular/router';

export class CanDeactivateGuard implements CanDeactivate<any> {

    public canDeactivate(component, currentRoute, currentState, nextState) {
        if (component.canDeactivate) {
            const routeToActivate = nextState && nextState.url;
            return component.canDeactivate(routeToActivate);
        }

        return true;
    }
}
