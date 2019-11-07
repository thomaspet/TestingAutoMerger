import {Component} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'license-info',
    templateUrl: './license-info.html',
    styleUrls: ['./license-info.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseInfo {
    activeTabIndex = 0;
    isSrEnvironment: boolean = environment.isSrEnvironment;

    tabs: IUniTab[] = [
        {name: 'Detaljer', path: 'details'},
        {name: 'Selskaper', path: 'companies'},
        {name: 'Brukere', path: 'users'}
    ];

    constructor(tabService: TabService) {
        if (!this.isSrEnvironment) {
            this.tabs.push({name: 'Estimert forbruk', path: 'billing'});
        }

        tabService.addTab({
            name: 'Lisensinformasjon',
            url: '/license-info',
            moduleID: UniModules.LicenseInfo
        });
    }
}
