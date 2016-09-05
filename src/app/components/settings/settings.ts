import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settings.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
export class Settings {

    private childRoutes: any[];

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Settings', url: '/settings/company', moduleID: 20, active: true });
        this.childRoutes = [
            {name: 'Firmainnstillinger', path: 'company'},
            {name: 'Aga og virksomheter', path: 'aga-and-subentities'},
            {name: 'Brukerinnstillinger', path: 'user'},
            {name: 'Brukere og roller', path: 'users'},
            {name: 'Altinn', path: 'altinn'},
        ];
    }
}
