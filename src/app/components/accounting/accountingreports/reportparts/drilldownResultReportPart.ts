import {Component, Input, OnChanges} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';

import {ChartHelper} from '../chartHelper';
import {PeriodFilter} from '../periodFilter/periodFilter';
import {AccountDetailsReportModal, IDetailsModalInput} from '../detailsmodal/accountDetailsReportModal';
import {UniModalService} from '@uni-framework/uni-modal';
import {UniHttp} from '@uni-framework/core/http/http';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    INumberFormat
} from '@uni-framework/ui/unitable';
import {
    AccountGroupService,
    StatisticsService,
    ErrorService,
    DimensionService,
    NumberFormat
} from '@app/services/services';

interface IReportRow {
    ID: number;
    AccountYear: number;
    AccountNumber: number;
    AccountName: string;
    GroupNumber: number;
    GroupName: string;
    SubGroupNumber: number;
    SubGroupName: string;
    BudgetSum: number;
    Sum: number;
    SumLastYear: number;
}

export class ResultSummaryData {
    public isAccount: boolean;
    public id: number;
    public number: number;
    public name: string;
    public amountPeriod1: number = 0;
    public amountPeriod2: number = 0;
    public budget: number = 0;
    public rowCount: number = 0;
    public percentagePeriod1: number = 0;
    public percentagePeriod2: number = 0;
    public children: ResultSummaryData[] = [];
    public parent: ResultSummaryData;
    public expanded: boolean = false;
    public level: number = 0;
    public turned: boolean = false;
}

@Component({
    selector: 'drilldown-result-report-part',
    templateUrl: './drilldownResultReportPart.html',
})
export class DrilldownResultReportPart implements OnChanges {
    @Input() public periodFilter1: PeriodFilter;
    @Input() public periodFilter2: PeriodFilter;
    @Input() private dimensionType: number;
    @Input() private dimensionId: number;
    @Input() private filter: any;

