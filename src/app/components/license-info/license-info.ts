import {Component} from '@angular/core';
import {IUniTab} from '../layout/uniTabs/uniTabs';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'license-info',
    templateUrl: './license-info.html',
    styleUrls: ['./license-info.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseInfo {
    activeTabIndex = 0;

    tabs: IUniTab[] = [
        {name: 'Detaljer', path: 'details'},
        {name: 'Selskaper', path: 'companies'},
        {name: 'Brukere', path: 'users'},
        {name: 'Estimert forbruk', path: 'billing'},
    ];

    constructor(
        private tabService: TabService
    ) {
        this.tabService.addTab({
            name: 'Lisensinformasjon',
            url: '/license-info',
            moduleID: UniModules.LicenseInfo
        });
    }
}
