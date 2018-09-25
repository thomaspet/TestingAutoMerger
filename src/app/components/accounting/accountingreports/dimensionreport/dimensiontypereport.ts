import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {ResultSummaryData} from '../resultreport/resultreport';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {
    StatisticsService,
    DimensionTypes, DimensionSettingsService,
    FinancialYearService,
    PageStateService,
    DimensionService
} from '../../../../services/services';

export interface IDimType {
    Dimension: number;
    Label: string;
    IsActive?: boolean;
    EntityName: string;
    NumberField: string;
}

@Component({
    selector: 'dimension-type-report',
    templateUrl: './dimensiontypereport.html',
})
export class DimensionTypeReport {

    public toolbarconfig: IToolbarConfig;
    public periodFilter1: PeriodFilter;
    public periodFilter2: PeriodFilter;
    public filter: any;
    public financialYear: number;
    public dimensionTypes: Array<IDimType>;
    public currentDimension: IDimType;
    private presetDimType: boolean;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private tabService: TabService,
        private dimensionService: DimensionService,
        private periodFilterHelper: PeriodFilterHelper,
        private financialYearService: FinancialYearService,
        private dimensionSettingsService: DimensionSettingsService,
        private pageStateService: PageStateService
    ) {
        this.route.params.subscribe(params => {

            this.setDimTypeFromUrl();

            const pageTitle = 'Resultat - dimensjoner';
            this.tabService.addTab({
                name: pageTitle,
                url: this.pageStateService.getUrl(),
                moduleID: UniModules.AccountingReports,
                active: true
            });

        });

    }

    public ngOnInit() {

        this.getDimensions();

        if (!this.presetDimType) {
            this.currentDimension = this.dimensionTypes[0];
        }

        this.financialYearService.getActiveYear()
            .subscribe( year => {

                this.financialYear = year;

                this.filter = {
                    ShowPreviousAccountYear: true,
                    Decimals: 0,
                    ShowPercent: true
                };

                this.periodFilter1 = this.periodFilterHelper.getFilter(1, null, this.financialYear);
                this.periodFilter2 = this.periodFilterHelper.getFilter(2, this.periodFilter1);

            });

    }

    private getDimensions() {
        this.dimensionTypes = [
            { Dimension: 1, Label: 'Prosjekt', IsActive: true, EntityName: 'project', NumberField: 'projectnumber' },
            { Dimension: 2, Label: 'Avdeling', IsActive: true, EntityName: 'department', NumberField: 'departmentnumber' },
            { Dimension: 3, Label: 'Ansvar', IsActive: false, EntityName: 'responsible', NumberField: 'NameOfResponsible' },
            { Dimension: 4, Label: 'Område', IsActive: false, EntityName: 'region', NumberField: 'RegionCode' }
        ];
        this.dimensionSettingsService.GetAll(null).subscribe((res) => {
            res.forEach((dim) => {
                dim.IsActive = true;
                dim.EntityName = `Dimension${dim.Dimension}`;
                dim.NumberField = 'Number';
                this.dimensionTypes.push(dim);
            });

            if (this.presetDimType) {
                this.setDimTypeFromUrl();
            }
        });
    }

    public onFilterClick(dimension: IDimType) {
        this.currentDimension = dimension;
        this.pageStateService.setPageState('dimtype', '' + dimension.Dimension);
        this.tabService.currentActiveTab.url = `/accounting/accountingreports/dimensions?dimtype=${dimension.Dimension}`;
    }

    private setDimTypeFromUrl() {
        if (this.dimensionTypes) {
            if (this.pageStateService.getPageState().dimtype) {
                const iVal = parseInt(this.pageStateService.getPageState().dimtype, 10);
                if (iVal) {
                    this.currentDimension = this.dimensionTypes.find( x => x.Dimension === iVal);
                }
            }
        } else {
            this.presetDimType = !!this.pageStateService.getPageState().dimtype;
        }
    }

}
