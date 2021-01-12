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
    isAdmin$ = new BehaviorSubject<boolean>(false);

    tabs: IUniTab[] = [];

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private elsaCustomersService: ElsaCustomersService,
    ) {
        tabService.addTab({
            name: 'Lisensinformasjon',
            url: '/license-info',
            moduleID: UniModules.LicenseInfo
        });

        if (!this.isAdmin()) {
            this.selectedContractID$.next(this.authService.currentUser.License?.Company?.ContractID);
        } else {
            this.isAdmin$.next(true);

            if (sessionStorage.getItem('selectedContractID')) {
                this.selectedContractID$.next(parseInt(sessionStorage.getItem('selectedContractID'), 10));
            } else {
                this.selectedContractID$.next(this.authService.currentUser.License?.Company?.ContractID);
            }

            this.populateTabs();
        }

        this.loadCustomers();
    }

    isAdmin() {
        return (
            this.authService.currentUser.License?.CustomerAgreement?.CanAgreeToLicense
            || !!sessionStorage.getItem('selectedContractID')
        );
    }

    populateTabs() {
        if (this.tabs?.length) {
            return;
        }

        // temporary code
        if (this.authService.currentUser.License?.ContractType?.TypeID === 11) { // bureau
            this.tabs = [
                {name: 'Detaljer', path: 'details'},
                {name: 'Selskaper', path: 'companies'},
                {name: 'Brukere', path: 'users'},
                {name: 'Estimert forbruk', path: 'billing'},
                {name: 'Forbrukshistorikk', path: 'history'},
            ];
        } else {
            this.tabs = [
                {name: 'Detaljer', path: 'details'},
                {name: 'Selskaper', path: 'companies'},
                {name: 'Brukere', path: 'users'},
            ];
        }
        // end temporary
    }

    ngOnDestroy() {
        this.isAdmin$.complete();
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
        this.populateTabs();
        // if they can select a contract, then they are admin on that contract
        this.isAdmin$.next(true);
        this.selectedContractID$.next(contract.ID);
        sessionStorage.setItem('selectedContractID', contract.ID.toString());
    }
}
