import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {PeriodFilter} from '../periodFilter/periodFilter';
import {UniTableColumn, UniTableConfig, UniTableColumnType, INumberFormat} from '../../../../../framework/ui/unitable/index';
import {
    StatisticsService,
    ErrorService,
    DimensionService,
    DimensionTypes
} from '../../../../services/services';

export class DimensionSummaryData {
    public dimensionId: number;
    public dimensionNumber: number;
    public dimensionName: string;
    public amountGroup3: number = 0;
    public amountGroup4: number = 0;
    public percentGroup4: number = 0;
    public amountGroup5: number = 0;
    public percentGroup5: number = 0;
    public amountGroup6: number = 0;
    public percentGroup6: number = 0;
    public amountGroup7: number = 0;
    public percentGroup7: number = 0;
    public amountGroup8: number = 0;
    public percentGroup8: number = 0;
    public amountGroupResult: number = 0;
    public percentGroupResult: number = 0;
}

@Component({
    selector: 'dimensions-overview-report-part',
    templateUrl: './dimensionsOverviewReportPart.html',
})
export class DimensionsOverviewReportPart {
    @Input() private periodFilter1: PeriodFilter;
    @Input() private periodFilter2: PeriodFilter;
    @Input() private dimensionType: DimensionTypes;
    @Input() private filter: any;

