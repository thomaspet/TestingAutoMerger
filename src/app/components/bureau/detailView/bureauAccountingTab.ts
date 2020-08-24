import {
    Component,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
    AfterViewInit, HostBinding
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {environment} from 'src/environments/environment';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {Observable} from 'rxjs';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../authService';
import {ErrorService} from '../../../services/common/errorService';
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';
import {UniModalService, ConfirmActions, UniPreviewModal} from '@uni-framework/uni-modal';
import {UniReportParamsModal} from '@app/components/reports/modals/parameter/reportParamModal';
import {ReportDefinitionService, FinancialYearService} from '@app/services/services';
import {ToastService} from '@uni-framework/uniToast/toastService';

const BASE = environment.BASE_URL;

@Component({
    selector: 'uni-bureau-accounting-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section *ngIf="!!viewData" class="tab-parts">
    <section class="tab-part">
        <section class="image-container">
            <img class="invoice-icon">
            <span> {{ 'NAVBAR.SUPPLIER_INVOICE' | translate }} </span>
        </section>
        <section class="text-container">
            <p>
                Godkjente faktura:
                <a (click)="navigateToCompanyUrl('/accounting/bills?filter=Approved')">{{viewData[0]}}</a>
            </p>

            <p>
                Bokført i {{accountingYear}}:
                <a (click)="navigateToCompanyUrl('/accounting/bills?filter=Journaled')">{{viewData[1]}}</a>
            </p>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container">
            <img class="journalentry-icon">
            <span>Bilag</span>
        </section>
        <section class="text-container">
            <p>
                Antall bilag bokført i {{accountingYear}}:
                <a (click)="navigateToCompanyUrl('/accounting/bills?filter=All')">{{viewData[2]}}</a>
            </p>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container clickable" (click)="runReport('Økonomioversikt')">
            <img class="journalentry-icon">
            <span>Økonomirapport</span>
        </section>
        <section class="text-container">
            <p><a (click)="runReport('Økonomioversikt')">Økonomirapport (med resultat og balanse)</a></p>
            <p class="small-header"><a (click)="navigateToCompanyUrl('/reports?category=accounting')">Andre rapporter</a></p>
        </section>
    </section>
</section>`
})
export class BureauAccountingTab implements AfterViewInit, OnDestroy {
    public company: KpiCompany;
    public accountingYear: number;
    public viewData: any[];
    private subscription: Subscription;
    private reportCache: Array<any> = [];
    @HostBinding('class.no_access') public noAccess: boolean;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private authService: AuthService,
        private errorService: ErrorService,
        public currentCompanyService: BureauCurrentCompanyService,
        private financialYearService: FinancialYearService,
        private uniModalService: UniModalService,
        private reportService: ReportDefinitionService,
        private toast: ToastService
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
                    this.getApprovedInvoices(company.Key),
                    this.getNumberOfJournalEntryTransactions(company.Key),
                    this.getNumberOfJournalEntries(company.Key),
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

    public getApprovedInvoices(companyKey: string): Observable<number> {
        return this.customHttpService.get(
            `${BASE}/api/statistics/?model=supplierinvoice`
            + `&select=count(id)`
            + `&filter=statuscode eq 30103`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntryTransactions(companyKey: string): Observable<number> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=supplierinvoice&select=count(id)`
            + `&filter=FinancialYear.Year eq ${year} and JournalEntry.JournalEntryNumber gt 0`
            + `&expand=journalentry,journalentry.financialyear`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntries(companyKey: string): Observable<number> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=journalentry&select=count(id)`
            + `&filter=FinancialYear.Year eq ${year} and JournalEntryNumber gt 0`
            + `&expand=financialyear`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }

    public runReport(name: string, report?: any) {

        if (!report) {
            report = this.reportCache.find( x => x.Name === name);
            if (!report) {
                this.reportService.GetAll(`filter=name eq '${name}'`)
                    .subscribe( (x: Array<any>) => {
                        const rep = x.length > 0 ? x[0] : undefined;
                        if (rep) {
                            this.reportCache.push(rep);
                            this.runReport('', rep);
                        } else {
                            this.toast.addToast('Ukjent rapport: ' + name);
                        }
                    });
                return;
            }
        }

        report.companyKey = this.company.Key;
        report.company = this.company;
        this.uniModalService.open(UniReportParamsModal,
            {   data: report,
                header: `${this.company.Name} : ${report.Name}`,
                message: report.Description,
            }).onClose.subscribe(modalResult => {
                if (modalResult === ConfirmActions.ACCEPT) {
                    this.uniModalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            });
    }
}
