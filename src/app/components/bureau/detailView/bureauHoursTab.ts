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
import {UniMath} from '../../../../framework/core/uniMath';
import {AuthService} from '../../../authService';

const BASE = AppConfig.BASE_URL;

@Component({
    selector: 'uni-bureau-hours-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<table *ngIf="!!viewData">
    <tr><th>Timeføring</th></tr>
    <tr>
        <td>Sum i {{accountingYear}} (Antall timeføringer)</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/timetracking/timeentry')">{{round(viewData[0].sum/60, 1)}} timer ({{viewData[0].counter}})</a></td>
    </tr>
    <tr><td colspan="2"><hr/></td></tr>
    <tr><th>Fakturering</th></tr>
    <tr>
        <td>Ufakturerte (fakturerbare) timer</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/timetracking/timeentry')">{{viewData[1]}}</a></td>
    </tr>
    <tr>
        <td>Fakturerte timer</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/timetracking/timeentry')">{{viewData[2]}}</a></td>
    </tr>
</table>`
})
export class BureauHoursTab implements OnChanges {
    @Input() public company: KpiCompany;

    public accountingYear: number;
    public viewData: any[];
    public round = UniMath.round;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService,
        private authService: AuthService
    ) {
        this.accountingYear = this.yearService.getSavedYear();
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.element.nativeElement.setAttribute('aria-busy', true);
        Observable.forkJoin(
            this.getNumberOfTimeTracings(),
            this.getUnInvoicedHours(),
            this.getInvoicedHours()
        )
            .do(() => this.element.nativeElement.setAttribute('aria-busy', false))
            .do(() => this.cd.markForCheck())
            .subscribe(
                result => this.viewData = result
            );
    }

    public getNumberOfTimeTracings(): Observable<number> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=workitem&select=sum(minutes) as sum,count(id) as counter&filter=(worktype.systemtype le 10 or worktype.systemtype eq 12) and year(date) eq ${year}&join=&expand=worktype&top=50`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor);
    }

    public getUnInvoicedHours(): Observable<string> {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=workitem&select=sum(casewhen(minutestoorder eq 0\,minutes\,minutestoorder)) as SumMinutes&filter=(Invoiceable eq 1 or minutestoorder gt 0 or customerorderid gt 0) and transferedtoorder eq 0`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.SumMinutes)
            .map(sum => sum === null ? 0 : sum);
    }

    public getInvoicedHours() {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=workitem&select=sum(casewhen(minutestoorder eq 0\,minutes\,minutestoorder)) as SumMinutes&filter=(Invoiceable eq 1 or minutestoorder gt 0 or customerorderid gt 0) and transferedtoorder eq 1 and year(date) eq ${year}`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.SumMinutes)
            .map(sum => sum === null ? 0 : sum);
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