    private dimensionEntityName: string = '';
    private dimensionDisplayName: string = '';
    private showPercent: boolean = true;
    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: '.',
        decimalLength: 2
    };

    private dimensionDataList: Array<DimensionSummaryData> = [];
    private uniTableConfigDimension: UniTableConfig;

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {

    }

    public ngOnChanges() {
        if (this.filter) {
            this.numberFormat.decimalLength = this.filter.Decimals ? this.filter.Decimals : 0;
            this.showPercent = this.filter.ShowPercent;
        }

        if (this.periodFilter1 && this.periodFilter2 && this.dimensionType) {
            this.loadData();
        }
    }

    private switchMainPeriod() {
        let tmp = this.periodFilter1;
        this.periodFilter1 = this.periodFilter2;
        this.periodFilter2 = tmp;

        this.loadData();
    }

    private loadData() {
        this.dimensionDisplayName = DimensionService.getEntityDisplayNameFromDimensionType(this.dimensionType);
        this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);

        this.setupDimensionTable();
    }

    private selectDimension(data) {
        let url = `/accounting/accountingreports/dimension/${this.dimensionType}/${data.dimensionId}/${data.dimensionNumber}/${data.dimensionName}`;
        this.router.navigateByUrl(url);
    }

    private setupDimensionTable() {

        let dimensionDataList: Array<DimensionSummaryData> = [];

        this.statisticsService.GetAll(`model=JournalEntryLine&expand=Period,Dimensions.${this.dimensionEntityName},Account.TopLevelAccountGroup` +
                                      `&filter=Period.AccountYear eq ${this.periodFilter1.year} and Period.No ge ${this.periodFilter1.fromPeriodNo} and Period.No le ${this.periodFilter1.toPeriodNo}` +
                                      `&orderby=${this.dimensionEntityName}.${this.dimensionEntityName}Number,TopLevelAccountGroup.GroupNumber` +
                                      `&select=${this.dimensionEntityName}.ID as DimID,${this.dimensionEntityName}.${this.dimensionEntityName}Number as DimensionNumber,${this.dimensionEntityName}.Name as DimensionName,TopLevelAccountGroup.GroupNumber as TopLevelAccountGroupGroupNumber,TopLevelAccountGroup.Name as TopLevelAccountGroupName,sum(JournalEntryLine.Amount) as SumAmount`
            ).subscribe(data => {
                let dimensionDataUnordered = data.Data;

                dimensionDataUnordered.forEach((item) => {
                    let dimensionData = dimensionDataList.find(x => x.dimensionId === (item.DimID ? item.DimID : 0));

                    if (!dimensionData) {
                        dimensionData = new DimensionSummaryData();
                        if (item.DimID) {
                            dimensionData.dimensionId = item.DimID;
                            dimensionData.dimensionNumber = item.DimensionNumber;
                            dimensionData.dimensionName = item.DimensionName;
                        } else {
                            dimensionData.dimensionId = 0;
                            dimensionData.dimensionNumber = 0;
                            dimensionData.dimensionName = `${this.dimensionDisplayName} ikke valgt`;
                        }

                        dimensionDataList.push(dimensionData);
                    }

                    // set amount
                    dimensionData['amountGroup' + item.TopLevelAccountGroupGroupNumber] = item.SumAmount;
                });

                // calculate percentages
                dimensionDataList.forEach(dimensionItem => {

                    // show income as positive numbers
                    dimensionItem.amountGroup3 = dimensionItem.amountGroup3 * -1;

                    // use extra variable for clearity
                    let totalIncome = dimensionItem.amountGroup3;

                    dimensionItem.percentGroup4 = totalIncome === 0 ? 0 : Math.round((dimensionItem.amountGroup4 * 100) / totalIncome);
                    dimensionItem.percentGroup5 = totalIncome === 0 ? 0 : Math.round((dimensionItem.amountGroup5 * 100) / totalIncome);
                    dimensionItem.percentGroup6 = totalIncome === 0 ? 0 : Math.round((dimensionItem.amountGroup6 * 100) / totalIncome);
                    dimensionItem.percentGroup7 = totalIncome === 0 ? 0 : Math.round((dimensionItem.amountGroup7 * 100) / totalIncome);
                    dimensionItem.percentGroup8 = totalIncome === 0 ? 0 : Math.round((dimensionItem.amountGroup8 * 100) / totalIncome);

                    dimensionItem.amountGroupResult = totalIncome - (dimensionItem.amountGroup4 + dimensionItem.amountGroup5 + dimensionItem.amountGroup6 + dimensionItem.amountGroup7 + dimensionItem.amountGroup8);
                    dimensionItem.percentGroupResult = totalIncome === 0 ? 0 : Math.round((dimensionItem.amountGroupResult * 100) / totalIncome);
                });

                // do this to make UniTable accept the data as it's datasource
                this.dimensionDataList = JSON.parse(JSON.stringify(dimensionDataList));

                let dimensionName = new UniTableColumn('dimensionName', this.dimensionDisplayName, UniTableColumnType.Text)
                    .setWidth('15%')
                    .setTemplate(x => x.dimensionId > 0 ? `${x.dimensionNumber}: ${x.dimensionName}` : 'Ikke definert');

                let amountGroup3 = new UniTableColumn('amountGroup3', 'Salgsinntekter', UniTableColumnType.Money)
                    .setCls('amount')
                    .setNumberFormat(this.numberFormat);

                let amountGroup4 = new UniTableColumn('amountGroup4', 'Varekostnad', UniTableColumnType.Money)
                    .setCls('amount')
                    .setNumberFormat(this.numberFormat);

                let percentGroup4 = new UniTableColumn('percentGroup4', '%', UniTableColumnType.Number)
                    .setWidth('4%')
                    .setCls('percentage');

                let amountGroup5 = new UniTableColumn('amountGroup5', 'Lønnskostnader', UniTableColumnType.Money)
                    .setCls('amount')
                    .setNumberFormat(this.numberFormat);

                let percentGroup5 = new UniTableColumn('percentGroup5', '%', UniTableColumnType.Number)
                    .setWidth('4%')
                    .setCls('percentage');

                let amountGroup6 = new UniTableColumn('amountGroup6', 'Andre driftskost', UniTableColumnType.Money)
                    .setCls('amount')
                    .setNumberFormat(this.numberFormat);

                let percentGroup6 = new UniTableColumn('percentGroup6', '%', UniTableColumnType.Number)
                    .setWidth('4%')
                    .setCls('percentage');

                let amountGroup7 = new UniTableColumn('amountGroup7', 'Andre driftskost', UniTableColumnType.Money)
                    .setCls('amount')
                    .setNumberFormat(this.numberFormat);

                let percentGroup7 = new UniTableColumn('percentGroup7', '%', UniTableColumnType.Number)
                    .setWidth('4%')
                    .setCls('percentage');

                let amountGroup8 = new UniTableColumn('amountGroup8', 'Finanskost/innt', UniTableColumnType.Money)
                    .setCls('amount')
                    .setNumberFormat(this.numberFormat);

                let percentGroup8 = new UniTableColumn('percentGroup8', '%', UniTableColumnType.Number)
                    .setWidth('4%')
                    .setCls('percentage');

                let amountGroupResult = new UniTableColumn('amountGroupResult', 'Resultat', UniTableColumnType.Money)
                    .setCls('amount')
                    .setNumberFormat(this.numberFormat);

                let percentGroupResult = new UniTableColumn('percentGroupResult', '%', UniTableColumnType.Number)
                    .setWidth('4%')
                    .setCls('percentage');

                this.uniTableConfigDimension = new UniTableConfig(false, false)
                    .setPageable(true)
                    .setPageSize(25);

                if (this.showPercent) {
                    this.uniTableConfigDimension.setColumns([dimensionName, amountGroup3, amountGroup4, percentGroup4, amountGroup5, percentGroup5, amountGroup6, percentGroup6, amountGroup7, percentGroup7, amountGroup8, percentGroup8, amountGroupResult, percentGroupResult]);
                } else {
                    this.uniTableConfigDimension.setColumns([dimensionName, amountGroup3, amountGroup4, amountGroup5, amountGroup6, amountGroup7, amountGroup8, amountGroupResult]);
                }
            }, err => this.errorService.handle(err));
    }
}
