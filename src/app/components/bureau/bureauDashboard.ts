import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {User, LocalDate} from '../../unientities';
import {ErrorService} from '../../services/common/errorService';
import {AuthService} from '../../authService';
import {UniModalService} from '../../../framework/uniModal/modalService';
import {UniHttp} from '../../../framework/core/http/http';
import {UserService} from '../../services/common/userService';
import {ToastService, ToastType, ToastTime} from '../../../framework/uniToast/toastService';
import {UniNewCompanyModal} from './newCompanyModal';
import {Observable} from 'rxjs';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';

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
}

@Component({
    selector: 'uni-bureau-dashboard',
    templateUrl: './bureauDashboard.html'
})
export class BureauDashboard {
    private companies: KpiCompany[];
    private filteredCompanies: KpiCompany[];
    private searchControl: FormControl = new FormControl('');
    public busy: boolean = false;
    public currentSortField: string;
    public sortIsDesc: boolean = true;
    public highlightedCompany: KpiCompany;

    constructor(
        private errorService: ErrorService,
        private authService: AuthService,
        private router: Router,
        private uniModalService: UniModalService,
        private uniHttp: UniHttp,
        private userService: UserService,
        private toastService: ToastService,
        tabService: TabService
    ) {
        tabService.addTab({ name: 'Selskaper', url: '/bureau', moduleID: UniModules.BureauDashboard, active: true });
    }

    public ngOnInit() {
        this.searchControl.valueChanges
            .subscribe((searchValue) => {
                this.filteredCompanies = this.companies.filter(company => {
                    const companyName = (company.Name && company.Name.toLowerCase()) || '';
                    return companyName.includes(searchValue);
                });
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
                res => this.filteredCompanies = this.companies = res,
                err => this.errorService.handle(err)
            );
    }

    public getKpiCount(company, kpiName): string {
        const kpi = company.Kpi.find(kpi => kpi.Name === kpiName);
        if (kpi) {
            switch (kpi.ValueStatus) {
                case KPI_STATUS.StatusReady:
                    return kpi.Counter != 0 ? kpi.Counter : '';
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

    public onNewCompanyClick() {
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
                `${companyName} blir nå laget, en mail vil bli sendt til ${user.Email} når du kan begynne å bruke det.`
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

    public sortByKpi(key) {
        if (this.currentSortField === key) {
            this.sortIsDesc = !this.sortIsDesc;
        }
        this.currentSortField = key;
        this.filteredCompanies.sort((companyA, companyB) => {
            const a = this.getKpiCount(companyA, key);
            const b = this.getKpiCount(companyB, key);
            if (a > b) {
                return this.sortIsDesc ? -1 : 1;
            }
            if (a < b) {
                return this.sortIsDesc ? 1 : -1;
            }
            return 0;
        })
    }

    public sortBy(key) {
        if (this.currentSortField === key) {
            this.sortIsDesc = !this.sortIsDesc;
        }
        this.currentSortField = key;
        this.filteredCompanies.sort((a, b) => {
            a = typeof a[key] === "string" ? a[key].toLowerCase() : a[key];
            b = typeof b[key] === "string" ? b[key].toLowerCase() : b[key];
            if (a > b) {
                return this.sortIsDesc ? -1 : 1;
            }
            if (a < b) {
                return this.sortIsDesc ? 1 : -1;
            }
            return 0;
        })
    }

    public getSortArrow(key) {
        if (this.currentSortField === key) {
            return this.sortIsDesc ? '▲' : '▼';
        }
    }

    public onCompanyNameClick(company: KpiCompany) {
        this.authService.setActiveCompany(company);
        this.busy = true;
    }

    public onCompanyInboxClick(company: KpiCompany) {
        const redirectUrl = '/accounting/bills?filter=Inbox';
        this.authService.setActiveCompany(company, redirectUrl);
        this.busy = true;
    }

    public onCompanyApprovalsClick(company: KpiCompany) {
        const redirectUrl = '/accounting/bills?filter=Approved';
        this.authService.setActiveCompany(company, redirectUrl);
        this.busy = true;
    }

    public onRowClick(company: KpiCompany) {
        this.highlightedCompany = company;
    }
}
