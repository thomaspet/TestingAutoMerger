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
import {Observable} from 'rxjs';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../authService';
import {CompanySettings} from '../../../unientities';
import {UniFilesService} from '../../../services/common/uniFilesService';
import {ErrorService} from '../../../services/common/errorService';
import {FinancialYearService} from '@app/services/services';
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';

const BASE = environment.BASE_URL;
const FILE_BASE = environment.BASE_URL_FILES;

@Component({
    selector: 'uni-bureau-company-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section class="company-overview" *ngIf="!!viewData && !!company">
    <section class="highlighted-bar">
        <section>
            <span>Virksomheter</span>
            <a>{{viewData[2]}}</a>
        </section>
        <section>
            <span>Org. Nummer</span>
            <a>{{viewData[0].OrganizationNumber}}</a>
        </section>
        <section>
            <span>Aktive Brukere</span>
            <a (click)="navigateToCompanyUrl('/settings/users')">{{viewData[1]}}</a>
        </section>
    </section>
    <section class="info-section">
        <span><i class="material-icons">room</i><span class="info-name">Addresse</span>{{viewData[0].DefaultAddress?.AddressLine1}} {{viewData[0].DefaultAddress?.City}} {{viewData[0].DefaultAddress?.PostalCode}}</span>
        <span><i class="material-icons">mail_outline</i><span class="info-name">E-post</span>{{viewData[0].DefaultEmail?.EmailAddress}}</span>
        <span><i class="material-icons">call</i><span class="info-name">Telefon</span>{{viewData[0].DefaultPhone?.Number}}</span>
        <span><i class="material-icons">credit_card</i><span class="info-name">Driftskonto</span>{{viewData[0].CompanyBankAccount?.AccountNumber}}</span>
        <span><i class="material-icons">compare_arrows</i><span class="info-name">EHF</span>{{viewData[0].APActivated ? "aktivert" : "ikke aktivert"}}</span>
    </section>
</section>
`
})
export class BureauCompanyTab implements AfterViewInit, OnDestroy {
    public company: KpiCompany;

    public accountingYear: number;
    public viewData: any[];
    @HostBinding('class.no_access') public noAccess: boolean = false;

    private subscription: Subscription;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private authService: AuthService,
        private errorService: ErrorService,
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
                    this.getCompanySettings(company.Key),
                    this.getNumberOfUsersInCompany(company.Key),
                    this.getSubEntities(company.Key),
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

    public getCompanySettings(companyKey: string): Observable<CompanySettings> {
        return this.customHttpService.get(
            `${BASE}/api/biz/${CompanySettings.EntityType}/1`
            + `?expand=DefaultAddress,DefaultEmail,DefaultPhone,CompanyBankAccount`,
            companyKey
        )
            .map(response => response.body);
    }

    public getNumberOfUsersInCompany(companyKey: string): Observable<number> {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=user&select=count(id)`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getSubEntities(companyKey: string): Observable<number> {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=subentity&select=count(id)&filter=SuperiorOrganizationID gt 0`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
