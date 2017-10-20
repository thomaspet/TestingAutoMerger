import {
    Component,
    Input,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    SimpleChanges,
    OnChanges
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {AppConfig} from '../../../AppConfig';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';
import {AuthService} from '../../../authService';

const BASE = AppConfig.BASE_URL;

@Component({
    selector: 'uni-bureau-salary-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<table *ngIf="!!viewData">
    <tr><th>Lønnsavregning</th></tr>
    <tr>
        <td>Siste lønnsavregning</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/salary/payrollrun')">{{viewData[0]}}</a></td>
    </tr>
    <tr>
        <td>Utbetalingsdato</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/salary/payrollrun')">{{viewData[1]}}</a></td>
    </tr>
    <tr><td colspan="2"><hr/></td></tr>
    <tr><th>A-Melding</th></tr>
    <tr>
        <td>Siste leverte periode (A-melding)</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/salary/amelding')">{{viewData[2]}}</a></td>
    </tr>
</table>`
})
export class BureauSalarTab implements OnChanges {
    @Input() public company: KpiCompany;

    public viewData: any[];

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService,
        private authService: AuthService
    ) {}

    public ngOnChanges(changes: SimpleChanges) {
        this.element.nativeElement.setAttribute('aria-busy', true);
        Observable.forkJoin(
            this.getLastPayroll(),
            this.getPayrollPaymentDate(),
            this.getLastPeriodOfAMelding()
        )
            .do(() => this.element.nativeElement.setAttribute('aria-busy', false))
            .do(() => this.cd.markForCheck())
            .subscribe(
                result => this.viewData = result
            );
    }

    private formatDate(date: string|Date): string {
        if (!date) {
            return '';
        }
        return moment(date).format('DD.MM.YYYY');
    }

    public getLastPayroll(): Observable<string> {
        const year = this.yearService.getSavedYear();
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=payrollrun&select=id as id,description as name,paydate as paydate&filter=year(paydate) eq ${year}&orderby=paydate desc&top=1`,
            this.company.Key
        )
            .map(this.customHttpService.statisticsExtractor)
            .map(results => results.length ? this.formatDate(results[0].paydate) : '');
    }

    public getPayrollPaymentDate(): Observable<string> {
        const year = this.yearService.getSavedYear();
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=payrollrun&select=paydate as paydate&filter=year(paydate) eq ${year}&orderby=paydate desc&top=1`,
            this.company.Key
        )
            .map(this.customHttpService.statisticsExtractor)
            .map(results => results.length ? this.formatDate(results[0].paydate) : '');
    }

    public getLastPeriodOfAMelding() {
        const year = this.yearService.getSavedYear();
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=ameldingdata&select=period as period,sent as sent,year as year&filter=year eq ${year}&orderby=period desc,sent desc&top=1`,
            this.company.Key
        )
            .map(this.customHttpService.statisticsExtractor)
            .map(results => results.length ? this.formatDate(results[0].sent) : '');
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
