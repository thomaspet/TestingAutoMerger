import {Component} from '@angular/core';
import {IUniTab} from '../layout/uniTabs/uniTabs';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {ElsaCustomersService, ErrorService} from '@app/services/services';
import {AuthService} from '@app/authService';

@Component({
    selector: 'license-info',
    templateUrl: './license-info.html',
    styleUrls: ['./license-info.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseInfo {
    licenseOwner;
    activeTabIndex = 0;

    tabs: IUniTab[] = [
        {name: 'Administratorer'},
        {name: 'Selskaper'},
    ];

    constructor(
        private authService: AuthService,
        private elsaCustomerService: ElsaCustomersService,
        private errorService: ErrorService,
        private tabService: TabService
    ) {
        this.tabService.addTab({
            name: 'Lisensinformasjon',
            url: '/license-info',
            moduleID: UniModules.LicenseInfo
        });

        const contractID = this.authService.currentUser.License.Company.ContractID;
        this.elsaCustomerService.getByContractID(contractID).subscribe(
            res => this.licenseOwner = res,
            err => this.errorService.handle(err)
        );
    }
}
