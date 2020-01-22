import {Component} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {UniModules} from '../layout/navbar/tabstrip/tabService';
import {SettingsService} from './settings-service';
import {Observable} from 'rxjs';
import {UniHttp} from '../../../framework/core/http/http';
import {IToolbarConfig} from '../common/toolbar/toolbar';

@Component({
    selector: 'settings',
    templateUrl: './settings.html'
})
export class Settings {
    public childRoutes: any[];
    public toolbarconfig: IToolbarConfig = {
        title: 'Innstillinger',
        hideBreadcrumbs: true
    };

    constructor(
        public settingsService: SettingsService,
        private tabService: TabService
    ) {
        this.tabService.addTab({
             name: 'Innstillinger',
             url: '/settings/company',
             moduleID: UniModules.Settings,
             active: true
        });

        this.childRoutes = [
            { name: 'Firma', path: 'company' },
            { name: 'Utsendelse', path: 'distribution' },
            { name: 'Lønn', path: 'aga-and-subentities' },
            { name: 'Integrasjoner', path: 'webhooks' },
            { name: 'Brukere', path: 'users' },
            { name: 'Team', path: 'teams' },
            { name: 'Nummerserier', path: 'numberseries' },
            { name: 'Betalings- og leveringsbetingelser', path: 'terms' },
            { name: 'Dimensjoner', path: 'dimension' }
            // { name: 'Bankinnstillinger', path: 'banksettings' }
        ];
    }
}
