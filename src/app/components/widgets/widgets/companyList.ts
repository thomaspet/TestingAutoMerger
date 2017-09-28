import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {ErrorService} from '../../../services/services';
import {Company, User} from '../../../unientities';
import {AuthService} from '../../../../framework/core/authService';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {UniNewCompanyModal} from '../../bureau/newCompanyModal';
import {UniHttp} from '../../../../framework/core/http/http';
import {UserService} from '../../../services/common/userService';
import {Observable} from 'rxjs/Observable';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';

enum KPI_STATUS {
    StatusUnknown = 0,
    StatusInProgress = 1,
    StatusError = 2,
    StatusReady = 3
}

@Component({
    selector: 'uni-companylist-widget',
    template: `
        <section class="uni-widget-header">
            Mine klienter
        </section>

        <section class="list-content"
            [attr.aria-busy]="busy">
            <input class="table-filter"
                type="search"
                placeholder="Filtrer klienter"
                [formControl]="searchControl" />

            <button
                type="button"
                (click)="onNewCompanyClick($event)"
            >Lag ny bedrift</button>

            <table class="uni-table unitable-main-table">
            <thead>
            <tr>
                <th (click)="sortBy('Name')" >Klienter <i>{{getSortArrow('Name')}}</i></th>
                <th (click)="sortByKpi('Inbox')">Fakturainnboks <i>{{getSortArrow('Inbox')}}</i></th>
                <th (click)="sortByKpi('Approved')">Godkjente regninger <i>{{getSortArrow('Approved')}}</i></th>
            </tr>
            </thead>
            <tr *ngFor="let company of filteredCompanies">
                <td (click)="onCompanyNameClick(company)">{{company.Name}}</td>
                <td (click)="onCompanyInboxClick(company)">{{getKpiCount(company, 'Inbox')}}</td>
                <td (click)="onCompanyApprovalsClick(company)">{{getKpiCount(company, 'Approved')}}</td>
            </tr>
            </table>
        </section>
    `
})
export class UniCompanyListWidget {
    private companies: Company[];
    private filteredCompanies: Company[];
    private searchControl: FormControl = new FormControl('');
    public busy: boolean = false;
    public currentSortField: string;
    public sortIsDesc: boolean = true;

    constructor(
        private errorService: ErrorService,
        private authService: AuthService,
        private router: Router,
        private uniModalService: UniModalService,
        private uniHttp: UniHttp,
        private userService: UserService,
        private toastService: ToastService
    ) {}

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
            .do(modalResult => companyName = modalResult.CompanyName)
            .flatMap(() => companyName ? this.userService.getCurrentUser() : Observable.empty())
            .do(currentUser => user = currentUser)
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

    public onCompanyNameClick(company: Company) {
        this.authService.setActiveCompany(company);
        this.busy = true;
        this.router.navigateByUrl('/');
    }

    public onCompanyInboxClick(company: Company) {
        this.authService.setActiveCompany(company);
        this.busy = true;
        this.router.navigateByUrl('/accounting/bills?filter=Inbox');
    }

    public onCompanyApprovalsClick(company: Company) {
        this.authService.setActiveCompany(company);
        this.busy = true;
        this.router.navigateByUrl('/accounting/bills?filter=Approved');
    }
}
