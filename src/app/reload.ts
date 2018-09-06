import {Component} from '@angular/core';

@Component({
    selector: 'reload-helper',
    template: '',
})
export class ReloadHelper {
    /*
        While seemingly meaningless, this component is used by authService for a few reasons

        - It allows us to redraw the current route without reloading the entire application
          (navigating here and then back causes the component to reload).
          This allows us to change active company without throwing the user back to dashboard.

        - It's also used to trigger unsaved changes check before changing active company.
          AuthService first tries navigating here. If the navigation is stopped by canDeactivate
          it will not change active company. If the navigation is successful it'll change company
          and navigate back to the previous route.
    */
}