    private dimensionEntityName: string;
    private treeSummaryList: ResultSummaryData[] = [];
    private flattenedTreeSummaryList: ResultSummaryData[] = [];
    public uniTableConfig: UniTableConfig;
    private showPercent: boolean = true;
    private showPreviousAccountYear: boolean = true;
    private showBudget = true;
    private hideBudget = false;
    private showall: boolean = false;
    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 0
    };
    public busy = true;
    private colors: Array<string> = ['#7293CB', '#84BA5B', '#ff0000', '#00ff00', '#f0f000'];
    private percentagePeriod1: number = 0;

    constructor(
        private statisticsService: StatisticsService,
        private accountGroupService: AccountGroupService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat,
        private modalService: UniModalService,
        private http: UniHttp
    ) {

    }

    public ngOnChanges() {
        if (this.filter) {
            this.numberFormat.decimalLength = this.filter.Decimals ? this.filter.Decimals : 0;
            this.showPercent = this.filter.ShowPercent;
            this.showPreviousAccountYear = this.filter.ShowPreviousAccountYear;
            this.showBudget = this.filter.ShowBudget;
            this.hideBudget = !this.filter.ShowBudget;
        }

        if (this.periodFilter1 && this.periodFilter2) {
            if (this.dimensionType) {
                this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);
            }
        }

        this.loadData();
    }

    public toggleShowAll() {
        this.showall = !this.showall;
        if (this.showall) {
            this.flattenedTreeSummaryList.forEach(child => {
                this.expandChildren(child);
            });
        } else {
            this.flattenedTreeSummaryList = this.treeSummaryList.concat();
            this.flattenedTreeSummaryList.forEach(child => {
                child.expanded = false;
            });
        }
    }

    private expandChildren(child) {
        if (child.children.length > 0) {
            child.expanded = true;
            const index = this.flattenedTreeSummaryList.indexOf(child);
            const childrenWithData = child.children.filter(x => x.rowCount > 0);
            this.flattenedTreeSummaryList = this.flattenedTreeSummaryList
                .slice( 0, index + 1 )
                .concat( childrenWithData )
                .concat( this.flattenedTreeSummaryList.slice( index + 1 ) );
            child.children.forEach(subchild => {
                this.expandChildren(subchild);
            });
        }
    }

    public rowClicked(summaryData: ResultSummaryData) {
        if (summaryData.isAccount) {
            const data: IDetailsModalInput = {
                modalMode: true,
                accountID: summaryData.id,
                subaccountID: null,
                accountName: summaryData.name,
                accountNumber: summaryData.number,
                dimensionType: this.dimensionType,
                dimensionId: this.dimensionId,
                periodFilter1: this.periodFilter1,
                periodFilter2: this.periodFilter2,
                close: null
            };
            this.modalService.open(AccountDetailsReportModal, { data: data });
        } else {
            summaryData.expanded = !summaryData.expanded;

            if (summaryData.expanded) {
                const index = this.flattenedTreeSummaryList.indexOf(summaryData);
                if (summaryData.children && summaryData.children.length > 0) {
                    const childrenWithData = summaryData.children.filter(x => x.rowCount > 0);
                    this.flattenedTreeSummaryList = this.flattenedTreeSummaryList
                        .slice( 0, index + 1 )
                        .concat( childrenWithData )
                        .concat( this.flattenedTreeSummaryList.slice( index + 1 ) );
                }
            } else {
                // hide child and subchildren if multiple levels are expanded
                if (summaryData.children) {
                    const childrenWithData = this.getChildrenWithDataDeep(summaryData);
                    this.flattenedTreeSummaryList = this.flattenedTreeSummaryList.filter(
                        x => !childrenWithData.find(y => x === y)
                    );
                }
            }
        }
    }

    private getChildrenWithDataDeep(summaryData: ResultSummaryData) {
        let children = summaryData.children.filter(x => x.rowCount > 0);

        children.forEach(child => {
            children = children.concat(this.getChildrenWithDataDeep(child));
        });

        return children;
    }

    private mapDimTypeToModel(dimType: number): { model: string, filterModel?: string, fld: string } {
        switch (dimType) {
            case 1:
                return { model: 'project', fld: 'ProjectNumber' };
            case 2:
                return { model: 'department', fld: 'DepartmentNumber' };
            case 3:
                return { model: 'responsible', fld: 'NameOfResponsible' };
            case 4:
                return { model: 'region', fld: 'RegionCode' };
            default:
                return { model: `dimension${dimType}`, filterModel: `dim${dimType}`, fld: 'Number' };
        }
    }

    private getDimFilter(): Observable<string> {
        this.busy = true;

        // Lookup the 'number' from the 'id' since the report-action doesnt support ID's
        if (this.dimensionType && this.dimensionId) {
            const dimType = parseInt(this.dimensionType.toString(), 10);
            const dimMap = this.mapDimTypeToModel(dimType);

            return this.statisticsService.GetAll(
                `model=${dimMap.model}&select=${dimMap.fld} as value&filter=id eq ${this.dimensionId}`
            ).pipe(
                map(res => {
                    if (res.Success && res.Data && res.Data.length) {
                        const value = res.Data[0].value;
                        return `&${dimMap.filterModel || dimMap.model}='${value}'-'${value}'`;
                    }
                })
            );
        } else {
            let dimFilter = '';
            if (this.filter) {
                if (this.filter.ProjectNumber) {
                    dimFilter += `&dim1='${this.filter.ProjectNumber}'-'${this.filter.ProjectNumber}'`;
                }

                if (this.filter.DepartmentNumber) {
                    dimFilter += `&dim2='${this.filter.DepartmentNumber}'-'${this.filter.DepartmentNumber}'`;
                }
            }

            return observableOf(dimFilter);
        }
    }

    private loadData() {
        this.busy = true;

        this.getDimFilter().pipe(
            switchMap(dimFilter => {
                const filter = `&financialyear=${this.periodFilter1.year}`
                    + `&period=${this.periodFilter1.fromPeriodNo}-${this.periodFilter1.toPeriodNo}`
                    + dimFilter;

                return this.http.asGET()
                    .usingBusinessDomain()
                    .withEndPoint('accounts?action=profit-and-loss-periodical' + filter)
                    .send();
            })
        ).subscribe(
            res => {
                res = res.json();
                const list = this.extractGroups(res);
                this.flattenedTreeSummaryList = list;
                this.calculateTreePercentages(list, null, null);
                this.percentagePeriod1 = list.find(x => x.number === 9).percentagePeriod1;
                this.setupTable();
                this.setupChart();
            },
            err => this.errorService.handle(err),
            () => this.busy = false
        );
    }

    private toSummaryData(row: IReportRow, level = 0, presign = 1): ResultSummaryData {
        const ret = new ResultSummaryData();
        ret.amountPeriod1 = row.Sum * presign;
        ret.amountPeriod2 = row.SumLastYear * presign;
        ret.budget = row.BudgetSum * presign;
        ret.isAccount = true;
        ret.name = row.AccountName;
        ret.id = row.ID;
        ret.number = row.AccountNumber;
        ret.level = level;
        ret.turned = presign < 0;
        return ret;
    }

    private extractGroups(rows: IReportRow[]): ResultSummaryData[] {
        const groups: ResultSummaryData[] = [];
        let hasBudget = false;
        const template = [
            { number: 3, name: 'Salg', from: 3000, to: 3999, turned: true },
            { number: 4, name: 'Varekjøp', from: 4000, to: 4999 },
            { number: 5, name: 'Lønn', from: 5000, to: 5999 },
            { number: 6, name: 'Andre kostnader', from: 6000, to: 7999 },
            { number: 7, name: 'Driftsresultat', from: 3000, to: 7999, turned: true, virtual: true },
            { number: 8, name: 'Finansinntekter', from: 8000, to: 8099, turned: true, autohide: true },
            { number: 81, name: 'Finanskostnader', from: 8100, to: 8199, autohide: true },
            { number: 83, name: 'Skatt', from: 8200, to: 8799, autohide: true },
            { number: 89, name: 'Årsresultat', from: 8800, to: 8899, autohide: true },
            { number: 89, name: 'Disponeringer', from: 8900, to: 8999, autohide: true },
            { number: 9, name: 'Årsresultat', from: 3000, to: 8999, turned: true, virtual: true },
        ];
        template.forEach( (x: any) => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const presign = x.turned ? -1 : 1;
                const sumrow = (<ResultSummaryData>x);
                if (row.AccountNumber >= x.from && row.AccountNumber <= x.to) {

                    if (!x.virtual) {
                        sumrow.children = sumrow.children || [];
                        const item = this.toSummaryData(row, 1, presign);
                        x.children.push(item);
                        item.parent = sumrow;
                        item.rowCount = 1;
                    } else {
                        sumrow.children = [];
                    }
                    sumrow.amountPeriod1 = (sumrow.amountPeriod1 || 0) + (row.Sum * presign);
                    sumrow.amountPeriod2 = (sumrow.amountPeriod2 || 0) + (row.SumLastYear * presign);
                    sumrow.budget = (sumrow.budget || 0) + (row.BudgetSum * presign);
                    sumrow.level = 0;
                    sumrow.isAccount = false;
                    sumrow.id = sumrow.number;
                }
            }
            if (!(x.autohide && ( (!x.children) || x.children.length === 0))) {
                groups.push(x);
            }
            hasBudget = hasBudget || (x.budget !== 0 && x.budget !== undefined);
        });
        // Dynamic on/off budget column
        if (!this.hideBudget) {
            this.showBudget = hasBudget;
        }
        return groups;
    }


    private calculateTreePercentages(
        treeList: ResultSummaryData[],
        totalAmountPeriod1: number,
        totalAmountPeriod2: number
    ) {

        if (totalAmountPeriod1 === null || totalAmountPeriod2 === null) {
            const totalIncomeNode = treeList.find(x => x.number === 3);

            totalAmountPeriod1 = totalIncomeNode.amountPeriod1;
            totalAmountPeriod2 = totalIncomeNode.amountPeriod2;
        }

        treeList.forEach(treeNode => {
            treeNode.percentagePeriod1 = totalAmountPeriod1 && treeNode.amountPeriod1
                ? Math.round((treeNode.amountPeriod1 * 100) / totalAmountPeriod1)
                : 0;
            treeNode.percentagePeriod2 = totalAmountPeriod2 && treeNode.amountPeriod2
                ? Math.round((treeNode.amountPeriod2 * 100) / totalAmountPeriod2)
                : 0;

            if (treeNode.children && treeNode.children.length > 0) {
                this.calculateTreePercentages(treeNode.children, totalAmountPeriod1, totalAmountPeriod2);
            }
        });
    }

    private shouldTurnAmount(groupNumber): boolean {
        if (groupNumber.toString().substring(0, 1) === '3') {
            return true;
        }

        return false;
    }

    private shouldSkipGroupLevel(groupNumber): boolean {
        if (groupNumber.toString().length === 3) {
            return true;
        }

        return false;
    }

    public getPaddingLeft(level) {
        if (level > 0) {
            return (level * 20).toString() + 'px';
        }
    }

    private setupTable() {
        this.uniTableConfig = new UniTableConfig('accounting.drilldownResultReportPart', false, false)
            .setColumnMenuVisible(true)
            .setColumns([
                new UniTableColumn('number', 'Konto/kontogruppe', UniTableColumnType.Text)
                    .setWidth('50%')
                    .setTemplate(item => item.number + ': ' + item.name),
                new UniTableColumn('amountPeriod1', this.periodFilter1.name, UniTableColumnType.Money)
                    .setWidth('20%').setCls('amount')
                    .setNumberFormat(this.numberFormat),
                new UniTableColumn('percentagePeriod1', '%', UniTableColumnType.Number)
                    .setWidth('5%')
                    .setCls('percentage'),
                new UniTableColumn('amountPeriod2', this.periodFilter2.name, UniTableColumnType.Money)
                    .setWidth('20%').setCls('percentage')
                    .setNumberFormat(this.numberFormat),
                new UniTableColumn('percentagePeriod2', '%', UniTableColumnType.Number)
                    .setWidth('5%')
                    .setCls('percentage'),
            ]);
    }

    private setupChart() {
        const dataSets = [];

        const sales = this.flattenedTreeSummaryList.find(x => x.number === 3);
        const purchase = this.flattenedTreeSummaryList.find(x => x.number === 4);
        const salary = this.flattenedTreeSummaryList.find(x => x.number === 5);
        const other = this.flattenedTreeSummaryList.find(x => x.number === 6);
        const result = this.flattenedTreeSummaryList.find(x => x.number === 9);

        dataSets.push({
            label: this.periodFilter1.year,
            data: [],
            backgroundColor: this.colors[1],
            borderColor: this.colors[1],
            fill: true,
            borderWidth: 2
        });

        dataSets[0].data.push(
            sales.amountPeriod1,
            salary.amountPeriod1,
            other.amountPeriod1 + purchase.amountPeriod1,
            result.amountPeriod1
        );

        // create datasets
        if (this.showPreviousAccountYear) {
            dataSets.push({
                label: this.periodFilter2.year,
                data: [],
                backgroundColor: this.colors[0],
                borderColor: this.colors[0],
                fill: true,
                borderWidth: 2
            });

            // amountPeriod2
            dataSets[1].data.push(
                sales.amountPeriod2,
                salary.amountPeriod2,
                other.amountPeriod2 + purchase.amountPeriod2,
                result.amountPeriod2
            );
        }

        // Result
        const resulttext = result.amountPeriod1 > 0
            ? 'Overskudd'
            : (result.amountPeriod1 < 0 ? 'Underskudd' : 'Resultat');

        const chartConfig = {
            label: '',
            labels: ['Salg', 'Lønn', 'Andre kostnader', resulttext],
            chartType: 'bar',
            borderColor: null,
            backgroundColor: null,
            datasets: dataSets,
            data: null
        };

        ChartHelper.generateChart('accountingReportDrilldownChart', chartConfig);
    }

    public profitMarginText() {
        // feks 20% og oppover gir visning av prosent og kommentaren:
        // Best, 10-20%: Svært godt, 5-10% Godt, 0-5% Bra, og under: Svak
        if (this.percentagePeriod1 >= 20) {
            return this.percentagePeriod1  + '% - svært godt';
        } else if (this.percentagePeriod1 > 10) {
            return this.percentagePeriod1  + '% - svært godt';
        } else if (this.percentagePeriod1 > 5) {
            return this.percentagePeriod1 + '% - godt';
        } else if (this.percentagePeriod1 >= 0) {
            return this.percentagePeriod1 + '% - bra';
        } else {
            return this.percentagePeriod1 + '% - svak';
        }
    }
}
