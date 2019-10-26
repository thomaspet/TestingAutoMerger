import {
    Component,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    AfterViewInit,
    OnDestroy, HostBinding
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {environment} from 'src/environments/environment';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {FinancialYearService} from '@app/services/services';
import {Observable} from 'rxjs';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../authService';
import {Company} from '../../../unientities';
import {ErrorService} from '../../../services/common/errorService';
import {UserService} from '../../../services/common/userService';
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';

const BASE = environment.BASE_URL;

@Component({
    selector: 'uni-bureau-task-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section class="tasks" *ngIf="!!viewData">
    <section class="for-approval">
        <i class="material-icons">check_circle</i>
        <a class="company_name">Til godkjenning</a>
        <section class="text-container">
            <p>
                Faktura
                <a (click)="navigateToCompanyUrl('/assignments/approvals')">{{viewData[2]}}</a>
            </p>

            <p>
                Timer
                <a (click)="navigateToCompanyUrl('/assignments/approvals')">{{viewData[3]}}</a>
            </p>
        </section>
    </section>
    <section class="for-processing">
        <i class="material-icons">autorenew</i>
        <a class="company_name">Til behandling</a>
        <section class="text-container">
            <p>
                Fakturainnboks
                <a (click)="navigateToCompanyUrl(inboxUrl)">{{viewData[0]}}</a>
            </p>

            <p>
                Godkjente faktura
                <a (click)="navigateToCompanyUrl('/accounting/bills?filter=Approved')">{{viewData[1]}}</a>
            </p>
        </section>
    </section>
</section>
`
})
export class BureauTaskTab implements AfterViewInit, OnDestroy {
    company: KpiCompany;
    accountingYear: number;
    viewData: any[];
    inboxUrl: string = environment.isSrEnvironment ? '/accounting/inbox' : '/accounting/bills?filter=Inbox';

    private subscription: Subscription;
    @HostBinding('class.no_access') public noAccess: boolean = false;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private authService: AuthService,
        private errorService: ErrorService,
        private userService: UserService,
        public currentCompanyService: BureauCurrentCompanyService,
        financialYearService: FinancialYearService,
    ) {
        this.accountingYear = financialYearService.getActiveYear();
    }

    public ngAfterViewInit() {
        this.element.nativeElement.setAttribute('aria-busy', true);
        this.subscription = this.currentCompanyService
            .getCurrentCompany()
            .subscribe(company => {
                this.company = company;
                this.noAccess = false;
                this.element.nativeElement.setAttribute('aria-busy', true);
                Observable.forkJoin(
                    this.getNumberOfItemsInInbox(company.Key),
                    this.getApprovedSupplierInvoices(company.Key),
                    this.getSupplierInvoiceApprovals(company.Key),
                    this.getHoursApprovals(company.Key),
                )
                    .finally(() => this.element.nativeElement.setAttribute('aria-busy', false))
                    .do(() => this.cd.markForCheck())
                    .subscribe(
                        result => this.viewData = result,
                        err => {
                            if (err.status === 403) {
                                this.noAccess = true;
                                this.cd.markForCheck();
                            } else {
                                this.errorService.handle(err);
                            }
                        },
                    );
            });
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public getNumberOfItemsInInbox(companyKey: string): Observable<Company> {
        return this.customHttpService.get(
            `${BASE}/api/biz/filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense/0?action=get-supplierInvoice-inbox`,
            companyKey
        )
            .map(response => response.body)
            .map(result => result.length);
    }

    public getApprovedSupplierInvoices(companyKey: string): Observable<Company> {
        return this.customHttpService.get(
            `${BASE}/api/statistics/?model=SupplierInvoice`
            +`&select=count(id)`
            +`&filter=( isnull(deleted,0) eq 0 ) and ( statuscode eq 30103 )`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getSupplierInvoiceApprovals(companyKey: string): Observable<number> {
        const supplierInvoiceModelId = 162;
        return this.userService.getCurrentUser()
            .switchMap(
                user => this.customHttpService.get(
                    `${BASE}/api/statistics/?model=approval`
                    +`&select=count(id)`
                    +`&expand=Task.Model`
                    +`&filter=UserID eq ${user.ID} and StatusCode eq 50120 and Model.ID eq ${supplierInvoiceModelId}`,
                    companyKey
                )
            )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getHoursApprovals(companyKey: string): Observable<number> {
        const hoursModelId = 196;
        return this.userService.getCurrentUser()
            .switchMap(
                user => this.customHttpService.get(
                    `${BASE}/api/statistics/?model=approval`
                    +`&select=count(id)`
                    +`&expand=Task.Model`
                    +`&filter=UserID eq ${user.ID} and StatusCode eq 50120 and Model.ID eq ${hoursModelId}`,
                    companyKey
                )
            )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }


    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
