import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {User, LocalDate} from '../../unientities';
import {ErrorService} from '../../services/common/errorService';
import {AuthService} from '../../authService';
import {UniModalService} from '../../../framework/uniModal/modalService';
import {UniHttp} from '../../../framework/core/http/http';
import {UserService} from '../../services/common/userService';
import {ToastService, ToastType, ToastTime} from '../../../framework/uniToast/toastService';
import {UniNewCompanyModal} from './newCompanyModal';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../framework/save/save';

import {Observable} from 'rxjs/Observable';

enum KPI_STATUS {
    StatusUnknown = 0,
    StatusInProgress = 1,
    StatusError = 2,
    StatusReady = 3
}

type KpiCompany = {
    FileFlowEmail: string;
    ID: number;
    Name: string;
    IsTest: boolean;
    Key: string;
    Kpi: {
        ID: number;
        KpiDefinitionID: number;
        Name: string;
        Application: string;
        CompanyID: number;
        Counter: number;
        ValueStatus: KPI_STATUS;
        LastUpdated: LocalDate;
    }[]
};

@Component({
    selector: 'uni-bureau-dashboard',
    templateUrl: './bureauDashboard.html'
})
export class BureauDashboard {
    public toolbarConfig: IToolbarConfig;
    public saveActions: IUniSaveAction[];

    private companies: KpiCompany[];
    private filteredCompanies: KpiCompany[];
    public highlightedCompany: KpiCompany;

    private searchControl: FormControl;
    public busy: boolean = false;
    public currentSortField: string;
    public sortIsDesc: boolean = true;

    constructor(
        private errorService: ErrorService,
        private authService: AuthService,
        private uniModalService: UniModalService,
        private uniHttp: UniHttp,
        private userService: UserService,
        private toastService: ToastService,
        tabService: TabService
    ) {
        tabService.addTab({
            name: 'Selskaper',
            url: '/bureau',
            moduleID: UniModules.BureauDashboard,
            active: true
        });

        this.toolbarConfig = {
            title: 'Mine selskaper',
        };

        this.saveActions = [{
            label : 'Opprett nytt selskap',
            action: (done) => {
                this.openNewCompanyModal();
                done();
            }
        }];
    }

    public ngOnInit() {
        let userPreferences = this.getUserPreferences();
        this.searchControl = new FormControl(userPreferences.filterString || '');
        this.sortIsDesc = userPreferences.sortIsDesc;
        this.currentSortField = userPreferences.sortField;

        this.searchControl.valueChanges.subscribe((searchValue: string) => {
            this.filterCompanies(searchValue);
        });

        this.busy = true;
        this.uniHttp
            .asGET()
            .usingRootDomain()
            .withEndPoint('kpi/companies')
            .send()
            .map(res => res.json())
            .do(() => this.busy = false)
            .subscribe(
                res => {
                    this.companies = this.mapKpiCounts(res);
                    this.filterCompanies(this.searchControl.value || '');
                    this.sortBy(this.currentSortField);
                },
                err => this.errorService.handle(err)
            );
    }

    public ngOnDestroy() {
        // Store filter string and sort info
        try {
            localStorage.setItem('bureau_list_user_preferences', JSON.stringify({
                filterString: this.searchControl.value || '',
                sortField: this.currentSortField,
                sortIsDesc: this.sortIsDesc
            }));
        } catch (e) {}
    }

    private filterCompanies(filterString): void {
        if (filterString && filterString.length) {
            this.filteredCompanies = this.companies.filter(company => {
                const companyName = (company.Name && company.Name.toLowerCase()) || '';
                return companyName.includes((filterString || '').toLowerCase());
            });
        } else {
            this.filteredCompanies = this.companies;
        }

        this.sortBy(this.currentSortField);
    }

    private mapKpiCounts(companies: KpiCompany[]): KpiCompany[] {
        return companies.map(company => {
            company['_inboxCount'] = this.getKpiCount(company, 'Inbox');
            company['_approvedCount'] = this.getKpiCount(company, 'Approved');

            return company;
        });
    }

    public getKpiCount(company, kpiName): string {
        const kpi = company.Kpi.find(k => k.Name === kpiName);
        if (kpi) {
            switch (kpi.ValueStatus) {
                case KPI_STATUS.StatusReady:
                    return kpi.Counter !== 0 ? kpi.Counter : '';
                case KPI_STATUS.StatusError:
                    return 'Feil';
                case KPI_STATUS.StatusInProgress:
                    return 'Loading...';
                case KPI_STATUS.StatusUnknown:
                    return 'Ukjent status';
            }
        }
        return '';
    }

    public openNewCompanyModal() {
        let companyName: string;
        let user: User;
        this.uniModalService.open(UniNewCompanyModal).onClose.asObservable()
            .filter(modalResult => !!modalResult)
            .do(modalResult => companyName = modalResult.CompanyName)
            .flatMap(() => companyName ? this.userService.getCurrentUser() : Observable.empty())
            .do((currentUser: User) => user = currentUser)
            .flatMap(() => this.createCompany(companyName, user.Email))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(() => this.toastService.addToast(
                'Suksess',
                ToastType.good,
                ToastTime.medium,
                `${companyName} blir nå laget, en mail vil bli sendt til `
                    + `${user.Email} når du kan begynne å bruke det.`
            ));
    }

    private createCompany(name: string, email: string) {
        return this.uniHttp
            .usingInitDomain()
            .asPOST()
            .withEndPoint('sign-up')
            .withBody({
                CompanyName: name,
                Email: email
            })
            .send();
    }

    public sortBy(key, toggleDirection?: boolean) {
        if (!key || !key.length) {
            return;
        }

        if (toggleDirection && this.currentSortField === key) {
            this.sortIsDesc = !this.sortIsDesc;
        }

        this.currentSortField = key;
        this.filteredCompanies.sort((a, b) => {
            a = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
            b = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];

            if (a > b) {
                return this.sortIsDesc ? -1 : 1;
            }
            if (a < b) {
                return this.sortIsDesc ? 1 : -1;
            }

            return 0;
        });
    }

    public getSortArrow(key) {
        if (this.currentSortField === key) {
            return this.sortIsDesc ? '▼' : '▲';
        }
    }

    public onCompanyNameClick(company: KpiCompany) {
        this.authService.setActiveCompany(<any>company);
        this.busy = true;
    }

    public onCompanyInboxClick(company: KpiCompany) {
        const redirectUrl = '/accounting/bills?filter=Inbox';
        this.authService.setActiveCompany(<any>company, redirectUrl);
        this.busy = true;
    }

    public onCompanyApprovalsClick(company: KpiCompany) {
        const redirectUrl = '/accounting/bills?filter=Approved';
        this.authService.setActiveCompany(<any>company, redirectUrl);
        this.busy = true;
    }

    public onRowClick(company: KpiCompany) {
        this.highlightedCompany = company;
    }

    private getUserPreferences() {
        let preferences;
        try {
            preferences = JSON.parse(localStorage.getItem('bureau_list_user_preferences'));
        } catch (e) {}

        return preferences || {};
    }
}
