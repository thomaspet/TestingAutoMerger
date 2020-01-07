import {Component, Input, OnChanges, ViewChild, ElementRef} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {switchMap, map, finalize} from 'rxjs/operators';

import {PeriodFilter} from '../periodFilter/periodFilter';
import {AccountDetailsReportModal, IDetailsModalInput} from '../detailsmodal/accountDetailsReportModal';
import {UniModalService} from '@uni-framework/uni-modal';
import {UniHttp} from '@uni-framework/core/http/http';
import {INumberFormat} from '@uni-framework/ui/unitable';
import {
    StatisticsService,
    ErrorService,
    NumberFormat
} from '@app/services/services';
import * as Chart from 'chart.js';

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
    public percantageOfLastYear1: number = 0;
    public percantageOfLastYear2: number = 0;
    public percentageOfBudget1: number = 0;
    public percentageOfBudget2: number = 0;
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

    @ViewChild('chartElement1', { static: false })
    private chartElement1: ElementRef;
    private treeSummaryList: ResultSummaryData[] = [];

    flattenedTreeSummaryList: ResultSummaryData[] = [];
    showPercent: boolean = true;
    showPreviousAccountYear: boolean = true;
    showBudget = true;
    showPercentOfBudget: boolean = false;
    hideBudget = false;
    showall: boolean = false;
    budgetSoFar: number = 0;
    numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 0
    };

    busy = true;
    CUSTOM_COLORS = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4DD0E1',
        '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFF176 ', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F', '#E0E0E0', '#90A4AE'];
    myChart: any;

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat,
        private modalService: UniModalService,
        private http: UniHttp
    ) { }

    public ngOnChanges() {
        if (this.filter) {
            this.numberFormat.decimalLength = this.filter.Decimals ? this.filter.Decimals : 0;
            this.showPercent = this.filter.ShowPercent;
            this.showPreviousAccountYear = this.filter.ShowPreviousAccountYear;
            this.showBudget = this.filter.ShowBudget;
            this.showPercentOfBudget = this.filter.ShowPercentOfBudget;
            this.hideBudget = !this.filter.ShowBudget;
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
                close: null,
                filter: this.filter
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
            }),
            finalize(() => this.busy = false)
        ).subscribe(
            res => {
                res = res.body;
                const list = this.extractGroups(res);
                this.getBudgetToCurrentMonth(res);
                this.flattenedTreeSummaryList = list;
                this.treeSummaryList = [...list];
                this.calculateTreePercentages(list, null, null);
                this.setupChart();
            },
            err => this.errorService.handle(err),
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

    private getBudgetToCurrentMonth(data) {

        this.budgetSoFar = 0;
        const currentMonth = new Date().getMonth() + 1;

        data.forEach(d => {
            for (let i = 1; i <= currentMonth; i++) {
                this.budgetSoFar += d['BudPeriod' + i];
            }
        });
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

            treeNode.percantageOfLastYear1 = treeNode.amountPeriod2 && treeNode.amountPeriod1
                ? Math.round(treeNode.amountPeriod1 / (treeNode.amountPeriod2 / 100) )
                : 0;

            treeNode.percentageOfBudget1 = treeNode.budget && treeNode.amountPeriod1
                ? Math.round((treeNode.amountPeriod1 * 100) / treeNode.budget)
                : 0;

            if (treeNode.children && treeNode.children.length > 0) {
                this.calculateTreePercentages(treeNode.children, totalAmountPeriod1, totalAmountPeriod2);
            }
        });
    }

    public getPaddingLeft(level) {
        if (level > 0) {
            return (level * 20).toString() + 'px';
        }
    }

    private setupChart() {
        const sales = this.flattenedTreeSummaryList.find(x => x.number === 3);
        const purchase = this.flattenedTreeSummaryList.find(x => x.number === 4);
        const salary = this.flattenedTreeSummaryList.find(x => x.number === 5);
        const other = this.flattenedTreeSummaryList.find(x => x.number === 6);

        let budget, budgetString;

        if (parseInt(this.periodFilter1.year.toString(), 10) === new Date().getFullYear()) {
            budget = this.budgetSoFar * -1;
            budgetString = 'Budsjett hittil';
        } else {
            budget = (sales.budget || 0) + (purchase.budget || 0) + (salary.budget || 0) + (other.budget || 0);
            budgetString = 'Budsjett';
        }

        if (this.myChart) {
            this.myChart.destroy();
        }

        const cost1 = other.amountPeriod1 + purchase.amountPeriod1 + salary.amountPeriod1;
        const cost2 = other.amountPeriod2 + purchase.amountPeriod2 + salary.amountPeriod2;

        const labels = [this.periodFilter1.year, this.periodFilter2.year];
        const element = this.chartElement1.nativeElement;
        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Driftsinntekter',
                    backgroundColor: '#2850a0',
                    data: [
                        Math.round(sales.amountPeriod1),
                        Math.round(sales.amountPeriod2)
                    ],
                    stack: 1
                },
                {
                    label: 'Underskudd',
                    backgroundColor: 'rgba(67, 105, 210, .2)',
                    data: [
                        cost1 > sales.amountPeriod1 ? Math.round(cost1 - sales.amountPeriod1) : 0,
                        cost2 > sales.amountPeriod2 ? Math.round(cost2 - sales.amountPeriod2) : 0,
                    ],
                    stack: 1
                },
                {
                    label: 'Varekostnader',
                    backgroundColor: 'rgba(67, 105, 210, 1)',
                    data: [
                        Math.round(purchase.amountPeriod1),
                        Math.round(purchase.amountPeriod2)
                    ],
                    stack: 2
                },
                {
                    label: 'Personalkostnader',
                    backgroundColor: 'rgba(67, 105, 210, .8)',
                    data: [
                        Math.round(salary.amountPeriod1),
                        Math.round(salary.amountPeriod2)
                    ],
                    stack: 2
                },
                {
                    label: 'Driftskostnader',
                    backgroundColor: 'rgba(67, 105, 210, .6)',
                    data: [
                        Math.round(other.amountPeriod1),
                        Math.round(other.amountPeriod2)
                    ],
                    stack: 2
                },
                {
                    label: 'Overskudd',
                    backgroundColor: 'rgba(67, 105, 210, .3)',
                    data: [
                        cost1 < sales.amountPeriod1 ? Math.round(sales.amountPeriod1 - cost1) : 0,
                        cost2 < sales.amountPeriod2 ? Math.round(sales.amountPeriod2 - cost2) : 0,
                    ],
                    stack: 2
                },
                {
                    label: budgetString,
                    backgroundColor: this.CUSTOM_COLORS[7],
                    data: [
                        Math.round(budget), 0
                    ],
                    stack: 3
                }
            ]
        };

        if (!this.showPreviousAccountYear) {
            data.labels.pop();
            data.datasets.forEach(d => d.data.pop());
        }

        if (!this.showBudget) {
            data.datasets.pop();
        }

        this.myChart = new Chart(element, {
            type: 'bar',
            data: <any> data,
            options: {
                tooltips: {
                    callbacks: {
                        label: this.labelFormat.bind(this)
                    }
                },
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    yAxes: [{
                        stacked: true,
                    }]
                },
                legend: {
                    position: 'left',
                    display: true
                }
            }
        });
    }

    private labelFormat (tooltipItem, array) {
        const datasetLabel = array.datasets[tooltipItem.datasetIndex].label || 'Other';
        return datasetLabel + ': ' + this.numberFormatService.asMoney(tooltipItem.yLabel);
    }
}
