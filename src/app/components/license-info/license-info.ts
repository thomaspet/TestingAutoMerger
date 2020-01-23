import {Component, OnDestroy} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {environment} from 'src/environments/environment';
import {ElsaCustomer, ElsaContract} from '@app/models/elsa-models';
import {AuthService} from '@app/authService';
import {ElsaCustomersService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'license-info',
    templateUrl: './license-info.html',
    styleUrls: ['./license-info.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseInfo implements OnDestroy {
    activeTabIndex = 0;
    customers: ElsaCustomer[];
    isSrEnvironment: boolean = environment.isSrEnvironment;
    public selectedContractID$: BehaviorSubject<number> = new BehaviorSubject(null);

    tabs: IUniTab[] = [
        {name: 'Detaljer', path: 'details'},
        {name: 'Selskaper', path: 'companies'},
        {name: 'Brukere', path: 'users'}
    ];

    constructor(tabService: TabService,
        private authService: AuthService,
        private elsaCustomersService: ElsaCustomersService) {
        if (!this.isSrEnvironment) {
            this.tabs.push({name: 'Estimert forbruk', path: 'billing'});
        }

        tabService.addTab({
            name: 'Lisensinformasjon',
            url: '/license-info',
            moduleID: UniModules.LicenseInfo
        });
        this.selectedContractID$.next(this.authService.currentUser.License.Company.ContractID);
        this.loadCustomers();
    }

    ngOnDestroy() {
        this.selectedContractID$.complete();
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
    }
}
