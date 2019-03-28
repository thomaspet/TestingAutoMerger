import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {ResultSummaryData} from '../resultreport/resultreport';
import {DimensionTypes} from '@app/services/services';

@Component({
    selector: 'dimension-result-report',
    templateUrl: './dimensionresultreport.html',
    styleUrls: ['./dimensionresultreport.sass']
})
export class DimensionResultReport {
    private dimensionDisplayName: string = '';
    private filterDimensionNumber: number = 0;
    private filterDimensionName: string = '';

    periodFilter1: PeriodFilter;
    periodFilter2: PeriodFilter;

    treeSummaryList: ResultSummaryData[] = [];
    flattenedTreeSummaryList: ResultSummaryData[] = [];

    dimensionType: number;
    filterDimensionID: number = 0;
    headerText: string;
    activeDistributionElement: string = 'Resultat';
    distributionPeriodAccountIDs: Array<number> = [];

    constructor(
        private route: ActivatedRoute,
        private periodFilterHelper: PeriodFilterHelper,
    ) {
        this.route.queryParams.subscribe(params => {

            this.dimensionType = params['type'];
            this.filterDimensionID = +params['id'];
            this.filterDimensionNumber = params['number'];
            this.filterDimensionName = params['name'];

            if (this.dimensionType.toString() === DimensionTypes.Project.toString()) {
                this.dimensionDisplayName = 'Prosjekt';
            } else if (this.dimensionType.toString() === DimensionTypes.Department.toString()) {
                this.dimensionDisplayName = 'Avdeling';
            }

            this.setPageTitle();
        });

    }

    private setPageTitle() {
        if (this.filterDimensionID && this.filterDimensionID > 0) {
            this.headerText = `${this.dimensionDisplayName} `
                + `${this.filterDimensionNumber}: ${this.filterDimensionName}`;
        } else {
            this.headerText = `Posteringer uten definert ${this.dimensionDisplayName.toLowerCase()}`;
        }
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
