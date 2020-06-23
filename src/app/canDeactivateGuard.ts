import {CanDeactivate} from '@angular/router';
import {Injectable} from '@angular/core';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<any> {
    public canDeactivate(component, currentRoute, currentState, nextState) {
        if (nextState.url.startsWith('/init')) {
            return true;
        }

        if (component?.canDeactivate) {
            const routeToActivate = nextState && nextState.url;

            if (routeToActivate === '/reload') {
                // Do not run the component's canDeactivate function when changing company!
                // Some of our views have timing issues that caused data to be
                // saved in the wrong company when doing this..
                return true;
            } else {
                return component.canDeactivate(routeToActivate);
            }
        }

        return true;
    }
}
