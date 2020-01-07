import {Component, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {
    StatisticsService,
    DimensionSettingsService,
    FinancialYearService,
    PageStateService,
    DimensionService
} from '../../../../services/services';
import { DimensionsOverviewReportPart } from '../reportparts/dimensionsOverviewReportPart';

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
    styleUrls: ['./dimensiontypereport.sass']
})
export class DimensionTypeReport {
    @ViewChild(DimensionsOverviewReportPart, { static: true }) public report: DimensionsOverviewReportPart;
    public toolbarconfig: IToolbarConfig;
    public periodFilter1: PeriodFilter;
    public periodFilter2: PeriodFilter;
    public filter: any;
    public financialYear: number;
    public dimensionTypes: Array<IDimType>;
    public currentDimension: IDimType;
    private presetDimType: boolean;
    toDate: { Date: Date };
    fromDate: { Date: Date };
    showPercent = false;
    busy = false;

    constructor(
        private route: ActivatedRoute,
        private tabService: TabService,
        private periodFilterHelper: PeriodFilterHelper,
        private financialYearService: FinancialYearService,
        private dimensionSettingsService: DimensionSettingsService,
        private pageStateService: PageStateService
    ) {
        this.fromDate = { Date: new Date(financialYearService.getActiveFinancialYear().Year, 0, 1) };
        this.toDate = { Date: new Date(financialYearService.getActiveFinancialYear().Year, 11, 31) };

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

    periodChange($event) {
        this.fromDate = { Date: $event.fromDate.Date.toDate() };
        this.toDate = { Date: $event.toDate.Date.toDate() };
    }    

    public ngOnInit() {
        this.getDimensions();

        if (!this.presetDimType) {
            this.currentDimension = this.dimensionTypes[0];
        }

        this.financialYear = this.financialYearService.getActiveYear();

        this.filter = {
            ShowPreviousAccountYear: true,
            Decimals: 0,
            ShowPercent: true
        };

        this.periodFilter1 = this.periodFilterHelper.getFilter(1, null, this.financialYear);
        this.periodFilter2 = this.periodFilterHelper.getFilter(2, this.periodFilter1);
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

    exportToExcel() {
        this.busy = true;
        this.report.exportToExcel().then( () => this.busy = false );
    }

}
