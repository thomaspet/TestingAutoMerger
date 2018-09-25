import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {ResultSummaryData} from '../resultreport/resultreport';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {
    StatisticsService,
    DimensionTypes,
    PageStateService

} from '../../../../services/services';

@Component({
    selector: 'dimension-result-report',
    templateUrl: './dimensionresultreport.html',
})
export class DimensionResultReport {
    public periodFilter1: PeriodFilter;
    public periodFilter2: PeriodFilter;

    public treeSummaryList: ResultSummaryData[] = [];
    public flattenedTreeSummaryList: ResultSummaryData[] = [];

    public dimensionType: number;
    private dimensionEntityName: string = '';
    private dimensionDisplayName: string = '';
    public filterDimensionID: number = 0;
    private filterDimensionNumber: number = 0;
    private filterDimensionName: string = '';
    private pageTitle: string = '';

    public activeDistributionElement: string = 'Resultat';
    public distributionPeriodAccountIDs: Array<number> = [];

    public toolbarconfig: IToolbarConfig;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private tabService: TabService,
        private pageStateService: PageStateService,
        private periodFilterHelper: PeriodFilterHelper,
    ) {
        this.route.params.subscribe(params => {

            this.dimensionType = params['type'];
            this.filterDimensionID = +params['id'];
            this.filterDimensionNumber = params['number'];
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
            this.pageTitle += `${this.dimensionDisplayName} `
                + `${this.filterDimensionNumber}: ${this.filterDimensionName}`;
        } else {
            this.pageTitle += `Posteringer uten definert ${this.dimensionDisplayName.toLowerCase()}`;
        }

        this.toolbarconfig = {
            title: this.pageTitle
        };
    }

    public ngOnInit() {
        // get default period filters
        this.periodFilter1 = this.periodFilterHelper.getFilter(1, null);
        this.periodFilter2 = this.periodFilterHelper.getFilter(2, this.periodFilter1);
    }

    public onPeriodFilter1Changed(event) {
        this.periodFilter1 = event;
        this.periodFilterHelper.saveFilterSettings(1, this.periodFilter1);
    }

    public onPeriodFilter2Changed(event) {
        this.periodFilter2 = event;
        this.periodFilterHelper.saveFilterSettings(2, this.periodFilter2);
    }
}
