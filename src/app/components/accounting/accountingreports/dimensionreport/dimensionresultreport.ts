import {Component, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {AccountDetailsReportModal} from '../detailsmodal/accountDetailsReportModal';
import {DrilldownResultReportPart} from '../reportparts/drilldownResultReportPart';
import {DimensionsOverviewReportPart} from '../reportparts/dimensionsOverviewReportPart';
import {UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter} from 'unitable-ng2/main';
import {ChartHelper, IChartDataSet} from '../chartHelper';
import {ResultSummaryData} from '../resultreport/resultreport';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {
    JournalEntryService,
    StatisticsService,
    DimensionTypes,

} from '../../../../services/services';

@Component({
    selector: 'dimension-result-report',
    templateUrl: './dimensionresultreport.html',
})
export class DimensionResultReport {

    @ViewChild(AccountDetailsReportModal) private accountDetailsReportModal: AccountDetailsReportModal;
    @ViewChild(DrilldownResultReportPart) private drilldownResultReportPart: DrilldownResultReportPart;

    private periodFilter1: PeriodFilter;
    private periodFilter2: PeriodFilter;

    private treeSummaryList: ResultSummaryData[] = [];
    private flattenedTreeSummaryList: ResultSummaryData[] = [];

    private dimensionType: number;
    private dimensionEntityName: string = '';
    private dimensionDisplayName: string = '';
    private filterDimensionID: number = 0;
    private filterDimensionNumber: number = 0;
    private filterDimensionName: string = '';
    private pageTitle: string = '';

    private activeDistributionElement: string = 'Resultat';
    private distributionPeriodAccountIDs: Array<number> = [];

    private toolbarconfig: IToolbarConfig;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private statisticsService: StatisticsService,
                private tabService: TabService) {
        this.route.params.subscribe(params => {
            this.dimensionType = params['type'];
            this.filterDimensionID = +params['id'];
            this.filterDimensionNumber = +params['number'];
            this.filterDimensionName = params['name'];

            if (this.dimensionType.toString() === DimensionTypes.Project.toString()) {
                this.dimensionDisplayName = 'Prosjekt';
                this.dimensionEntityName = 'Project';
            } else if (this.dimensionType.toString() === DimensionTypes.Department.toString()) {
                this.dimensionDisplayName = 'Avdeling';
                this.dimensionEntityName = 'Department';
            }

            this.setPageTitle();
        });

    }

    private setPageTitle() {
        if (this.filterDimensionID && this.filterDimensionID > 0) {
            this.pageTitle += `${this.dimensionDisplayName} ${this.filterDimensionNumber}: ${this.filterDimensionName}`;
        } else {
            this.pageTitle += `Posteringer uten definert ${this.dimensionDisplayName.toLowerCase()}`;
        }

        this.toolbarconfig = {
            title: this.pageTitle
        };
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
