import {CanDeactivate} from '@angular/router';

export class CanDeactivateGuard implements CanDeactivate<any> {
    public canDeactivate(component, currentRoute, currentState, nextState) {
        if (nextState.url.includes('/login')) {
            return true;
        }

        if (component.canDeactivate) {
            const routeToActivate = nextState && nextState.url;
            return component.canDeactivate(routeToActivate);
        }

        return true;
    }
}
