import {Component, OnDestroy} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {ElsaCustomer, ElsaContract} from '@app/models/elsa-models';
import {AuthService} from '@app/authService';
import {CompanySettingsService, ElsaCustomersService, ErrorService, SubEntityService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {theme, THEMES} from 'src/themes/theme';
import {UniModalService, WizardSettingsModal} from '@uni-framework/uni-modal';
import {NewContractModal} from './new-contract-modal/new-contract-modal';
import {UniNewCompanyModal} from '../common/modals/company-modals';
import {NewCompanyModal} from './new-company-modal/new-company-modal';
import {switchMap, tap} from 'rxjs/operators';
import {Company} from '@uni-entities';

@Component({
    selector: 'license-info',
    templateUrl: './license-info.html',
    styleUrls: ['./license-info.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseInfo implements OnDestroy {
    activeTabIndex = 0;
    customers: ElsaCustomer[];
    selectedCustomerID: number;
    selectedContractID$ = new BehaviorSubject<number>(null);
    isAdmin$ = new BehaviorSubject<boolean>(false);
    isBureauCustomer: boolean;
    isSb1 = theme.theme === THEMES.SR;

    tabs: IUniTab[] = [];

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private elsaCustomersService: ElsaCustomersService,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private subEntityService: SubEntityService,
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
                    this.findSelectedCustomer();
                }
            },
            err => console.error(err),
        );
    }

    selectContract(contract: ElsaContract, customer: ElsaCustomer) {
        this.populateTabs();
        // if they can select a contract, then they are admin on that contract
        this.isAdmin$.next(true);
        this.selectedContractID$.next(contract.ID);
        this.selectedCustomerID = customer.ID;
        this.isBureauCustomer = customer.CustomerType === 5;
        sessionStorage.setItem('selectedContractID', contract.ID.toString());
    }

    findSelectedCustomer() {
        const selectedCustomer = this.customers.find(customer => {
            return customer.Contracts?.some(contract => contract.ID === this.selectedContractID$.getValue());
        });

        this.selectedCustomerID = selectedCustomer.ID;
        this.isBureauCustomer = selectedCustomer.CustomerType === 5;
    }

    openNewContractModal() {
        if (!this.selectedCustomerID) {
            this.findSelectedCustomer();
        }

        this.modalService.open(NewContractModal, {
            data: {customerID: this.selectedCustomerID}
        }).onClose.subscribe((newContract: ElsaContract) => {
            if (newContract) {
                this.loadCustomers();
                if (theme.theme === THEMES.UE || theme.theme === THEMES.SOFTRIG) {
                    this.modalService.open(UniNewCompanyModal, {
                        data: { contractID: newContract.ID }
                    }).onClose.subscribe((company: Company) => {
                        if (company && company.ID) {
                            this.authService.setActiveCompany(company);
                            this.modalService.open(WizardSettingsModal).onClose.pipe(
                                tap(() => this.handleSubEntityImport()),
                            ).subscribe(() => {}, err => this.errorService.handle(err));
                        }
                    });
                } else {
                    this.modalService.open(NewCompanyModal, {
                        data: {
                            contractID: newContract.ID,
                            contractType: newContract.ContractType,
                            isBureauCustomer: this.isBureauCustomer
                        }
                    });
                }
            }
        });
    }

    handleSubEntityImport() {
        this.companySettingsService.getCompanySettings()
            .pipe(switchMap(companySettings =>
                this.subEntityService.checkZonesAndSaveFromEnhetsregisteret(companySettings.OrganizationNumber)
            )).take(1).subscribe();
    }
}
