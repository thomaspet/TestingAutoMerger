﻿import {Component} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {UniModules} from '../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settings.html'
})
export class Settings {

    private childRoutes: any[];

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Settings', url: '/settings/company', moduleID: UniModules.Settings, active: true });
        this.childRoutes = [
            {name: 'Firmainnstillinger', path: 'company'},
            {name: 'Aga og virksomheter', path: 'aga-and-subentities'},
            {name: 'Brukerinnstillinger', path: 'user'},
            {name: 'Brukere og roller', path: 'users'},
            {name: 'Altinn', path: 'altinn'},
        ];
    }
}
