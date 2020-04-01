import {Component, Input, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PeriodFilter} from '../periodFilter/periodFilter';
import {toIso} from '../../../common/utils/utils';
import {
    UniTableColumn, UniTableConfig, UniTableColumnType, INumberFormat
} from '@uni-framework/ui/unitable';
import {
    StatisticsService,
    ErrorService,
    DimensionService,
    DimensionTypes,
    FinancialYearService
} from '@app/services/services';
import { IDimType } from '../dimensionreport/dimensiontypereport';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {saveAs} from 'file-saver';

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
    @ViewChild(AgGridWrapper) public table: AgGridWrapper;
    @Input() periodFilter1: PeriodFilter;
    @Input() periodFilter2: PeriodFilter;
    @Input() dimensionType: DimensionTypes;
    @Input() filter: any;
    @Input() dimensionTypes: IDimType[];
    @Input() toDate: { Date: Date };
    @Input() fromDate: { Date: Date };
    @Input() showPercent = false;

    busy = false;

    private dimensionEntityName: string = '';
    dimensionDisplayName: string = '';
    private dimensionsNumberField: string = '';
    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 0
    };

    dimensionDataList: DimensionSummaryData[] = [];
    uniTableConfigDimension: UniTableConfig;

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {
    }

    public exportToExcel() {
        return new Promise( (resolve, reject) => {
            var parts = this.getExcelQueryParts();
            this.statisticsService
            .GetExportedExcelFile(parts.model, parts.selects, parts.filters,
                parts.expands, parts.headings, parts.joins, true)
                .subscribe((result) => {
                    let filename = '';
                    // Get filename with filetype from headers
                    if (result.headers) {
                        const fromHeader = result.headers.get('content-disposition');
                        if (fromHeader) {
                            filename = fromHeader.split('=')[1];
                        }
                    }

                    if (!filename || filename === '') {
                        filename = 'export.xlsx';
                    }

                    const blob = new Blob([result.body], { type: 'text/csv' });
                    // download file so the user can open it
                    saveAs(blob, filename);
                    resolve(filename);
                },
                err => { this.errorService.handle(err); resolve(''); });        
            
        });
    }

    public ngOnChanges() {
        if (this.filter) {
            this.numberFormat.decimalLength = this.filter.Decimals ? this.filter.Decimals : 0;
        }

        if (this.periodFilter1 && this.periodFilter2 && this.dimensionType) {
            this.loadData();
        }
    }

    public switchMainPeriod() {
        const tmp = this.periodFilter1;
        this.periodFilter1 = this.periodFilter2;
        this.periodFilter2 = tmp;

        this.loadData();
    }

    private loadData() {
        const dt = this.dimensionTypes.find( x => x.Dimension === this.dimensionType);
        if (dt) {
            this.dimensionDisplayName = dt.Label;
            this.dimensionEntityName = dt.EntityName;
            this.dimensionsNumberField = dt.NumberField;
        } else {
            this.dimensionDisplayName = DimensionService.getEntityDisplayNameFromDimensionType(this.dimensionType);
            this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);
            this.dimensionsNumberField = `${this.dimensionEntityName}Number`;
        }

        this.setupDimensionTable();
    }

    public selectDimension(data) {
        const dimName = data.dimensionName.replace(/\//g, '-');
        const url = '/accounting/accountingreports/dimension'
            + `?type=${this.dimensionType}`
            + `&id=${data.dimensionId}`
            + `&number=${data.dimensionNumber}`
            + `&name=${dimName}`;

        this.router.navigateByUrl(url);
    }

    private getExcelQueryParts(): { model: string, selects: string, filters: string, orderby?: string, expands: string, headings: string, joins: string, distinct: boolean }
    {
        return {
            model: 'JournalEntryLine'
            ,selects: `${this.dimensionEntityName}.${this.dimensionsNumberField} as DimensionNumber`
            + `,${this.dimensionEntityName}.Name as DimensionName`
            + `,sum(casewhen(t.groupnumber eq 3,multiply(-1,amount),0)) as Sales`
            + `,sum(casewhen(t.groupnumber eq 4,amount,0)) as Purchase`
            + `,sum(casewhen(t.groupnumber eq 5,amount,0)) as Payroll`
            + `,sum(casewhen(t.groupnumber ge 6 and t.groupnumber le 7,amount,0)) as Cost`
            + `,sum(casewhen(t.groupnumber ge 8,amount,0)) as Finance`
            + `,sum(multiply(-1,amount)) as Result`
            ,filters: `FinancialDate ge '${toIso(this.fromDate.Date)}'`
            + ` and FinancialDate le '${toIso(this.toDate.Date)}'`
            + ` and ${this.dimensionEntityName}.ID gt 0`
            + ' and t.groupnumber ge 3',
            expands: `Period,Dimensions.${this.dimensionEntityName},Account`,
            orderby: `${this.dimensionEntityName}.${this.dimensionsNumberField}`,
            joins: 'account.toplevelaccountgroupid eq accountgroup.id as t',
            headings: 'Nr,Navn,Salgsinntekter,Varekostnad,Lonnskostnader,Andre driftskostnader,Finans,Resultat',
            distinct: true
        }
    }

    private getReportQueryParts(): { model: string, selects: string, filters: string, orderby?: string, expands: string, headings: string, joins: string, distinct: boolean }
    {
        return {
            model: 'JournalEntryLine'
            , selects: `${this.dimensionEntityName}.ID as DimID,${this.dimensionEntityName}`
            + `.${this.dimensionsNumberField} as DimensionNumber,${this.dimensionEntityName}`
            + `.Name as DimensionName,TopLevelAccountGroup.GroupNumber `
            + `as TopLevelAccountGroupGroupNumber,TopLevelAccountGroup.Name `
            + `as TopLevelAccountGroupName,sum(JournalEntryLine.Amount) as SumAmount`,
            filters: `FinancialDate ge '${toIso(this.fromDate.Date)}'`
            + ` and FinancialDate le '${toIso(this.toDate.Date)}'`
            + ` and ${this.dimensionEntityName}.ID gt 0`,
            expands: `Period,Dimensions.${this.dimensionEntityName},Account.TopLevelAccountGroup`,
            orderby: `${this.dimensionEntityName}.${this.dimensionsNumberField}`
            + `,TopLevelAccountGroup.GroupNumber`,
            joins: '',
            headings: 'Prosjekt,Salgsinntekter,Varekostnad,Lonn,Driftskostnader-1,Driftskostnader-2,Finans,Resultat',
            distinct: true
        }
    }

    private getReportQuery(): string {
        var parts = this.getReportQueryParts();
        return `model=${parts.model}`
        + `&filter=${parts.filters}`
        + `&orderby=${this.dimensionEntityName}.${this.dimensionsNumberField}`
        + `,TopLevelAccountGroup.GroupNumber`
        + `&expand=${parts.expands}`
        + `&select=${parts.selects}`
        + `&orderby=${parts.orderby}`;
    }

    private setupDimensionTable() {

        this.busy = true;

        const dimensionDataList: Array<DimensionSummaryData> = [];

         this.statisticsService.GetAll(this.getReportQuery())        
        .finally(() => this.busy = false)
        .subscribe(data => {
            const dimensionDataUnordered = data.Data;

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
                const totalIncome = dimensionItem.amountGroup3;

                dimensionItem.percentGroup4 = totalIncome === 0
                    ? 0 : Math.round((dimensionItem.amountGroup4 * 100) / totalIncome);
                dimensionItem.percentGroup5 = totalIncome === 0
                    ? 0 : Math.round((dimensionItem.amountGroup5 * 100) / totalIncome);
                dimensionItem.percentGroup6 = totalIncome === 0
                    ? 0 : Math.round((dimensionItem.amountGroup6 * 100) / totalIncome);
                dimensionItem.percentGroup7 = totalIncome === 0
                    ? 0 : Math.round((dimensionItem.amountGroup7 * 100) / totalIncome);
                dimensionItem.percentGroup8 = totalIncome === 0
                    ? 0 : Math.round((dimensionItem.amountGroup8 * 100) / totalIncome);

                dimensionItem.amountGroupResult = totalIncome - (
                    dimensionItem.amountGroup4
                    + dimensionItem.amountGroup5
                    + dimensionItem.amountGroup6
                    + dimensionItem.amountGroup7
                    + dimensionItem.amountGroup8
                );
                dimensionItem.percentGroupResult = totalIncome === 0
                    ? 0 : Math.round((dimensionItem.amountGroupResult * 100) / totalIncome);
            });

            // do this to make UniTable accept the data as it's datasource
            this.dimensionDataList = JSON.parse(JSON.stringify(dimensionDataList));

            const dimensionName = new UniTableColumn('dimensionName', this.dimensionDisplayName)
                .setWidth('15rem')
                .setTemplate(x => x.dimensionId > 0 ? `${x.dimensionNumber}: ${x.dimensionName}` : 'Ikke definert');

            const amountGroup3 = new UniTableColumn('amountGroup3', 'Salgsinntekter', UniTableColumnType.Money)
                .setCls('amount').setWidth('8rem')
                .setNumberFormat(this.numberFormat);

            const amountGroup4 = new UniTableColumn('amountGroup4', 'Varekostnad', UniTableColumnType.Money)
                .setCls('amount').setWidth('8rem')
                .setNumberFormat(this.numberFormat);

            const percentGroup4 = new UniTableColumn('percentGroup4', '%', UniTableColumnType.Percent).setWidth('4rem');

            const amountGroup5 = new UniTableColumn('amountGroup5', 'Lønnskostnader', UniTableColumnType.Money)
                .setCls('amount').setWidth('8rem')
                .setNumberFormat(this.numberFormat);

            const percentGroup5 = new UniTableColumn('percentGroup5', '%', UniTableColumnType.Percent).setWidth('4rem');

            const amountGroup6 = new UniTableColumn('amountGroup6', 'Andre driftskost', UniTableColumnType.Money)
                .setCls('amount').setWidth('8rem')
                .setNumberFormat(this.numberFormat);

            const percentGroup6 = new UniTableColumn('percentGroup6', '%', UniTableColumnType.Percent).setWidth('4rem');

            const amountGroup7 = new UniTableColumn('amountGroup7', 'Andre driftskost', UniTableColumnType.Money)
                .setCls('amount').setWidth('8rem')
                .setNumberFormat(this.numberFormat);

            const percentGroup7 = new UniTableColumn('percentGroup7', '%', UniTableColumnType.Percent).setWidth('4rem');

            const amountGroup8 = new UniTableColumn('amountGroup8', 'Finanskost/innt', UniTableColumnType.Money)
                .setCls('amount').setWidth('8rem')
                .setNumberFormat(this.numberFormat);

            const percentGroup8 = new UniTableColumn('percentGroup8', '%', UniTableColumnType.Percent).setWidth('4rem');

            const amountGroupResult = new UniTableColumn('amountGroupResult', 'Resultat', UniTableColumnType.Money)
                .setCls('amount').setWidth('8rem')
                .setNumberFormat(this.numberFormat);

            const percentGroupResult = new UniTableColumn('percentGroupResult', '%', UniTableColumnType.Number).setWidth('4rem');

            const tableName = 'accounting.dimensionOverviewReportPart';
            this.uniTableConfigDimension = new UniTableConfig(tableName, false, true, 25);

            if (this.showPercent) {
                this.uniTableConfigDimension.setColumns([
                    dimensionName,
                    amountGroup3,
                    amountGroup4,
                    percentGroup4,
                    amountGroup5,
                    percentGroup5,
                    amountGroup6,
                    percentGroup6,
                    amountGroup7,
                    percentGroup7,
                    amountGroup8,
                    percentGroup8,
                    amountGroupResult,
                    percentGroupResult
                ]);
            } else {
                this.uniTableConfigDimension.setColumns([
                    dimensionName,
                    amountGroup3,
                    amountGroup4,
                    amountGroup5,
                    amountGroup6,
                    amountGroup7,
                    amountGroup8,
                    amountGroupResult
                ]);
            }
        }, err => this.errorService.handle(err));
    }
}
