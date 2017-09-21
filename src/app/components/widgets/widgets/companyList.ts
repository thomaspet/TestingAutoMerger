import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {CompanyService, ErrorService} from '../../../services/services';
import {Company, User} from '../../../unientities';
import {AuthService} from '../../../../framework/core/authService';
import {UniTableConfig, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {UniNewCompanyModal} from './newCompanyModal';
import {UniHttp} from '../../../../framework/core/http/http';
import {UserService} from '../../../services/common/userService';
import {Observable} from 'rxjs/Observable';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'uni-companylist-widget',
    template: `
        <section class="uni-widget-header">
            Mine klienter
        </section>

        <section class="list-content">
            <input class="table-filter"
                type="search"
                placeholder="Filtrer klienter"
                [formControl]="searchControl" />
                
            <button
                type="button"
                (click)="onNewCompanyClick($event)"
            >Lag ny bedrift</button>

            <uni-table
                [resource]="filteredCompanies"
                [config]="tableConfig"
                (cellSelected)="onCellClick($event)">
            </uni-table>
        </section>
    `
})
export class UniCompanyListWidget {
    private companies: Company[];
    private filteredCompanies: Company[];
    private tableConfig: UniTableConfig;
    private searchControl: FormControl = new FormControl('');

    constructor(
        private errorService: ErrorService,
        private companyService: CompanyService,
        private authService: AuthService,
        private router: Router,
        private uniModalService: UniModalService,
        private uniHttp: UniHttp,
        private userService: UserService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.tableConfig = this.getTableConfig();

        this.searchControl.valueChanges
            .subscribe((searchValue) => {
                this.filteredCompanies = this.companies.filter(company => {
                    const companyName = (company.Name && company.Name.toLowerCase()) || '';
                    return companyName.includes(searchValue);
                });
            });

        this.companyService.GetAll(null).subscribe(
            res => this.filteredCompanies = this.companies = res.map(c => this.setCountsOnCompany(c)),
            err => this.errorService.handle(err)
        );
    }

    private setCountsOnCompany(company: Company): Company {
        // TODO: implement when we have a backend solution for this
        company['_approvals'] = Math.floor(Math.random() * 10);
        company['_inbox'] = Math.floor(Math.random() * 10);
        return company;
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

    private getTableConfig(): UniTableConfig {
        return new UniTableConfig('widgest.companyList', false, true, 14)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('Name', 'Klient'),
                // this.getCountCol('_approvals', 'Godkjenninger'),
                // this.getCountCol('_inbox', 'Fakturainnboks')
            ]);
    }

    private getCountCol(field: string, header: string) {
        return new UniTableColumn(field, header)
            .setTemplate(row => row[field] || '0')
            .setHeaderCls('count-col')
            .setAlignment('center')
            .setConditionalCls((row) => {
                const value = +row[field] || 0;
                return value === 0 ? 'number-good' : 'number-bad';
            });
    }

    public onCellClick(event: {row: Company, column: UniTableColumn}) {
        this.authService.setActiveCompany(event.row);

        let url = '/';
        const field = event.column.field;

        switch (field) {
            case '_approvals':
                url = '/assignments/approvals';
            break;
            case '_inbox':
                url = '/accounting/bills?filter=Inbox';
            break;
        }

        this.router.navigateByUrl(url);
    }
}
