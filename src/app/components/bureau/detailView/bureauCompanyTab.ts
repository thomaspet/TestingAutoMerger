import {
    Component,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {AppConfig} from '../../../AppConfig';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../../../authService';
import {Company, CompanySettings} from '../../../unientities';
import {UniFilesService} from '../../../services/common/uniFilesService';
import {ErrorService} from '../../../services/common/errorService';
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';

const BASE = AppConfig.BASE_URL;
const FILE_BASE = AppConfig.BASE_URL_FILES;

@Component({
    selector: 'uni-bureau-company-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section class="company-overview" *ngIf="!!viewData && !!company">
    <img class="logo" [src]="logoUrl" [attr.aria-busy]="!logoUrl" />
    <a class="company_name">{{company.Name}}</a>
    <section class="highlighted-bar">
        <section>
            <span>Virksomheter</span>
            <a href="#">{{viewData[2]}}</a>
        </section>
        <section>
            <span>Org. Nummer</span>
            <a href="#">{{viewData[0].OrganizationNumber}}</a>
        </section>
        <section>
            <span>Aktive Brukere</span>
            <a href="#" (click)="navigateToCompanyUrl('/settings/users')">{{viewData[1]}}</a>
        </section>
    </section>
    <section class="info-section">
        <span><i class="material-icons">room</i><span class="info-name">Addresse</span>{{viewData[0].DefaultAddress?.AddressLine1}} {{viewData[0].DefaultAddress?.City}} {{viewData[0].DefaultAddress?.PostalCode}}</span>
        <span><i class="material-icons">mail_outline</i><span class="info-name">Epost</span>{{viewData[0].DefaultEmail?.EmailAddress}}</span>
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
    public logoUrl: string;

    private authToken: string;
    private subscription: Subscription;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService,
        private authService: AuthService,
        private uniFilesService: UniFilesService,
        private errorService: ErrorService,
        private currentCompanyService: BureauCurrentCompanyService
    ) {
        this.accountingYear = this.yearService.getSavedYear();
        this.authService.filesToken$.subscribe(token => this.authToken = token);
    }

    public ngAfterViewInit() {
        this.element.nativeElement.setAttribute('aria-busy', true);
        this.subscription = this.currentCompanyService
            .getCurrentCompany()
            .do(() => this.element.nativeElement.setAttribute('aria-busy', true))
            .do(company => this.company = company)
            .switchMap(company => Observable.forkJoin(
                this.getCompanySettings(company.Key),
                this.getNumberOfUsersInCompany(company.Key),
                this.getSubEntities(company.Key),
            ))
            .do(() => this.element.nativeElement.setAttribute('aria-busy', false))
            .do(() => this.cd.markForCheck())
            .do(() => this.logoUrl = undefined)
            .subscribe(
                result => {
                    this.viewData = result;
                    this.getLogoUrl(result[0], this.company.Key)
                        .do(() => this.cd.markForCheck())
                        .subscribe(logoUrl => this.logoUrl = logoUrl);
                },
                err => this.errorService.handle(err)
            );
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
        ).map(response => response.json());
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

    private getLogoUrl(companySettings: CompanySettings, companyKey: string): Observable<string> {
        if (!companySettings.LogoFileID) {
            return Observable.of('/assets/Logo-Placeholder.png');
        }

        const logoUrlObservable = this.customHttpService
            .get(`/api/biz/files/${CompanySettings.EntityType}/1`, companyKey)
            .map(response => response.json())
            .map(files => files.length ? files[0] : Observable.empty())
            .map(file =>
                `${FILE_BASE}/api/image/?key=${companyKey}&token=${this.authToken}&id=${file.StorageReference}`
            );

        return Observable.fromPromise(
            this.uniFilesService
                .checkAuthentication()
                .catch(() => this.authService.authenticateUniFiles())
        ).switchMap(() => logoUrlObservable);
    }


    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
