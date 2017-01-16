import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {JournalEntryService, StatisticsService, DimensionTypes} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {AccountDetailsReportModal} from '../detailsmodal/accountDetailsReportModal';
import {DrilldownResultReportPart} from '../reportparts/drilldownResultReportPart';
import {DimensionsOverviewReportPart} from '../reportparts/dimensionsOverviewReportPart';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';

declare const moment;
declare const _; // lodash

export class ResultSummaryData {
    public isAccount: boolean;
    public id: number;
    public number: number;
    public name: string;
    public amountPeriod1: number = 0;
    public amountPeriod2: number = 0;
    public rowCount: number = 0;
    public percentagePeriod1: number = 0;
    public percentagePeriod2: number = 0;
    public children: ResultSummaryData[] = [];
    public parent: ResultSummaryData;
    public expanded: boolean = false;
    public level: number = 0;
}

@Component({
    selector: 'accounting-result-report',
    templateUrl: './resultreport.html',
})
export class ResultReport {
    @ViewChild(AccountDetailsReportModal) private accountDetailsReportModal: AccountDetailsReportModal;
    @ViewChild(DrilldownResultReportPart) private drilldownResultReportPart: DrilldownResultReportPart;

    private periodFilter1: PeriodFilter;
    private periodFilter2: PeriodFilter;

    private treeSummaryList: ResultSummaryData[] = [];
    private flattenedTreeSummaryList: ResultSummaryData[] = [];

    private dimensionTypeProject: DimensionTypes = DimensionTypes.Project;
    private dimensionTypeDepartment: DimensionTypes = DimensionTypes.Department;

    private activeDistributionElement: string = 'Resultat';
    private distributionPeriodAccountIDs: Array<number> = [];

    private toolbarconfig: IToolbarConfig = {
        title: 'Resultat'
    };

    constructor(private router: Router,
                private statisticsService: StatisticsService,
                private tabService: TabService) {
        this.tabService.addTab({ name: 'Resultat - oversikt', url: '/accounting/accountingreports/result', moduleID: UniModules.AccountingReports, active: true });
    }

    public ngOnInit() {
        // get default period filters
        this.periodFilter1 = PeriodFilterHelper.getFilter(1, null);
        this.periodFilter2 = PeriodFilterHelper.getFilter(2, this.periodFilter1);
    }

    private onPeriodFilter1Changed(event) {
        this.periodFilter1 = event;
        PeriodFilterHelper.saveFilterSettings(1, this.periodFilter1);
    }

    private onPeriodFilter2Changed(event) {
        this.periodFilter2 = event;
        PeriodFilterHelper.saveFilterSettings(2, this.periodFilter2);
    }
}
