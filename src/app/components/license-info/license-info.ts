import {Component, OnDestroy} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {ElsaCustomer, ElsaContract} from '@app/models/elsa-models';
import {AuthService} from '@app/authService';
import {ElsaCustomersService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'license-info',
    templateUrl: './license-info.html',
    styleUrls: ['./license-info.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseInfo implements OnDestroy {
    activeTabIndex = 0;
    customers: ElsaCustomer[];
    selectedContractID$ = new BehaviorSubject<number>(null);

    tabs: IUniTab[] = [
        {name: 'Detaljer', path: 'details'},
        {name: 'Selskaper', path: 'companies'},
        {name: 'Brukere', path: 'users'},
        {name: 'Estimert forbruk', path: 'billing'},
        {name: 'Forbrukshistorikk', path: 'history'},
    ];

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private elsaCustomersService: ElsaCustomersService
    ) {
        tabService.addTab({
            name: 'Lisensinformasjon',
            url: '/license-info',
            moduleID: UniModules.LicenseInfo
        });

        if (sessionStorage.getItem('selectedContractID')) {
            this.selectedContractID$.next(parseInt(sessionStorage.getItem('selectedContractID'), 10));
        } else {
            this.selectedContractID$.next(this.authService.currentUser.License.Company.ContractID);
        }

        this.loadCustomers();
    }

    ngOnDestroy() {
        this.selectedContractID$.complete();
        sessionStorage.removeItem('selectedContractID');
    }

    loadCustomers() {
        this.elsaCustomersService.getAllManaged(this.authService.currentUser.GlobalIdentity).subscribe(
            (customers: ElsaCustomer[]) => {
                if (customers) {
                    this.customers = customers;
                }
            },
            err => console.error(err),
        );
    }

    selectContract(contract: ElsaContract) {
        this.selectedContractID$.next(contract.ID);
        sessionStorage.setItem('selectedContractID', contract.ID.toString());
    }
}
